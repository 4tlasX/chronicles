import React from "react";

export interface SegmentedOption {
  value: string;
  label?: string;
  /** Optional leading IconName. */
  icon?: string;
}

export interface SegmentedControlProps {
  /** Options as strings or {value,label,icon} objects. */
  options: Array<string | SegmentedOption>;
  /** Currently selected value. */
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

/** Compact single-select toggle for 2–4 mutually exclusive views. */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
