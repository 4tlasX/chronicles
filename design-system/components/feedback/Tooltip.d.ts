import React from "react";

export interface TooltipProps {
  /** Tooltip text shown above the trigger. */
  label: string;
  children: React.ReactNode;
  className?: string;
}

/** Wraps a trigger and shows a label on hover/focus. */
export function Tooltip(props: TooltipProps): JSX.Element;
