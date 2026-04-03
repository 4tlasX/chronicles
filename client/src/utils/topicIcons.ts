/**
 * Maps topic icon name strings (stored in DB) to FontAwesome icon definitions.
 * Used by TopicSelector, TopicBadge, EntryCard, and QuickEntry.
 */
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCheck,
  faCircleCheck,
  faLightbulb,
  faMagnifyingGlass,
  faCalendar,
  faUsers,
  faFlask,
  faMusic,
  faBook,
  faFilm,
  faQuoteLeft,
  faUtensils,
  faPills,
  faBullseye,
  faFlag,
  faDumbbell,
  faTriangleExclamation,
  faCircle,
  faPen,
  faPencil,
  faNoteSticky,
  faHeart,
  faStar,
  faHome,
  faBriefcase,
  faGraduationCap,
  faCode,
  faCamera,
  faPalette,
  faPlane,
  faCar,
  faGamepad,
  faCoffee,
  faMugHot,
} from '@fortawesome/free-solid-svg-icons';

const ICON_MAP: Record<string, IconDefinition> = {
  'check': faCheck,
  'circle-check': faCircleCheck,
  'lightbulb': faLightbulb,
  'magnifying-glass': faMagnifyingGlass,
  'calendar': faCalendar,
  'users': faUsers,
  'flask': faFlask,
  'music': faMusic,
  'book': faBook,
  'film': faFilm,
  'quote-left': faQuoteLeft,
  'utensils': faUtensils,
  'pills': faPills,
  'bullseye': faBullseye,
  'flag': faFlag,
  'dumbbell': faDumbbell,
  'triangle-exclamation': faTriangleExclamation,
  'pen': faPen,
  'pencil': faPencil,
  'note-sticky': faNoteSticky,
  'heart': faHeart,
  'star': faStar,
  'home': faHome,
  'briefcase': faBriefcase,
  'graduation-cap': faGraduationCap,
  'code': faCode,
  'camera': faCamera,
  'palette': faPalette,
  'plane': faPlane,
  'car': faCar,
  'gamepad': faGamepad,
  'coffee': faCoffee,
  'mug-hot': faMugHot,
};

/**
 * Get a FontAwesome icon definition from a topic icon name string.
 * Falls back to a generic circle if the icon name is not found.
 */
export function getTopicIcon(iconName: string | null | undefined): IconDefinition {
  if (!iconName) return faCircle;
  return ICON_MAP[iconName] || faCircle;
}
