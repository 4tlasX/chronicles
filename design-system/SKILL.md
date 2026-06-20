---
name: chronicles-design
description: Use this skill to generate well-branded interfaces and assets for Chronicles, a modern bullet-journaling app, either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

Chronicles is a calm, modern, highly-accessible **quick-capture journaling** app:
modern light tile/panel UI: friendly sans-on-sans headings (Work Sans) + humanist
body (Open Sans), soft-rounded cards (14px), an accent icon-tile aesthetic, a flat
light/dark surface palette, one
user-selectable accent (seven themes), and an entry-marker system that sorts every
capture (task, event, journal, quote, goal, meal, recipe, idea) into useful views.
A widget **dashboard** (quick capture, calendar, wellness, medication, weather,
meal plan, upcoming, custom widgets) is the home surface.

**Key files**
- `styles.css` — the single CSS entry point; link this and you get all tokens + component classes.
- `tokens/` — colors, accents, semantic light/dark, type, spacing, radius, elevation, motion.
- `components/` — React primitives (`.jsx` + `.d.ts` + `.prompt.md`). Namespace: `window.ChroniclesDesignSystem_cefe3d`.
- `ui_kits/` — full-screen recreations (mobile, desktop, settings, marketing, onboarding) — the best reference for composition.
- `assets/` — logo mark + wordmark (SVG, `currentColor`).

**How to build**
- Theme via `data-theme="dark"` and `data-accent="sage|clay|amber|teal|rose|slate"` on `<html>` (default accent: `ink`).
- Use sentence case everywhere, terse calm copy. Metadata (dates/times/counts) in Open Sans, uppercase and tracked.
- Prefer hairline borders and surface fills over shadows — panels are flat; reserve shadows for floating overlays (menus, dialogs, toasts). Motion is quick (140–200ms), never bouncy.
- The capture composer is `QuickCapture` (dropdown topic picker + formatting + mic); dashboard tiles use `Widget`; entries use `BulletEntry`.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and
create static HTML files for the user to view. If working on production code, copy assets
and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they want to build or
design, ask a few focused questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.
