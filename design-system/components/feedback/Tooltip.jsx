import React from "react";

/* Hover/focus tooltip wrapper. */
export function Tooltip({ label, children, className = "" }) {
  return (
    <span className={`ch-tooltip-wrap ${className}`} tabIndex={0}>
      {children}
      <span className="ch-tooltip" role="tooltip">{label}</span>
    </span>
  );
}
