The heart of the Chronicles dashboard — capture anything, sorted by topic. Includes the required **dropdown topic picker**, a **formatting** button, and a **microphone** for dictation.

```jsx
<QuickCapture onCapture={({ type, text }) => addEntry({ type, text })} />
```

`topics` overrides the dropdown list; `defaultTopic` sets the initial selection. Exports `TOPICS` (task, event, journal, note, quote, goal, meal, recipe, idea). Fires `onCapture({ type, text })` on the Capture button or ⌘/Ctrl+Enter.
