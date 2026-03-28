/**
 * Predefined color options for header and accent customization
 */

export interface ColorOption {
  value: string;
  label: string;
}

export const HEADER_COLORS: ColorOption[] = [
  { value: '#2d2c2a', label: 'Dark' },
  { value: '#003D73', label: 'Navy' },
  { value: '#E6B062', label: 'Gold' },
  { value: '#EF8070', label: 'Coral' },
  { value: '#46A99B', label: 'Teal' },
  { value: '#4281A4', label: 'Steel Blue' },
  { value: '#48A9A6', label: 'Verdigris' },
  { value: '#D4B483', label: 'Tan' },
  { value: '#C1666B', label: 'Rose' },
  { value: '#582C4D', label: 'Plum' },
  { value: '#474973', label: 'Purple' },
  { value: '#161B33', label: 'Midnight' },
  { value: '#0D0C1D', label: 'Black' },
  { value: '#5F0F40', label: 'Burgundy' },
  { value: '#9A031E', label: 'Ruby' },
  { value: '#E36414', label: 'Orange' },
  { value: '#0F4C5C', label: 'Deep Teal' },
  { value: 'transparent', label: 'Transparent' },
];

/**
 * Derive a hover color (15% darker) from a hex color
 */
export function deriveHoverColor(hex: string): string {
  if (hex === 'transparent') return '#3d3c3a';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const darken = (c: number) => Math.max(0, Math.round(c * 0.85));
  return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
}

/**
 * Derive a light background color (10% opacity) from a hex color
 */
export function deriveLightColor(hex: string): string {
  if (hex === 'transparent') return 'rgba(107, 114, 128, 0.1)';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}
