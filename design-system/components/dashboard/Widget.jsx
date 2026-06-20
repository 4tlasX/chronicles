import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Dashboard widget shell: titled card with an icon and optional action. */
export function Widget({ title, icon, action, variant, flush = false, children, className = "", ...rest }) {
  const cls = [
    "ch-widget",
    variant === "raised" ? "ch-widget--raised" : "",
    variant === "accent" ? "ch-widget--accent" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <section className={cls} {...rest}>
      {(title || icon || action) && (
        <header className="ch-widget__head">
          {icon && <span className="ch-widget__icon">{typeof icon === "string" ? <Icon name={icon} size={17} /> : icon}</span>}
          {title && <h3 className="ch-widget__title">{title}</h3>}
          {action && <span className="ch-widget__action">{action}</span>}
        </header>
      )}
      <div className={`ch-widget__body ${flush ? "ch-widget__body--flush" : ""}`}>{children}</div>
    </section>
  );
}
