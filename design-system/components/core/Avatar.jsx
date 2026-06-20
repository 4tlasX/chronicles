import React from "react";

/* Avatar — image or initials. */
export function Avatar({ src, name = "", size = "md", className = "", ...rest }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span className={`ch-avatar ch-avatar--${size} ${className}`} {...rest}>
      {src ? <img src={src} alt={name} /> : <span>{initials || "·"}</span>}
    </span>
  );
}
