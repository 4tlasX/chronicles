import React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. */
  variant?: "ghost" | "solid" | "outline";
  size?: "sm" | "md" | "lg";
  /** IconName string or a React node. */
  icon: string | React.ReactNode;
  /** Required for accessibility — describes the action. */
  "aria-label": string;
}

/** Square, icon-only button. Always supply an aria-label. */
export function IconButton(props: IconButtonProps): JSX.Element;
