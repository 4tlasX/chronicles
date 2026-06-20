import React from "react";
import { Icon } from "./Icon.jsx";

/* Segmented control — single-select among a few options. */
export function SegmentedControl({ options, value, onChange, className = "", ...rest }) {
  return (
    <div className={`ch-segmented ${className}`} role="tablist" {...rest}>
      {options.map((opt) => {
        const o = typeof opt === "string" ? { value: opt, label: opt } : opt;
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className="ch-segmented__item"
            onClick={() => onChange && onChange(o.value)}
          >
            {o.icon && <Icon name={o.icon} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
