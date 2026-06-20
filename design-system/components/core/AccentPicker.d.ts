import React from "react";

export type AccentValue = "ink" | "sage" | "clay" | "amber" | "teal" | "rose" | "slate";

export interface AccentOption {
  value: AccentValue;
  label: string;
  color: string;
}

/** The seven built-in accent themes (value maps to the `data-accent` attribute). */
export const ACCENTS: AccentOption[];

export interface AccentPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Selected accent value. */
  value?: AccentValue;
  onChange?: (value: AccentValue) => void;
}

/**
 * Swatch row for picking the user's accent theme. Set the chosen value as
 * `data-accent` on <html> to recolor the whole app.
 */
export function AccentPicker(props: AccentPickerProps): JSX.Element;
