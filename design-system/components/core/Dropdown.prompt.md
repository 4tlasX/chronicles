Single-select dropdown menu. Use for the entry topic picker and any compact option list. Set `up` for bottom-anchored composers.

```jsx
<Dropdown value={topic} onChange={setTopic} options={[
  { value: "task", label: "Task", icon: "check-circle" },
  { value: "journal", label: "Journal", icon: "feather" },
  { value: "quote", label: "Quote", icon: "quote" },
  { value: "meal", label: "Meal", icon: "utensils" },
]} />
```
