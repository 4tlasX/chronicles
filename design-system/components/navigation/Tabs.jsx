import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Underline tab bar. */
export function Tabs({ tabs, value, onChange, className = "", ...rest }) {
  return (
    <div className={`ch-tabs ${className}`} role="tablist" {...rest}>
      {tabs.map((tab) => {
        const t = typeof tab === "string" ? { value: tab, label: tab } : tab;
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className="ch-tab"
            onClick={() => onChange && onChange(t.value)}
          >
            {t.icon && <Icon name={t.icon} />}
            {t.label}
            {t.count != null && <span className="ch-tab__count">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
