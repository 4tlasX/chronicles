Titled card tile for the dashboard. Compose any content; use the helper classes `ch-metric`, `ch-stat`, `ch-dots` for common patterns.

```jsx
<Widget title="Weather" icon="cloud-sun" action={<span className="ch-eyebrow">Austin</span>}>
  <div className="ch-metric ch-metric--xl">72°</div>
</Widget>

<Widget title="Medication" icon="pill">
  <div className="ch-stat"><span className="ch-stat__label"><Icon name="check"/> Vitamin D</span><span className="ch-stat__value">8:00</span></div>
</Widget>
```

Variants: `raised` (shadow) · `accent` (tinted). Pass `flush` to remove body padding.
