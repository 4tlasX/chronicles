Signature customization control — lets users pick their accent theme. Apply the selected value to `document.documentElement.dataset.accent` to recolor the entire app.

```jsx
const [accent, setAccent] = React.useState("ink");
React.useEffect(() => { document.documentElement.dataset.accent = accent; }, [accent]);
<AccentPicker value={accent} onChange={setAccent} />
```

Values: `ink (default) | sage | clay | amber | teal | rose | slate`. Exported `ACCENTS` holds the {value,label,color} list.
