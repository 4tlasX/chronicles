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
│           ├── auth.ts                # Register, login, logout, salt, change-password, recover
│           ├── entries.ts             # CRUD for journal entries (encrypted)
│           ├── topics.ts              # CRUD for topics/taxonomies
│           ├── settings.ts            # Key-value settings
│           └── sessions.ts            # List, revoke, revoke-all sessions
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

1. **Authentication Layer (Server)**: bcrypt password hash (12 rounds), split-token database sessions with immediate revocation
2. **Encryption Layer (Client)**: AES-256-GCM with auto-generated master key wrapped by password-derived KEK (PBKDF2-SHA256, 600k iterations)

Password changes only re-wrap the master key (instant). Data is never re-encrypted on password change.

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
- `client/src/contexts/AuthContext.tsx` — Session state, login/logout/register
- `client/src/contexts/EncryptionContext.tsx` — Master key lifecycle, encrypt/decrypt delegation
- `client/src/stores/uiStore.ts` — Search, sidebar, view mode, theme colors
- `client/src/stores/entriesStore.ts` — Encrypted entries cache, topics, CRUD operations

**Client Services:**
- `client/src/services/api.ts` — Single API client with `X-Requested-With` CSRF header

### Querying User Data

User-specific tables require raw SQL via `tenantQueries.ts`:
```typescript
import { getAllPosts, createPost } from './db/tenantQueries.js';

// Schema name comes from authenticated session (never from client)
const posts = await getAllPosts(req.auth.tenantSchemaName);
```

## Features

### Phase 1 (Current — Foundation)
- User authentication with bcrypt + split-token sessions
- Client-side AES-256-GCM encryption with non-extractable keys
- Journal entries with TipTap rich text editor
- Topic organization with icons and colors
- Client-side search (keyword + date range)
- Settings (header color, background image, feature toggles)
- Session management (view/revoke active sessions)
- Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)

### Phase 2 (Productivity)
- Goals & milestones with progress tracking
- Tasks with auto-migration (incomplete tasks move to current day)
- Entry relationships (goal → milestone → task linking)
- Drag-and-drop reordering

### Phase 3 (Health Tracking)
- Medications with dosage, frequency, scheduled times
- Dose logging with timestamps
- Food tracking with meal types, ingredients, calorie counting
- Symptom tracking with severity scale
- Exercise tracking with type, duration, intensity, distance
- Schedule view (today's medication timeline)
- Reporting with correlation analysis + calorie summaries

### Phase 4 (Calendar, Sharing & Media)
- Calendar events (encrypted titles, recurrence rules)
- Entertainment tracking (music, books, TV/movies)
- Inspiration collection (research, ideas, quotes)
- Entry sharing via public links (with expiration, view count)
- Image uploads (encrypted storage)

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
