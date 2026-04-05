import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBook, faHeart, faStar, faBriefcase, faHome, faUtensils, faDumbbell,
  faBrain, faMusic, faCamera, faPlane, faCar, faGraduationCap, faCode,
  faGamepad, faPaintBrush, faLightbulb, faBolt, faLeaf, faSun, faMoon,
  faCloud, faFire, faWater, faMountain, faTree, faFlask, faPills,
  faAppleWhole, faMugSaucer, faWineGlass, faBed, faPersonRunning, faBicycle,
  faPersonSwimming, faPersonHiking, faHandsPraying, faHandHoldingHeart,
  faUsers, faUserGroup, faBaby, faDog, faCat, faMoneyBillWave,
  faCreditCard, faChartLine, faCalendarCheck, faClipboardList, faFlag,
  faTrophy, faMedal, faGem, faCrown, faCartShopping, faGift, faEnvelope,
  faPhone, faComments, faBookOpen, faPen, faFilm, faTv, faHeadphones,
  faGuitar, faBasketball, faFootball, faVolleyball, faBaseball, faGolfBallTee,
  faCheck, faCircleCheck, faMagnifyingGlass, faCalendar, faBullseye,
  faTriangleExclamation, faQuoteLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { IconOption } from '../../types/ui.js';
export type { IconOption } from '../../types/ui.js';

export const TOPIC_ICONS: IconOption[] = [
  // Tasks & Actions
  { name: 'check', icon: faCheck },
  { name: 'circle-check', icon: faCircleCheck },
  { name: 'clipboard-list', icon: faClipboardList },
  { name: 'calendar-check', icon: faCalendarCheck },
  { name: 'calendar', icon: faCalendar },
  { name: 'bullseye', icon: faBullseye },
  { name: 'flag', icon: faFlag },
  // General
  { name: 'book', icon: faBook },
  { name: 'book-open', icon: faBookOpen },
  { name: 'pen', icon: faPen },
  { name: 'magnifying-glass', icon: faMagnifyingGlass },
  { name: 'heart', icon: faHeart },
  { name: 'star', icon: faStar },
  { name: 'lightbulb', icon: faLightbulb },
  { name: 'bolt', icon: faBolt },
  { name: 'quote-left', icon: faQuoteLeft },
  // Work & Education
  { name: 'briefcase', icon: faBriefcase },
  { name: 'graduation-cap', icon: faGraduationCap },
  { name: 'code', icon: faCode },
  { name: 'chart-line', icon: faChartLine },
  // Health & Wellness
  { name: 'brain', icon: faBrain },
  { name: 'pills', icon: faPills },
  { name: 'flask', icon: faFlask },
  { name: 'triangle-exclamation', icon: faTriangleExclamation },
  { name: 'dumbbell', icon: faDumbbell },
  { name: 'person-running', icon: faPersonRunning },
  { name: 'bicycle', icon: faBicycle },
  { name: 'person-swimming', icon: faPersonSwimming },
  { name: 'person-hiking', icon: faPersonHiking },
  { name: 'bed', icon: faBed },
  { name: 'hands-praying', icon: faHandsPraying },
  // Food & Drink
  { name: 'utensils', icon: faUtensils },
  { name: 'apple-whole', icon: faAppleWhole },
  { name: 'mug-saucer', icon: faMugSaucer },
  { name: 'wine-glass', icon: faWineGlass },
  // Hobbies & Entertainment
  { name: 'music', icon: faMusic },
  { name: 'guitar', icon: faGuitar },
  { name: 'headphones', icon: faHeadphones },
  { name: 'camera', icon: faCamera },
  { name: 'paint-brush', icon: faPaintBrush },
  { name: 'gamepad', icon: faGamepad },
  { name: 'film', icon: faFilm },
  { name: 'tv', icon: faTv },
  // Sports
  { name: 'basketball', icon: faBasketball },
  { name: 'football', icon: faFootball },
  { name: 'volleyball', icon: faVolleyball },
  { name: 'baseball', icon: faBaseball },
  { name: 'golf-ball-tee', icon: faGolfBallTee },
  // Nature
  { name: 'leaf', icon: faLeaf },
  { name: 'tree', icon: faTree },
  { name: 'mountain', icon: faMountain },
  { name: 'sun', icon: faSun },
  { name: 'moon', icon: faMoon },
  { name: 'cloud', icon: faCloud },
  { name: 'fire', icon: faFire },
  { name: 'water', icon: faWater },
  // Travel
  { name: 'plane', icon: faPlane },
  { name: 'car', icon: faCar },
  { name: 'home', icon: faHome },
  // People & Relationships
  { name: 'users', icon: faUsers },
  { name: 'user-group', icon: faUserGroup },
  { name: 'baby', icon: faBaby },
  { name: 'hand-holding-heart', icon: faHandHoldingHeart },
  // Pets
  { name: 'dog', icon: faDog },
  { name: 'cat', icon: faCat },
  // Money & Shopping
  { name: 'money-bill-wave', icon: faMoneyBillWave },
  { name: 'credit-card', icon: faCreditCard },
  { name: 'cart-shopping', icon: faCartShopping },
  { name: 'gift', icon: faGift },
  // Achievements
  { name: 'trophy', icon: faTrophy },
  { name: 'medal', icon: faMedal },
  { name: 'gem', icon: faGem },
  { name: 'crown', icon: faCrown },
  // Communication
  { name: 'envelope', icon: faEnvelope },
  { name: 'phone', icon: faPhone },
  { name: 'comments', icon: faComments },
];

export const ICON_MAP: Record<string, IconDefinition> = Object.fromEntries(
  TOPIC_ICONS.map(({ name, icon }) => [name, icon])
);

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
  background: ${({ $selected }) => $selected ? 'rgba(255,255,255,0.4)' : 'transparent'};
  cursor: pointer;
  transition: background 0.1s;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const NoIconLabel = styled.span`
  font-size: 12px;
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
      {TOPIC_ICONS.map(({ name, icon }) => (
        <IconBtn key={name} $selected={selectedIcon === name} onClick={() => onSelectIcon(name)} title={name}>
          <FontAwesomeIcon
            icon={icon}
            style={{ fontSize: 14, color: selectedIcon === name ? '#1f2937' : '#4b5563' }}
          />
        </IconBtn>
      ))}
    </Grid>
  );
}
