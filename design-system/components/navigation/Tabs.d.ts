import React from "react";

export interface TabItem {
  value: string;
  label?: string;
  /** Optional leading IconName. */
  icon?: string;
  /** Optional count pill. */
  count?: number;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Array<string | TabItem>;
  value: string;
  onChange?: (value: string) => void;
}

/** Underline tab bar with optional icons and count pills. */
export function Tabs(props: TabsProps): JSX.Element;
