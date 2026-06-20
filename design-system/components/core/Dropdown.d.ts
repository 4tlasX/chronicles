import React from "react";

export interface DropdownOption {
  value: string;
  label?: string;
  /** Optional leading IconName. */
  icon?: string;
  /** Render a divider instead of an item. */
  separator?: boolean;
}

export interface DropdownProps {
  /** Selected value. */
  value: string;
  onChange?: (value: string) => void;
  /** Options as strings or {value,label,icon,separator}. */
  options: Array<string | DropdownOption>;
  placeholder?: string;
  /** Open upward (for bottom-anchored composers). */
  up?: boolean;
  /** Override the trigger text (keeps the current icon). */
  triggerLabel?: string;
  className?: string;
}

/** Single-select dropdown menu with icons and a click-away overlay. */
export function Dropdown(props: DropdownProps): JSX.Element;
