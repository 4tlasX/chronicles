import React from "react";

/* Surface container. */
export function Card({ pad = true, raised = false, interactive = false, as: Tag = "div", children, className = "", ...rest }) {
  const cls = [
    "ch-card",
    pad ? "ch-card--pad" : "",
    raised ? "ch-card--raised" : "",
    interactive ? "ch-card--interactive" : "",
    className,
  ].filter(Boolean).join(" ");
  return <Tag className={cls} {...rest}>{children}</Tag>;
}
