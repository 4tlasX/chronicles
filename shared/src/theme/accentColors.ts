/**
 * Predefined color options for header and accent customization
 */

export interface ColorOption {
  value: string;
  label: string;
}

export const HEADER_COLORS: ColorOption[] = [
  { value: '#000000', label: 'Black' },
  { value: '#1B2A4A', label: 'Navy' },
  { value: '#0F4C5C', label: 'Deep Teal' },
  { value: '#1A7A6D', label: 'Teal' },
  { value: '#2D6A4F', label: 'Forest' },
  { value: '#582C4D', label: 'Plum' },
  { value: '#7C3238', label: 'Wine' },
  { value: '#8B5E3C', label: 'Saddle' },
  { value: '#4A5568', label: 'Slate' },
  { value: '#C1666B', label: 'Rose' },
  { value: '#D4956A', label: 'Copper' },
  { value: '#B8A88A', label: 'Sand' },
  { value: '#E8DCC8', label: 'Cream' },
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
