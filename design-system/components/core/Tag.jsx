import React from "react";
import { Icon } from "./Icon.jsx";

/* Removable chip, e.g. a tag on an entry. */
export function Tag({ children, onRemove, className = "", ...rest }) {
  return (
    <span className={`ch-tag ${className}`} {...rest}>
      {children}
      {onRemove && (
        <button type="button" className="ch-tag__close" aria-label="Remove" onClick={onRemove}>
          <Icon name="x" size={13} strokeWidth={2.4} />
        </button>
      )}
    </span>
  );
}
