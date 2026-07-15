# Entry Images — Implementation Plan

**Status:** Implemented, with one deliberate architecture change from this plan (end-to-end verification against a real R2 bucket still pending — see Verification below)

> **Architecture change (2026-07-14):** Phases 1 was replaced with a fully client-side design.
> The user's R2 credentials are encrypted with the **master key** and stored as the
> `imageStorageConfig` setting — the server never sees them and has no image code at all
> (no routes, no Prisma model, no `SECRETS_ENCRYPTION_KEY` requirement). Presigned URLs are
> generated in the browser by a dependency-free SigV4 signer (`client/src/services/r2Signer.ts`),
> and the connection test runs from the browser, which also validates the bucket CORS policy
> (which must additionally allow `DELETE`). Everything below describing server routes/credential
> storage is superseded by this; the client-side phases (2–7) shipped as planned.
**Scope:** Up to 7 images per journal entry, stored zero-knowledge in the user's own Cloudflare R2 bucket.

## Feature summary

- **Cloudflare R2 only** (S3-compatible), bring-your-own bucket. User enables images in Settings and enters R2 account ID, access key ID, secret access key, and bucket name. Their storage, their bill.
- **Zero-knowledge pipeline**: every image (and its thumbnail) is AES-256-GCM-encrypted client-side with the existing non-extractable master key *before* upload. The browser PUTs ciphertext directly to R2 via short-lived presigned URLs minted by the Chronicles server (which stores the user's R2 credentials encrypted at rest). Display = presigned GET → fetch → decrypt in memory → `URL.createObjectURL`. The Chronicles server and database never see image bytes.
- **Up to 7 images per entry.** Image metadata (object keys, IVs, mime types) lives inside the entry's already-encrypted `metadata` blob — harmless without the master key.
- **Thumbnails are first-class encrypted objects** (never plaintext): the client scales down a small copy, encrypts it separately, and uploads it alongside the full image. The bottom-strip UI decrypts only thumbnails; full images decrypt lazily when the lightbox opens.
- **Featured image (optional)**: one image can be marked featured → renders as a full-width hero banner (~400px tall) above the entry's date header.
- **Gallery UX**: images show as a thumbnail strip at the bottom of the post; clicking a thumbnail opens a lightbox to scroll through full-size versions.
- **Deletion is symmetric**: removing an image from an entry, or deleting the entry (single or bulk), deletes the corresponding R2 objects (full + thumb).
- **No sharing with images** (hard product rule): the share button is hidden and the share flow blocked for any entry with ≥1 image. This guarantees the share feature can never distribute user-hosted imagery (CSAM/abuse risk).

Security simplifier: presign/delete operations always use the requesting user's own credentials against their own bucket — no object-ownership checks are needed server-side.

## Data model

Inside the entry's encrypted metadata (following the existing `_`-prefixed convention like `_taxonomyId`, `_customFields`):

```ts
interface EntryImage {
  key: string;        // R2 object key of full image, e.g. img/<uuid>
  iv: string;         // base64 12-byte IV for full image
  thumbKey: string;   // R2 object key of encrypted thumbnail
  thumbIv: string;    // base64 IV for thumbnail
  mimeType: string;   // 'image/jpeg'
  size: number;       // ciphertext bytes (full image)
  width?: number; height?: number;  // display hints
}

metadata._images: EntryImage[]        // max 7
metadata._featuredKey?: string        // key of the featured image, if any
```

## Phase 1 — Server: credential storage + R2 routes

1. **Prisma model** (`server/prisma/schema.prisma`, mirror `CalendarIntegration` at lines 40–53): `ImageStorageIntegration` — `accountId` unique FK to Account, `r2AccountId`, `r2Bucket`, `r2AccessKeyId` (encrypted), `r2SecretAccessKey` (encrypted), timestamps, `@@map("image_storage_integrations")`. Then `npx prisma generate` + `db push` (public schema only, no tenant migration).
2. **Generalize secret crypto** (`server/src/services/tokenCrypto.ts`): `getKey()` reads `SECRETS_ENCRYPTION_KEY || CALENDAR_TOKEN_KEY` (backward compatible). Reuse `encryptToken`/`decryptToken`/`isTokenCryptoConfigured` for the R2 credentials. Update `server/.env.example`.
3. **R2 service** (new `server/src/services/r2.ts`), deps `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`. **Critical gotcha:** AWS SDK ≥3.729 default integrity checksums break R2 — construct `S3Client` with `requestChecksumCalculation: 'WHEN_REQUIRED'`, `responseChecksumValidation: 'WHEN_REQUIRED'`, `region: 'auto'`, endpoint `https://<accountId>.r2.cloudflarestorage.com`. Functions: `presignPut(cfg, key, contentLength)` (300s expiry, `application/octet-stream`), `presignGet(cfg, key)` (300s), `deleteObjects(cfg, keys)`, `testConnection(cfg)` (PUT tiny probe object then DELETE — proves write+delete perms, unlike HeadBucket).
4. **Routes** (new `server/src/routes/images.ts`, template `server/src/routes/calendar.ts`; mount authed in `server/src/index.ts`):
   - `GET /status` → `{ configured, accountId?, bucket? }` (never returns keys; false when tokenCrypto unconfigured)
   - `PUT /config` → validates, runs `testConnection` (400 + friendly message on failure), encrypts credentials, upserts; 503 if tokenCrypto unconfigured
   - `DELETE /config` → deletes row only; never touches bucket contents
   - `POST /presign-upload` `{ contentLength, thumbContentLength }` → `{ image: { key, url }, thumb: { key, url }, expiresInSeconds }` — server generates both keys as `img/<uuid>` / `img/<uuid>-t` (no user info in keys); 409 if unconfigured
   - `POST /presign-get` `{ key }` → `{ url, expiresInSeconds }`
   - `POST /delete-objects` `{ keys: string[] }` (1–50) → best-effort, 200 on partial R2 errors (logged)
5. **Zod schemas** (`shared/src/validation/schemas.ts`, exported through the shared index like `createShareSchema`): `objectKeySchema` (`/^img\/<uuid>(-t)?$/`), `imageStorageConfigSchema` (32-hex account ID, S3 bucket-name rules), `presignUploadSchema` (each length ≤ 10 MB full / 1 MB thumb), `presignGetSchema`, `deleteObjectsSchema`.
6. **CSP** (`server/src/middleware/security.ts` line 14): append `https://*.r2.cloudflarestorage.com` to `connect-src`. `img-src` already allows `blob:`. No other CSP surface exists in the repo (Vite dev sends none; Express serves the built client).

## Phase 2 — Shared crypto: binary encrypt/decrypt

1. `shared/src/crypto/primitives.ts`: binary siblings of the string `encrypt`/`decrypt` (lines 182–217) that use the existing CryptoKey directly (**not** `importKey` from raw material — the master key is non-extractable): `encryptBytes(masterKey, data: ArrayBuffer) → { ciphertext: ArrayBuffer, iv: base64 }`, `decryptBytes(masterKey, ciphertext, ivBase64) → ArrayBuffer`.
2. `shared/src/crypto/encryptionService.ts`: thin `encryptFile`/`decryptFile` pass-throughs; round-trip + wrong-IV unit tests.
3. `client/src/contexts/EncryptionContext.tsx`: expose `encryptBytes`/`decryptBytes` on the context (implemented via `getKey()` like `encryptPost` at line 78). In `lock()` (line 59) call `clearImageCache()` so decrypted object URLs are revoked on tab-hide auto-lock / inactivity / logout.

## Phase 3 — Client services & state

1. **API group** (`client/src/services/api.ts`, after `calendar` ~line 315): `images.getStatus / saveConfig / deleteConfig / presignUpload / presignGet / deleteObjects`; export `EntryImage` type.
2. **Downscale util** (new `client/src/utils/processImage.ts`): `createImageBitmap(file)` → produce **two** JPEGs via canvas: full (long edge ≤ 2560px, q0.85, reject > 10 MB post-downscale) and thumbnail (long edge ≤ 400px, q0.8). JPEG everywhere (Safari WebP encode unreliable). Returns `{ full: Blob, thumb: Blob, width, height }`. Rejects non-image files.
3. **Image pipeline** (new `client/src/services/imageStorage.ts`, module-level — delete paths need it outside React):
   - `uploadEntryImage(file, encryptBytes)` → process → encrypt both blobs → one `presignUpload` call → two plain `fetch(url, { method:'PUT', body })` PUTs (**no** `X-Requested-With`/credentials to R2 — breaks CORS) → returns `EntryImage`.
   - `getImageObjectUrl(key, iv, mimeType, decryptBytes)` → presign GET → fetch → decrypt → object URL, cached in `Map<key, string>`. Presigned URLs never cached (5-min expiry); decrypted object URLs cached per session. Used for both thumbs and full images.
   - `clearImageCache()` — revoke all object URLs (called from `EncryptionContext.lock()`).
   - `bestEffortDeleteImages(keys)` — never throws, logs, chunks >50.
   - `collectImageKeys(entries)` — flatten `_images[].key` + `_images[].thumbKey` from decrypted entries.
4. **Display hook** (new `client/src/hooks/useDecryptedImage.ts`, template `useDictation.ts`): `useDecryptedImage(key, iv, mimeType | null)` → `{ url, loading, error }` via `useEncryption().decryptBytes`.
5. **Settings state**: `uiStore.ts` — `imagesEnabled`/`setImagesEnabled` (weatherEnabled triple pattern, lines 69–72/143–146) + `imagesConfigured`/`setImagesConfigured`. `useInitializeData.ts` (~line 68) — type-guarded `settingsMap.imagesEnabled` load (**opt-in, defaults false** — NOT in the default-true `KNOWN_FLAGS` bag); fire-and-forget `images.getStatus()` → `setImagesConfigured`. Gate everywhere: `imagesReady = imagesEnabled && imagesConfigured`.

## Phase 4 — Editor UI (JournalView + EntryForm)

**`client/src/views/JournalView.tsx`** (owns image state):
- State: `entryImages: EntryImage[]`, `featuredKey: string | null`, `imageUploading`, `imageError`.
- Load/reset in the `selectedEntryId` effect (lines 434–459) from `entry.metadata._images`/`_featuredKey`; reset in else-branch, `handleNew`, and post-save resets.
- **All three metadata build sites** (`handleSave` ~482, `autoSaveDoRef` ~316, `wellnessAutoSaveDoRef` ~257): `if (entryImages.length) { metadata._images = entryImages; if (featuredKey) metadata._featuredKey = featuredKey; }`. Add to `handleSave` deps. Bookmark handlers spread existing metadata, so images survive untouched.
- `handleImagesSelected(files)`: enforce `7 - entryImages.length` remaining slots (reject extras with inline error); sequential `uploadEntryImage` per file; append to state; if entry exists, persist metadata immediately (mirror `handleBookmark` ~585: rebuild from store entry, `encryptPost`, `entriesApi.update`, `updateDecryptedEntry`). **Autosave race**: on completion re-read `selectedEntryId` from the store, not the closure (autosave may create the entry mid-upload).
- `handleImageRemoved(key)`: drop from state (clear `featuredKey` if it pointed there), persist, then `bestEffortDeleteImages([key, thumbKey])`. Discarding a never-saved entry with uploads → cleanup all uploaded objects.
- `handleSetFeatured(key | null)`: toggle + persist.
- **Delete cleanup**: `handleDelete` (:516) and ConfirmDialog `onConfirm` (:770) — collect keys via `collectImageKeys` before delete; after `entriesApi.delete` succeeds, best-effort delete (≤14 objects/entry).
- **Share gating**: `onShare={entryImages.length ? undefined : () => setShareOpen(true)}` (:742); ShareModal render condition (:755) adds `&& entryImages.length === 0`.

**`client/src/components/organisms/EntryForm.tsx`**:
- New props: `images`, `featuredKey`, `onImagesSelected`, `onImageRemoved`, `onSetFeatured`, `imageUploading`, `imageError`, `imagesReady` (extend `EntryFormProps` at :354).
- **Hero banner (featured image)**: first child of `ScrollArea` (:523), *before* `EdBody` — EdBody is a 90%-width padded column, so rendering outside it gives full-bleed for free. `BannerWrap` (`height: clamp(240px, 38vh, 400px); background: var(--bg-sunken)`), `BannerImg` (`object-fit: cover`), centered spinner while decrypting. Rendered only when `featuredKey` resolves to an image.
- **Thumbnail strip**: below the editor content at the bottom of `EdBody` — a horizontal row of square thumbs (~96px, `--r-lg` corners, `object-fit: cover`) each via `useDecryptedImage(thumbKey…)`. Per-thumb hover/tap controls: star toggle (set/unset featured; filled star = featured, DS accent), remove button with **two-step armed confirm** (first tap arms, second removes — never `window.confirm`). While uploading, a placeholder tile with spinner.
- **Lightbox gallery**: clicking a thumb opens a full-screen overlay **portaled to `document.body`** (house rule: overlays escape stacking contexts), dark scrim, centered full-size image (decrypted lazily per image, `max-width/height: 90vw/90vh; object-fit: contain`), prev/next arrows + swipe + arrow-key navigation, close on Esc/scrim tap, image counter ("3 / 7"). Preload adjacent images' decrypts for smooth paging.
- **Upload button** in `EdActions` between Share (:559–567) and Dictate (:568–575), rendered only when `imagesReady`: hidden `<input type="file" accept="image/*" multiple>` + `IconBtn` (mic button at :568–575 is the template); disabled with tooltip when 7 images reached; spinner while uploading; reset `input.value` after each pick.
- **Share button hidden** entirely when the entry has images.
- Inline error line under the action row for `imageError` (dictation-error pattern).

**Icon** (`design-system/components/core/Icon.jsx`): no image glyph exists — add `image` (lucide-style rect + dot + mountain path) and reuse existing star/x icons for featured/remove if present (verify; add if missing).

## Phase 5 — Settings UI

New organism `client/src/components/organisms/ImageStorageSettings.tsx` (template: `CalendarSyncSettings.tsx` — SettingsCard/SettingsRow, Toggle, ActionButton, Spinner, armed-disconnect pattern):
- "Entry images" Toggle → `settingsApi.upsert('imagesEnabled', v)` + store update.
- Enabled & unconfigured: four filled inputs (Account ID, Access key ID, Secret access key as `type="password"`, Bucket) + "Save & test connection" → `images.saveConfig`; inline error on failure.
- Configured: masked summary ("Bucket `x` on account `abcd…1234`"), two-step armed Disconnect → `images.deleteConfig`. Copy warns: disconnecting does not delete uploaded images; existing entries won't display images until reconnected to the same bucket.
- Help text (first-class, will be the #1 support issue): how to create the R2 bucket + API token (Object Read & Write scoped to the bucket) **and the mandatory bucket CORS policy** — `AllowedOrigins: [app origin, http://localhost:5173]`, `AllowedMethods: [GET, PUT]`, `AllowedHeaders: [content-type]`. Direct browser PUT/GET fails without it.
- Mount in `client/src/views/SettingsView.tsx` as a new "Entry Images" section after Calendar Sync (~line 797).

## Phase 6 — Deletion cleanup in EntryList

`client/src/components/organisms/EntryList.tsx`: single card delete (`handleDelete` ~:175) and bulk delete (`handleBulkDelete` ~:288) — collect keys via `collectImageKeys` from the store entries before deleting; after successful `entriesApi.delete` calls, one batched `bestEffortDeleteImages` (chunk >50 keys — bulk deletes of many image-bearing entries can exceed 50). Attach cleanup to **every** branch that calls `entriesApi.delete` (verify the `alsoDeleteRemote` branches during implementation).

Orphan policy (best-effort by design): upload-then-abandon leaves ciphertext in the user's own bucket (mitigated by discard cleanup); failed R2 delete after entry delete is logged and accepted. Settings help notes the bucket can be purged wholesale anytime.

## Phase 7 — Tests

- **shared**: `encryptBytes`/`decryptBytes` round-trip + wrong-IV failure (Vitest jsdom Web Crypto).
- **server**: `/api/images` route tests with `vi.mock('../services/r2.js')` — status unconfigured, config save stores non-plaintext credentials, presign rejects oversize/bad keys, delete-objects validates key format + count, 503 when tokenCrypto unconfigured.
- **client**: `collectImageKeys` pure test; `processImage` shallow test (mock `createImageBitmap`/`toBlob`); 7-image cap logic.

## Implementation order

1. Zod schemas + tokenCrypto generalization → Prisma model → r2 service + routes → CSP
2. Shared crypto + EncryptionContext (parallelizable with 1)
3. Client api group, processImage, imageStorage service, hooks, uiStore/init
4. Settings UI (enables end-to-end config first)
5. Editor UI: upload button + thumbnail strip → lightbox → featured banner → share gating
6. EntryList deletion cleanup
7. Tests throughout

## Verification (end-to-end, when built)

Use a **real R2 bucket** (free tier, no egress fees) — the only honest test of the two integration killers: bucket CORS and SDK checksum behavior.

1. Create bucket + scoped Object Read & Write token; apply CORS with `http://localhost:5173`. Set `SECRETS_ENCRYPTION_KEY` (or existing `CALENDAR_TOKEN_KEY`); `npx prisma db push`; `npm run dev`.
2. Settings → enable + save credentials → success; DB row shows encrypted key fields.
3. Add 3 images (one >10 MB, >2560px original) → thumbs appear at bottom; Network tab shows binary PUTs to `*.r2.cloudflarestorage.com`; R2 dashboard objects are ciphertext (no JPEG magic bytes).
4. Star one → hero banner above date header. Click a thumb → lightbox, arrows/swipe through all, Esc closes.
5. Reload + unlock → thumbs and banner re-render (presign-get → decrypt). Share button gone on this entry, present on image-less entries.
6. Try adding an 8th image → blocked with message. Remove an image → both objects gone from bucket; removing the featured one clears the banner. Remove all → share button returns.
7. Delete entry via editor button, card delete, and bulk select → all objects removed each way.
8. Negatives: wrong secret → friendly 400; toggle off → button disappears; incompressible >10 MB image → client-side size error.

Offline alternative: MinIO with an endpoint override, or the mocked route tests — lower fidelity (skips real CORS verification).

## Risks

1. **Bucket CORS is mandatory user setup** — make it a first-class step in Settings help.
2. **AWS SDK ≥3.729 checksum incompatibility with R2** — the `WHEN_REQUIRED` flags are load-bearing; comment them in `r2.ts`.
3. **Tab-hide auto-lock** revokes cached object URLs via `clearImageCache()`; post-unlock re-render must re-resolve images.
4. **Autosave race on new entries**: uploads completing after autosave created the entry must persist against the store's current `selectedEntryId`, not a stale closure.
5. **Metadata size**: 7 images ≈ ~1.5 KB of metadata — negligible against the 64 KB setting/post limits.
6. **Pre-existing share links** on an entry that later gains images remain valid — they are text-only snapshots taken at share time; no image data can leak. Acceptable; revocation UI already exists in ShareModal.
