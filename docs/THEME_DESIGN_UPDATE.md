# Theme Design Update — Minimalist Foundation

Chronicles is transitioning from a single hardcoded light theme with glass morphism and Unsplash photo backgrounds to a clean, paper-like dual-theme system with imprinted SVG textures. This document captures all design decisions.

---

## Typography System

### Font Families
| Role | Font | Usage |
|------|------|-------|
| **Display/Serif** | Playfair Display | Entry titles, headings, display text |
| **UI/Sans** | Inter | Body text, buttons, labels, inputs, all UI chrome |
| **Brand** | Josefin Sans (letter-spaced) | App name "Chronicles" only |

### Google Fonts Import
```
Inter:wght@400;500;600;700
Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500
Josefin+Sans:wght@300;400;600
```

### Font Family Tokens
```
serif: "'Playfair Display', Georgia, 'Times New Roman', serif"
sans:  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
brand: "'Josefin Sans', 'Inter', sans-serif"
```

### Type Scale (rem-based, 1rem = 16px)

| Token     | Size     | Weight | Font     | Usage |
|-----------|----------|--------|----------|-------|
| `display` | 2rem     | 700    | Playfair | Hero headings, splash |
| `h1`      | 1.75rem  | 600    | Playfair | Page titles (Settings, Calendar) |
| `h2`      | 1.375rem | 600    | Playfair | Section headings, entry titles in editor |
| `h3`      | 1.125rem | 600    | Inter    | Subsection headings, card titles |
| `body`    | 1rem     | 400    | Inter    | Default body text, entry content |
| `bodySm`  | 0.875rem | 400    | Inter    | Secondary body, metadata, timestamps |
| `caption` | 0.75rem  | 500    | Inter    | Labels, badges, helper text |
| `brand`   | —        | 400    | Josefin  | App name only (letter-spacing: 0.1em) |

Components reference `theme.typography.h1` etc. instead of assembling font-size + weight + family individually.

---

## Dual Theme System

### Architecture
- `lightTheme` and `darkTheme` share structure, differ in color values
- Spacing, typography, border-radius, shadows, z-index are shared
- `themeMode: 'light' | 'dark'` in uiStore (default: `'light'`)
- Dynamic `<ThemeProvider>` selects theme based on mode
- Header/accent colors remain user-selectable — **not** baked into themes

### Light Theme Colors (Paper-Like Warm)
| Token | Value | Description |
|-------|-------|-------------|
| `background` | `#f0ebdf` | Warm parchment |
| `surface` | `#faf8f4` | Slightly off-white paper |
| `surfaceHover` | `#f0eeea` | Hover state |
| `text` | `#2c2c2c` | Primary text |
| `textSecondary` | `#6b6b6b` | Secondary text |
| `textMuted` | `#9a9a9a` | Muted/disabled text |
| `textInverse` | `#ffffff` | Text on dark backgrounds |
| `border` | `#e8e4dc` | Warm, barely-there dividers |
| `accent` | `#4281a4` | Default accent (user-overridable) |
| `accentHover` | `#2e6184` | Accent hover |
| `accentLight` | `#d6e9f4` | Focus rings, light accent backgrounds |
| `danger` | `#ef4444` | Error/destructive |
| `dangerHover` | `#dc2626` | Danger hover |
| `success` | `#22c55e` | Success states |
| `warning` | `#f59e0b` | Warning states |
| `info` | `#3b82f6` | Info states |

### Dark Theme Colors (Dark Paper)
| Token | Value | Description |
|-------|-------|-------------|
| `background` | `#2e2f31` | Dark base |
| `surface` | `#353638` | Card/panel surface |
| `surfaceHover` | `#3d3e41` | Hover state |
| `text` | `#e8e5df` | Primary text |
| `textSecondary` | `#a0a0a0` | Secondary text |
| `textMuted` | `#707070` | Muted/disabled text |
| `textInverse` | `#2e2f31` | Text on light backgrounds |
| `border` | `#3e3f44` | Subtle dark dividers |
| `accent` | `#4281a4` | Same accent (user-overridable) |
| `accentHover` | `#5a9bbe` | Lighter on dark backgrounds |
| `accentLight` | `rgba(66, 129, 164, 0.2)` | Focus rings (translucent) |
| `danger` | `#f87171` | Lighter red for dark bg |
| `dangerHover` | `#ef4444` | Danger hover |
| `success` | `#4ade80` | Lighter green for dark bg |
| `warning` | `#fbbf24` | Lighter amber for dark bg |
| `info` | `#60a5fa` | Lighter blue for dark bg |

### Removed from Theme Tokens
- `header` / `headerHover` — these come from uiStore (user-selectable)
- `surfaceGlass` / `surfaceGlassLight` — glass morphism removed

---

## Glass Morphism Removal

All `backdrop-filter: blur(...)` + `rgba()` backgrounds replaced with solid `theme.colors.surface`.

### Removed From
**Templates:** AppTemplate, JournalTemplate, ContentTemplate, SettingsTemplate
**Organisms:** Sidebar, SearchPanel, TopicSidebarPanel, TopicEntryList, EntryCard, ViewTabs
**Atoms/Molecules:** Textarea, Select, DateTimeInput, SearchInput

### Kept On (floating overlays only)
- `Modal.tsx` overlay — overlays page content
- Header `DropdownMenu` — floats over page
- Topic selector dropdowns — float over page

---

## SVG Paper Texture Backgrounds

### Concept
Replace 28 Unsplash photo backgrounds with 5 seamless-tiling SVG patterns. Patterns render as subtle debossed/embossed imprints on the paper surface using CSS blend modes.

### Pattern Library

| Pattern | File | Tile Size | Description |
|---------|------|-----------|-------------|
| Botanical | `botanical.svg` | 400×400 | Dense line-drawn flora — Gucci-inspired Victorian naturalist illustration |
| Japanese Waves | `waves.svg` | 300×300 | Seigaiha / Hokusai-style concentric wave arcs |
| Marble | `marble.svg` | 400×400 | Classic bookbinding endpaper veins and swirls |
| Manuscript | `manuscript.svg` | 300×300 | Aged ruled/grid paper with subtle ink bleed |
| Pressed Flower | `pressed-flower.svg` | 400×400 | Delicate scattered botanical silhouettes — herbarium style |

### SVG Requirements
- Single-color paths on transparent background (`#000000` fill)
- Color/opacity controlled entirely via CSS
- Lightweight (<10KB each)
- No embedded fonts or external references
- Seamless tiling at specified dimensions

### Rendering
```css
/* Background component structure */
BackgroundWrapper {
  position: fixed; inset: 0; z-index: -1;
  background-color: theme.colors.background;
}

PatternOverlay {
  background-image: url(/patterns/{patternId}.svg);
  background-repeat: repeat;
  background-size: {tile size};
  opacity: {user-adjustable, 0.03–0.20, default 0.06};
  mix-blend-mode: multiply;  /* light theme — darkens */
  mix-blend-mode: screen;    /* dark theme — lightens */
  pointer-events: none;
}
```

### Data Model
```typescript
export interface BackgroundOption {
  value: string;        // Pattern ID: 'botanical', 'waves', etc.
  label: string;        // Display name
  description: string;  // Short description
}
```

### User Controls
- Pattern picker grid in Settings (inline SVG previews, replaces photo thumbnails)
- Opacity slider: 3%–20% range, default 6%
- Persisted as `backgroundPattern` and `patternOpacity` settings

---

## Flattened Visual System

### Border Radius

| Token | Old | New |
|-------|-----|-----|
| `sm` | 4px | 2px |
| `md` | 8px | 4px |
| `lg` | 12px | 6px |
| `xl` | 16px | 8px |
| `full` | 9999px | 9999px (unchanged) |

~38 hardcoded radius values standardized to use theme tokens.

### Shadows

| Token | Old | New |
|-------|-----|-----|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.04)` |
| `md` | `0 4px 6px rgba(0,0,0,0.1)` | `0 2px 8px rgba(0,0,0,0.06)` |
| `lg` | `0 10px 15px rgba(0,0,0,0.1)` | `0 4px 12px rgba(0,0,0,0.08)` |

New `focus` token: `0 0 0 2px ${accentLight}` — consolidates 7 hardcoded focus ring instances.

Dark theme uses slightly higher opacity shadows since dark backgrounds swallow shadow.

### Borders
- Primary visual structure tool (170+ uses) — **kept but softened**
- Light: `#e8e4dc` (warm, barely there, like paper creases)
- Dark: `#3e3f44` (subtle separation, close to surface)
- All 1px solid — no heavy borders

---

## Circle/Pill Shape Violations Fixed

Per CLAUDE.md rules: no circles or pills, all shapes use rounded square edges (4-8px).

| Component | Change |
|-----------|--------|
| `Badge.tsx` | `borderRadius.full` → `borderRadius.sm` |
| `TopicBadge.tsx` | Remove `IconCircle`, plain icon with header color. Pill → rounded square |
| `Sidebar.tsx` TopicDot | Replace 8px circle with FontAwesome topic icon colored with headerColor |
| `EntryCard.tsx` | Pill-shaped badges → `borderRadius.sm` |

**Exceptions (functional shapes, not decorative):**
- Toggle switch — standard UI pattern
- Spinner — universally circular
- ColorSwatch — functional circle for color picking
- MiniCalendar day cells — standard calendar convention

---

## State Management Changes

### New uiStore State
```typescript
themeMode: 'light' | 'dark'       // default: 'light'
backgroundPattern: string          // default: '' (replaces backgroundImage)
patternOpacity: number             // default: 0.06 (range: 0.03–0.20)
```

### Settings Persistence
| Key | Type | Default |
|-----|------|---------|
| `themeMode` | string | `'light'` |
| `backgroundPattern` | string | `''` |
| `patternOpacity` | string (stored as string, parsed as number) | `'0.06'` |

### Migration
- Existing `backgroundImage` values (Unsplash paths) are ignored
- Existing `headerColor` and `accentColor` values preserved as-is

---

## Settings UI Updates

Theme section in SettingsView gets:
1. **Light/Dark toggle** — top of section
2. **Pattern picker** — 4-column grid with inline SVG previews (replaces photo thumbnails)
3. **Opacity slider** — RangeInput, 3%–20% range, shown when pattern is selected
4. **Header color picker** — unchanged (user-selectable)

---

## Files Modified

**Core theme:** `shared/src/theme/tokens.ts`, `shared/src/theme/backgrounds.ts`, `client/src/styles/styled.d.ts`, `client/src/styles/GlobalStyle.ts`, `client/index.html`

**State & providers:** `client/src/stores/uiStore.ts`, `client/src/App.tsx`

**Templates:** `AppTemplate.tsx`, `JournalTemplate.tsx`, `ContentTemplate.tsx`, `SettingsTemplate.tsx`

**Organisms:** `Sidebar.tsx`, `EntryCard.tsx`, `SearchPanel.tsx`, `TopicSidebarPanel.tsx`, `TopicEntryList.tsx`, `ViewTabs.tsx`, `Background.tsx`

**Atoms/Molecules:** `Badge.tsx`, `Textarea.tsx`, `Select.tsx`, `DateTimeInput.tsx`, `TopicBadge.tsx`, `BackgroundPicker.tsx`, `SearchInput.tsx`

**Settings:** `SettingsView.tsx`

**New files:** `client/public/patterns/botanical.svg`, `waves.svg`, `marble.svg`, `manuscript.svg`, `pressed-flower.svg`
