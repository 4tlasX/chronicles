import React from "react";

/* A titled group of entries — a daily log or named collection. */
export function Collection({ title, date, action, children, className = "", ...rest }) {
  return (
    <section className={`ch-collection ${className}`} {...rest}>
      <header className="ch-collection__head">
        {title && <h2 className="ch-collection__title">{title}</h2>}
        {date && <span className="ch-collection__date">{date}</span>}
        <span className="ch-collection__rule" />
        {action}
      </header>
      <div>{children}</div>
    </section>
  );
}
