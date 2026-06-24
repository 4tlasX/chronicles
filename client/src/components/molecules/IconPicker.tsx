import styled from 'styled-components';
import { MaterialIcon } from '../atoms/MaterialIcon.js';

/* Topic icons — stored in the DB by `name` string, rendered as Google Material
   Symbols glyphs. `name` is the stable identifier (do not rename); `glyph` is
   the Material Symbols ligature. */
export interface IconOption {
  name: string;
  glyph: string;
}

export const TOPIC_ICONS: IconOption[] = [
  // Tasks & Actions
  { name: 'check', glyph: 'check' },
  { name: 'circle-check', glyph: 'check_circle' },
  { name: 'clipboard-list', glyph: 'assignment' },
  { name: 'calendar-check', glyph: 'event_available' },
  { name: 'calendar', glyph: 'calendar_month' },
  { name: 'bullseye', glyph: 'target' },
  { name: 'flag', glyph: 'flag' },
  // General
  { name: 'book', glyph: 'book_2' },
  { name: 'book-open', glyph: 'menu_book' },
  { name: 'pen', glyph: 'edit' },
  { name: 'magnifying-glass', glyph: 'search' },
  { name: 'heart', glyph: 'favorite' },
  { name: 'star', glyph: 'star' },
  { name: 'lightbulb', glyph: 'lightbulb' },
  { name: 'bolt', glyph: 'bolt' },
  { name: 'quote-left', glyph: 'format_quote' },
  // Work & Education
  { name: 'briefcase', glyph: 'work' },
  { name: 'graduation-cap', glyph: 'school' },
  { name: 'code', glyph: 'code' },
  { name: 'chart-line', glyph: 'monitoring' },
  // Health & Wellness
  { name: 'brain', glyph: 'psychology' },
  { name: 'pills', glyph: 'medication' },
  { name: 'flask', glyph: 'science' },
  { name: 'triangle-exclamation', glyph: 'warning' },
  { name: 'dumbbell', glyph: 'exercise' },
  { name: 'person-running', glyph: 'directions_run' },
  { name: 'bicycle', glyph: 'pedal_bike' },
  { name: 'person-swimming', glyph: 'pool' },
  { name: 'person-hiking', glyph: 'hiking' },
  { name: 'bed', glyph: 'bed' },
  { name: 'hands-praying', glyph: 'volunteer_activism' },
  // Food & Drink
  { name: 'utensils', glyph: 'restaurant' },
  { name: 'apple-whole', glyph: 'nutrition' },
  { name: 'mug-saucer', glyph: 'local_cafe' },
  { name: 'wine-glass', glyph: 'wine_bar' },
  // Hobbies & Entertainment
  { name: 'music', glyph: 'music_note' },
  { name: 'guitar', glyph: 'piano' },
  { name: 'headphones', glyph: 'headphones' },
  { name: 'camera', glyph: 'photo_camera' },
  { name: 'paint-brush', glyph: 'brush' },
  { name: 'gamepad', glyph: 'sports_esports' },
  { name: 'film', glyph: 'movie' },
  { name: 'tv', glyph: 'tv' },
  // Sports
  { name: 'basketball', glyph: 'sports_basketball' },
  { name: 'football', glyph: 'sports_football' },
  { name: 'volleyball', glyph: 'sports_volleyball' },
  { name: 'baseball', glyph: 'sports_baseball' },
  { name: 'golf-ball-tee', glyph: 'sports_golf' },
  // Nature
  { name: 'leaf', glyph: 'eco' },
  { name: 'tree', glyph: 'park' },
  { name: 'mountain', glyph: 'landscape' },
  { name: 'sun', glyph: 'light_mode' },
  { name: 'moon', glyph: 'dark_mode' },
  { name: 'cloud', glyph: 'cloud' },
  { name: 'fire', glyph: 'local_fire_department' },
  { name: 'water', glyph: 'water_drop' },
  // Travel
  { name: 'plane', glyph: 'flight' },
  { name: 'car', glyph: 'directions_car' },
  { name: 'home', glyph: 'home' },
  // People & Relationships
  { name: 'users', glyph: 'groups' },
  { name: 'user-group', glyph: 'group' },
  { name: 'baby', glyph: 'child_care' },
  { name: 'hand-holding-heart', glyph: 'favorite' },
  // Pets
  { name: 'dog', glyph: 'pets' },
  { name: 'cat', glyph: 'pets' },
  // Money & Shopping
  { name: 'money-bill-wave', glyph: 'payments' },
  { name: 'credit-card', glyph: 'credit_card' },
  { name: 'cart-shopping', glyph: 'shopping_cart' },
  { name: 'gift', glyph: 'card_giftcard' },
  // Achievements
  { name: 'trophy', glyph: 'trophy' },
  { name: 'medal', glyph: 'military_tech' },
  { name: 'gem', glyph: 'diamond' },
  { name: 'crown', glyph: 'crown' },
  // Communication
  { name: 'envelope', glyph: 'mail' },
  { name: 'phone', glyph: 'call' },
  { name: 'comments', glyph: 'forum' },
];

/** name → Material Symbols glyph. */
export const ICON_MAP: Record<string, string> = Object.fromEntries(
  TOPIC_ICONS.map(({ name, glyph }) => [name, glyph])
);

/** Render a topic icon by its stored name (falls back to a book glyph). */
export function TopicIcon({ name, size = 16 }: { name: string | null | undefined; size?: number }) {
  const glyph = (name && ICON_MAP[name]) || 'book_2';
  return <MaterialIcon $size={size} aria-hidden="true">{glyph}</MaterialIcon>;
}

/* ── Styled ── */

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  max-height: 128px;
  overflow-y: auto;
  padding: 4px;
`;

const IconBtn = styled.button<{ $selected?: boolean }>`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border: 1px solid ${({ $selected, theme }) => $selected ? theme.colors.border : 'transparent'};
  background: ${({ $selected, theme }) => $selected ? theme.colors.surfaceHover : 'transparent'};
  cursor: pointer;
  transition: background 0.1s;
  padding: 0;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const NoIconLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

/* ── Component ── */

interface IconPickerProps {
  selectedIcon: string | null;
  onSelectIcon: (iconName: string | null) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  return (
    <Grid>
      <IconBtn $selected={selectedIcon === null} onClick={() => onSelectIcon(null)} title="No icon">
        <NoIconLabel>×</NoIconLabel>
      </IconBtn>
      {TOPIC_ICONS.map(({ name, glyph }) => (
        <IconBtn key={name} $selected={selectedIcon === name} onClick={() => onSelectIcon(name)} title={name}>
          <MaterialIcon $size={16} aria-hidden="true">{glyph}</MaterialIcon>
        </IconBtn>
      ))}
    </Grid>
  );
}
