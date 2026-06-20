import React from "react";

export interface CollectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Collection / day name. */
  title?: string;
  /** Date or meta, shown in mono on the right of the header. */
  date?: string;
  /** Optional trailing header node (e.g. an IconButton). */
  action?: React.ReactNode;
  children?: React.ReactNode;
}

/** Titled group wrapping a set of BulletEntry rows. */
export function Collection(props: CollectionProps): JSX.Element;
