Labeled text field. Composes label, input, and hint/error. Pass `icon` for a leading glyph (e.g. search).

```jsx
<Input label="Title" placeholder="Morning pages…" />
<Input icon="search" placeholder="Search entries" />
<Input label="Email" error="That address looks off" defaultValue="me@" />
```

`error` takes precedence over `hint` and applies danger styling + `aria-invalid`.
