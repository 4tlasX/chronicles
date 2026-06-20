import React from "react";

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "info" | "success" | "warning";
  title?: string;
  children?: React.ReactNode;
}

/** Inline contextual message embedded in a view. */
export function Banner(props: BannerProps): JSX.Element;
