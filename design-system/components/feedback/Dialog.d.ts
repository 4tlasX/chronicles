import React from "react";

export interface DialogProps {
  /** Controls visibility. */
  open: boolean;
  /** Close handler — fires on overlay click and the × button. */
  onClose?: () => void;
  title?: string;
  description?: string;
  /** Body content below the header. */
  children?: React.ReactNode;
  /** Footer node, typically right-aligned buttons. */
  footer?: React.ReactNode;
  className?: string;
}

/** Centered modal dialog with overlay, blur, and entrance animation. */
export function Dialog(props: DialogProps): JSX.Element | null;
