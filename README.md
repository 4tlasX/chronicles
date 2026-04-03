# Chronicles - In Active Design/Development

A journal for those too busy to journal with zero-knowledge encryption. Chronicles is designed as a simple daily log. The core philosophy is to capture the key moments of your day briefly in less than 10-15 minutes, then use topics to organize and find them later.

## Features

- **Encrypted Journal Entries** - Rich text editor with client-side encryption
- **Topic Organization** - Categorize entries with custom topics, icons, and colors
- **Goals & Milestones** - Track goals with milestone progress
- **Medical Tracking** - Log medications, symptoms, food (with calorie tracking), and schedules
- **Calendar View** - Visual overview of entries by date
- **Entry Sharing** - Share specific entries via secure public links
- **Bookmarks** - Mark and quickly access important entries
- **Mobile Responsive** - Works on desktop and mobile devices
- **Customizable colors and background** - Choose from a variety of colors and background images

## Privacy

- All entry content is encrypted in the browser before transmission
- Recovery key system allows password reset without compromising zero-knowledge design
- Schema-per-user database isolation (not row-level security)
- Session Management - Revoke sessions at any time if you see an unfamiliar device
- Non-extractable CryptoKeys — master key cannot be exported from the browser's crypto subsystem
- Split-token sessions — database leaks cannot reconstruct valid session tokens

## Screenshots
<img width="1238" height="717" alt="Screenshot 2026-04-03 at 4 43 06 PM" src="https://github.com/user-attachments/assets/8308f4ec-9098-4142-8786-c067a1955c23" />
<img width="1382" height="725" alt="Screenshot 2026-04-03 at 4 43 44 PM" src="https://github.com/user-attachments/assets/71dda451-827b-4e19-8bcd-03294f87519c" />
<img width="1382" height="725" alt="Screenshot 2026-04-03 at 4 43 44 PM" src="https://github.com/user-attachments/assets/eb02bfdf-b24e-4bc9-becb-d87c8e354ef9" />
<img width="1371" height="733" alt="Screenshot 2026-04-03 at 4 44 02 PM" src="https://github.com/user-attachments/assets/f81fa555-b840-4d9d-a8fd-a48d33cd2934" />
<img width="1377" height="744" alt="Screenshot 2026-04-02 at 11 07 13 PM" src="https://github.com/user-attachments/assets/1114a924-bf13-4b0c-93ea-e7412c6de9db" />
<img width="1375" height="721" alt="Screenshot 2026-04-03 at 4 44 37 PM" src="https://github.com/user-attachments/assets/dd8ef232-d0a1-4395-915b-62d8c6eb002b" />
<img width="1376" height="723" alt="Screenshot 2026-04-03 at 4 45 10 PM" src="https://github.com/user-attachments/assets/64827b0b-67d3-4ad7-b5db-a2e8f82274d1" />
<img width="1380" height="723" alt="Screenshot 2026-04-03 at 4 45 28 PM" src="https://github.com/user-attachments/assets/90d1a3cb-43c2-4664-9604-8464b4ded8f7" />
<img width="1379" height="729" alt="Screenshot 2026-04-03 at 4 45 45 PM" src="https://github.com/user-attachments/assets/216e2ad0-dd09-4f52-8ea4-8e53ceec6c29" />
<img width="1380" height="733" alt="Screenshot 2026-04-03 at 4 46 29 PM" src="https://github.com/user-attachments/assets/1962ae88-a44a-4379-ad69-1b19b6ff4f0c" />

## Architecture

This is a complete rebuild combining the best of the original Chronicles UI with a cleaner, modular architecture:

- **Client**: React 19 SPA (Vite) — no Next.js, ready for React Native
- **Server**: Express 5 API with TypeScript
- **Shared**: Crypto, types, validation, and theme tokens shared across platforms
- **Components**: Atomic Design (atoms → molecules → organisms → templates → views)
- **Styling**: styled-components (CSS-in-JS) — works on both web and React Native

```
chronicles-rebuild/
├── client/          # React SPA (Vite + styled-components)
├── server/          # Express API (Prisma + PostgreSQL)
├── shared/          # Shared code (crypto, types, theme)
└── docs/            # BLUEPRINT.md — full architectural plan
```

## How It Works

Chronicles is designed as a simple daily log. The core philosophy is to capture the key moments of your day briefly in less than 10-15 minutes, then use topics to organize and find them later.

**Important**: You can only add entries for today or edit past entries. You cannot create entries for future dates. This keeps Chronicles focused as a record of what happened, not a planning tool. However, you can use it to track goals, milestones, events, and ideas.

### Topics

Topics are how you categorize entries. Think of them as tags or folders.

**Default Topics**: Chronicles comes with several built-in topics that have special functionality:
- **Task** - Todo items with completion tracking
- **Goal** - Long-term objectives with milestone support
- **Milestone** - Checkpoints within goals
- **Medication** - Medication schedules and tracking
- **Food** - Meal logging with ingredients and calorie tracking
- **Symptom** - Health symptom tracking with severity
- **Exercise** - Daily logs of exercise types and duration
- **Event** - Calendar events with date/time/location
- **Meeting** - Meetings with attendees and agenda
- **Music** - Track music you're listening to
- **Books** - Log books you're reading
- **TV/Movies** - Track shows and films
- **Research** - Save research notes and findings
- **Idea** - Capture ideas for later
- **Quote** - Save inspiring quotes

You can create your own topics for anything else (Work, Personal, Ideas, etc.).

### Special Entry Types

When you select certain topics, additional settings appear:

#### Tasks
- **Completed** - Check when the task is done
- **Auto-migrate if incomplete** - Uncompleted tasks automatically move to the current day at midnight
- **Link to Milestones** - Connect tasks to milestones to track progress toward goals

#### Goals
- **Type** - Short-term or Long-term
- **Status** - Active, Completed, or Archived
- **Target Date** - Optional deadline
- **Progress** - Automatically calculated from linked milestones

#### Medications
- **Dosage** - Amount per dose (e.g., "500mg")
- **Frequency** - Once daily, twice daily, three times daily, as needed, or custom
- **Schedule Times** - Specific times for each dose
- **Active** - Toggle when starting/stopping a medication

#### Food
- **Meal Type** - Breakfast, lunch, dinner, or snack
- **Time Consumed** - When you ate
- **Ingredients** - Comma-separated list (used for correlation analysis with symptoms)
- **Calories** - Estimated calorie count for the meal

#### Symptoms
- **Severity** - Scale of 1-10 (mild to severe)
- **Time Occurred** - When the symptom started
- **Duration** - How long it lasted (in minutes)

### Settings

- **Sessions** - View and revoke active sessions on other devices
- **Change Password** - Update your password (master key is re-wrapped, data is not re-encrypted)
- **Feature Toggles** - Enable/disable features like the medical tracker
- **Theme Customization**:
  - **Header Color** - Choose from 18 colors (Dark, Navy, Teal, Coral, etc.) or transparent
  - **Background Image** - Select from 28 curated images from Unsplash artists

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
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Recovery Key:**
At registration, you'll receive a recovery key (formatted as hex with dashes). This key is shown only once — save it securely. If you forget your password, this key is the only way to recover your account.

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

- **Frontend**: React 19, Vite, react-router-dom, styled-components, Zustand, TipTap
- **Backend**: Express 5, TypeScript, Prisma
- **Database**: PostgreSQL (schema-per-user isolation)
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2-SHA256 600k iterations)
- **Auth**: Split-token sessions (selector + SHA-256 verifier hash)
- **Testing**: Vitest, React Testing Library, supertest

## License

© 2025 Claudette Raynor | All Rights Reserved. You may not use this for any commercial purpose. You can download this application for personal use only, but you may not modify it.
