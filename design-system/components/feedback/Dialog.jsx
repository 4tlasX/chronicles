import React from "react";
import { IconButton } from "../core/IconButton.jsx";

/* Modal dialog. Controlled via `open`. */
export function Dialog({ open, onClose, title, description, children, footer, className = "" }) {
  if (!open) return null;
  return (
    <div className="ch-dialog-overlay" onClick={onClose} role="presentation">
      <div
        className={`ch-dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ch-dialog__body">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)" }}>
            <div>
              {title && <h2 className="ch-dialog__title">{title}</h2>}
              {description && <p className="ch-dialog__desc">{description}</p>}
            </div>
            {onClose && <IconButton icon="x" aria-label="Close" size="sm" onClick={onClose} />}
          </div>
          {children && <div style={{ marginTop: "var(--space-4)" }}>{children}</div>}
        </div>
        {footer && <div className="ch-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}
