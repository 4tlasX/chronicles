# Handoff: Chronicles Design System

## Overview

A unified visual + interaction system for **Chronicles**, the zero-knowledge encrypted journaling / day-planner app. The mock in this bundle pulls every screen — Home, Chronicle, Planner, Settings, a public Landing, and the mobile app — into a single coherent language built around three ideas:

1. **Paper is the substrate.** A tinted off-white (or dark graphite in Midnight) reads like a journal page, with a subtle hand-drawn watermark behind every screen. Content sits on the page, not in boxes.
2. **Ink is the mark.** Type — especially the italic serif — does the heavy lifting. Color is reserved for the user-picked accent (header bar, links, active states) and semantic state.
3. **Quiet chrome.** Hairline rules instead of shadows or filled chips. Borders are 1px `--rule`. Radii are small (2–8 px). Elevation exists but is rare.

Everything in the file is live HTML/CSS — no images or frameworks beyond Google Fonts + Font Awesome — so you can inspect computed styles directly.

## About the Design Files

The files in this bundle are **design references created in HTML** — a prototype showing the intended look, layout, and interactions. They are **not production code to copy directly**. The task is to **recreate these designs in the Chronicles codebase** using its existing React + TypeScript + Vite setup, shared `tokens.ts`, and atomic-component structure (`client/src/components/atoms | molecules | organisms`).

Tokens and naming should be migrated into `shared/src/theme/tokens.ts` and consumed through the existing theme context. Where this design introduces new tokens (e.g. the Midnight palette, new accent-stroke derivation, "paper" surfaces), extend the token file rather than hard-coding values in components.

## Fidelity

**High-fidelity.** Exact colors, typography, spacing, radii, and interaction behaviors are specified. Recreate pixel-perfectly in the codebase's existing React/TypeScript environment, lifting values from the HTML's CSS variables into `shared/src/theme/tokens.ts`.

## What's New vs. Today's App

The existing app already has scattered pieces of this system (Playfair/Lato/Montserrat, sepia ink, parchment background, accent-color picker, checkbox/radio atoms). This design pulls them together and adds:

- **Two themes, one palette logic.** `--paper`, `--paper-surface`, `--ink`, `--ink-2`, `--ink-3`, `--rule` — all flip in Midnight mode. Every surface and border references these, so theme-switching is instant.
- **A derived `--accent-stroke` token.** The user's picked accent color gets a desaturated/muted stroke variant used for borders, underlines, checked-state fills, and hairline accents — so the accent shows up everywhere, subtly, without shouting.
- **A consistent "header bar" pattern.** Full-bleed accent band at the top of every screen (Home, Chronicle, Planner, Settings, mobile nav). In Midnight mode this becomes a dark paper bar with a 2 px accent rule on top — same identity, quieter presence.
- **Section dividers with italic small-caps labels.** Thin rule + italicized serif label is the canonical way to break a page into zones. Replaces boxed cards in most places.
- **Watermark as global background.** A single subtle SVG watermark sits behind the page at ~6% opacity (paper) / ~4% (midnight). It's decorative but reinforces the journal metaphor on every screen.
- **Quiet component vocabulary.** Buttons, inputs, selects, textareas, checkboxes, radios, toggles, badges, cards, widgets, tabs, nav items — all use the same ink/rule/paper tokens. Nothing is a one-off.

## Screens / Views

The HTML is organized as a long-form field guide with four chapters, followed by screen mockups.

### Chapter 1 — Foundations

- **Color.** Paper, paper-surface, ink (4 tones), rule, and 8 accent color chips with their derived strokes. Shown as swatches with token names + hex.
- **Typography.** Four families: `Playfair Display` (italic serif — display/greeting/quotes), `Lato` (body + UI), `Montserrat` (uppercase small-caps labels/tabs), `Special Elite` (monospace for timestamps, metadata, tokens). Full scale from `--t-xs` (11 px) → `--t-display` (56 px). Italic is a semantic treatment, not a decoration.
- **Spacing.** `--s-1` through `--s-8` on a 4/8 rhythm (4, 8, 12, 16, 24, 32, 48, 64).
- **Radii.** 2 / 4 / 6 / 8 — squared, never pill. `--r-sm` (2), `--r-md` (4), `--r-lg` (6), `--r-xl` (8).
- **Elevation.** One ambient paper-shadow. Used sparingly on the mobile Quick Entry sheet and modal overlays.

### Chapter 2 — Components

Every component card in the HTML shows default + states + a code snippet of the class structure.

- **Buttons.** Primary (ink fill, paper text), secondary (ink outline), ghost (text only), icon-only. All share 32 px height and 12 px horizontal padding. Letter-spacing 0.04 em, Lato 500, uppercase is OFF except for small-caps labels.
- **Inputs, textareas, selects.** 1 px rule border, paper background, 8 px radius (`--r-xl`), 12 px padding. Focus is a 1 px accent-stroke outline + inset — no glow.
- **Checkboxes.** 18 × 18 paper square, 1 px ink-3 border. Checked = accent-stroke fill + paper checkmark. Works in both themes.
- **Radios.** Squared (2 px radius) by design — matches the "no pills" rule.
- **Toggles.** 36 × 20 pill (the one exception) with ink thumb.
- **Badges.** Outlined, not filled. Uppercase Montserrat 10 px, 1 px border, 2 px radius.
- **Cards & widgets.** `paper-surface` background, 1 px rule, 8 px radius. Header is italic-serif title + optional action on the right.
- **Navigation.** Top bar with logo, weather/date strip, nav items, and avatar. Active item underlined with 2 px accent-stroke.
- **Tabs.** Small-caps Montserrat, underlined on active.
- **Section dividers.** 1 px rule with an inline italic label — the default way to break a page.

### Chapter 3 — Patterns

- **Header bar + greeting.** Accent band → italic serif greeting on the same baseline as a pulled quote, attribution beneath.
- **Journal entry list.** Date in Special Elite at left, serif title + body preview, badge row at bottom. No card — just a hairline rule between rows.
- **Day planner.** Two-column grid: timeline on the left (hour ticks in Special Elite), entry blocks on the right with italic titles.
- **Settings panes.** Two-column label / control, with section dividers between groups. Label left (small-caps), control right (input/select/toggle).
- **Quick Entry (mobile).** Bottom sheet with paper-surface background, tinted compose area, white-paper input wells (light theme) / dark paper wells (midnight). Large italic title input at top.

### Chapter 4 — Screens

Full-bleed mockups of:

1. **Home / Dashboard** (desktop): header bar, greeting + quote row, stats strip, today's entries, upcoming agenda, recent reflections. All composed of the components above.
2. **Chronicle** (desktop): entry list in a two-column reading layout. Left is a dated index, right is the open entry in a wide reading measure (~68ch).
3. **Planner** (desktop): hour-based day view with entry blocks and a right-rail "Today" summary.
4. **Settings** (desktop): label/control pairs grouped by section (Profile, Appearance, Security, Notifications, Data).
5. **Public Landing** (desktop): hero with the watermark as the hero visual, italic serif headline, single primary CTA, three-feature strip, footer.
6. **Mobile app** (iPhone frame): Home, Chronicle list, Quick Entry sheet, Settings — all in both themes.

All screens render correctly at Light (default) and Midnight (dark) via the root `data-theme` attribute.

## Interactions & Behavior

- **Theme toggle.** `<html data-theme="light|dark">` — every token flips. No JS recolor, just CSS variables. Persist to localStorage under the existing `chronicles.theme` key.
- **Accent picker.** Updates `--accent` and `--accent-stroke` on `:root`. `--accent-stroke` is a muted/desaturated version — in the HTML it's currently authored per-color, but in the codebase derive it with `chroma(accent).desaturate(1.2).darken(0.4)` or equivalent.
- **Header bar reacts to theme.** Light: full accent fill. Midnight: dark paper with a 2 px accent-stroke rule on top.
- **Watermark.** Fixed-position SVG at the root; `opacity: 0.06` light, `0.04` dark; `pointer-events: none`; `z-index: 0`. Content stacks above it.
- **Focus states.** 1 px accent-stroke outline, inset. No box-shadow glow. Applies to inputs, buttons, checkboxes, toggles.
- **Hover on nav items / buttons.** Underline-on-hover for text links; 4% ink overlay on buttons; no color shift.
- **Transitions.** Theme switch: instant (tokens flip). Hover: 120 ms `ease-out`. Modal/sheet enter: 200 ms `ease-out` translateY.

## State Management

Use existing contexts — don't introduce new state machines for this:

- `ThemeContext` → `theme: 'light' | 'dark'`, persisted.
- `AccentContext` → `accent: ColorOption['value']`, persisted. Derive `accentStroke` in the provider.
- No new app-level state is required for the design system itself.

## Design Tokens

All tokens are authored as CSS custom properties in the HTML and should be mirrored into `shared/src/theme/tokens.ts` as the source of truth, then exposed as CSS variables at the app root.

### Color — Light (default)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f6f1e4` | Page background (with watermark on top) |
| `--paper-surface` | `#efe9d8` | Raised surfaces — cards, widgets, sheets |
| `--paper-well` | `#ffffff` | Input fill (compose wells) |
| `--ink` | `#2a2620` | Primary text, button fill |
| `--ink-2` | `#4a4238` | Secondary text |
| `--ink-3` | `#7a6f5e` | Tertiary text, icon default |
| `--rule` | `#d9cfb8` | All 1 px borders |

### Color — Midnight (dark)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#1a1815` | Page background |
| `--paper-surface` | `#24211d` | Raised surfaces, also inputs in dark mode (no white wells) |
| `--ink` | `#efeadd` | Primary text |
| `--ink-2` | `#c8c0ae` | Secondary text |
| `--ink-3` | `#8a8170` | Tertiary |
| `--rule` | `#3a342c` | Borders |

### Accent color options

Eight presets (defined in `shared/src/theme/accentColors.ts`, extended here with a `stroke` variant):

| Name | `--accent` | `--accent-stroke` |
|---|---|---|
| Sage | `#7A8B7B` | `#5a6e5c` |
| Slate Blue | `#4E6E7E` | `#385564` |
| Plum | `#6E5468` | `#523b4d` |
| Clay | `#A06A50` | `#7d4e38` |
| Ochre | `#B89456` | `#8f6f3a` |
| Ink Black | `#2a2620` | `#2a2620` |
| Oxblood | `#7a3b3b` | `#5a2828` |
| Moss | `#5a6e3c` | `#3f5028` |

### Typography

```
--serif:   'Playfair Display', Georgia, serif;     /* display + italic greetings + quotes */
--sans:    'Lato', -apple-system, sans-serif;      /* body + UI */
--smallcaps: 'Montserrat', sans-serif;             /* uppercase small-caps, 0.08em tracking */
--mono:    'Special Elite', 'Courier New', monospace; /* timestamps, metadata, dates */
```

Scale: `--t-xs` 11, `--t-sm` 12, `--t-base` 14, `--t-md` 15, `--t-lg` 18, `--t-xl` 22, `--t-2xl` 28, `--t-3xl` 36, `--t-display` 56.

Line height: 1.5 body, 1.3 display, 1.65 reading measure (Chronicle entry body).

### Spacing

```
--s-1: 4   --s-2: 8    --s-3: 12   --s-4: 16
--s-5: 24  --s-6: 32   --s-7: 48   --s-8: 64
```

### Radii

```
--r-sm: 2   --r-md: 4   --r-lg: 6   --r-xl: 8
```

Never use radii > 8 px except for the one toggle pill.

### Shadows

```
--paper-shadow: 0 8px 24px rgba(42, 38, 32, 0.08);
```

Only used on mobile bottom sheets and modal overlays.

## Assets

- **Watermark SVG.** Inline in the HTML (`<svg class="watermark">`). Hand-drawn ink doodles: cat, poppies, stars, and misc journal doodles. Extract and save as `client/public/watermark.svg`, then reference from a single `<Watermark />` component mounted at the app root.
- **Logo.** Chronicles wordmark — use the existing `client/public/chronicles-logo.png` (already in the repo). In the HTML it's rendered as styled text; keep using the image asset in production.
- **Fonts.** Self-hosted fonts already exist in `client/public/fonts/`. The HTML uses Google Fonts for portability; switch to the self-hosted `@font-face` block from `fonts.css` when implementing.
- **Icons.** Font Awesome in the mock. The codebase already uses `lucide-react` — map the icons across (calendar, lock, settings cog, sun/moon, pen-nib, etc.).

## Files

- `Chronicles Design System.html` — the entire design. Single self-contained file. Open in a browser; toggle the built-in Tweaks panel (bottom-right) to switch theme and accent color.
- `screenshots/` — reference renders at reduced scale:
  - `01-desktop-paper.png` — Dashboard, light/Paper theme
  - `02-desktop-midnight.png` — Dashboard, Midnight theme
  - `03-mobile-paper.png` — Mobile (Home + Settings), Paper theme
  - `04-mobile-midnight.png` — Mobile (Home + Settings), Midnight theme
  - `05-foundations.png` — Chapter I: watermark rules + color tokens
  - `06-components.png` — Chapter II: buttons + form controls anatomy

The HTML is the source of truth — screenshots are for orientation only. Open the file in a browser to inspect computed styles, try the Tweaks panel, and copy exact values.

## Implementation Order (suggested)

1. **Tokens first.** Extend `shared/src/theme/tokens.ts` with the Midnight palette and `--accent-stroke` derivation. Wire up theme + accent contexts to emit CSS variables on `:root`.
2. **Atoms.** Update `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Toggle`, `Badge` to the new specs. Keep prop APIs identical — only the rendered styles change.
3. **Layout primitives.** `SectionDivider`, `HeaderBar`, `Watermark`, `PaperSurface` — new atomic components.
4. **Screens.** Home → Chronicle → Planner → Settings. Each is mostly recomposition of atoms + new layout primitives.
5. **Mobile.** Reuse the same atoms; swap layout to the sheet / stack patterns shown in the iPhone frames.
6. **QA.** Verify every screen in both themes and across all 8 accent colors.
