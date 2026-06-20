Modal for focused decisions and forms. Controlled with `open`/`onClose`.

```jsx
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Move to next week?"
  description="Unfinished tasks will carry over to next Monday."
  footer={<>
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    <Button onClick={migrate}>Migrate</Button>
  </>}
/>
```
