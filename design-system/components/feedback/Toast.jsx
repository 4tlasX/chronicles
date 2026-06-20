import React from "react";
import { Icon } from "../core/Icon.jsx";

const ICONS = { success: "check", danger: "x", accent: "sparkles", neutral: "bell" };

/* Transient notification. */
export function Toast({ tone = "neutral", title, description, onClose, className = "" }) {
  return (
    <div className={`ch-toast ch-toast--${tone} ${className}`} role="status">
      <span className="ch-toast__icon"><Icon name={ICONS[tone]} size={18} /></span>
      <div className="ch-toast__content">
        {title && <div className="ch-toast__title">{title}</div>}
        {description && <div className="ch-toast__desc">{description}</div>}
      </div>
      {onClose && (
        <button className="ch-toast__close" aria-label="Dismiss" onClick={onClose}>
          <Icon name="x" size={15} />
        </button>
      )}
    </div>
  );
}
