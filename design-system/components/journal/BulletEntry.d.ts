import React from "react";

export type EntryType =
  | "task" | "event" | "note"
  | "quote" | "journal" | "goal" | "meal" | "recipe"
  | "wellness" | "medication" | "water" | "workout" | "idea";

/** Map of non-task topic types to their default leading IconName. */
export const ENTRY_ICONS: Record<string, string>;

export interface BulletEntryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Entry topic. task/event/note use signifier glyphs; all others show an icon marker. */
  type?: EntryType;
  /** Completed (tasks only) — strikes through and swaps the glyph for a check. */
  done?: boolean;
  /** Priority — bolds the text and shows a leading star. */
  priority?: boolean;
  /** Tint the task dot with the current accent. */
  accent?: boolean;
  /** Override the topic marker icon (IconName). */
  icon?: string;
  /** Primary entry text. Quote entries render italic in the display serif. */
  text: React.ReactNode;
  /** Optional secondary line. */
  sub?: React.ReactNode;
  /** Time/metadata. */
  time?: string;
  /** Hashtags (without the #). */
  tags?: string[];
  /** Fires when a task signifier is tapped. */
  onToggle?: (e: React.MouseEvent) => void;
  /** Trailing node revealed on hover (e.g. icon buttons). */
  trailing?: React.ReactNode;
}

/**
 * The signature captured-entry row. Any topic — task, event, note, quote,
 * journal, goal, meal, recipe and more — in one consistent, elegant rhythm.
 * @startingPoint section="Journal" subtitle="The captured-entry row" viewport="700x320"
 */
export function BulletEntry(props: BulletEntryProps): JSX.Element;
