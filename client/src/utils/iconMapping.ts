/**
 * Map FontAwesome icon names to Chronicles design system Icon names.
 * Use this to quickly swap FontAwesome → Icon component across the app.
 */
export const ICON_MAP: Record<string, string> = {
  // Navigation
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'arrow-right': 'arrow-right',
  'arrow-left': 'arrow-left',

  // Actions
  'plus': 'plus',
  'minus': 'minus',
  'x': 'x',
  'check': 'check',
  'trash': 'trash',
  'pencil': 'pencil',
  'search': 'search',
  'mic': 'mic',
  'bookmark': 'bookmark',
  'share': 'share',
  'flag': 'flag',

  // Objects
  'home': 'home',
  'book': 'book',
  'calendar': 'calendar',
  'tag': 'tag',
  'settings': 'settings',
  'user': 'user',
  'clock': 'clock',
  'bell': 'bell',
  'heart': 'heart',
  'star': 'star',

  // Status
  'check-circle': 'check-circle',
  'circle': 'circle',
  'alert': 'flag',

  // Health & Wellness
  'droplet': 'droplet',
  'moon': 'moon',
  'sun': 'sun',
  'cloud': 'cloud',
};

export type IconName =
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'arrow-right'
  | 'arrow-left'
  | 'plus'
  | 'minus'
  | 'x'
  | 'check'
  | 'trash'
  | 'pencil'
  | 'search'
  | 'mic'
  | 'bookmark'
  | 'share'
  | 'flag'
  | 'home'
  | 'book'
  | 'calendar'
  | 'tag'
  | 'settings'
  | 'user'
  | 'clock'
  | 'bell'
  | 'heart'
  | 'star'
  | 'check-circle'
  | 'circle'
  | 'alert'
  | 'droplet'
  | 'moon'
  | 'sun'
  | 'cloud';
