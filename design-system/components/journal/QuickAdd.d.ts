import React from "react";

export interface QuickAddProps extends React.HTMLAttributes<HTMLFormElement> {
  placeholder?: string;
  /** Signifier shown at the start of the row. */
  type?: "task" | "event" | "note";
  /** Called with the trimmed text on submit (Enter). */
  onAdd?: (text: string) => void;
}

/** Inline entry composer that matches the BulletEntry rhythm. */
export function QuickAdd(props: QuickAddProps): JSX.Element;
