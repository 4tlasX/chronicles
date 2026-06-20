import React from "react";

export interface CaptureTopic {
  value: string;
  label: string;
  icon?: string;
}

export interface CapturePayload {
  type: string;
  text: string;
}

export interface QuickCaptureProps {
  /** Topic options for the dropdown. Defaults to the full TOPICS palette. */
  topics?: CaptureTopic[];
  defaultTopic?: string;
  /** Fires with { type, text } on Capture / ⌘+Enter. */
  onCapture?: (payload: CapturePayload) => void;
  autoFocus?: boolean;
  className?: string;
}

/** The full default topic palette (task, event, journal, quote, goal, meal, recipe…). */
export const TOPICS: CaptureTopic[];

/**
 * The dashboard's signature capture composer: a dropdown topic picker, a text
 * area, a formatting toggle, a microphone, and a Capture button.
 * @startingPoint section="Journal" subtitle="Quick-capture composer" viewport="560x220"
 */
export function QuickCapture(props: QuickCaptureProps): JSX.Element;
