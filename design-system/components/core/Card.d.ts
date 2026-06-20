import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Apply default internal padding. Default true. */
  pad?: boolean;
  /** Use a soft shadow instead of a hairline border. */
  raised?: boolean;
  /** Add hover/press affordances for clickable cards. */
  interactive?: boolean;
  /** Element/tag to render as. Default "div". */
  as?: React.ElementType;
  children?: React.ReactNode;
}

/** Surface container for grouped content. */
export function Card(props: CardProps): JSX.Element;
