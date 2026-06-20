import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Topic types and their leading icon (for non-task entries). */
export const ENTRY_ICONS = {
  quote: "quote",
  journal: "feather",
  goal: "trophy",
  meal: "utensils",
  recipe: "coffee",
  wellness: "heart",
  medication: "pill",
  water: "droplet",
  workout: "activity",
  idea: "sparkles",
};

/* Render the leading signifier for an entry. */
function Signifier({ type, done, accent, icon }) {
  if (type === "task") {
    if (done) return <Icon name="check" size={15} strokeWidth={2.4} />;
    return <span className={`ch-sig-task ${accent ? "ch-sig-task--accent" : ""}`} />;
  }
  if (type === "event") return <span className="ch-sig-event" />;
  if (type === "note") return <span className="ch-sig-note" />;
  const name = icon || ENTRY_ICONS[type] || "circle";
  return <Icon name={name} size={16} strokeWidth={1.9} />;
}

/*
 * The signature Chronicles row — a captured entry of any topic.
 * Tasks have a tappable dot/check; other topics (quote, journal, goal,
 * meal, recipe, …) show an elegant icon marker. Supports priority, time,
 * and tags. Compose many inside a Collection.
 */
export function BulletEntry({
  type = "task",
  done = false,
  priority = false,
  accent = false,
  icon,
  text,
  sub,
  time,
  tags,
  onToggle,
  trailing,
  className = "",
  ...rest
}) {
  const isTask = type === "task";
  const sigClass = `ch-entry__sig ${isTask ? "" : "ch-entry__sig--topic"}`;
  return (
    <div
      className={`ch-entry ch-entry--${type} ${done ? "ch-entry--done" : ""} ${priority ? "ch-entry--priority" : ""} ${className}`}
      {...rest}
    >
      <button
        type="button"
        className={sigClass}
        aria-pressed={isTask ? done : undefined}
        aria-label={isTask ? (done ? "Mark incomplete" : "Complete") : type}
        onClick={isTask ? onToggle : undefined}
        tabIndex={isTask ? 0 : -1}
      >
        <Signifier type={type} done={done} accent={accent} icon={icon} />
      </button>

      <div className="ch-entry__body">
        <div className="ch-entry__text">
          {priority && !done && (
            <span className="ch-entry__star"><Icon name="star" size={14} /></span>
          )}
          {text}
        </div>
        {sub && <div className="ch-entry__sub">{sub}</div>}
        {(time || tags) && (
          <div className="ch-entry__meta">
            {time && <span className="ch-entry__time">{time}</span>}
            {tags && tags.map((t) => (
              <span key={t} className="ch-entry__tag">#{t}</span>
            ))}
          </div>
        )}
      </div>

      {trailing && <div className="ch-entry__trail">{trailing}</div>}
    </div>
  );
}
