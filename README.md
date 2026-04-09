# Chronicles - In Active Design/Development

A zero-knowledge encrypted journal for those too busy to journal. Capture the key moments of your day, organize with topics, and track health, goals, and more — all encrypted on your device before it ever leaves the browser.

## Features

- **Zero-Knowledge Encryption** - AES-256-GCM client-side encryption with non-extractable keys
- **Dashboard Home** - Drag-and-drop widgets: quick entry, daily priorities, events, tasks, shopping, medication schedule; daily quote and Playfair greeting
- **Rich Text Editor** - TipTap-based editor with formatting toolbar and inline drawing support
- **Topic Organization** - Categorize entries with custom topics, icons, and colors
- **Quick Tab Filters** - Date, Tasks, All, Bookmarks, and Search views
- **Goals & Milestones** - Track goals with milestone progress and task linking
- **Health Tracking** - Medications, symptoms, food, exercise, and allergies
- **Medication Schedule** - Daily dose tracking with time-based scheduling
- **Health Reporting** - Correlation analysis, severity trends, and exercise impact charts with date range filtering
- **Calendar View** - Visual month overview; events and meetings appear on their scheduled date in your header colour
- **Entry Sharing** - Share entries via encrypted public links
- **Printable Views** - Print medication lists, symptoms, and allergy records
- **PWA Support** - Installable as a standalone app with offline shell caching
- **Keyboard Shortcuts** - Ctrl+N (new entry), Ctrl+D (delete), Enter to save
- **Customizable Theme** - 40+ muted vintage header colors, 28 background images, light/dark mode
- **Apple Pencil Support** - Scribble handwriting-to-text in all fields; freehand drawing canvas with pressure sensitivity, palm rejection, and undo — drawings saved inline as encrypted SVG
- **Mobile Responsive** - Collapsible navigation, touch-friendly tap targets
- **Accessible** - ARIA roles, focus management, keyboard navigation, reduced motion support

## Privacy

- All entry content is encrypted in the browser before transmission
- Recovery key system allows password reset without compromising zero-knowledge design
- Schema-per-user database isolation (not row-level security)
- Session management — view and revoke active sessions from any device
- Non-extractable CryptoKeys — master key cannot be exported from the browser's crypto subsystem
- Split-token sessions — database leaks cannot reconstruct valid session tokens

## Screenshots
<img width="1430" height="719" alt="Screenshot 2026-04-04 at 7 35 22 PM" src="https://github.com/user-attachments/assets/06ce36c5-f24f-450b-9762-365c920d5908" />
<img width="1392" height="730" alt="Screenshot 2026-04-08 at 5 52 26 PM" src="https://github.com/user-attachments/assets/492b25c1-fec4-4b9e-9968-4b0f62ac73b9" />
<img width="1432" height="725" alt="Screenshot 2026-04-04 at 7 36 07 PM" src="https://github.com/user-attachments/assets/9d1c516a-edcd-47ef-953d-57798b4b86d5" />
<img width="1430" height="723" alt="Screenshot 2026-04-04 at 7 36 33 PM" src="https://github.com/user-attachments/assets/0690d1b6-4d2c-40f4-b0d2-cb20fc1e0632" />
<img width="1394" height="729" alt="Screenshot 2026-04-08 at 5 52 52 PM" src="https://github.com/user-attachments/assets/b9260411-88df-4d81-a26b-56b5f580b3f3" />
<img width="1389" height="639" alt="Screenshot 2026-04-08 at 5 52 40 PM" src="https://github.com/user-attachments/assets/78f8fe7d-3733-45be-8132-feb0f159f6e1" />
<img width="1428" height="729" alt="Screenshot 2026-04-04 at 7 36 59 PM" src="https://github.com/user-attachments/assets/0f629e6f-b325-4fce-b156-2e3f52456824" />
<img width="1432" height="726" alt="Screenshot 2026-04-04 at 7 48 08 PM" src="https://github.com/user-attachments/assets/6169bf21-0d3a-4e97-bf31-78044b3033f5" />
<img width="1427" height="716" alt="Screenshot 2026-04-04 at 7 37 37 PM" src="https://github.com/user-attachments/assets/2700db50-5ec3-457c-9648-e3c76d012ba9" />
<img width="1441" height="725" alt="Screenshot 2026-04-04 at 7 38 50 PM" src="https://github.com/user-attachments/assets/a8ff425d-37cf-4b3b-a5b1-f75a5700b97a" />


## Architecture

This is a complete rebuild combining the best of the original Chronicles UI with a cleaner, modular architecture:

- **Client**: React 19 SPA (Vite) — no Next.js, ready for React Native
- **Server**: Express 5 API with TypeScript
- **Shared**: Crypto, types, validation, and theme tokens shared across platforms
- **Components**: Atomic Design (atoms -> molecules -> organisms -> templates -> views)
- **Styling**: styled-components (CSS-in-JS) with muted vintage design tokens

```
chronicles-rebuild/
├── client/          # React SPA (Vite + styled-components + PWA)
├── server/          # Express API (Prisma + PostgreSQL)
├── shared/          # Shared code (crypto, types, theme)
└── docs/            # BLUEPRINT.md, ACCESSIBILITY_UX_PLAN.md
```

## How It Works

Chronicles is a daily journal. Capture moments, organize with topics, and track what matters to you.

### Topics

Topics categorize your entries — like tags or folders. Each has an icon and color.

**Default Topics** with special fields:
- **Task** - Todo items with completion tracking and auto-migration
- **Goal** - Objectives with milestone progress tracking
- **Milestone** - Checkpoints within goals, linkable to tasks
- **Medication** - Schedules with dosage, frequency, and dose logging
- **Food** - Meal logging with ingredients, calories, and meal type
- **Symptom** - Severity tracking (1-10 scale) with duration
- **Exercise** - Type, duration, intensity, and distance tracking
- **Allergy** - Allergen, severity, and reaction tracking
- **Event** - Date/time, location, and contact details
- **Meeting** - Attendees, topic, location, and scheduling
- **Music / Books / TV/Movies** - Entertainment tracking
- **Research / Idea / Quote** - Inspiration collection

You can create your own topics for anything else.

### Navigation

- **Dashboard** (`/`) - Home view with daily widgets and quick entry
- **Journal** (`/journal`) - Main entry view with quick tab filters (Date, Tasks, All, Bookmarks, Search)
- **Topics** - Manage and browse entries by topic
- **Calendar** - Month view with clickable days for detail; events/meetings appear on their scheduled date
- **Planning** - Goals, milestones, tasks, and todos (dropdown selector)
- **Health** - Medications, schedule, food, exercise, symptoms, allergies, and reporting
- **Quick Links** - Entertainment and inspiration collections

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New entry |
| Ctrl/Cmd + D | Delete selected entry |
| Enter | Save entry (compact mode) |
| Shift + N | New entry (when not typing) |

### Health Reporting

Analyze health data with correlation analysis:
- **Symptom frequency** and **severity trends** over time
- **Food-symptom correlations** — identify trigger ingredients
- **Exercise impact** on symptom patterns
- **Calorie summaries** by meal type
- **Date range filtering** — Today, Week, Month, Year, or custom date range

### Printable Views

Medication lists, symptom logs, and allergy records can be printed directly from the browser for sharing with healthcare providers.

### Settings

- **Sessions** - View and revoke active sessions
- **Password** - Change password (master key re-wrapped, data not re-encrypted)
- **Features** - Enable/disable health tracking, planning, entertainment, and more
- **Theme** - 40+ header colors, 28 background images, light/dark mode
- **Data** - Seed test data, export/import entries

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+

### Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your database credentials
   ```

4. Set up the database:
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

5. Run both servers:
   ```bash
   npm run dev
   ```
   This starts the Express API on port 3001 and the Vite dev server on port 5173.

### Registration

**Password requirements:**
- Minimum 12 characters
- At least one uppercase letter, lowercase letter, and number

**Recovery Key:**
At registration, you'll receive a recovery key (formatted as hex with dashes). Save it securely — it's the only way to recover your account if you forget your password.

## Commands

```bash
npm run dev              # Start both client and server
npm run dev:client       # Start Vite dev server only
npm run dev:server       # Start Express API only
npm run build            # Build all packages
npm run test             # Run all tests (shared + server + client)
npm run test:coverage    # Run tests with coverage
```

## Tech Stack

- **Frontend**: React 19, Vite, react-router-dom, styled-components, Zustand, TipTap, perfect-freehand
- **Backend**: Express 5, TypeScript, Prisma
- **Database**: PostgreSQL (schema-per-user isolation)
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2-SHA256 600k iterations)
- **Auth**: Split-token sessions (selector + SHA-256 verifier hash)
- **PWA**: vite-plugin-pwa with Workbox (shell caching, no encrypted data cached)
- **Accessibility**: ARIA roles, focus trapping, keyboard navigation, prefers-reduced-motion
- **Testing**: Vitest, React Testing Library, supertest

## License

All Rights Reserved. You may not use this for any commercial purpose. You can download this application for personal use only, but you may not modify it.
