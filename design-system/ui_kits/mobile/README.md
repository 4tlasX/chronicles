# Mobile app — Chronicles

The primary experience: a **quick-capture journaling dashboard**. You capture
anything — task, event, journal, quote, goal, meal, recipe, idea — and Chronicles
sorts it into useful views.

**Screens (in `app.jsx`):**
- **Home (dashboard)** — greeting, the **QuickCapture** composer (dropdown topic
  picker + formatting + mic), an **inbox banner** (captures land in the Inbox), then
  a grid of widgets: this-week calendar glance, weather, wellness (mood + water),
  medication schedule, today's meals, upcoming, and customizable topic widgets
  (+ an "Add widget" tile).
- **Library** — the same captures sorted into tabbed views, starting with the
  **Inbox** (file or dismiss each capture), then Journal, Quotes, Goals, Tasks,
  Meals, Recipes.
- **Calendar** — week strip + the day's events.
- **You** — profile, AccentPicker, dark mode, reminders.
- **Capture sheet** — the center button opens QuickCapture as a bottom sheet; new
  captures flow into the right Library view.

Type: Work Sans headings + Open Sans UI (friendly sans-on-sans), soft-rounded
light tiles. Built from `window.ChroniclesDesignSystem_cefe3d`. Open `index.html`.
