# Chronicles - In Active Design/Development

A zero-knowledge encrypted journal and digital day planner for those too busy to journal. Capture the key moments of your day, organize with topics, and track health, goals, and more — all encrypted on your device before it ever leaves the browser.

## Features

- **Zero-Knowledge Encryption** - AES-256-GCM client-side encryption with non-extractable keys; server never sees plaintext
- **Two-Factor Authentication** - TOTP-based 2FA (authenticator app); inline setup wizard with QR code, confirmation step, and 8 backup codes; disable with password confirmation
- **Dashboard Home** - Two-column drag-and-drop widget layout; quick entry, daily priorities, events & meetings, mini calendar, affirmations, daily wellness check-in, tasks, shopping list, medication schedule, weather, and menu plan; daily quote and greeting; Add your custom topic widget
- **Rich Text Editor** - TipTap-based editor with formatting toolbar, inline freehand drawing, and voice dictation
- **Voice Dictation** - Tap the mic button to dictate entries hands-free using the Web Speech API; interim text previews in real-time as you speak; works offline on iOS/Safari (on-device processing); auto-continues after silence
- **Topic Organization** - Categorize entries with custom topics, icons, and drag-and-drop reordering; define your own custom fields per topic (text, number, date, yes/no, URL) — fields appear in the entry editor and dashboard quick entry; entries saved with only field values auto-summarize them as content
- **Quick Tab Filters** - Today, Date (with active filter bar and clear button), Tasks, All, Bookmarks, and Search views
- **Goals & Milestones** - Track goals with milestone progress and task linking; milestone status cycle (Not Started → In Progress → Completed) with tap-to-advance on the card
- **Custom Planner Filters** - Cross-hierarchy search across goals, milestones, tasks, and todos; filter by keyword, item type, status, priority, parent goal, and parent milestone; save named filters that persist and can be reloaded in one tap
- **Meal Planning & Recipes** - Weekly menu planner, recipe entries with ingredients and instructions, linked shopping lists
- **Shopping Lists** - Checklist-style lists linkable to recipes; dashboard widget shows active list with inline check-off
- **Health Tracking** - Medications, symptoms, food, exercise, and allergies; printable medication lists (with dosage and schedule), symptom logs, and allergy records
- **Medication Schedule** - Daily dose tracking with time-based scheduling; real-time sync on tab focus
- **Daily Wellness Check-in** - Tap-to-fill water glasses, mood faces (1–5), and sleep hours (cloud-moon icons) on the dashboard; entries stored encrypted under the Wellness topic and fully editable in the journal
- **Health Reporting** - Correlation analysis, severity trends, exercise impact, and wellness trends (water/mood/sleep) with cross-correlation insights (sleep→mood, water→symptoms, exercise→sleep, mood→symptoms); date range filtering
- **Mini Calendar Widget** - Monthly grid on dashboard with entry-presence dots; click any day to jump to that day's journal entries
- **Calendar View** - Visual month overview; events and meetings appear on their scheduled date in your header colour
- **Entry Sharing** - Share entries via encrypted public links
- **PWA Support** - Installable as a standalone app with offline shell caching
- **Keyboard Shortcuts** - Ctrl+N (new entry), Ctrl+D (delete), Enter to save
- **Customizable Theme** - 40+ muted vintage header colors, 28 background images, light/dark mode
- **Display Name** - Set a display name shown in the dashboard greeting; username shown read-only in account settings
- **Apple Pencil Support** - Scribble handwriting-to-text in all fields; freehand drawing canvas with pressure sensitivity, palm rejection, and undo — drawings saved inline as encrypted SVG
- **Mobile Responsive** - Collapsible navigation, touch-friendly tap targets, single-column dashboard on small screens
- **Accessible** - ARIA roles, focus management, keyboard navigation, reduced motion support

## Privacy & Security

- All entry content is encrypted in the browser before transmission
- **Two-factor authentication** (TOTP) — no external services; secrets stored encrypted server-side
- Recovery key system allows password reset without compromising zero-knowledge design
- Schema-per-user database isolation (not row-level security)
- Session management — view and revoke active sessions from any device
- Non-extractable CryptoKeys — master key cannot be exported from the browser's crypto subsystem
- Split-token sessions — database leaks cannot reconstruct valid session tokens

## Screenshots
<img width="1366" height="691" alt="Screenshot 2026-04-19 at 1 22 46 AM" src="https://github.com/user-attachments/assets/2a9d3ae0-fd41-4d0e-94db-a98fce83a0df" />
<img width="1438" height="701" alt="Screenshot 2026-04-19 at 1 22 10 AM" src="https://github.com/user-attachments/assets/6ce6b191-d09a-4c67-931c-5ef4379f3567" />
<img width="1435" height="697" alt="Screenshot 2026-04-19 at 1 21 20 AM" src="https://github.com/user-attachments/assets/e492b48d-2be6-4126-ba3e-6456673168b0" />
<img width="1455" height="692" alt="Screenshot 2026-04-19 at 1 18 23 AM" src="https://github.com/user-attachments/assets/9f6fbe02-1542-4bf1-b63b-56254c453881" />
<img width="1450" height="685" alt="Screenshot 2026-04-19 at 1 18 14 AM" src="https://github.com/user-attachments/assets/d8967d70-9269-4f79-9d24-6d8728fc4708" />
<img width="1462" height="694" alt="Screenshot 2026-04-19 at 1 19 03 AM" src="https://github.com/user-attachments/assets/9931f768-3f58-4752-97b0-c51d4774a98e" />
<img width="1459" height="699" alt="Screenshot 2026-04-19 at 1 20 19 AM" src="https://github.com/user-attachments/assets/0b811b72-94ae-4c06-969e-291e53097b6b" />
<img width="1455" height="668" alt="Screenshot 2026-04-19 at 1 19 56 AM" src="https://github.com/user-attachments/assets/fc6cdcac-b8f9-4e1e-a40e-f80d9c125038" />
<img width="1463" height="700" alt="Screenshot 2026-04-19 at 1 19 34 AM" src="https://github.com/user-attachments/assets/ddae4d8d-6145-417d-b1e7-c612412546fa" />
<img width="1466" height="730" alt="Screenshot 2026-04-19 at 3 46 11 PM" src="https://github.com/user-attachments/assets/34680099-dad7-4e58-b38b-cf0262049750" />
<img width="1460" height="642" alt="Screenshot 2026-04-19 at 3 46 01 PM" src="https://github.com/user-attachments/assets/a6dc4110-57ed-418a-8487-88e857225fa8" />
<img width="1461" height="701" alt="Screenshot 2026-04-19 at 1 29 30 AM" src="https://github.com/user-attachments/assets/ddf6d0e1-743b-42f5-993d-ad0201f42ea7" />
<img width="1450" height="689" alt="Screenshot 2026-04-19 at 1 29 20 AM" src="https://github.com/user-attachments/assets/e28f2b80-c24d-4c17-a732-5fac73981117" />
<img width="1448" height="694" alt="Screenshot 2026-04-19 at 1 29 10 AM" src="https://github.com/user-attachments/assets/7d216df7-83cd-4266-982b-e647e7f6f03f" />


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
- **Wellness** - Auto-created by the dashboard check-in widget; water, mood, and sleep fields
- **Event** - Date/time, location, and contact details
- **Meeting** - Attendees, topic, location, and scheduling
- **Priorities** - Auto-created by the dashboard priorities widget
- **Music / Books / TV/Movies** - Entertainment tracking
- **Research / Idea / Quote** - Inspiration collection

You can create your own topics for anything else. Any topic can have **user-defined custom fields** — add them by editing a topic in the Topics view. Fields appear in the entry editor and Quick Entry widget. Supported types: text, number, date, yes/no, URL.

### Navigation

- **Dashboard** (`/`) - Home view with daily widgets and quick entry
- **Journal** (`/journal`) - Main entry view with quick tab filters (Today, Date, Tasks, All, Bookmarks, Search)
- **Topics** - Manage and browse entries by topic
- **Calendar** - Month view with clickable days for detail; events/meetings appear on their scheduled date
- **Planning** - Goals, milestones, tasks, and todos (dropdown selector); Custom Filters view at `/goals/filter`
- **Health** - Medications, schedule, food, exercise, symptoms, allergies, and reporting
- **Quick Links** - Entertainment and inspiration collections

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New entry |
| Ctrl/Cmd + D | Delete selected entry |
| Enter | Save entry (when editor is focused) |
| Shift + N | New entry (when not typing) |

### Dashboard Widgets

The dashboard has two columns. Default layout:

| Left | Right |
|------|-------|
| Quick Entry | Mini Calendar |
| Priorities | Affirmations |
| Events & Meetings | Daily Wellness Check-in |
| Menu Plan | *(add more from widget tray)* |

Additional widgets available in the tray: Tasks, Shopping List, Medication Schedule, Weather.

Drag to reorder within or across columns. Layout is saved per-browser.

### Health Reporting

Analyze health data with correlation analysis:
- **Symptom frequency** and **severity trends** over time
- **Food-symptom correlations** — identify trigger ingredients
- **Exercise impact** on symptom patterns
- **Wellness trends** — water, mood, and sleep over time with cross-correlations (sleep→mood, water→symptoms, exercise→sleep, mood→symptoms)
- **Calorie summaries** by meal type
- **Date range filtering** — Today, Week, Month, Year, or custom date range

### Printable Views

Medication lists, symptom logs, and allergy records can be printed directly from the browser for sharing with healthcare providers.

### Settings

- **Account** - Display name, read-only username
- **Security** - Change password; Two-factor authentication (TOTP setup wizard with QR code and backup codes)
- **Sessions** - View and revoke active sessions from any device
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
- **Auth**: Split-token sessions (selector + SHA-256 verifier hash) + TOTP 2FA (otplib)
- **PWA**: vite-plugin-pwa with Workbox (shell caching, no encrypted data cached)
- **Accessibility**: ARIA roles, focus trapping, keyboard navigation, prefers-reduced-motion
- **Testing**: Vitest, React Testing Library, supertest

## License

All Rights Reserved. You may not use this for any commercial purpose. You can download this application for personal use only, but you may not modify it.
