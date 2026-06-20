import React from "react";
import { Icon } from "../core/Icon.jsx";

const ICONS = { info: "bell", success: "check", warning: "flag" };

/* Inline contextual banner. */
export function Banner({ tone = "info", title, children, className = "", ...rest }) {
  return (
    <div className={`ch-banner ch-banner--${tone} ${className}`} role="note" {...rest}>
      <span className="ch-banner__icon"><Icon name={ICONS[tone]} size={17} /></span>
      <div>
        {title && <span className="ch-banner__title">{title} </span>}
        {children}
      </div>
    </div>
  );
}
