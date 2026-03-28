# Chronicles Rebuild Plan

## Context

Chronicles is a feature-rich encrypted journal app with excellent UI but monolithic, hard-to-maintain code. A prior rebuild attempt (Postcards) introduced a cleaner database schema and modular encryption but had an inferior UI. This rebuild combines:

- **Chronicles' UI/UX and features** (rich text, topics, health tracking, goals, etc.)
- **Postcards' architecture** (modular encryption service, tenant query pattern, cleaner schema)
- **Pure React + Express API** (no Next.js — enables straightforward React Native conversion)
- **Highly modular, component-based structure** ready for mobile

## Architecture Overview

```
chronicles-rebuild/
├── client/                    # React SPA (Vite)
│   ├── src/
│   │   ├── components/        # Atomic Design component hierarchy
│   │   │   ├── atoms/         # Indivisible UI primitives
│   │   │   ├── molecules/     # Atom combinations with single purpose
│   │   │   ├── organisms/     # Complex UI sections
│   │   │   └── templates/     # View layouts (slots, no data)
│   │   ├── views/             # Templates + real data (react-router)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── stores/            # Zustand stores
│   │   ├── contexts/          # React contexts (encryption, auth)
│   │   ├── services/          # API client layer
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                    # Express API
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   ├── middleware/        # Auth, rate limiting, validation
│   │   ├── db/                # Database (Postcards pattern)
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma      # Auth schema (Postcards style)
│   └── package.json
│
├── shared/                    # Shared code (future RN monorepo package)
│   ├── crypto/                # Encryption service (from Postcards)
│   ├── types/                 # TypeScript interfaces
│   ├── validation/            # Zod schemas
│   └── constants/             # Shared constants
│
└── package.json               # Workspace root
```

## React Native Readiness

The entire architecture is designed for minimal-effort React Native conversion:

| Layer | Web | React Native | Change Required |
|-------|-----|-------------|----------------|
| **shared/crypto** | Web Crypto API | `react-native-quick-crypto` (same API) | Import swap only |
| **shared/types** | TypeScript interfaces | Same | None |
| **shared/validation** | Zod schemas | Same | None |
| **server/** | Express API | Same server, no changes | None |
| **atoms/** | `styled.input`, `styled.button` (HTML) | `styled.TextInput`, `styled.Pressable` (RN) | **Swap styled primitives** |
| **styles/theme** | styled-components ThemeProvider | styled-components/native ThemeProvider | Import swap only |
| **molecules/** | Compose web atoms | Compose RN atoms | None (if atoms interface matches) |
| **organisms/** | Compose molecules | Same | None |
| **templates/** | CSS Grid/Flexbox layouts | RN Flexbox layouts | **Swap implementations** |
| **views/** | react-router | React Navigation | **Swap routing** |
| **stores/** | Zustand | Same | None |
| **contexts/** | React Context | Same | None |
| **hooks/** | Custom hooks | Same | None |
| **services/api** | fetch + cookies | fetch + secure storage token | Minor auth header change |
| **Sessions** | HTTP-only cookie | `expo-secure-store` + Bearer header | Auth middleware already supports both |

**Total changes for RN**: Swap atoms, templates, routing, and crypto import. Everything else is shared. The Express API serves both web and mobile with zero changes.

## Key Architectural Decisions

### 1. Pure React + Express (no Next.js)
- **Client**: React 18+ with Vite, react-router-dom for routing
- **Server**: Express with TypeScript, run via `tsx` (fast TS execution, no compile step in dev)
- **Why**: Direct path to React Native — shared logic lifts cleanly into a monorepo

### 1b. Styling — styled-components (CSS-in-JS)
- **All styles live in JS** — no separate CSS files, styles are co-located with components
- **Each atom/molecule/organism** defines its styles via `styled.div`, `styled.button`, etc.
- **Theme provider** at app root with design tokens (colors, spacing, typography, shadows)
- **React Native**: styled-components has native support (`styled-components/native`) — same API, same theme, just swap `styled.div` → `styled.View`, `styled.span` → `styled.Text`
- **Findable**: Styles are in the same file as the component or in a co-located `ComponentName.styles.ts`
- **Updatable**: Change theme tokens → propagates everywhere. Override per-component as needed.

### 1c. Build Process — Vite + tsx
- **Client dev**: `vite dev` (fast HMR, instant updates)
- **Client build**: `vite build` (Rollup-based, tree-shaking, code-splitting)
- **Server dev**: `tsx watch src/index.ts` (fast TS execution with file watching, no compile step)
- **Server build**: `tsc` to compile, then `node dist/index.js` for production
- **Shared**: consumed directly via npm workspaces path aliases (no separate build step in dev)
- **Root scripts**:
  ```json
  {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && tsx watch src/index.ts",
    "dev:client": "cd client && vite",
    "build": "npm run build:shared && npm run build:server && npm run build:client",
    "build:shared": "cd shared && tsc",
    "build:server": "cd server && tsc",
    "build:client": "cd client && vite build",
    "test": "npm run test:shared && npm run test:server && npm run test:client"
  }
  ```

### 2. Postcards Database Schema
- Tenant-per-user PostgreSQL schemas (`usr_{counter}_{hex}`)
- Tables: `posts`, `taxonomies`, `post_taxonomies`, `settings` (+ new tables as features are added)
- Prisma for auth schema, raw SQL via `tenantQueries.ts` for tenant schemas
- GIN index on `posts.metadata` for JSONB queries

### 3. Postcards Encryption (Modular)
- **Stateless `encryptionService.ts`** in `/shared/crypto/` — pure functions, key as parameter
- **React `EncryptionProvider`** in client — manages key state, wraps service
- AES-256-GCM, PBKDF2-SHA256 (600k iterations), recovery key system
- Content + metadata encrypted client-side; server stores BYTEA
- Client-side search on decrypted data (no SSE tokens — simpler, works offline)

### 4. Database Sessions — Split Token Strategy

Instead of storing a single token, we use a **Selector + Verifier** split token pattern (OWASP recommended):

- **Selector** (12 chars, hex): Used as the DB lookup key (indexed, fast)
- **Verifier** (32 chars, hex): Only `SHA-256(verifier)` stored in DB; raw verifier sent to client
- **Client receives**: `selector + verifier` (44 chars total) in HTTP-only cookie
- **DB stores**: `selector` (plaintext, indexed) + `verifierHash` (SHA-256)

**Why this is better than a single token:**
1. **Database leak resistance**: If sessions table is leaked, attacker has `selector` + `hash(verifier)` — they cannot reconstruct valid tokens
2. **No timing attacks**: Lookup by `selector` (indexed), then constant-time compare on `verifierHash`
3. **No token in DB**: The actual session credential never touches the database

**Prisma Schema:**
```prisma
model Session {
  id            Int       @id @default(autoincrement())
  selector      String    @unique @db.VarChar(12)     // Hex, lookup key
  verifierHash  String    @map("verifier_hash")        // SHA-256 of verifier
  accountId     Int       @map("account_id")
  deviceInfo    String?   @map("device_info")
  ipAddress     String?   @map("ip_address")
  userAgent     String?   @map("user_agent")
  lastActiveAt  DateTime  @default(now()) @map("last_active_at")
  expiresAt     DateTime  @map("expires_at") @db.Timestamptz
  revokedAt     DateTime? @map("revoked_at")           // NULL=active
  revokedReason String?   @map("revoked_reason")       // 'password_change'|'user_logout'
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz

  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  @@index([selector])
  @@index([expiresAt])
  @@map("sessions")
}
```

**Session lifecycle in Express:**

1. **Login** (create session):
   ```
   selector  = crypto.randomBytes(6).toString('hex')   // 12 hex chars
   verifier  = crypto.randomBytes(16).toString('hex')   // 32 hex chars
   verifierHash = SHA-256(verifier)
   → INSERT session { selector, verifierHash, accountId, deviceInfo, ipAddress, ... }
   → Set HTTP-only cookie: chronicle_session = selector + verifier (44 chars)
   ```

2. **Auth middleware** (validate on every request):
   ```
   token = cookie['chronicle_session'] || Authorization header (Bearer)
   selector = token.slice(0, 12)
   verifier = token.slice(12)
   → SELECT session WHERE selector = ? AND revokedAt IS NULL AND expiresAt > NOW()
   → constant-time compare: SHA-256(verifier) === session.verifierHash
   → if valid: attach { accountId, tenantSchemaName } to req
   → update lastActiveAt (sliding window)
   ```

3. **Logout**: `UPDATE session SET revokedAt = NOW(), revokedReason = 'user_logout' WHERE selector = ?`
4. **Password change**: Revoke ALL sessions except current (`revokedReason = 'password_change'`)
5. **Session management UI**: List sessions with device/IP; revoke individual sessions by id
6. **Cleanup**: Delete expired/revoked sessions on server startup + periodic interval

**React Native path** — same API, zero changes:
- Mobile stores `selector + verifier` in secure storage (`expo-secure-store` / `react-native-keychain`)
- Sends via `Authorization: Bearer <selector+verifier>` header
- Auth middleware checks both cookie AND Bearer header
- **Zero API changes** for React Native

**Security properties:**
- Split token: DB leak doesn't expose valid credentials
- Constant-time verification: immune to timing attacks
- Database-backed: immediate revocation (not stateless JWTs)
- Device/IP tracking for session management UI
- Revocation with reason tracking
- 30-day max lifetime

### Production Hardening (Addresses Known Pitfalls)

**1. Single-Row Session Lookup (no multi-pass DB hits)**

Cache `tenantSchemaName` directly in the Session row to avoid JOINs:
```prisma
model Session {
  // ... existing fields ...
  tenantSchemaName String @map("tenant_schema_name")  // Cached from Account
}
```
Auth middleware does ONE query: `SELECT * FROM sessions WHERE selector = ?` — returns session + tenant schema in a single row. No JOIN to accounts table on every request. The `tenantSchemaName` is set at login time and is immutable.

**2. Explicit Cookie vs Bearer Branching (no CSRF backdoor)**

The middleware does NOT treat cookies and Bearer tokens interchangeably:
```typescript
// server/src/middleware/auth.ts
if (req.headers.authorization?.startsWith('Bearer ')) {
  // MOBILE PATH: Token from secure storage, no CSRF risk
  token = req.headers.authorization.slice(7);
  // Skip CSRF check — Bearer tokens aren't sent automatically by browsers
} else if (req.cookies?.chronicle_session) {
  // WEB PATH: Cookie sent automatically by browser — CSRF risk
  token = req.cookies.chronicle_session;
  // ENFORCE: Require X-Requested-With header (or CSRF token)
  if (!req.headers['x-requested-with']) {
    return res.status(403).json({ error: 'Missing CSRF header' });
  }
}
```
The API client on web always sends `X-Requested-With: XMLHttpRequest`. Browsers won't add this header on cross-origin requests (blocked by CORS preflight). This eliminates CSRF without a token management system.

**3. Debounced `lastActiveAt` Updates (no write bloat)**

Instead of updating on every request, only update if stale:
```typescript
// In auth middleware, after session validation:
const ACTIVITY_DEBOUNCE_MS = 15 * 60 * 1000; // 15 minutes
const timeSinceActive = Date.now() - session.lastActiveAt.getTime();

if (timeSinceActive > ACTIVITY_DEBOUNCE_MS) {
  // Fire-and-forget — don't await, don't block the request
  prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() }
  }).catch(() => {}); // Swallow errors — this is non-critical
}
```
Result: 10 API calls in 2 seconds → 0 session updates (until 15 min passes). Eliminates write contention.

**4. Key Storage — sessionStorage Only (true Zero Knowledge)**

The master key is stored in `sessionStorage` (NOT `localStorage`):
- `sessionStorage` is wiped when the tab/browser closes
- Not accessible to other tabs (same-origin, different browsing context)
- If XSS occurs: attacker can steal the key from the current tab, but:
  - CSP headers block inline scripts and external script injection
  - DOMPurify sanitizes all user content before rendering
  - The attack surface is the same as "attacker has full JS execution" — at that point, any in-memory key is compromised regardless of storage method
- On page refresh: key is restored from `sessionStorage` (still alive)
- On tab close: key is gone — user must re-enter password
- Inactivity timeout clears `sessionStorage` proactively

This matches Chronicles' existing behavior. The EncryptionContext holds the `CryptoKey` in React state for active use, and backs it up to `sessionStorage` (as exported JWK) for refresh survival only.

**5. Tenant Schema Migration Orchestrator**

Adding a robust migration system instead of ad-hoc raw SQL:

```
server/src/db/
├── schemaManager.ts         # Creates new tenant schemas
├── tenantQueries.ts         # CRUD queries
└── migrationOrchestrator.ts # NEW: Manages schema migrations across all tenants
```

**`migrationOrchestrator.ts`** handles:
```typescript
interface TenantMigration {
  version: number;        // Sequential version number
  name: string;           // e.g., "add_health_tracking_tables"
  up: (schemaName: string) => string;   // SQL to apply
  down: (schemaName: string) => string; // SQL to rollback
}
```

Each tenant schema gets a `_migrations` table:
```sql
CREATE TABLE "{schema}"._migrations (
  version INT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
```

Migration process:
1. `getAllTenantSchemas()` — list all schemas from accounts table
2. For each schema, check `_migrations` for current version
3. Apply pending migrations in order
4. **On failure**: Log error, skip schema, continue with others (no full rollback)
5. **After completion**: Report which schemas succeeded/failed
6. **Retry**: Re-run safely — already-applied migrations are skipped (idempotent)
7. **New user signup**: Runs all migrations up to latest version when creating schema

This runs:
- On server startup (check + apply pending migrations)
- Via CLI: `npm run migrate:tenants` for manual runs
- In migration script for Chronicles → Rebuild data migration

**6. JIT (Just-In-Time) Migrations — No Zombie Schemas**

Partial migration failures must not lock users out. Two-layer protection:

```typescript
// In auth middleware, after session validation:
const LATEST_SCHEMA_VERSION = 5; // Bumped with each new migration

if (session.schemaVersion < LATEST_SCHEMA_VERSION) {
  // JIT: Run pending migrations for THIS user right now
  await migrationOrchestrator.migrateSchema(
    session.tenantSchemaName,
    session.schemaVersion,
    LATEST_SCHEMA_VERSION
  );
  // Update cached version in session row
  await prisma.session.update({
    where: { id: session.id },
    data: { schemaVersion: LATEST_SCHEMA_VERSION }
  });
}
```

Session table gets a `schemaVersion` column (cached from `_migrations`):
```prisma
model Session {
  // ... existing fields ...
  schemaVersion Int @default(0) @map("schema_version")
}
```

How it works:
- **Background migration on startup**: Migrates all schemas — fast path for most users
- **JIT fallback on request**: If a user's schema was missed (failure, new deploy before bg migration finished), their next request triggers migration before proceeding
- **Version cached in session**: Avoids querying `_migrations` table on every request — only checks the integer in the session row
- **Result**: Zero users left behind. Worst case = slight latency on first request after a migration

**Transaction safety + concurrency guard:**
```typescript
async migrateSchema(schemaName: string, fromVersion: number, toVersion: number) {
  // 1. Set is_migrating flag to prevent concurrent JIT attempts
  const locked = await prisma.$executeRaw`
    UPDATE accounts SET is_migrating = true
    WHERE tenant_schema_name = ${schemaName} AND is_migrating = false
  `;
  if (locked === 0) return; // Another request is already migrating this schema

  try {
    // 2. Run all pending migrations in a single transaction
    await pool.query('BEGIN');
    for (const migration of pendingMigrations) {
      await pool.query(migration.up(schemaName));
      await pool.query(`INSERT INTO "${schemaName}"._migrations ...`);
    }
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK'); // Atomic — all or nothing
    throw err;
  } finally {
    // 3. Release lock
    await prisma.$executeRaw`
      UPDATE accounts SET is_migrating = false
      WHERE tenant_schema_name = ${schemaName}
    `;
  }
}
```
- `BEGIN/COMMIT` ensures no half-migrated schemas
- `is_migrating` flag prevents concurrent JIT attempts on the same schema
- If user refreshes during migration, the second request sees `is_migrating = true` and waits or retries

**7. Smart Organisms / Dumb Atoms (Zustand Access Pattern)**

Prevent prop drilling while keeping atoms portable:

```
Atoms     → Props ONLY (pure components, no hooks, no stores)
Molecules → Props ONLY (compose atoms, still pure)
Organisms → CAN use Zustand hooks + contexts (smart layer)
Templates → Layout only (slots for children)
Views     → Route logic + top-level data orchestration
```

Example — `EntryList` organism:
```typescript
// organisms/EntryList.tsx — SMART (hooks into store)
import { useEntriesStore } from '@/stores/entriesStore';

export function EntryList() {
  const entries = useEntriesStore(s => s.filteredEntries);
  const selectEntry = useEntriesStore(s => s.selectEntry);

  return (
    <EntryListContainer>
      {entries.map(entry => (
        <EntryCard  // molecule — receives props, no store access
          key={entry.id}
          title={entry.title}
          date={entry.date}
          topicColor={entry.topicColor}
          onClick={() => selectEntry(entry.id)}
        />
      ))}
    </EntryListContainer>
  );
}
```

**For React Native**: Atoms and molecules are swapped (new styled primitives). Organisms keep their store hooks — Zustand works identically in RN. No prop drilling, no rewiring.

**Platform-agnostic list rendering**: Organisms that render lists use an abstracted `ListRenderer` template rather than raw `.map()`:
```typescript
// templates/ListRenderer.tsx (web)
export function ListRenderer<T>({ data, renderItem, keyExtractor }: Props<T>) {
  return <div>{data.map(item => <div key={keyExtractor(item)}>{renderItem(item)}</div>)}</div>;
}

// templates/ListRenderer.tsx (React Native — swap)
export function ListRenderer<T>({ data, renderItem, keyExtractor }: Props<T>) {
  return <FlatList data={data} renderItem={({ item }) => renderItem(item)} keyExtractor={keyExtractor} />;
}
```
Organisms call `<ListRenderer>` — they never directly use `.map()` for scrollable lists. This keeps organisms platform-independent.

**8. Non-Extractable CryptoKey (Stronger Zero Knowledge)**

Use Web Crypto's `extractable: false` to prevent key export:

```typescript
// shared/crypto/primitives.ts
export async function deriveKEK(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,  // extractable = false
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,  // extractable = false — KEY CANNOT BE EXPORTED
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}
```

On page refresh:
- `CryptoKey` object is gone (it was in memory)
- User re-enters password → re-derive key from `kekSalt` (fetched from server)
- Password kept in a closure variable during derivation, then discarded
- **No JWK in sessionStorage** — eliminates the XSS key theft vector entirely

Trade-off: Users re-enter password on refresh. But this is **stronger zero knowledge** — the key literally cannot be extracted from the browser's crypto subsystem.

**Refresh persistence option**: Use a **Service Worker** to hold the non-extractable `CryptoKey` across page refreshes. The Service Worker lifecycle is tied to the browser session (not the page), so the key survives refreshes but dies when the browser closes. This avoids password re-entry on refresh while keeping the key out of any storage API.

Alternatively, expose this as a **user toggle in SettingsView**:
- **High security** (default): Re-enter password on refresh (non-extractable, no persistence)
- **Convenience mode**: Service Worker holds key across refreshes within the session

**9. Shared Theme Package (Web + RN Unified Tokens)**

Theme object lives in `shared/` so both platforms use identical tokens:

```
shared/
├── theme/
│   ├── tokens.ts        # Colors, spacing, typography, shadows
│   ├── accentColors.ts  # 18 header colors + 16 accent colors
│   └── backgrounds.ts   # 28 background image definitions
```

```typescript
// shared/theme/tokens.ts
export const theme = {
  colors: {
    accent: '#00b4d8',
    accentHover: '#00a0c0',
    header: '#2d2c2a',
    headerHover: '#3d3c3a',
    background: '#f7f7f7',
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    danger: '#ef4444',
    success: '#22c55e',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 24, xxl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 12 },
  // ... etc
};

export type Theme = typeof theme;
```

Platform usage:
```typescript
// Web: client/src/App.tsx
import { ThemeProvider } from 'styled-components';
import { theme } from '@shared/theme/tokens';
<ThemeProvider theme={theme}>...</ThemeProvider>

// React Native (future): mobile/src/App.tsx
import { ThemeProvider } from 'styled-components/native';
import { theme } from '@shared/theme/tokens';
<ThemeProvider theme={theme}>...</ThemeProvider>
```

Change `theme.colors.accent` in one place → both platforms update.

**10. Security Headers (Express Middleware)**

Applied to all responses via `server/src/middleware/security.ts`:
```typescript
app.use((req, res, next) => {
  // Prevent XSS from stealing in-memory key
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'"
  );
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Control referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Disable browser features we don't need
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
```

### 5. TipTap (Abstracted)
- TipTap for web rich text editing
- Wrapped in an `<Editor>` component interface with props: `content`, `onChange`, `readOnly`
- React Native swap: replace `<Editor>` implementation with a mobile-compatible editor

### 6. State Management
- **Zustand** for client state (same as both apps)
- Stores: `authStore`, `uiStore`, `entriesCache`, `settingsStore`
- All decrypted data lives in memory only, cleared on logout/timeout

## Incremental Build Phases

### Phase 1: Foundation (THIS BUILD)
Core infrastructure + journaling:

1. **Project scaffolding** — monorepo with client/server/shared
2. **Auth** — register, login, logout, sessions, password recovery
3. **Encryption** — setup, unlock, encrypt/decrypt posts, recovery key
4. **Entries (Posts)** — CRUD with rich text (TipTap), encrypted storage
5. **Topics (Taxonomies)** — create, edit, delete, color/icon, filtering
6. **Client-side search** — keyword + date range filtering
7. **Settings** — feature flags, timezone, theme preferences
8. **UI** — Port Chronicles' visual design (header, sidebar, layout, backgrounds, accent colors)
9. **Security** — inactivity timeout, session management, CSP headers

### Phase 2: Productivity
- Goals & milestones with progress tracking
- Tasks with auto-migration (incomplete tasks move to current day)
- Entry relationships (goal → milestone → task linking)
- Drag-and-drop reordering

### Phase 3: Health Tracking
- Medications with dosage, frequency, scheduled times
- Dose logging with timestamps
- Food tracking with meal types, ingredients, calorie counting
- Symptom tracking with severity scale
- Exercise tracking with type, duration, intensity, distance
- Schedule view (today's medication timeline)
- Reporting with correlation analysis + calorie summaries

### Phase 4: Calendar, Sharing & Media
- Calendar events (encrypted titles, recurrence rules)
- Entertainment tracking (music, books, TV/movies)
- Inspiration collection (research, ideas, quotes)
- Entry sharing via public links (with expiration, view count)
- Image uploads (encrypted storage)

## Implementation Steps (Phase 1)

### Step 1: Project Scaffolding
Create the monorepo structure:

- **Root**: `package.json` with npm workspaces (`client`, `server`, `shared`)
- **Client**: Vite + React 18 + TypeScript + styled-components + react-router-dom
- **Server**: Express + TypeScript + Prisma + pg
- **Shared**: TypeScript with path aliases

Key files to create:
- `chronicles-rebuild/package.json` (workspace root)
- `chronicles-rebuild/client/package.json`, `vite.config.ts`, `tsconfig.json`
- `chronicles-rebuild/server/package.json`, `tsconfig.json`
- `chronicles-rebuild/shared/package.json`, `tsconfig.json`

### Step 2: Shared Layer
Port from Postcards (`/apps/postcards/src/lib/crypto/`):

- `shared/crypto/primitives.ts` — Web Crypto wrappers (generateMasterKey, deriveKEK, encrypt, decrypt, wrap/unwrap)
- `shared/crypto/encryptionService.ts` — stateless orchestration (encryptPost, decryptPost, setupEncryption, unwrapMasterKey)
- `shared/crypto/encoding.ts` — base64/ArrayBuffer utilities
- `shared/crypto/constants.ts` — AES_KEY_LENGTH, PBKDF2_ITERATIONS, etc.
- `shared/crypto/types.ts` — EncryptedPost, DecryptedPost, KeyMaterial interfaces
- `shared/types/` — Post, Taxonomy, Settings, User interfaces
- `shared/validation/` — Zod schemas for API request/response validation

### Step 3: Server — Database & Auth
Port from Postcards (`/apps/postcards/src/lib/db/`, `/apps/postcards/schema.prisma`):

- `server/prisma/schema.prisma` — Account, Session, SchemaCounter (Postcards schema)
- `server/src/db/schemaManager.ts` — tenant schema creation (from Postcards)
- `server/src/db/tenantQueries.ts` — typed query helpers (from Postcards)
- `server/src/routes/auth.ts` — register, login, logout, salt, verify-password, change-password, recover
- `server/src/middleware/auth.ts` — session validation middleware (extracts tenant schema)
- `server/src/middleware/rateLimit.ts` — rate limiting on auth endpoints

### Step 4: Server — Entry & Topic APIs
- `server/src/routes/entries.ts` — GET (all), POST, GET/:id, PUT/:id, DELETE/:id
- `server/src/routes/topics.ts` — GET, POST, PUT/:id, DELETE/:id, POST/reorder
- `server/src/routes/settings.ts` — GET, PUT

### Atomic Design Component Architecture

All client components follow **Atomic Design** (Brad Frost). Each level composes from the level below.

**Atoms** (`client/src/components/atoms/`) — Single-purpose, indivisible UI elements:
```
TextInput.tsx          # Styled text input (value, onChange, placeholder, error)
Textarea.tsx           # Multi-line text input
PasswordInput.tsx      # Text input with show/hide toggle
Button.tsx             # Primary, secondary, danger, ghost variants
IconButton.tsx         # Button with just an icon
Label.tsx              # Form label
Icon.tsx               # FontAwesome icon wrapper (name, size, color)
Badge.tsx              # Small colored pill (text, color)
Toggle.tsx             # On/off switch
ColorSwatch.tsx        # Single color circle (color, selected, onClick)
DateInput.tsx          # Date picker input
DateTimeInput.tsx      # Date + time picker
Spinner.tsx            # Loading spinner
Avatar.tsx             # User avatar circle
Divider.tsx            # Horizontal rule
Modal.tsx              # Modal overlay shell (children slot)
Tooltip.tsx            # Hover tooltip wrapper
```

**Molecules** (`client/src/components/molecules/`) — Atoms composed into functional groups:
```
FormField.tsx          # Label + Input + error message (any atom input)
PasswordField.tsx      # Label + PasswordInput + strength meter
SearchInput.tsx        # Icon + TextInput (debounced)
TopicBadge.tsx         # Icon + Badge (topic color + name)
ColorPicker.tsx        # Grid of ColorSwatch atoms + custom input
BackgroundPicker.tsx   # Grid of image thumbnails + none option
NavItem.tsx            # Icon + Label (sidebar navigation item)
EntryMeta.tsx          # Date + TopicBadge (entry metadata line)
SessionRow.tsx         # Device icon + info + revoke button
ConfirmDialog.tsx      # Modal + message + Button pair (confirm/cancel)
RecoveryKeyDisplay.tsx # Formatted hex key + copy button
AccentColorPreview.tsx # ColorSwatch + header preview strip
DateRangeInput.tsx     # Two DateInput atoms (from/to)
```

**Organisms** (`client/src/components/organisms/`) — Complex sections, compose molecules:
```
# Auth
LoginForm.tsx          # FormField molecules (email, password) + Button
RegisterForm.tsx       # FormField molecules + PasswordField + terms toggle
RecoverForm.tsx        # Multi-step recovery (email → recovery key → new password)
UnlockDialog.tsx       # Modal + PasswordField (re-enter password to unlock encryption)
RecoveryKeyDialog.tsx  # Modal + RecoveryKeyDisplay + ConfirmDialog

# Layout
Header.tsx             # Logo + NavItem molecules + user Avatar + accent color
Sidebar.tsx            # NavItem list + TopicBadge list + add topic button
TopicSidebar.tsx       # SearchInput + TopicBadge list + topic CRUD buttons

# Entries
EntryCard.tsx          # EntryMeta + content preview + actions (edit, delete, favorite)
EntryList.tsx          # Scrollable list of EntryCard organisms
EntryForm.tsx          # FormField (title) + Editor + TopicSelector + DateInput + Buttons
Editor.tsx             # TipTap wrapper (abstracted — content, onChange, readOnly)

# Topics
TopicForm.tsx          # FormField (name) + ColorPicker + Icon selector + Buttons
TopicSelector.tsx      # Dropdown of TopicBadge molecules

# Search
SearchPanel.tsx        # SearchInput + DateRangeInput + topic filter + clear button

# Settings
ThemeSettings.tsx      # ColorPicker (accent) + ColorPicker (header) + BackgroundPicker
SessionManager.tsx     # List of SessionRow molecules + "revoke all" button
FeatureToggles.tsx     # List of Toggle atoms with labels
```

**Templates** (`client/src/components/templates/`) — View layout skeletons with slots:
```
AuthTemplate.tsx       # Centered card layout (children slot for form)
AppTemplate.tsx        # Header + Sidebar + main content area (children slot)
SettingsTemplate.tsx   # AppTemplate + settings nav + content slot
```

**Views** (`client/src/views/`) — Templates filled with data + route logic:
```
LoginView.tsx          # AuthTemplate + LoginForm
RegisterView.tsx       # AuthTemplate + RegisterForm + RecoveryKeyDialog
RecoverView.tsx        # AuthTemplate + RecoverForm
JournalView.tsx        # AppTemplate + EntryList + EntryForm + SearchPanel
SettingsView.tsx       # SettingsTemplate + ThemeSettings + SessionManager + FeatureToggles
GoalsView.tsx          # AppTemplate + GoalList + GoalForm + MilestoneList
HealthView.tsx         # AppTemplate + tabbed (Medications, Food, Symptoms, Exercise, Schedule, Reporting)
CalendarView.tsx       # AppTemplate + CalendarGrid + EventForm
EntertainmentView.tsx  # AppTemplate + tabbed (Music, Books, TV/Movies)
InspirationView.tsx    # AppTemplate + tabbed (Research, Ideas, Quotes)
```

**Key principle**: Every input has its own component (atom). Forms compose atoms via molecules. Organisms compose molecules. Views are just templates + data. This makes React Native conversion trivial — swap atoms, keep everything above.

### Step 5: Client — Auth & Encryption
- `client/src/contexts/AuthContext.tsx` — session state, login/logout methods
- `client/src/contexts/EncryptionContext.tsx` — master key state, encrypt/decrypt methods (wraps shared service)
- `client/src/views/LoginView.tsx` — login form (port Chronicles UI)
- `client/src/views/RegisterView.tsx` — registration with recovery key display
- `client/src/views/RecoverView.tsx` — password recovery flow
- `client/src/components/encryption/UnlockDialog.tsx` — password re-entry modal
- `client/src/components/encryption/RecoveryKeyDialog.tsx` — recovery key display

### Step 6: Client — Core UI Layout
Port Chronicles' visual design:

- `client/src/components/layout/Header.tsx` — accent color header (18 colors + transparent)
- `client/src/components/layout/Sidebar.tsx` — topic navigation sidebar
- `client/src/components/layout/Background.tsx` — background image system (28 Unsplash images)
- `client/src/components/layout/AppLayout.tsx` — main layout wrapper
- `client/src/stores/uiStore.ts` — sidebar state, search state, accent color, background
- `client/src/stores/settingsStore.ts` — feature flags, timezone
- Create theme provider with Chronicles' design tokens (colors, spacing, typography)
- `client/src/styles/theme.ts` — theme object (accent colors, backgrounds, font sizes, spacing scale)
- `client/src/styles/GlobalStyle.ts` — styled-components `createGlobalStyle` (resets, base styles)

### Step 7: Client — Journal Entries
- `client/src/components/editor/Editor.tsx` — TipTap wrapper (abstracted interface)
- `client/src/components/entries/EntryList.tsx` — scrollable entry list
- `client/src/components/entries/EntryCard.tsx` — individual entry display
- `client/src/components/entries/EntryForm.tsx` — create/edit entry form
- `client/src/stores/entriesStore.ts` — Zustand cache of all entries (encrypted in memory, decrypt on demand)
- `client/src/views/JournalView.tsx` — main journal view (Chronicles layout)
- `client/src/services/api.ts` — API client with auth headers

### Step 8: Client — Topics & Search
- `client/src/components/topics/TopicSidebar.tsx` — topic list with icons/colors
- `client/src/components/topics/TopicSelector.tsx` — dropdown for entry forms
- `client/src/components/topics/TopicForm.tsx` — create/edit topic
- `client/src/components/search/SearchSidebar.tsx` — keyword + date range search
- Client-side filtering in JournalView (keyword match on decrypted content + metadata)

### Step 9: Client — Settings & Security
- `client/src/views/SettingsView.tsx` — settings UI
- `client/src/components/settings/ThemeSettings.tsx` — accent color picker, background picker
- `client/src/components/settings/SessionManager.tsx` — view/revoke active sessions
- `client/src/components/settings/FeatureToggles.tsx` — enable/disable features
- `client/src/hooks/useInactivityTimeout.ts` — auto-logout on idle (from Chronicles)
- `client/src/hooks/useSecurityClear.ts` — cleanup registry (from Chronicles)

### Step 10: Integration & Polish
- Wire up all routes in `client/src/App.tsx` with react-router
- Protected route wrapper
- Error boundaries
- Loading states
- Verify full encrypt/decrypt flow end-to-end
- Test auth flow (register → login → create entry → search → logout)

## Source Files to Port

### From Postcards (architecture/patterns):
| Source | Destination | What |
|--------|------------|------|
| `postcards/src/lib/crypto/*` | `shared/crypto/*` | Entire encryption module |
| `postcards/src/lib/db/schemaManager.ts` | `server/src/db/schemaManager.ts` | Tenant schema creation |
| `postcards/src/lib/db/tenantQueries.ts` | `server/src/db/tenantQueries.ts` | Typed query helpers |
| `postcards/schema.prisma` | `server/prisma/schema.prisma` | Auth schema |
| `postcards/src/stores/uiStore.ts` | `client/src/stores/uiStore.ts` | UI state pattern |

### From Chronicles (UI/features):
| Source | Destination | What |
|--------|------------|------|
| `chronicles-original/src/app/globals.css` | `client/src/index.css` | Styles & Tailwind |
| `chronicles-original/src/components/layout/*` | `client/src/components/layout/*` | Header, sidebar, background UI |
| `chronicles-original/src/components/journal/*` | `client/src/components/entries/*` | Entry list, editor UI |
| `chronicles-original/src/components/topics/*` | `client/src/components/topics/*` | Topic sidebar UI |
| `chronicles-original/src/components/shared/*` | `client/src/components/ui/*` | Shared UI primitives |
| `chronicles-original/src/lib/hooks/useInactivityTimeout.ts` | `client/src/hooks/` | Security hooks |
| `chronicles-original/src/lib/hooks/useSecurityClear.ts` | `client/src/hooks/` | Cleanup registry |
| `chronicles-original/public/*` | `client/public/*` | Background images, assets |

## Data Migration (Chronicles → Rebuild)

Existing users keep their passwords and encrypted entries. No re-encryption needed.

### What's Compatible (zero changes)
- **Password hashes**: Both use bcrypt — copy directly
- **Encryption algorithm**: Both AES-256-GCM with PBKDF2-SHA256 key derivation
- **Master key wrapping**: Same wrap/unwrap pattern
- **Recovery key system**: Same concept (master key wrapped with recovery-derived key)

### What Needs Migration

A one-time **migration script** (`server/scripts/migrate-from-chronicles.ts`) handles:

**1. Account table mapping:**
```
Chronicles Account           →  Rebuild Account
─────────────────────────────────────────────────
id (cuid string)             →  userId (uuid, generate new)
email                        →  email (copy)
passwordHash                 →  passwordHash (copy, bcrypt compatible)
salt (base64 string)         →  kekSalt (convert to Bytes)
encryptedMasterKey (base64)  →  encryptedMasterKey (convert to Bytes)
encryptedMasterKeyWithRecovery → recoveryWrappedMK (convert to Bytes)
recoveryKeySalt              →  recoveryWrapIv (extract IV from recovery data)
schemaName                   →  tenantSchemaName (new name, e.g., usr_1_abc123)
                             →  kekWrapIv (extract from existing wrapped key)
                             →  kekIterations (600000, or 100000 for legacy)
                             →  encryptionEnabled = true
                             →  username (generate from email or prompt)
```

**2. Tenant schema migration (per user):**
```
Chronicles Schema            →  Rebuild Schema
─────────────────────────────────────────────────
topics.encryptedName         →  taxonomies.name (keep encrypted, store as text)
topics.iv                    →  (stored alongside in metadata or separate column)
topics.color                 →  taxonomies.color (copy)
topics.icon                  →  taxonomies.icon (copy)

entries.encryptedContent     →  posts.content_encrypted (base64 → BYTEA)
entries.iv                   →  posts.content_iv (base64 → BYTEA)
entries.entryDate            →  posts.created_at (convert DATE → TIMESTAMPTZ)
entries.customType           →  posts.metadata._customType (move to JSONB)
entries.searchTokens         →  (drop — rebuild uses client-side search)

custom_fields.encryptedData  →  posts.metadata_encrypted (merge into post metadata)
custom_fields.iv             →  posts.metadata_iv

entry_relationships          →  posts.metadata._relationships (flatten into JSONB)

user_settings                →  settings table (key/value pairs)

calendar_events              →  posts with metadata._type = 'calendar_event'
medication_dose_logs         →  posts with metadata._type = 'dose_log'
favorites                    →  posts.metadata._isFavorite = true
shared_entries               →  (migrate to new sharing table, TBD in Phase 4)
entry_images                 →  (migrate metadata, keep encrypted files)
```

**3. Session table**: NOT migrated — users log in fresh with existing credentials.

### Migration Script Behavior
1. Reads from existing Chronicles database (source)
2. Creates new accounts in rebuild database (target)
3. Creates new tenant schemas with Postcards structure
4. Copies and transforms data per user
5. **Dry-run mode**: Validates without writing
6. **Incremental**: Can resume if interrupted (tracks progress)
7. **Verification**: After migration, decrypts a sample entry per user to confirm data integrity

### What Users Experience
- Log in with **same email and password** — works immediately
- All entries, topics, settings appear as before
- Recovery key still works (same master key, just re-wrapped format)
- Legacy PBKDF2 iterations (100k) auto-upgrade on first login (same as Chronicles)

## Testing Strategy

**Every major function and component gets a corresponding unit test.** Tests run before and after build to ensure 100% functionality before merging.

### Test Stack
- **Server**: Vitest + supertest (HTTP route testing)
- **Client**: Vitest + React Testing Library + jsdom
- **Shared**: Vitest (pure function tests)
- **E2E (future)**: Playwright (not Phase 1, but structure supports it)

### Server Tests (`server/src/__tests__/`)

**Route tests** (every CRUD endpoint):
| Test File | Covers |
|-----------|--------|
| `routes/auth.test.ts` | POST /register, POST /login, POST /logout, GET /salt, POST /verify-password, POST /change-password, POST /recover |
| `routes/entries.test.ts` | GET /entries, POST /entries, GET /entries/:id, PUT /entries/:id, DELETE /entries/:id |
| `routes/topics.test.ts` | GET /topics, POST /topics, PUT /topics/:id, DELETE /topics/:id, POST /topics/reorder |
| `routes/settings.test.ts` | GET /settings, PUT /settings |
| `routes/sessions.test.ts` | GET /sessions, POST /sessions/:id/revoke, POST /sessions/revoke-all |

**Middleware tests**:
| Test File | Covers |
|-----------|--------|
| `middleware/auth.test.ts` | Split token validation, expired session rejection, revoked session rejection, cookie vs Bearer header, tenant schema attachment |
| `middleware/rateLimit.test.ts` | Rate limiting on auth endpoints |

**Database tests**:
| Test File | Covers |
|-----------|--------|
| `db/schemaManager.test.ts` | Tenant schema creation, deletion, counter increment |
| `db/tenantQueries.test.ts` | All CRUD query functions (posts, taxonomies, settings, relationships) |

### Client Tests (`client/src/__tests__/`)

**Component render tests** (every UI component):
| Test File | Covers |
|-----------|--------|
| `components/layout/Header.test.tsx` | Renders with accent color, nav items, responsive behavior |
| `components/layout/Sidebar.test.tsx` | Topic list rendering, active state, collapse/expand |
| `components/layout/AppLayout.test.tsx` | Renders children, sidebar + header integration |
| `components/entries/EntryList.test.tsx` | Renders entries, empty state, loading state |
| `components/entries/EntryCard.test.tsx` | Renders entry content, topic badge, date |
| `components/entries/EntryForm.test.tsx` | Form submission, validation, topic selection |
| `components/editor/Editor.test.tsx` | TipTap mount, content change callback, read-only mode |
| `components/topics/TopicSidebar.test.tsx` | Renders topics, click selection, add button |
| `components/topics/TopicSelector.test.tsx` | Dropdown selection, color/icon display |
| `components/topics/TopicForm.test.tsx` | Create/edit form submission, color picker |
| `components/search/SearchSidebar.test.tsx` | Keyword input, date range, clear filters |
| `components/encryption/UnlockDialog.test.tsx` | Password input, submit, error state |
| `components/encryption/RecoveryKeyDialog.test.tsx` | Key display, copy, dismiss |
| `components/settings/ThemeSettings.test.tsx` | Color picker, background picker |
| `components/settings/SessionManager.test.tsx` | Session list render, revoke action |
| `components/settings/FeatureToggles.test.tsx` | Toggle state, save |

**View tests**:
| Test File | Covers |
|-----------|--------|
| `views/LoginView.test.tsx` | Form render, submit, error handling, redirect |
| `views/RegisterView.test.tsx` | Form render, validation, recovery key display |
| `views/RecoverView.test.tsx` | Recovery flow steps |
| `views/JournalView.test.tsx` | Entry list + editor layout, topic filtering, search filtering |
| `views/SettingsView.test.tsx` | Settings sections render, save |

**Store tests** (every state change):
| Test File | Covers |
|-----------|--------|
| `stores/uiStore.test.ts` | Search state, sidebar toggle, accent color, background |
| `stores/entriesStore.test.ts` | Cache init, add/update/remove entry, clear, filter by date/topic |
| `stores/settingsStore.test.ts` | Feature flags, timezone, theme persist |

**Hook tests**:
| Test File | Covers |
|-----------|--------|
| `hooks/useInactivityTimeout.test.ts` | Timer start, activity reset, timeout callback |
| `hooks/useSecurityClear.test.ts` | Register cleanup, trigger clearAll, unregister |

**Context tests**:
| Test File | Covers |
|-----------|--------|
| `contexts/AuthContext.test.tsx` | Login/logout state, session validation, redirect |
| `contexts/EncryptionContext.test.tsx` | Key setup, unlock, lock, encrypt/decrypt delegation |

**Service tests**:
| Test File | Covers |
|-----------|--------|
| `services/api.test.ts` | API client methods, auth header injection, error handling |

### Shared Tests (`shared/__tests__/`)

**Crypto tests** (every encryption function):
| Test File | Covers |
|-----------|--------|
| `crypto/primitives.test.ts` | generateMasterKey, deriveKEK, encrypt/decrypt round-trip, wrap/unwrap key, generateIv, generateSalt |
| `crypto/encryptionService.test.ts` | encryptPost/decryptPost round-trip, setupEncryption, unwrapMasterKey, recovery key flow |
| `crypto/encoding.test.ts` | base64 round-trips, ArrayBuffer conversions |

**Validation tests**:
| Test File | Covers |
|-----------|--------|
| `validation/schemas.test.ts` | Zod schema validation for all request/response types |

### Test Scripts (in root `package.json`)
```json
{
  "scripts": {
    "test": "npm run test:shared && npm run test:server && npm run test:client",
    "test:shared": "cd shared && vitest run",
    "test:server": "cd server && vitest run",
    "test:client": "cd client && vitest run",
    "test:watch": "vitest --workspace",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Test-First Approach
For each implementation step:
1. Write the test skeleton (describe blocks, test cases)
2. Implement the feature
3. Run tests — all must pass
4. `npm test` from root runs all three packages

## Verification

After Phase 1 is complete:
1. `npm install` from root — all workspaces install
2. Start server: `cd server && npm run dev` — Express starts on port 3001
3. Start client: `cd client && npm run dev` — Vite dev server on port 5173
4. Register a new user — account created, recovery key shown, encryption setup
5. Login — session created, master key unlocked
6. Create an entry with topic — encrypted in DB, decrypted in UI
7. Search entries — client-side filtering works
8. Change accent color/background — persists in settings
9. Inactivity timeout — auto-logout after idle period
10. Session management — view and revoke sessions
