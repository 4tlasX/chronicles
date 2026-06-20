import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Inline rapid-add row that matches the entry rhythm. */
export function QuickAdd({ placeholder = "Add an entry…", onAdd, type = "task", className = "", ...rest }) {
  const [value, setValue] = React.useState("");
  const submit = (e) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onAdd && onAdd(v);
    setValue("");
  };
  return (
    <form className={`ch-quickadd ${className}`} onSubmit={submit} {...rest}>
      <span className="ch-quickadd__sig">
        {type === "event" ? <span className="ch-sig-event" /> : type === "note" ? <span className="ch-sig-note" /> : <Icon name="plus" size={15} />}
      </span>
      <input
        className="ch-quickadd__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Add entry"
      />
    </form>
  );
}
