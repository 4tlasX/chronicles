/**
 * Design tokens — shared across web and React Native
 * Single source of truth for all visual constants
 */

export const theme = {
  colors: {
    // Core palette — matches Chronicles original
    accent: '#4281a4',
    accentHover: '#2e6184',
    accentLight: '#d6e9f4',

    header: '#0F4C5C',
    headerHover: '#0a3640',

    background: '#e8e5df',
    surface: '#ffffff',
    surfaceHover: '#f0f0f0',
    surfaceGlass: 'rgba(255, 255, 255, 0.9)',
    surfaceGlassLight: 'rgba(255, 255, 255, 0.1)',

    text: '#171717',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    textInverse: '#ffffff',

    border: '#d1d5db',
    borderFocus: '#4281a4',

    danger: '#ef4444',
    dangerHover: '#dc2626',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },

  zIndex: {
    sidebar: 100,
    header: 200,
    modal: 300,
    tooltip: 400,
  },
} as const;

export type Theme = typeof theme;

