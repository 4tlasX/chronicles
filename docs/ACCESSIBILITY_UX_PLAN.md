# Accessibility & Visual UX Improvement Plan

## Context

Chronicles currently has zero ARIA attributes, no `focus-visible` usage, no `prefers-reduced-motion` support, no focus trapping in modals, and inconsistent semantic HTML. This plan addresses the full audit across ~60 components, organized into 8 independently shippable batches ordered by impact.

---

## Batch 1: Foundation Layer (Global Styles + Core Primitives)

Establishes the infrastructure all subsequent batches build on.

**Files to modify:**

| File | Changes |
|------|---------|
| `client/src/styles/GlobalStyle.ts` | Add global `:focus-visible` outline on interactive elements; add `@media (prefers-reduced-motion: reduce)` blanket rule; add `.sr-only` utility class |
| `client/src/components/templates/AppTemplate.tsx` | Add skip-to-content link (visually hidden until focused); add `id="main-content"` to main content area |
| `shared/src/theme/tokens.ts` | Improve dark theme `textSecondary` from `#938f8f` to `#a8a4a4` (~7:1 contrast); same for `textMuted` |
| `client/src/components/atoms/Button.tsx` | Add `&:focus-visible` outline style |
| `client/src/components/atoms/IconButton.tsx` | Add `&:focus-visible` outline style |
| `client/src/components/atoms/ColorSwatch.tsx` | Add `&:focus-visible` outline; accept `aria-label` prop |
| `client/src/components/atoms/Checkbox.tsx` | Add `&:focus-visible` style on hidden input that highlights the visible Box |
| `client/src/components/atoms/Spinner.tsx` | Add `role="status"`, `aria-label="Loading"` |
| `client/src/components/atoms/ErrorBanner.tsx` | Add `role="alert"`, `aria-live="assertive"` |
| `client/src/components/atoms/ProgressBar.tsx` | Add `role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}` |

---

## Batch 2: Modal/Dialog Accessibility

**New file:**
- `client/src/hooks/useFocusTrap.ts` — ~40 line hook: traps Tab/Shift+Tab within container, Escape calls `onClose`, saves/restores previous focus on mount/unmount

**Files to modify:**

| File | Changes |
|------|---------|
| `client/src/components/atoms/Modal.tsx` | Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (via `useId()`), `aria-label="Close"` on close button, integrate `useFocusTrap`, Escape key handler, render via `createPortal` |
| `client/src/components/organisms/UnlockDialog.tsx` | Add `role="dialog"`, `aria-modal`, `aria-labelledby`, integrate `useFocusTrap`, Escape key, `role="alert"` on error text, `aria-describedby` linking error to input |
| `client/src/components/organisms/ShareModal.tsx` | Add `aria-label` to Revoke and Copy buttons (inherits dialog semantics from Modal) |
| `client/src/components/molecules/ConfirmDialog.tsx` | Verify focus moves to dialog on open (inherits from Modal) |

---

## Batch 3: Tab and Navigation Semantics

**New file (optional):**
- `client/src/hooks/useArrowKeyNavigation.ts` — Reusable hook for Left/Right/Up/Down arrow focus management across tab lists and menus

**Files to modify:**

| File | Changes |
|------|---------|
| `client/src/components/molecules/TabBar.tsx` | Add `role="tablist"` on Row, `role="tab"` + `aria-selected` + roving `tabIndex` on buttons, arrow-key navigation |
| `client/src/components/molecules/FilterTabs.tsx` | Same tab ARIA treatment |
| `client/src/components/organisms/ViewTabs.tsx` | Same tab ARIA treatment |
| `client/src/components/organisms/TopicSelector.tsx` | `aria-haspopup="listbox"`, `aria-expanded` on trigger, `role="listbox"`/`role="option"` + `aria-selected` on dropdown, arrow-key nav, Escape to close |
| `client/src/components/organisms/Header.tsx` | `aria-haspopup="menu"` + `aria-expanded` on dropdown triggers, `role="menu"`/`role="menuitem"` on items, arrow-key nav, Escape to close, `aria-label` on hamburger/close/logout buttons, focus trap on mobile drawer |
| `client/src/components/molecules/SearchInput.tsx` | `aria-label="Search entries"` on input, `aria-label="Clear search"` on clear button |
| `client/src/components/molecules/ExpandableSection.tsx` | `aria-expanded` on header, `aria-controls` linking to body |

---

## Batch 4: Semantic HTML and Form Accessibility

| File | Changes |
|------|---------|
| `client/src/components/atoms/DateGroupLabel.tsx` | Change from `styled.div` to `styled.h3` |
| `client/src/components/atoms/EmptyState.tsx` | Change Message/Sub from `styled.span` to `styled.p` |
| `client/src/components/organisms/Sidebar.tsx` | Wrap topic list in `styled.ul`, items in `styled.li` (keep button inside li) |
| `client/src/components/organisms/EntryList.tsx` | Add `role="list"` on container, `role="listitem"` on card wrappers |
| `client/src/components/organisms/SessionManager.tsx` | Change list container to `styled.ul`, rows to `styled.li` |
| `client/src/components/organisms/LoginForm.tsx` | Use `role="alert"` on error display, add `aria-describedby` linking error to inputs |
| `client/src/components/organisms/RegisterForm.tsx` | Same error linking treatment |
| `client/src/components/organisms/ProtectedRoute.tsx` | Add `aria-label="Loading application"` to loading state |

---

## Batch 5: Icon Labels and Remaining Interactive Elements

| File | Changes |
|------|---------|
| `client/src/components/organisms/Editor.tsx` | `aria-label` on every toolbar button ("Bold", "Italic", etc.), `aria-pressed` for toggle state, `aria-label="Toggle formatting toolbar"` + `aria-expanded` on toolbar toggle |
| `client/src/components/organisms/EntryForm.tsx` | `aria-label` on bookmark and share icon buttons, `aria-expanded` on custom fields toggle |
| `client/src/components/atoms/DragHandle.tsx` | `aria-label="Drag to reorder"`, `aria-roledescription="sortable"` |
| `client/src/components/organisms/CalendarGrid.tsx` | `role="grid"`/`role="gridcell"`, `aria-current="date"` on today, `aria-label` on prev/next buttons |
| `client/src/components/organisms/MiniCalendar.tsx` | Same calendar ARIA treatment |
| `client/src/components/organisms/HealthReport.tsx` | Add text labels to color-only strength indicators, increase badge font-size from 10px to 12px |
| Chart components (`CorrelationChart`, `FrequencyChart`, `SeverityTrendChart`) | Add `role="img"` + `aria-label` on chart containers; add visually hidden data table using `.sr-only` class |

---

## Batch 6: Theme Token Consolidation and Visual Polish

### 6a. Hardcoded color cleanup
Add semantic tokens to `shared/src/theme/tokens.ts` where needed, then replace hardcoded colors in:
- `EntryForm.tsx` — bookmark `#f59e0b` -> `theme.colors.warning`
- `EntryForm.tsx` — delete `rgba(239,68,68,0.5)` -> `theme.colors.danger` with opacity
- `GoalCard.tsx` — status colors
- `ChangePassword.tsx` — message colors `#ef4444`/`#22c55e` -> `theme.colors.danger`/`theme.colors.success`
- `HealthReport.tsx` — badge/stat colors
- `LoginForm.tsx` / `RegisterForm.tsx` — inline error colors
- Chart components — chart colors
- `InlineEditPanel.tsx`, `MedicationFields.tsx`, `MilestoneFields.tsx`

### 6b. Replace `window.confirm()` with styled ConfirmDialog
Files using `window.confirm`: `JournalView.tsx`, `MilestoneCard.tsx`, `GoalCard.tsx`, `EditableEntryCard.tsx`, `TopicsView.tsx`. Each gets local state for dialog lifecycle.

### 6c. Keyboard shortcut help
- New: `client/src/components/organisms/KeyboardShortcutsHelp.tsx` — modal listing shortcuts, triggered by `?` key when not in an input
- Register listener in `AppTemplate.tsx`

### 6d. Animation reduction
Wrap animations in `@media (prefers-reduced-motion: no-preference)` in: `TopicSelector.tsx`, `Header.tsx`, `ViewTabs.tsx`

---

## Batch 7: Tap Targets and Text Size

Fixes touch affordance (WCAG 2.5.8 minimum 24x24px) and text readability (minimum 12px).

### 7a. Critical tap target violations — increase to minimum 24x24px, prefer 44x44px on mobile

| File | Element | Current Size | Fix |
|------|---------|-------------|-----|
| `atoms/IconButton.tsx` | Root button | `padding: 8px` (~16x16) | Increase padding to `12px` (min 24x24) |
| `atoms/Checkbox.tsx` | Box div | `16x16px` | Increase to `20x20px`, keep hidden input tap area at `24x24` via padding on label |
| `atoms/Modal.tsx` | CloseButton | `padding: 4px 8px` (~20px tall) | Increase to `padding: 8px 12px`, add `min-width: 32px; min-height: 32px` |
| `atoms/DragHandle.tsx` | Root button | `padding: 2px` (~16px) | Increase to `padding: 8px` |
| `molecules/SearchInput.tsx` | ClearButton | `padding: 2px 4px` (~14px) | Add `min-width: 28px; min-height: 28px; padding: 6px` |
| `molecules/SubItemRow.tsx` | UnlinkBtn | `20x20px` | Increase to `24x24px` |
| `molecules/FilterTabs.tsx` | TabButton | `padding: 4px 12px` (~18px tall) | Increase to `padding: 6px 14px` |
| `molecules/IconPicker.tsx` | IconBtn | `28x28px` | Acceptable (above 24px), increase gap from `4px` to `6px` |
| `organisms/MiniCalendar.tsx` | NavButton | `24x24px` | Acceptable at minimum, increase to `28x28px` for comfort |

### 7b. Text size violations — enforce 12px minimum

| File | Element | Current | Fix |
|------|---------|---------|-----|
| `atoms/Label.tsx` | Root label | `11px` | Increase to `12px` |
| `atoms/Badge.tsx` | Root span | `10px` | Increase to `12px` |
| `molecules/FilterTabs.tsx` | TabButton | `10px` | Increase to `12px` |
| `molecules/TabBar.tsx` | TabButton | `11px` (mobile: `10px`) | Increase to `12px`, remove mobile shrink |
| `molecules/TopicBadge.tsx` | Chip span | `10px` | Increase to `12px` |
| `molecules/EntryMeta.tsx` | Wrapper | `theme.fontSize.xs` (10px) | Change to `12px` directly |
| `molecules/InlineEditPanel.tsx` | ActionBtn, EditTitle | `10px` | Increase to `12px` |
| `organisms/MiniCalendar.tsx` | ToggleBar, MonthLabel, WeekdayLabel | `11px` | Increase to `12px` |
| `organisms/EntryForm.tsx` | ActionBtn, SaveButton, DeleteBtn | `10px`-`11px` | Increase to `12px` |
| `atoms/SettingsAtoms.tsx` | BackLink | `11px` | Increase to `12px` |

### 7c. Mobile responsive — stop shrinking targets on small screens

| File | Issue | Fix |
|------|-------|-----|
| `molecules/TabBar.tsx` | Mobile font shrinks to `10px`, padding unchanged | Set mobile font to `12px`, increase padding to `12px 16px` |
| `organisms/Header.tsx` | NewEntryButton padding shrinks to `5px 2px` at 480px | Set mobile min-padding to `8px 8px` |
| `molecules/FilterTabs.tsx` | `gap: 4px` too tight for touch | Increase to `6px` |
| `molecules/InlineEditPanel.tsx` | Mobile gap shrinks to `6px` | Keep at `8px` minimum |

### 7d. Design token update

| File | Change |
|------|--------|
| `shared/src/theme/tokens.ts` | Verify `fontSize.xs` is `12` (not 10); add `fontSize.xxs: 10` if any usage genuinely needs sub-12px |

---

## Batch 8: Typography Hierarchy and Spacing Consistency

Standardizes body text sizing, line-height, and font usage across all entry-related components. Fixes spacing/alignment asymmetries.

### 8a. Body text hierarchy — standardize entry content text

Currently entry body text varies across components with no consistency:

| Component | Element | Current | Standard |
|-----------|---------|---------|----------|
| `organisms/Editor.tsx` | `.tiptap` | `16px`, line-height `1.85` | Keep as-is (full editor) |
| `organisms/EntryCard.tsx` | PreviewText | hardcoded `15px`, `'Lato'`, weight `500` | `${theme.fontSize.sm}px` (14px), `${theme.fontFamily.sans}`, weight `400` |
| `organisms/EditableEntryCard.tsx` | Preview | `14px`, no line-height | Add `line-height: 1.5` |
| `molecules/EntryPreviewRow.tsx` | Preview | `14px`, no line-height | Add `line-height: 1.5` |
| `molecules/InlineEditPanel.tsx` | `.tiptap` override | `14px`, no line-height | Add `line-height: 1.6` |
| `organisms/QuickEntry.tsx` | Input | `15px`, italic | Change to `14px`, keep italic |

**Target**: All entry preview/card text = `14px` (bodySm token), `fontFamily.sans`, weight `400`, `line-height: 1.5`. Full editor stays at `16px` with `1.85` line-height. This creates a clear hierarchy: editor (16px) > previews/cards (14px) > meta/labels (12px).

### 8b. Heading hierarchy — consistent font family and page structure

| Issue | Fix |
|-------|-----|
| `tokens.ts` h3 uses `fontFamily.sans` while h1/h2 use `fontFamily.serif` | Change h3 to `fontFamily.serif` for consistency |
| `molecules/ViewHeader.tsx` Title uses `1.25rem, serif, italic, weight 500` | Use `theme.typography.h2` token (1.375rem, serif, weight 600) |
| `organisms/GoalCard.tsx` Title at `15px, weight 500` | Use `theme.fontSize.sm` with `fontWeight.semibold` |
| `organisms/MilestoneCard.tsx` Title at `15px, weight 500` | Same as GoalCard |

### 8c. Spacing symmetry — standardize card and section padding

**Desktop standard**: `16px 24px` (vertical horizontal), cards use `16px 24px 20px` (4px extra bottom for visual rhythm between stacked cards — keep this intentional pattern).

| Component | Current | Fix |
|-----------|---------|-----|
| `molecules/EntryPreviewRow.tsx` | `10px 20px` | Change to `12px 24px` to align with card standard |
| `molecules/TopicFilterBar.tsx` | `8px 12px` | Change to `8px 24px` (match horizontal standard) |
| `molecules/FilterTabs.tsx` | `8px 24px` | Keep — 8px vertical is correct for compact bars |
| `organisms/QuickEntry.tsx` Input | `padding: 10px 0` (no horizontal!) | Change to `padding: 10px 8px` |

**Horizontal alignment rule**: All content left edges should start at `24px` from their container edge on desktop, `16px` at 768px, `12px` at 480px.

### 8d. Vertical rhythm — normalize gaps to 4px scale

Gaps between elements should follow the spacing scale: 4, 8, 12, 16, 24px.

| Context | Current | Fix |
|---------|---------|-----|
| EntryCard HeaderRow margin-bottom | `10px` | Change to `8px` or `12px` |
| EntryCard ContentArea gap | `8px` | Keep (on scale) |
| EntryCard Footer margin-top | `8px` | Keep (on scale) |
| GoalCard header gap | `10px` | Change to `8px` or `12px` |
| EditableEntryCard Preview-to-Meta margin | `2px` | Change to `4px` |
| QuickEntry HeaderRow margin-bottom | `12px` | Keep (on scale) |

### 8e. Line-height standardization

| Context | Current | Standard |
|---------|---------|----------|
| Body text (16px) | `1.5` (GlobalStyle default) | Keep |
| Editor content | `1.85` | Keep (editorial readability) |
| Card preview text | unspecified (inherits 1.5) | Explicitly set `1.5` |
| InlineEditPanel `.tiptap` | unspecified | Set `1.6` |
| UI labels (Montserrat) | unspecified | Set `1.3` (tighter for UI) |

---

## Batch Dependency

```
Batch 1 (Foundation) — do first
  ├── Batch 2 (Modals) — needs useFocusTrap pattern
  ├── Batch 3 (Tabs/Nav) — needs focus-visible styles
  ├── Batch 4 (Semantic HTML) — needs ErrorBanner fix
  ├── Batch 5 (Icon Labels) — needs .sr-only class
  ├── Batch 6 (Visual Polish) — needs token updates
  ├── Batch 7 (Tap Targets & Text Size) — independent CSS/sizing
  └── Batch 8 (Typography & Spacing) — independent, pairs well with Batch 7
```

Batches 2-8 are independent of each other and can be done in any order after Batch 1. Batches 7 and 8 are purely visual — no ARIA dependencies — so they can be done first if preferred. Doing 7 and 8 together is natural since both touch font sizes and padding.

---

## Verification

After each batch:
1. Tab through the affected components — every interactive element should show a visible focus ring
2. Use browser DevTools Accessibility panel to verify ARIA roles and labels
3. Test with screen reader (VoiceOver on Mac: Cmd+F5) on key flows: login, create entry, navigate tabs, open/close modal
4. Test `prefers-reduced-motion` via DevTools > Rendering > Emulate CSS media feature
5. Run `npm run test` to ensure no regressions

**Batch 7 & 8 specific verification:**
6. Use Chrome DevTools device toolbar (mobile emulation) to verify tap targets — no interactive element should be smaller than 24x24px
7. Inspect computed font sizes — no text should render below 12px
8. Test at 480px, 768px, and 1024px breakpoints to verify targets don't shrink below minimums
9. Use Chrome Lighthouse accessibility audit to catch remaining contrast/size issues
