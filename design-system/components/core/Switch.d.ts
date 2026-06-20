import React from "react";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

/** Binary toggle for settings. Renders with role="switch". */
export function Switch(props: SwitchProps): JSX.Element;
