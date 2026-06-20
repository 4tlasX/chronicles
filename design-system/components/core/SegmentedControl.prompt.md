Compact toggle for switching between a few mutually-exclusive views (e.g. Day / Week / Month).

```jsx
<SegmentedControl
  value={view}
  onChange={setView}
  options={[
    { value: "day", label: "Day", icon: "list" },
    { value: "week", label: "Week", icon: "layout-grid" },
    { value: "month", label: "Month", icon: "calendar" },
  ]}
/>
```
