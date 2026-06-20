# Chronicles — working agreement

- **Design-only changes by default.** When iterating, keep the existing UI
  structure, screens, elements, and functionality intact — change the *design*
  (type, color, spacing, elegance, styling), not the layout or feature set, unless
  the user explicitly asks to add/remove an element.
- **Product:** Chronicles is a **quick-capture journaling app** (not a task
  manager). Core surfaces and elements that must persist: the **dashboard**, the
  **QuickCapture** composer (dropdown topic picker + formatting + mic), **Journal**,
  **Calendar**, **Topics**, and the customizable **widgets** (calendar glance,
  wellness, medication, weather, meal plan, upcoming, custom).
- **Type:** Work Sans (display/headings, weight 200–300 for large headings) + Open
  Sans (UI/body, tracked-uppercase labels) — a friendly, rounded sans-on-sans
  pairing. **Colors/accents are approved — do not change them.**
- **Aesthetic:** modern light/dark tile/panel — **sharp, squared corners**
  (cards/tiles ~2px), **borderless tonal panels** (separated by fill, not outline),
  filled inputs, solid accent tiles + accent left-bar for the active item, thin
  (Light-weight) display headings; no drop shadows on panels (shadows only on
  floating overlays: menus, dialogs, toasts).
- **Light mode = pure white (#ffffff) canvas.** Content and widgets sit directly
  on white. Sidebar uses `--bg-sunken` (#f5f6f8). NO gray behind anything.
- **Dark mode = deep charcoal (#1b1d26) canvas.** Sidebar darker (#13151e).
- **Dashboard widgets = separate tiles.** Each widget (Quick Entry, Priorities,
  Events, Tasks, Shopping, Menu Plan, Log Meal, Affirmations, Wellness, Mini
  Calendar, Medications, Weather) is a distinct tile with a 1px border. They form
  a two-column grid on desktop (2fr/1fr), stacked on mobile.
- **Active nav = solid filled teal block** (white icon/text).
- **Thin accent stripe** (3px teal) at the very top of the app chrome.
- **Heading weight = 200–300 (ExtraLight/Light).**
- **Sidebar structure (from codebase):**
  - Core: Dashboard, Journal, Calendar, Topics
  - Collapsible: Planning (Goals, Milestones, Tasks, Todos, Filters, Menu Planner,
    Shopping Lists)
  - Collapsible: Health (Schedule, Medications, Meals, Symptoms, Exercise,
    Allergies, Reports)
  - Collapsible: Inspiration (Quotes, Ideas, Music, Books, TV/Movies)
  - Collapsible: Your Topics (user custom topics — could be hundreds)
  - Collapsible: Settings (Preferences)
  - **NO accent color picker in sidebar** — Settings only.
  - **NO Inbox** — not a feature in the codebase.
