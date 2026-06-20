import React from "react";
import { Icon } from "./Icon.jsx";

/* The six Chronicles accent themes. value matches the data-accent attribute. */
export const ACCENTS = [
  { value: "ink",   label: "Ink",   color: "#5b53d6" },
  { value: "sage",  label: "Sage",  color: "#4c8a5f" },
  { value: "clay",  label: "Clay",  color: "#bf6038" },
  { value: "amber", label: "Amber", color: "#c2871a" },
  { value: "teal",  label: "Teal",  color: "#1e8a87" },
  { value: "rose",  label: "Rose",  color: "#c34a77" },
  { value: "slate", label: "Slate", color: "#5b636e" },
];

/* Row of accent swatches for theme customization. */
export function AccentPicker({ value = "ink", onChange, className = "", ...rest }) {
  return (
    <div className={`ch-accentpicker ${className}`} role="radiogroup" aria-label="Accent color"
      style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }} {...rest}>
      {ACCENTS.map((a) => (
        <button
          key={a.value}
          type="button"
          role="radio"
          aria-checked={value === a.value}
          aria-pressed={value === a.value}
          aria-label={a.label}
          title={a.label}
          className="ch-swatch"
          style={{ background: a.color }}
          onClick={() => onChange && onChange(a.value)}
        >
          {value === a.value && (
            <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff" }}>
              <Icon name="check" size={13} strokeWidth={3} />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
