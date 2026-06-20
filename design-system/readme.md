# Chronicles — Design System

Chronicles is a modern, high-end **quick-capture journaling app**. You capture
anything in a breath — a task, an event, a journal entry, a quote, a goal, a meal,
a recipe — and Chronicles **sorts it into useful views**. Captures first land in an
**Inbox**, where you file each one (or let it go). A **dashboard of widgets**
(quick capture, calendar at a glance, wellness, medication, weather, meal plan,
upcoming, and customizable topic widgets) makes the whole thing work. It is **not**
a task manager — tasks are just one of many things you keep here.

This system is a ground-up redesign sharing **no visual DNA** with any prior
version. The mandate: modern, clean, **elegant**, functional, and **highly
accessible**, with a customizable accent so each person's journal feels their own.

> **Sources:** This is a greenfield brand. There was no attached codebase, Figma
> file, or prior design system — the foundations here were authored from the
> product brief. If/when production code or Figma exists, link it here so future
> contributors can reconcile.

---

## What's in the box

| Path | What it is |
|---|---|
| `styles.css` | The single entry point. Consumers link **only** this. `@import`s every token + component stylesheet. |
| `tokens/` | CSS custom properties — colors, accents, semantic light/dark, type, spacing, radius, elevation, motion + base reset. |
| `components/core/` | Buttons, fields, toggles, badges, tags, avatar, card, segmented control, **AccentPicker**, Icon. |
| `components/journal/` | The signature **BulletEntry**, **Collection**, **QuickAdd**. |
| `components/feedback/` | Dialog, Toast, Tooltip, Banner. |
| `components/navigation/` | Tabs. |
| `guidelines/foundations/` | Specimen cards rendered in the Design System tab. |
| `ui_kits/` | Full-screen product recreations — mobile app, desktop app, settings, marketing, onboarding. |
| `assets/` | Logo mark + wordmark (SVG, `currentColor`). |
| `SKILL.md` | Agent-Skill manifest for use in Claude Code. |

**Namespace:** components are exposed at `window.ChroniclesDesignSystem_cefe3d.<Name>`
(e.g. `const { Button, BulletEntry } = window.ChroniclesDesignSystem_cefe3d`).

### Component index (28)

- **core/** — `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Checkbox`,
  `Switch`, `Badge`, `Tag`, `Avatar`, `Card`, `SegmentedControl`, `Dropdown`,
  `AccentPicker` (+ exported `ACCENTS`), `Icon`.
- **journal/** — `BulletEntry`, `Collection`, `QuickAdd`, **`QuickCapture`**
  (the signature capture composer — dropdown topic picker, formatting, mic).
- **dashboard/** — `Widget` (titled tile for the dashboard surface).
- **feedback/** — `Dialog`, `Toast`, `Tooltip`, `Banner`.
- **navigation/** — `Tabs`.

### UI kits (5)

`ui_kits/mobile`, `ui_kits/desktop`, `ui_kits/settings`, `ui_kits/marketing`,
`ui_kits/onboarding` — each is `{ index.html, app.jsx, README.md }`, composed from
the components above. Open any `index.html`.

---

## Content fundamentals — how Chronicles writes

The voice is **quiet, encouraging, and precise** — a thoughtful tool, never a
chirpy mascot. It respects the user's time and intelligence.

- **Person:** Address the user as **you**; the product refers to itself rarely and
  never as "I". ("Carry over unfinished tasks?" not "I'll move your tasks.")
- **Casing:** **Sentence case** everywhere — buttons, titles, menus, headers.
  Never Title Case UI. ("New entry", "This week", "Move to next week?")
- **Tone:** Calm and plainspoken. Short verbs. Favor the active voice.
  Encouraging without cheerleading. Example empty state: *"Nothing logged yet.
  Capture your first entry below."*
- **Length:** Terse. Labels are 1–2 words ("Migrate", "Reflect", "Today").
  Helper text is one short sentence.
- **Metadata** (dates, times, counts) is set in **Open Sans, uppercase and
  tracked** (not a mono face): `WED · JUN 17`, `09:30`. Hashtags keep the accent.
- **Numbers & dates:** Times are 24h or locale-aware `09:30`; dates abbreviate as
  `WED · JUN 17`; counts are plain (`12`, not `12 items` unless needed).
- **Emoji:** Used **only** sparingly as optional mood faces in the wellness
  widget. Everywhere else the iconography is the entry-topic markers (below) and a
  clean stroke icon set — never decorative emoji.
- **Punctuation:** Use the middot `·` as a soft separator. Em-dashes for asides.
  No exclamation points in product copy except genuine celebration (sparingly).
- **Encouragement, not gamification:** Progress is shown as quiet facts
  ("3 of 7 done"), not streaks, confetti, or badges.

**Vibe in one line:** *a calm, well-made notebook that happens to be software.*

---

## Visual foundations

**Overall:** crisp, airy, and restrained. The interface gets out of the way of the
writing. Generous whitespace, hairline structure, one confident accent.

- **Color:** Near-neutral grays with a faint cool cast carry 95% of the UI. A
  single **accent** provides emphasis and is **user-selectable** across seven
  themes (Ink·default, Sage, Clay, Amber, Teal, Rose, Slate). Status hues
  (green/amber/red/blue) are reserved for meaning, never decoration.
- **Light & dark:** A true pair, both borderless and tonal. Light is a three-tone
  stack — soft-gray canvas (`--bg-app` = neutral-150), white panels, slightly
  darker rails (`--bg-sunken`). Dark mirrors the references: near-black canvas
  (`#131418`), charcoal panels a clear step lighter (`#1e2025`), darker rails.
  Accent steps brighten one notch in dark. Toggle via `data-theme="dark"` on `<html>`.
- **Containers:** **Borderless tonal panels.** Cards, widgets, and inputs separate
  from the canvas by **fill tone**, not by outline — a white (or charcoal) panel on
  a grayer (or blacker) canvas. Visible borders are reserved for **dividers**
  (section rules, sidebar edges) and the occasional opt-in `--outlined` variant.
  Inputs are **filled** (`--bg-sunken`), not outlined.
- **Active state = accent block or left bar.** The reference's signature: the one
  active/selected thing is marked by a solid accent tile (a teal icon square) or a
  2px accent **left-edge bar** plus a faint accent-tinted fill (`.ch-row[aria-current]`,
  `.ch-card--active`). Accent is never decorative — it marks exactly one thing.
- **Elevation:** **Flat.** Depth is tonal layering, **never shadow** on panels.
  Shadows (`--shadow-lg/xl`) are reserved for genuinely floating overlays: dropdown
  menus, dialogs, toasts. Hover is a fill shift, never a lift.
- **Type:** **Work Sans** for headings and display — a warm, slightly rounded
  grotesque, friendly but composed. **Open Sans** for all UI, body, and labels —
  a humanist, highly legible workhorse. A friendly **sans-on-sans** pairing;
  contrast comes from weight, size, and tracking. Labels/metadata are
  Open Sans in **uppercase with
  `0.14em` tracking**. Body is 15px. **Display headings are set thin (Light, 300)**
  for an airy, editorial feel — contrast comes from size, not heaviness.
- **Corners:** **Sharp and squared.** The reference aesthetic is hard-edged —
  cards, widgets, and tiles sit at ~2px (essentially square); inputs/buttons 1px;
  sheets/dialogs 2px. Only avatars, switches, dots, and toggle chips are round.
- **Corners:** **Sharp and minimal.** Inputs/buttons 5px, cards 7px, sheets 10px.
  Only pills, avatars, and switches go fully round. Never large playful radii.
- **Borders:** The primary structural device. 1px hairlines in `--border-subtle`
  /`--border-default`. Prefer a border over a shadow.
- **Elevation:** Shadows are soft, low-contrast, neutral-tinted, and **reserved
  for truly floating surfaces** (popovers, dialogs, toasts). Resting cards use a
  hairline, not a shadow.
- **Transparency & blur:** Used sparingly — only the dialog overlay (42% scrim +
  3px backdrop blur). No frosted-glass panels in the resting UI.
- **Motion:** Quick and precise — 140–200ms, decelerating `ease-out`. **Never
  bouncy.** Entrances are short fades + a few px of travel. Press states scale to
  ~0.99 (buttons) / 0.88 (entry-marker taps). No infinite/looping animation. All
  motion respects `prefers-reduced-motion`.
- **Hover:** Backgrounds shift to `--bg-hover` (a step toward the accent-neutral),
  text strengthens secondary→primary; borders go subtle→strong.
- **Press:** A small downward nudge + slight scale-down; primary buttons darken
  to `--color-accent-active`.
- **Focus:** A 3px accent-tinted ring (`--shadow-ring`) plus a 2px outline for
  keyboard users — visible, accessible, consistent across every control.
- **Imagery:** The product itself is image-light (it's about *your* words). Where
  imagery appears (marketing), it's clean, bright, and uncropped — no heavy
  grain or moody color grading.
- **Cards:** Flat surface, 7px radius, 1px subtle border, optional soft shadow
  when `raised`. Interactive cards strengthen border + lift slightly on hover.

---

## Iconography

- **Icon set:** A curated subset of **[Lucide](https://lucide.dev)** (MIT) — clean
  2px stroke, 24px grid, rounded caps/joins. Shipped inline via the `Icon`
  component (`components/core/Icon.jsx`) so there's no runtime dependency; add
  paths there as needed. Reach for Lucide's CDN for any icon not yet included,
  matching the 2px stroke weight.
- **The entry-marker system** is Chronicles' signature iconography. Three core
  topics use crisp CSS glyphs (not a font, not emoji); every other topic uses a
  stroke icon in the accent:
  - **Task** — a small filled dot `•` (tap to complete → check + strikethrough)
  - **Event** — a hollow ring `○`
  - **Note** — a short dash `—`
    **Goal** trophy · **Meal** utensils · **Recipe** coffee · **Idea** sparkles
    (quote text sets in medium-weight Work Sans)
  - **Priority** — a leading accent **star** `★` on any entry
  See `BulletEntry` / `ENTRY_ICONS` for the full map; `QuickCapture.TOPICS` lists
  the capture palette.
- Icons are monochrome and inherit `currentColor`, so they theme with light/dark
  and accent automatically.
- **Logo:** `assets/logo-mark.svg` (diamond-bullet mark) and
  `assets/logo-wordmark.svg`. Both use `currentColor` — set the color to the
  accent or to `--text-primary` as context demands.

---

## Using the system

```html
<!-- Link the one entry point -->
<link rel="stylesheet" href="styles.css" />
<!-- Optional: theme the whole app -->
<html data-theme="dark" data-accent="sage">
```

```jsx
const { Button, BulletEntry, Collection } = window.ChroniclesDesignSystem_cefe3d;
```

Every component references semantic tokens, so theming is automatic — switch
`data-theme` or `data-accent` on any ancestor and the subtree recolors.

---

## Caveats

- **Fonts load from the Google Fonts CDN** (`tokens/fonts.css`), so the compiler
  reports 0 self-hosted `@font-face` rules. For offline/production use, self-host
  Work Sans + Open Sans `.woff2` files in `assets/fonts/` and swap the
  `@import` for local `@font-face` rules.
