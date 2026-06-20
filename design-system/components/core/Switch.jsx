import React from "react";

/* Toggle switch for binary settings. */
export function Switch({ label, className = "", ...rest }) {
  return (
    <label className={`ch-switch ${className}`}>
      <input type="checkbox" role="switch" {...rest} />
      <span className="ch-switch__track"><span className="ch-switch__thumb" /></span>
      {label && <span className="ch-check__label">{label}</span>}
    </label>
  );
}
