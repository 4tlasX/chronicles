import React from "react";

export interface WidgetProps extends React.HTMLAttributes<HTMLElement> {
  /** Uppercase tracked title in the header. */
  title?: string;
  /** Leading IconName or node. */
  icon?: string | React.ReactNode;
  /** Trailing header node (e.g. an IconButton or a "See all" link). */
  action?: React.ReactNode;
  /** "raised" = shadow instead of border; "accent" = tinted surface. */
  variant?: "raised" | "accent";
  /** Remove body padding (for flush lists/calendars). */
  flush?: boolean;
  children?: React.ReactNode;
}

/**
 * Titled card for a dashboard tile — weather, wellness, meds, meal plan,
 * upcoming, or any custom topic widget.
 * @startingPoint section="Dashboard" subtitle="Dashboard widget tile" viewport="380x260"
 */
export function Widget(props: WidgetProps): JSX.Element;
