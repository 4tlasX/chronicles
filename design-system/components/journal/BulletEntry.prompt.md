The heart of Chronicles — a rapid-logging entry row. The leading signifier is tappable to toggle completion.

```jsx
<BulletEntry type="task" text="Draft Q3 review" time="09:30" tags={["work"]} onToggle={toggle} />
<BulletEntry type="task" done text="Reply to Maya" />
<BulletEntry type="task" priority accent text="Book dentist" />
<BulletEntry type="event" text="Standup" time="10:00" />
<BulletEntry type="note" text="Idea: weekly review template" />
```

Types: `task` (dot) · `event` (ring) · `note` (dash). Flags: `done`, `priority`, `accent`. Pass `trailing` for hover affordances.
