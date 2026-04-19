/**
 * Design tokens — shared across web and React Native
 * Single source of truth for all visual constants
 */

const fontFamily = {
  serif: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
  sans: "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  ui: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  brand: "'Josefin Sans', 'Inter', sans-serif",
};

const typography = {
  display: { fontFamily: fontFamily.serif, fontSize: '2.25rem', fontWeight: 700 },
  h1: { fontFamily: fontFamily.serif, fontSize: '2rem', fontWeight: 600 },
  h2: { fontFamily: fontFamily.serif, fontSize: '1.5rem', fontWeight: 600 },
  h3: { fontFamily: fontFamily.sans, fontSize: '1.25rem', fontWeight: 600 },
  body: { fontFamily: fontFamily.sans, fontSize: '1rem', fontWeight: 400 },
  bodySm: { fontFamily: fontFamily.sans, fontSize: '0.9rem', fontWeight: 400 },
  caption: { fontFamily: fontFamily.sans, fontSize: '0.8rem', fontWeight: 500 },
  brand: { fontFamily: fontFamily.brand, fontSize: '1rem', fontWeight: 400, letterSpacing: '0.1em' },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const fontSize = {
  xs: 13,
  sm: 15,
  md: 17,
  lg: 20,
  xl: 26,
  xxl: 34,
};

const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const borderRadius = {
  sm: 2,
  md: 4,
  lg: 6,
  xl: 8,
  full: 9999,
};

const zIndex = {
  sidebar: 100,
  header: 200,
  modal: 300,
  tooltip: 400,
};

/** Shared (non-color) tokens */
const shared = {
  fontFamily,
  typography,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  zIndex,
};

/** Light theme — warm parchment paper */
export const lightTheme = {
  ...shared,
  colors: {
    background: 'rgb(240, 235, 223)',
    surface: '#faf8f4',
    surfaceHover: '#f0eeea',
    surfaceOverlay: 'rgba(250, 248, 244, 0.92)',
    surfaceOverlayBlur: 'rgba(240, 235, 223, 0.82)',

    text: '#1a1a1a',
    textSecondary: '#363636',
    textMuted: '#5a5a5a',
    textInverse: '#ffffff',

    border: '#d4cfc5',
    borderFocus: '#8B6B4A',

    accent: '#4E6E7E',
    accentHover: '#3B5E6E',
    accentLight: 'rgba(78, 110, 126, 0.12)',

    danger: '#9B4444',
    dangerHover: '#7A3B3F',
    success: '#5A8A6A',
    warning: '#B8965A',
    info: '#5C6B8A',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 2px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.08)',
    focus: '0 0 0 2px rgba(139, 107, 74, 0.2)',
  },
} as const;

/** Dark theme — dark paper */
export const darkTheme = {
  ...shared,
  colors: {
    background: '#1a1b1d',
    surface: '#222325',
    surfaceHover: '#2a2b2e',
    surfaceOverlay: 'rgba(26, 27, 29, 0.92)',
    surfaceOverlayBlur: 'rgba(26, 27, 29, 0.82)',

    text: '#979797',
    textSecondary: '#a8a4a4',
    textMuted: '#a8a4a4',
    textInverse: '#2e2f31',

    border: '#2e2f33',
    borderFocus: '#A67C52',

    accent: '#6B8BA4',
    accentHover: '#7B9EB2',
    accentLight: 'rgba(107, 139, 164, 0.2)',

    danger: '#C47A7A',
    dangerHover: '#A45A5A',
    success: '#7BAA8A',
    warning: '#D4B47A',
    info: '#7B9EB2',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 2px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.2)',
    focus: '0 0 0 2px rgba(166, 124, 82, 0.25)',
  },
} as const;

/** Default theme export for backwards compatibility */
export const theme = lightTheme;

export type Theme = typeof lightTheme;
