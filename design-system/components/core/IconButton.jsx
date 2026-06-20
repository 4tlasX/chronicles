import React from "react";
import { Icon } from "./Icon.jsx";

/* Square icon-only button. Always pass aria-label. */
export function IconButton({
  variant = "ghost",
  size = "md",
  icon,
  className = "",
  ...rest
}) {
  const cls = [
    "ch-iconbtn",
    `ch-iconbtn--${size}`,
    variant === "solid" ? "ch-iconbtn--solid" : variant === "outline" ? "ch-iconbtn--outline" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <button className={cls} {...rest}>
      {typeof icon === "string" ? <Icon name={icon} /> : icon}
    </button>
  );
}
