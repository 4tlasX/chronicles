Action trigger for Chronicles — use `primary` for the single main action per view, `secondary`/`ghost` for supporting actions, `accentSoft` for tinted emphasis, `danger` for destructive confirms.

```jsx
<Button variant="primary" icon="plus">New entry</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ghost" icon="settings" />
<Button variant="danger">Delete log</Button>
```

Variants: `primary | secondary | ghost | accentSoft | danger`. Sizes: `sm | md | lg`. Pass `block` to fill width; `icon` / `iconRight` accept an IconName string or any node.
