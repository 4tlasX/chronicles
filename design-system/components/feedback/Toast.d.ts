import React from "react";

export interface ToastProps {
  tone?: "neutral" | "success" | "danger" | "accent";
  title?: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

/** Transient confirmation/notification on a dark surface. */
export function Toast(props: ToastProps): JSX.Element;
