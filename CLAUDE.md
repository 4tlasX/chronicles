# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chronicles is a **zero-knowledge encrypted journal application** rebuilt as a **React + Express monorepo** (no Next.js) for React Native readiness. The server never sees plaintext user data.

Key privacy guarantees:
- All entry content encrypted client-side with AES-256-GCM before transmission
- Non-extractable CryptoKeys — master key cannot be exported from the browser's crypto subsystem
- Split-token sessions — database leaks cannot reconstruct valid tokens
- Recovery key provided at registration for password recovery

## UI Design Rules

- **No circles or pills** — All shapes use rounded square edges (border-radius: 4-8px). No circular badges, no pill-shaped chips.
- **Icons are plain** — Topic icons are displayed as plain FontAwesome icons colored with the user's selected header color. No circle backgrounds, no colored dot indicators.
- **User's header color** — Topic icons throughout the app (dropdowns, entry card badges) use the user's selected header color, not individual topic colors.
- **No `window.confirm`** — Safari on iPad blocks pop-ups by default, silently returning `false`. Use inline state-based confirmation or delete directly. Never use `window.confirm` / `window.alert` / `window.prompt`.
- **TipTap node views with overlays** — Always portal overlays (`position: fixed`) from TipTap `NodeViewWrapper` to `document.body` via `createPortal`. The node view DOM can create stacking contexts that trap pointer events.

## Commands

```bash
# From root (monorepo)
npm run dev              # Start both client (port 5173) and server (port 3001)
npm run build            # Build all packages (shared → server → client)
npm run test             # Run all tests (shared + server + client)
npm run test:coverage    # Run tests with coverage

# Client only
cd client
npm run dev              # Vite dev server
npm run build            # Vite production build
npm run test             # Vitest (jsdom environment)

# Server only
cd server
npm run dev              # tsx watch (hot reload)
npm run build            # tsc compile
npm run test             # Vitest (node environment)
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma db push       # Push schema to database
npx prisma migrate dev   # Create and apply migration
npm run migrate:tenants  # Run tenant schema migrations

# Shared only
cd shared
npm run build            # tsc compile
npm run test             # Vitest
```

## Architecture

### Monorepo Structure

```
chronicles-rebuild/
├── shared/              # Shared code (web + future React Native)
│   └── src/
│       ├── crypto/      # Stateless encryption service (AES-256-GCM, PBKDF2)
│       ├── types/       # TypeScript interfaces (Post, Taxonomy, User, Session, Settings)
│       ├── validation/  # Zod schemas for API request/response validation
│       └── theme/       # Design tokens, accent colors, background images
│
├── server/              # Express 5 API
│   ├── prisma/
│   │   └── schema.prisma  # Auth schema (Account, Session, SchemaCounter)
│   └── src/
│       ├── db/
│       │   ├── prisma.ts              # Prisma client singleton
│       │   ├── schemaManager.ts       # Tenant schema creation/deletion
│       │   └── tenantQueries.ts       # Typed CRUD queries for tenant tables
│       ├── middleware/
│       │   ├── auth.ts                # Split-token session validation + CSRF
│       │   └── security.ts            # CSP, HSTS, X-Frame-Options headers
│       └── routes/
│           ├── auth.ts                # Register, login, logout, salt, change-password, recover, TOTP 2FA
│           ├── entries.ts             # CRUD for journal entries (encrypted)
│           ├── topics.ts              # CRUD for topics/taxonomies
│           ├── settings.ts            # Key-value settings
│           ├── sessions.ts            # List, revoke, revoke-all sessions
│           └── doses.ts               # Medication dose log CRUD
│
├── client/              # React 19 SPA (Vite)
│   └── src/
│       ├── components/
│       │   ├── atoms/       # Indivisible UI primitives (TextInput, Button, Label, Icon, etc.)
│       │   ├── molecules/   # Atom combinations (FormField, EntryMeta, RecoveryKeyDisplay)
│       │   ├── organisms/   # Complex sections with store access (Header, Sidebar, Editor, EntryList, LoginForm, etc.)
│       │   └── templates/   # Layout skeletons (AuthTemplate, AppTemplate)
│       ├── views/           # Route-level components (LoginView, RegisterView, JournalView, SettingsView)
│       ├── contexts/        # React contexts (AuthContext, EncryptionContext)
│       ├── stores/          # Zustand stores (uiStore, entriesStore)
│       ├── services/        # API client with CSRF headers (api.ts)
│       └── styles/          # GlobalStyle, styled-components theme augmentation
│
└── docs/
    └── BLUEPRINT.md     # Full architectural plan with all design decisions
```

### Multi-Tenant Schema-per-User Database

Each user gets an isolated PostgreSQL schema. This is **not** row-level security.

```
PostgreSQL Database
├── public schema (shared)
│   ├── accounts - authentication + encryption params
│   ├── sessions - split-token sessions (selector + verifierHash)
│   └── schema_counter - atomic counter for unique schema names
│
├── usr_1_a1b2c3 (user 1's isolated schema)
│   ├── _migrations - schema version tracking for JIT migrations
│   ├── settings - key-value store (JSONB)
│   ├── taxonomies - topics with icon and color
│   ├── posts - encrypted content + metadata (BYTEA)
│   └── post_taxonomies - many-to-many relationships
│
└── usr_2_d4e5f6 (user 2's isolated schema)
    └── ... same tables
```

**Schema naming**: `usr_{counter}_{random_hex}` — NOT derived from user info for security.

### Two-Layer Security Model

1. **Authentication Layer (Server)**: bcrypt password hash (12 rounds), split-token database sessions with immediate revocation, optional TOTP 2FA
2. **Encryption Layer (Client)**: AES-256-GCM with auto-generated master key wrapped by password-derived KEK (PBKDF2-SHA256, 600k iterations)

Password changes only re-wrap the master key (instant). Data is never re-encrypted on password change.

### TOTP Two-Factor Authentication

Implemented via `otplib` — no external services required.

**Login flow when 2FA is enabled:**
- `POST /api/auth/login` returns `{ pendingToken, requires2FA: true }` instead of a session
- Client shows OTP screen; user enters code from authenticator app or a backup code
- `POST /api/auth/login/2fa` verifies the code and issues the real split-token session
- Pending tokens are stored in-memory with 5-minute TTL (single-instance safe for Render)

**Setup flow (Settings → Security):**
1. `POST /api/auth/2fa/setup` — generates TOTP secret + QR code (not saved yet)
2. User scans QR code and enters confirmation code
3. `POST /api/auth/2fa/enable` — verifies code, saves secret to `accounts` table, issues 8 one-time backup codes
4. `DELETE /api/auth/2fa` — disables 2FA after password confirmation

**Schema**: `totpSecret` and `totpEnabled` added to `accounts` table.

### Split-Token Session Strategy

Instead of storing a single token, sessions use a **Selector + Verifier** pattern:
- **Selector** (12 hex chars): DB lookup key (indexed)
- **Verifier** (32 hex chars): Only SHA-256 hash stored in DB; raw verifier sent to client
- **Cookie path**: Enforces `X-Requested-With` header for CSRF protection
- **Bearer path**: For React Native (no CSRF risk from secure storage)
- **Activity debounce**: `lastActiveAt` only updated if 15+ minutes stale (fire-and-forget)

### Recovery Key System

The master key is wrapped with two different keys:
1. **Password-derived key** (PBKDF2) — for normal login
2. **Recovery key** — for password recovery

At registration:
- Client generates a random master key and recovery key (32 bytes each)
- Master key wrapped with password-derived key (stored as `encryptedMasterKey`)
- Master key also wrapped with recovery key (stored as `recoveryWrappedMK`)
- Recovery key shown once to user — must be saved

### Encryption Specification

```
Algorithm: AES-256-GCM
IV: Random 12 bytes per encryption operation
Key Derivation: PBKDF2-SHA256, 600,000 iterations (OWASP 2024)
Salt: 16 bytes random per user
Master Key: Non-extractable CryptoKey (cannot be exported from Web Crypto)
Content: Encrypted client-side, stored as BYTEA in PostgreSQL
Search: Client-side on decrypted data (no server-side search tokens)
```

### Atomic Design Component Architecture

```
Atoms     → Props ONLY (pure components, no hooks, no stores)
Molecules → Props ONLY (compose atoms, still pure)
Organisms → CAN use Zustand hooks + contexts (smart layer)
Templates → Layout only (slots for children)
Views     → Route logic + top-level data orchestration
```

**React Native swap**: Replace atoms + templates. Organisms, stores, contexts, and services stay the same.

### Routes

| Path | View |
|------|------|
| `/` | DashboardView (home) |
| `/journal` | JournalView |
| `/topics` | TopicsView |
| `/calendar` | CalendarView |
| `/settings` | SettingsView |
| `/goals`, `/goals/milestones`, `/goals/tasks`, `/goals/todos` | Goals/planning views |
| `/health/*` | Health tracking views |
| `/entertainment/*`, `/inspiration/*` | Media/inspiration views |

### Key Files

**Database & Auth:**
- `server/prisma/schema.prisma` — Account (with encryption fields), Session (split-token), SchemaCounter
- `server/src/db/schemaManager.ts` — Creates per-user schemas with `_migrations` tracking
- `server/src/db/tenantQueries.ts` — Typed CRUD for posts, taxonomies, settings, relationships
- `server/src/middleware/auth.ts` — Split-token validation, CSRF branching, session helpers

**Encryption (Shared):**
- `shared/src/crypto/primitives.ts` — Web Crypto wrappers (non-extractable keys)
- `shared/src/crypto/encryptionService.ts` — Stateless orchestration (encrypt/decrypt posts, setup, unwrap, rewrap)
- `shared/src/crypto/constants.ts` — AES_KEY_LENGTH, PBKDF2_ITERATIONS, etc.

**Client State:**
- `client/src/contexts/AuthContext.tsx` — Session state, login/logout/register, `pending2FA` state for TOTP flow
- `client/src/contexts/EncryptionContext.tsx` — Master key lifecycle, encrypt/decrypt delegation
- `client/src/stores/uiStore.ts` — Search, sidebar, view mode, theme colors, `pencilOnly` toggle, `displayName`, `weatherEnabled`, `weatherCity`, `topicCustomFields` (user-defined field defs per topic)
- `client/src/types/userFields.ts` — `UserFieldDef` (id, label, type) and `TopicCustomFields = Record<number, UserFieldDef[]>`
- `client/src/utils/stripHtml.ts` — also exports `summarizeUserFields(defs, values)` for auto-content generation
- `client/src/stores/entriesStore.ts` — Encrypted entries cache, topics, feature flags, CRUD operations

**Client Services:**
- `client/src/services/api.ts` — Single API client with `X-Requested-With` CSRF header; fetches up to 5,000 entries on init; includes 2FA endpoints (`login2fa`, `setup2fa`, `enable2fa`, `disable2fa`)

**Journal View:**
- `client/src/views/JournalView.tsx` — Two-panel layout (entry list + editor); preserves `_widgetType` through saves so wellness check-in entries remain linked; date filter bar shown when `viewMode === 'date'` with active date label and Clear button; topic filter bar shown when a topic is active

**Dashboard:**
- `client/src/views/DashboardView.tsx` — Home view with drag-and-drop widgets; saves widget order to localStorage
  - Widget IDs: `quick-entry`, `priorities`, `events`, `tasks`, `shopping`, `meds`, `weather`, `menu-plan`, `affirmations`, `wellness`, `mini-calendar`
  - Default left column: `quick-entry`, `priorities`, `events`, `menu-plan`
  - Default right column: `mini-calendar`, `affirmations`, `wellness`
  - Priorities widget auto-creates a "Priorities" topic on first save
  - Events widget shows Event + Meeting topic entries with `startDate`, up to 10, 90-day lookahead
  - Meds widget only renders when active medication entries exist
  - Wellness widget: tap-to-fill water glasses (8), mood faces (5), sleep hours (10 cloud-moon icons); debounced save with optimistic store updates; reactive to journal edits via Zustand; auto-creates "Wellness" topic so entries appear in journal
  - Mini Calendar widget: monthly grid with entry-presence dots; clicking a day sets `viewMode: 'date'` and navigates to journal filtered to that day

**Apple Pencil / Drawing:**
- `client/src/components/atoms/DrawingCanvas.tsx` — Full-screen freehand canvas using `perfect-freehand`; pointer events with pressure sensitivity; palm rejection (`pencilOnly` mode); serializes strokes to SVG on save
- `client/src/components/tiptap/DrawingNode.tsx` — TipTap block node extension (`type: drawing`, `atom: true`); renders saved SVG inline with hover-to-edit; portals canvas to `document.body` to avoid stacking context issues

### Querying User Data

User-specific tables require raw SQL via `tenantQueries.ts`:
```typescript
import { getAllPosts, createPost } from './db/tenantQueries.js';

// Schema name comes from authenticated session (never from client)
const posts = await getAllPosts(req.auth.tenantSchemaName);
```

## Features

### Implemented

**Foundation**
- User authentication with bcrypt + split-token sessions
- Client-side AES-256-GCM encryption with non-extractable keys
- Journal entries with TipTap rich text editor
- Topic organization with icons and drag-and-drop reordering
- Client-side search (keyword + date range)
- Settings (header color, background image, feature toggles per topic type)
- Session management (view/revoke active sessions)
- Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- Apple Pencil: Scribble handwriting-to-text (CSS) + freehand drawing canvas with pressure sensitivity, palm rejection, undo, inline SVG storage (encrypted)

**Dashboard (Home)**
- Two-column layout (2/3 left + 1/3 right) with independent per-column drag-and-drop and cross-column dragging
- Layout stored as `{ left, right, hidden }` arrays in localStorage (`dashboard-layout-v2`); migrates from old flat `order` array automatically
- Default left: `quick-entry`, `priorities`, `events`, `menu-plan`; default right: `mini-calendar`, `affirmations`, `wellness`
- Edit/Add Widgets tray at bottom of right column; cross-column dragging supported
- Quick Entry with topic selector, rotating daily reflection prompt, per-topic built-in fields and user-defined custom fields; editor auto-expands with content; entries saved with only field values (no typed text) auto-summarize those fields as entry content
- Daily Priorities widget — saved as "Priorities" topic entries with `PrioritiesFields` custom fields editor; respects 12:01am local grace period
- Events & Meetings widget — upcoming entries by `startDate`, 90-day window, up to 10
- Tasks widget — today's tasks with inline completion toggle
- Shopping List widget — first active shopping list with item check-off
- Medication Schedule widget — today's dose tracking; only shown when active meds exist; syncs on tab focus via `visibilitychange`
- Weather widget — current conditions via Open-Meteo; city geocoded with US state disambiguation; shown inline beside date in page header too
- Menu Plan widget — shows actual meals for today (or next upcoming day)
- Affirmations widget — daily rotating affirmation
- Daily Wellness Check-in widget — tap-to-fill water glasses (8), mood faces (5), sleep hours (10 cloud-moon icons); debounced 600ms save with optimistic store updates; reactive to journal edits via Zustand (no BroadcastChannel); auto-creates Wellness topic on first save
- Mini Calendar widget — monthly grid with entry-presence dots; click any day sets `viewMode: 'date'` and navigates to journal
- Dashboard greeting uses `displayName` setting ("Good morning, Alex")
- Daily quote in Playfair Display, constrained to right column

**Topic Custom Fields**
- Any topic can have user-defined custom fields: text, number, date, boolean (yes/no), URL
- Fields defined by editing a topic in the Topics view (`TopicEditForm`); stored as `topicCustomFields` setting (JSONB, `Record<number, UserFieldDef[]>`)
- Field definitions loaded into `uiStore.topicCustomFields` on init via `useInitializeData`
- Field values stored in entries at `metadata._customFields._userFields` (same shape used in `EntryForm` and `QuickEntryCard`)
- When saving with no text content but non-empty field values, a plain-text summary (`Label: value · …`) is auto-generated as entry content — see `summarizeUserFields` in `client/src/utils/stripHtml.ts`
- `UserFieldDef` and `TopicCustomFields` types are in `client/src/types/userFields.ts`

**Productivity**
- Goals & milestones with progress tracking; progress bar shown when milestones/tasks are linked; goal "In Progress" status supported
- Tasks with priority levels and milestone linking; completed tasks show line-through in all views
- Menu planner and shopping lists with recipe linking
- Drag-and-drop reordering

**Health Tracking**
- Medications with dosage, frequency, scheduled times
- Dose logging with timestamps (`medication_dose_logs` table, JIT migration); real-time sync via `visibilitychange`
- Food tracking with meal types, ingredients, calories
- Symptom tracking with severity scale
- Exercise tracking with type, duration, intensity, distance
- Allergy tracking
- Wellness check-ins — water glasses, mood (1–5), sleep hours; stored as `_widgetType: 'wellness-checkin'` entries with Wellness topic; editable via `WellnessFields` custom fields in journal
- Reporting view with wellness trends + cross-correlations (sleep→mood, water→symptoms, exercise→sleep, mood→symptoms)

**Calendar**
- Monthly grid with entry previews per day
- Events and meetings placed on their `startDate`, sorted first, shown in user header colour
- Day detail panel with full editable entry list

**Media & Inspiration**
- Entertainment tracking (music, books, TV/movies)
- Inspiration (research, ideas, quotes)

**Settings**
- Account: display name (shown in dashboard greeting), read-only username
- Security: change password (re-wraps master key, no data re-encryption); TOTP 2FA inline setup wizard
- Sessions: view and revoke active sessions from any device
- Features: enable/disable health tracking, planning, entertainment, and more per topic type
- Theme: header color (40+), background image (28), light/dark mode
- Data: seed test data

### Planned
- Image uploads (encrypted storage)
- Recurring calendar events
- Calorie correlation reporting

## Important Implementation Notes

### Entry Pagination
`entriesApi.getAll()` requests `?limit=5000`. Server allows up to 10,000. Do not reduce this — personal journals can easily exceed 100 entries and topic filtering relies on all entries being in the client store.

### Feature Flags
Feature flags in `entriesStore.featureFlags` default to `{}` on load. `useInitializeData` explicitly sets all known flags to `true` when not present in settings. The `filterTopics` function uses `featureFlags[flag] !== false` (not `featureFlags[flag]`) so undefined flags are treated as enabled.

### Dashboard Widget Data
Dashboard widgets save entries with `_taxonomyId` in encrypted metadata (same as all entries). The Priorities widget auto-creates a "Priorities" topic on first save. The Meds widget reads from `decryptedEntries` filtered by the Medication topic — it only renders when `hasMeds` is true.

The Wellness widget uses `_widgetType: 'wellness-checkin'` (no `_taxonomyId` initially) to identify today's entry. On first save it auto-creates a "Wellness" topic and adds `_taxonomyId` so the entry becomes visible in the journal. The widget is fully reactive — display values are derived via `useMemo` from `decryptedEntries`, so journal edits flow back to the dashboard automatically. `doSaveRef` pattern prevents stale closures in the 600ms debounce. On save, the store is scanned directly for today's existing entry before creating a new one, preventing duplicates if the `entryIdRef` is stale.

## Security Hardening

### Content Security Policy (CSP)
Applied via Express middleware (`server/src/middleware/security.ts`):
- `default-src 'self'` — only same-origin
- `script-src 'self'` — no inline scripts
- `style-src 'self' 'unsafe-inline'` — required for styled-components
- `img-src 'self' data: blob:` — images from same origin and data URIs
- `connect-src 'self'` — API calls to same origin only
- `frame-ancestors 'none'` — prevent clickjacking

### CSRF Protection
- Web requests require `X-Requested-With: XMLHttpRequest` header
- Mobile requests use `Authorization: Bearer` (no CSRF risk)
- Explicit branching in auth middleware — never mixed

### Password Strength
- Minimum 12 characters
- Uppercase, lowercase, number required
- Validated via Zod schemas (`shared/src/validation/schemas.ts`)

## State Management

**Zustand** for client state (not Redux):
- `uiStore` — Search filters, sidebar state, theme colors, selected entry
- `entriesStore` — Decrypted entries cache, topics, loading state

**React Context** for auth and encryption:
- `AuthContext` — Login/logout/register, session state
- `EncryptionContext` — Master key lifecycle, encrypt/decrypt methods

### Key Storage Security
- Master key is a **non-extractable CryptoKey** — cannot be exported to JWK or raw bytes
- Key lives in React ref (memory only) — lost on page refresh
- On refresh: user re-enters password to re-derive key
- Optional: Service Worker can hold key across refreshes (user toggle in Settings)
- Key is cleared on: logout, inactivity timeout, tab close

## UI Theme

### Styling: styled-components (CSS-in-JS)
- All styles co-located with components
- Theme tokens in `shared/src/theme/tokens.ts` — shared with future React Native
- `ThemeProvider` at app root supplies tokens to all styled components

### Customizable Colors
- **18 header colors** (Dark, Navy, Gold, Coral, Teal, Steel Blue, etc.) + transparent
- **28 background images** from Unsplash artists
- Colors derived programmatically: hover (15% darker), light (10% opacity)

### Default Colors
- Default header: `#2d2c2a` (dark)
- Default accent: `#00b4d8` (cyan)
- Neutral background: `#f7f7f7`

## React Native Readiness

The architecture enables React Native conversion with minimal changes:

| Layer | Change for RN |
|-------|--------------|
| shared/crypto | Import swap (`react-native-quick-crypto`) |
| shared/types, validation, theme | None |
| server/ | None (same API) |
| atoms/ | Swap styled primitives (div→View, input→TextInput) |
| molecules, organisms | None |
| templates/ | Swap layout primitives |
| views/ | Swap routing (react-router → React Navigation) |
| stores/, contexts/, hooks/ | None |
| services/api | Minor: Bearer header from secure storage |
