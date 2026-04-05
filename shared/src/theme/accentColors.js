/**
 * Predefined color options for header and accent customization
 */
export const HEADER_COLORS = [
    // Darks & Neutrals
    { value: '#2D2C2A', label: 'Charcoal' },
    { value: '#1A1A2E', label: 'Midnight' },
    { value: '#3A3A3A', label: 'Graphite' },
    { value: '#4A5568', label: 'Slate' },
    { value: '#6B7B8D', label: 'Pewter' },
    // Blues
    { value: '#3D4B6B', label: 'Indigo' },
    { value: '#2E4057', label: 'Navy' },
    { value: '#5C6B8A', label: 'Storm' },
    { value: '#6B8BA4', label: 'Dusty Blue' },
    { value: '#4E6E7E', label: 'Steel' },
    { value: '#3B5E6E', label: 'Petrol' },
    { value: '#7B9EB2', label: 'Chambray' },
    // Teals & Cyans
    { value: '#5A8A7A', label: 'Muted Teal' },
    { value: '#3A6B6B', label: 'Deep Teal' },
    { value: '#6A9B9B', label: 'Patina' },
    { value: '#4A7C7C', label: 'Verdigris' },
    // Greens
    { value: '#8B9A6B', label: 'Sage' },
    { value: '#5B6B4A', label: 'Olive' },
    { value: '#4A6355', label: 'Moss' },
    { value: '#3D5A3D', label: 'Forest' },
    { value: '#6B8E6B', label: 'Fern' },
    { value: '#8A9E70', label: 'Lichen' },
    // Purples
    { value: '#5B4A6B', label: 'Plum' },
    { value: '#6E5A7E', label: 'Amethyst' },
    { value: '#7B6B8A', label: 'Lavender' },
    { value: '#4A3B5C', label: 'Eggplant' },
    { value: '#8B7A9E', label: 'Wisteria' },
    // Reds & Pinks
    { value: '#7A3B3F', label: 'Burgundy' },
    { value: '#5C2E2E', label: 'Claret' },
    { value: '#8C5A5A', label: 'Rosewood' },
    { value: '#9B7B8E', label: 'Mauve' },
    { value: '#A4747A', label: 'Dusty Rose' },
    { value: '#6B4A4A', label: 'Mahogany' },
    // Browns & Earths
    { value: '#6B5344', label: 'Umber' },
    { value: '#7A624B', label: 'Sepia' },
    { value: '#B5704F', label: 'Terracotta' },
    { value: '#A67C52', label: 'Sienna' },
    { value: '#8B6B4A', label: 'Chestnut' },
    { value: '#5C4A3A', label: 'Espresso' },
    { value: '#9B8B6B', label: 'Driftwood' },
    // Golds & Warm Lights
    { value: '#C9A84C', label: 'Ochre' },
    { value: '#C4A24E', label: 'Goldenrod' },
    { value: '#B8965A', label: 'Brass' },
    { value: '#C4A882', label: 'Camel' },
    { value: '#D4C4A0', label: 'Sand' },
    { value: '#E8DCC4', label: 'Parchment' },
];
/**
 * Derive a hover color (15% darker) from a hex color
 */
export function deriveHoverColor(hex) {
    if (hex === 'transparent')
        return '#2D2C2A';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const darken = (c) => Math.max(0, Math.round(c * 0.85));
    return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
}
/**
 * Derive a light background color (10% opacity) from a hex color
 */
export function deriveLightColor(hex) {
    if (hex === 'transparent')
        return 'rgba(107, 114, 128, 0.1)';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
}
