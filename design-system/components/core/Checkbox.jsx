import React from "react";
import { Icon } from "./Icon.jsx";

/* Checkbox with label. Controlled or uncontrolled. */
export function Checkbox({ label, className = "", ...rest }) {
  return (
    <label className={`ch-check ${className}`}>
      <input type="checkbox" {...rest} />
      <span className="ch-check__box"><Icon name="check" size={13} strokeWidth={3} /></span>
      {label && <span className="ch-check__label">{label}</span>}
    </label>
  );
}
