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
- **Daily Wellness Check-in** - Tap-to-fill water glasses, mood faces (1–5), sleep hours, period toggle, and flow intensity on the dashboard; entries stored encrypted under the Wellness topic and fully editable in the journal
- **Health Reporting** - Correlation analysis, severity trends, exercise impact, and wellness trends (water/mood/sleep) with cross-correlation insights (sleep→mood, water→symptoms, exercise→sleep, mood→symptoms); cycle calendar showing period and flow days by month; date range filtering
- **Mini Calendar Widget** - Monthly grid on dashboard with entry-presence dots; click any day to jump to that day's journal entries
- **Calendar View** - Visual month overview; events and meetings appear on their scheduled date in your header colour
- **Calendar Sync** - Two-way sync of Event and Meeting entries with Google Calendar (pick any calendar you own); optional import of events created directly in Google; read-only Apple Calendar subscription feed (ICS) for iPhone/iPad/Mac; connect, disconnect, and sync on demand from Settings
- **Entry Images** - Attach up to 7 photos per entry, stored **zero-knowledge in your own Cloudflare R2 bucket**; images are encrypted in the browser with your master key before upload, so your bucket only ever holds ciphertext; thumbnail strip, tap-to-open lightbox, and an optional featured image that renders as a hero banner above the entry
- **Entry Sharing** - Share entries via encrypted public links (hidden automatically for entries with images)
- **PWA Support** - Installable as a standalone app with offline shell caching
- **Customizable Theme** - 40+ muted vintage header colors, 28 background images, light/dark mode
- **Display Name** - Set a display name shown in the dashboard greeting; username shown read-only in account settings
- **Apple Pencil Support** - Scribble handwriting-to-text in all fields; freehand drawing canvas with pressure sensitivity, palm rejection, and undo — drawings saved inline as encrypted SVG
- **Mobile Responsive** - Collapsible navigation, touch-friendly tap targets, single-column dashboard on small screens
- **Accessible** - ARIA roles, focus management, keyboard navigation, reduced motion support

## Privacy & Security

- All entry content is encrypted in the browser before transmission
- **Images never touch the Chronicles server** — they are encrypted client-side and uploaded straight to your own R2 bucket with URLs signed in the browser; your R2 credentials are themselves encrypted with your master key, so the server stores only ciphertext it cannot read
- **Two-factor authentication** (TOTP) — no external services; secrets stored encrypted server-side
- Recovery key system allows password reset without compromising zero-knowledge design
- Schema-per-user database isolation (not row-level security)
- Session management — view and revoke active sessions from any device
- Non-extractable CryptoKeys — master key cannot be exported from the browser's crypto subsystem
- Split-token sessions — database leaks cannot reconstruct valid session tokens

## Screenshots - Chronicles is in a re-design slated for release July/August with a phone app via React Native coming soon.
New look:
<img width="1374" height="720" alt="Screenshot 2026-06-24 at 11 45 57 PM" src="https://github.com/user-attachments/assets/9c574af0-c97b-4dd2-9dd5-194044513e7e" />
<img width="1374" height="722" alt="Screenshot 2026-06-24 at 11 47 51 PM" src="https://github.com/user-attachments/assets/fcef5215-b3eb-4f76-b7d2-65aa8b4e0f2b" />
<img width="1382" height="718" alt="Screenshot 2026-06-24 at 11 48 00 PM" src="https://github.com/user-attachments/assets/dc28747f-120f-431c-8ac4-343d26efae7d" />
<img width="1367" height="707" alt="Screenshot 2026-06-24 at 11 48 28 PM" src="https://github.com/user-attachments/assets/c7481ecb-735f-4de4-82c4-ac3674f59483" />
<img width="1372" height="723" alt="Screenshot 2026-06-24 at 11 49 25 PM" src="https://github.com/user-attachments/assets/97e33025-ade1-41b6-bb0a-17f853c1d448" />
<img width="1370" height="700" alt="Screenshot 2026-06-24 at 11 49 55 PM" src="https://github.com/user-attachments/assets/45d5a801-b54d-4ff1-8da8-23433498eac9" />
<img width="1374" height="709" alt="Screenshot 2026-06-24 at 11 50 17 PM" src="https://github.com/user-attachments/assets/4ac9fd6e-2a0b-47a0-8101-56342ae40cc8" />
<img width="1376" height="689" alt="Screenshot 2026-06-24 at 11 50 27 PM" src="https://github.com/user-attachments/assets/f9036d87-8593-4b32-855a-783c042f5330" />
<img width="1373" height="701" alt="Screenshot 2026-06-24 at 11 50 42 PM" src="https://github.com/user-attachments/assets/5d3b70b8-9dbd-4e3f-8ad5-40b8fc4a2e86" />
<img width="1378" height="708" alt="Screenshot 2026-06-24 at 11 51 49 PM" src="https://github.com/user-attachments/assets/3fb1861a-254f-41a7-8eb9-e9a0dd441787" />
<img width="1383" height="720" alt="Screenshot 2026-06-24 at 11 52 00 PM" src="https://github.com/user-attachments/assets/bef2ad9d-c12f-40c9-8bb4-84c7a1d5810f" />
<img width="1381" height="721" alt="Screenshot 2026-06-24 at 11 52 19 PM" src="https://github.com/user-attachments/assets/f5f9938c-7022-4986-a1aa-05c7f2cda893" />


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

### Calendar Sync

Keep Event and Meeting entries in sync with the calendars you already use:

- **Google Calendar (two-way)** — Connect your Google account in Settings → Calendar Sync and pick which calendar to sync to. Events and meetings you create in Chronicles appear there; edits and deletions propagate. Optionally import events created directly in Google (from today onward) as Chronicles entries.
- **Apple Calendar (subscription feed)** — Enable the ICS feed to get a private `webcal://` URL you can subscribe to from iPhone, iPad, or Mac (one-way: Chronicles → Apple Calendar). Regenerate the URL any time if it leaks.

Only event titles, times, and locations are synced — never your journal content. Requires Google OAuth credentials on the server (see `server/.env.example`); the Apple feed works with no external setup.

### Entry Images

Add up to 7 photos to any journal entry — without giving up zero-knowledge:

1. **Bring your own bucket** — Create a free Cloudflare R2 bucket and an API token (Object Read & Write, scoped to that bucket). Your storage, your bill (R2's free tier has no egress fees).
2. **Enter credentials in Settings → Entry images** — They autosave as you type, get encrypted with your master key, and are stored as ciphertext the server cannot read. The setup guide in Settings walks through the bucket, token, and the required CORS policy, and an optional "Test connection" verifies everything from your browser.
3. **Attach images in the editor** — Photos are downscaled, encrypted with AES-256-GCM in the browser, and uploaded directly to your bucket with browser-signed URLs. Chronicles' server never sees the images or your credentials — your bucket only ever contains encrypted noise.

Star an image to feature it as a full-width banner above the entry; tap any thumbnail for a full-screen lightbox with keyboard and swipe navigation. Deleting an image or an entry (including bulk delete) also removes the objects from your bucket. Sharing is automatically disabled for entries that contain images.

### Printable Views

Medication lists, symptom logs, and allergy records can be printed directly from the browser for sharing with healthcare providers.

### Settings

- **Account** - Display name, read-only username
- **Security** - Change password; Two-factor authentication (TOTP setup wizard with QR code and backup codes)
- **Sessions** - View and revoke active sessions from any device
- **Features** - Enable/disable health tracking, planning, entertainment, and more
- **Calendar Sync** - Connect Google Calendar, choose the target calendar, toggle imports, manage the Apple ICS feed, and clean up old events
- **Entry Images** - Toggle the feature, enter your Cloudflare R2 credentials (autosaved and master-key encrypted), test the connection, and follow the built-in setup guide
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
   Optional: to enable Google Calendar sync, add Google OAuth credentials and a
   `CALENDAR_TOKEN_KEY` (see comments in `.env.example`). Entry images need **no**
   server configuration — each user connects their own R2 bucket from Settings.

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
- **Image Storage**: User-owned Cloudflare R2 buckets; dependency-free in-browser AWS SigV4 signing (Web Crypto HMAC)
- **Calendar**: Google Calendar API (OAuth 2.0, two-way) + self-hosted ICS subscription feed
- **Auth**: Split-token sessions (selector + SHA-256 verifier hash) + TOTP 2FA (otplib)
- **PWA**: vite-plugin-pwa with Workbox (shell caching, no encrypted data cached)
- **Accessibility**: ARIA roles, focus trapping, keyboard navigation, prefers-reduced-motion
- **Testing**: Vitest, React Testing Library, supertest

## License

All Rights Reserved. You may not use this for any commercial purpose. You can download this application for personal use only, but you may not modify it.
