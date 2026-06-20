import React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials when absent. */
  src?: string;
  /** Full name — used for alt text and initials. */
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

/** User avatar showing an image or derived initials. */
export function Avatar(props: AvatarProps): JSX.Element;
