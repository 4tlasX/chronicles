import React from "react";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** When provided, renders a remove (×) button. */
  onRemove?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

/** Pill-shaped tag/label, optionally removable. */
export function Tag(props: TagProps): JSX.Element;
