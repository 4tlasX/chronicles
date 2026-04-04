/**
 * Maps topic icon name strings (stored in DB) to FontAwesome icon definitions.
 * Uses the canonical ICON_MAP from IconPicker as the single source of truth.
 */
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { ICON_MAP } from '../components/molecules/IconPicker.js';

/**
 * Get a FontAwesome icon definition from a topic icon name string.
 * Falls back to book icon if the icon name is not found or null.
 */
export function getTopicIcon(iconName: string | null | undefined): IconDefinition {
  if (!iconName) return faBook;
  return ICON_MAP[iconName] || faBook;
}
