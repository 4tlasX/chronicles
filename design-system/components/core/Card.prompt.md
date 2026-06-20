Surface that groups related content. Hairline border by default; `raised` swaps to a soft shadow; `interactive` adds hover/press states for clickable cards.

```jsx
<Card>
  <h3>This week</h3>
  <p>3 of 7 tasks complete.</p>
</Card>
<Card interactive raised onClick={open}>…</Card>
```
