import React from "react";
import { Icon } from "./Icon.jsx";

/*
 * Single-select dropdown menu. The trigger shows the current option;
 * the menu lists options with optional icons and a check on the active one.
 */
export function Dropdown({ value, onChange, options, placeholder = "Select", up = false, triggerLabel, className = "", ...rest }) {
  const [open, setOpen] = React.useState(false);
  const norm = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const current = norm.find((o) => o.value === value);

  return (
    <div className={`ch-dropdown ${className}`} data-open={open} {...rest}>
      <button type="button" className="ch-dropdown__trigger" aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        {current && current.icon && <Icon name={current.icon} size={16} />}
        <span>{triggerLabel || (current ? current.label : placeholder)}</span>
        <span className="ch-dropdown__chev"><Icon name="chevron-down" size={15} /></span>
      </button>
      {open && (
        <React.Fragment>
          <div className="ch-menu__overlay" onClick={() => setOpen(false)} />
          <div className={`ch-menu ${up ? "ch-menu--up" : ""}`} role="listbox">
            {norm.map((o) => o.separator ? (
              <div key={o.value || Math.random()} className="ch-menu__sep" />
            ) : (
              <button key={o.value} type="button" role="option" aria-selected={o.value === value}
                className="ch-menu__item"
                onClick={() => { onChange && onChange(o.value); setOpen(false); }}>
                {o.icon && <Icon name={o.icon} size={16} />}
                <span>{o.label}</span>
                <span className="ch-menu__check"><Icon name="check" size={15} strokeWidth={2.4} /></span>
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
