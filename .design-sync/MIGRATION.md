# Chronicles App Design System Migration Guide

## Overview
The app needs to fully adopt the Chronicles design system built in `/design-system/`. This involves:
1. Replacing 195+ FontAwesome icons with the Icon component
2. Standardizing form components (Button, Input, Select, Checkbox, etc.)
3. Enforcing consistent spacing, typography, and colors via design tokens
4. Removing inline styled-components where design system alternatives exist

## Current State
- **45 files** import FontAwesome icons
- **Most components** use inline `styled-components` instead of delegating to design-system components
- **Color tokens** are defined in the design system but not consistently used in app
- **Typography** still relies on theme context instead of design tokens

## Design System Components Available
- `Icon` (50+ icon names including chevrons, arrows, checks, trash, pencil, etc.)
- `Button` (variants: primary, secondary, ghost, danger)
- `Input` / `Select` / `Textarea` (form inputs)
- `Checkbox` / `Switch` / `Toggle` (form controls)
- `Card` / `Badge` / `Tag` (content containers)
- `Avatar` / `IconButton` (UI elements)

## Migration Path

### Phase 1: Icon System Replacement (High Impact, Low Effort)
**Files to update:** 45 files using FontAwesome

Pattern:
```typescript
// Before
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';

<FontAwesomeIcon icon={faChevronDown} />

// After
import { Icon } from '../../../design-system/components/core/Icon.js';

<Icon name="chevron-down" size={16} strokeWidth={2} />
```

**Chevron/Arrow replacement map:**
- `faChevronDown` → `chevron-down`
- `faChevronUp` → `chevron-up`
- `faChevronLeft` → `chevron-left`
- `faChevronRight` → `chevron-right`
- `faArrowRight` → `arrow-right`
- `faArrowLeft` → `arrow-left`

See `/client/src/utils/iconMapping.ts` for full icon mapping.

### Phase 2: Form Component Standardization
**Files to update:** ~20 files with form inputs

Replace inline styled form elements with design-system components:
- Styled `<button>` elements → use `Button` component from design-system
- Styled `<input>` elements → use `Input` component from design-system
- Styled `<select>` elements → use `Select` component from design-system
- Styled `<input type="checkbox">` → use `Checkbox` component from design-system

### Phase 3: Layout & Spacing Normalization
**Files to update:** All template components

- Update styled-components to use `var(--s-1)` through `var(--s-10)` for spacing
- Replace hardcoded colors with design token variables
- Use `--bg-app`, `--bg-surface`, `--bg-sunken` for backgrounds
- Use `--text-primary`, `--text-secondary`, `--text-tertiary` for text

### Phase 4: Remove Redundant Styled-Components
Delete inline styled components when design-system alternatives exist:
- Delete `styled.button` definitions → use `Button` component
- Delete `styled.input` definitions → use `Input` component
- Delete theme-dependent color calculations → use CSS variables

## Key Principles

1. **Always use Icon component** for icons — never FontAwesome inline
2. **Use design-system components** when available — no custom styled versions
3. **CSS variables first** — `var(--color-accent)` over `theme.colors.accent`
4. **Consistent spacing** — use spacing scale variables `--s-1` through `--s-10`
5. **No hardcoded colors** — all colors from tokens

## Testing
After each phase, verify:
- ✅ All icons render correctly
- ✅ Buttons and form elements appear consistent
- ✅ Colors match design system spec (use `/design-system/` as reference)
- ✅ Spacing aligns with grid (8px base, 4px multiples)
- ✅ No console warnings about missing styles

## Files to Prioritize
1. **Sidebar.tsx** — Navigation is critical
2. **Header.tsx** — App-wide visibility
3. **Button.tsx**, **Input.tsx**, **Select.tsx** — Form atoms
4. **EntryForm.tsx** — Complex form component
5. **Dashboard.tsx** — High-visibility area

## Config
- Icon mapping utility created at: `/client/src/utils/iconMapping.ts`
- Design system location: `/design-system/`
- Design token imports: `../../../design-system/components/core/Icon.js`
