/**
 * Maps topic icon name strings (stored in DB) to Google Material Symbols
 * glyph names. Uses the canonical ICON_MAP from IconPicker as the single
 * source of truth.
 */
import { ICON_MAP } from '../components/molecules/IconPicker.js';

/**
 * Get a Material Symbols glyph name from a topic icon name string.
 * Falls back to the book glyph if the icon name is not found or null.
 */
export function getTopicIcon(iconName: string | null | undefined): string {
  if (!iconName) return 'book_2';
  return ICON_MAP[iconName] || 'book_2';
}
