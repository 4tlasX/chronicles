import { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faTrash, faCalendarDay, faCalendarDays, faListCheck,
  faBolt, faCartShopping, faCheck, faPencil, faGripVertical, faPills,
  faSun, faCloud, faCloudRain, faSnowflake, faWind, faXmark, faSlidersH, faChevronDown, faUtensils, faDroplet,
  faHeart, faChevronLeft, faChevronRight,
  faGlassWater, faFaceSadCry, faFaceFrown, faFaceMeh, faFaceSmile, faFaceGrinBeam, faCloudMoon,
} from '@fortawesome/free-solid-svg-icons';
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor,
  useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { entries as entriesApi, doses as dosesApi, topics as topicsApi, settings as settingsApi } from '../services/api.js';
import { getOrCreateJournalTopic } from '../utils/getOrCreateJournalTopic.js';
import type { DoseLogRecord } from '../services/api.js';
import type { ScheduledDose } from '../types/health.js';
import { toDateStr, formatTime12h } from '../utils/dateUtils.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { stripHtml, summarizeUserFields } from '../utils/stripHtml.js';
import { TopicSelector } from '../components/organisms/TopicSelector.js';
import { Editor } from '../components/organisms/Editor.js';
import type { Topic } from '../types/topics.js';
import { getTopicIcon } from '../utils/topicIcons.js';
import { MiniCalendar } from '../components/organisms/MiniCalendar.js';
import { UserFieldsForm } from '../components/molecules/fields/UserFieldsForm.js';

/* ── Constants ── */

const REFLECTION_PROMPTS = [
  'What does success look like for you today?',
  'What\'s one thing you\'re grateful for right now?',
  'What challenge are you working through, and how might you approach it differently?',
  'What would make today a great day?',
  'What\'s something you\'ve been putting off that you should address?',
  'Who has positively influenced your week and why?',
  'What\'s one small step you can take today toward a bigger goal?',
  'How are you feeling right now, and what\'s behind that feeling?',
  'What\'s one thing you could let go of today?',
  'What have you accomplished recently that you\'re proud of?',
  'What do you need more of in your life right now?',
  'What would your ideal version of today look like?',
  'What\'s one habit you\'d like to start, stop, or change?',
  'What did you learn this week that surprised you?',
  'What\'s on your mind that you haven\'t said out loud yet?',
  'Where is your energy best spent today?',
  'What boundaries do you need to set or maintain today?',
  'What are you looking forward to this week?',
  'What conversation have you been avoiding?',
  'What does rest mean to you right now?',
];

const DAILY_QUOTES: { text: string; author: string }[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela' },
  { text: 'Don\'t watch the clock; do what it does. Keep going.', author: 'Sam Levenson' },
  { text: 'Keep your face always toward the sunshine, and shadows will fall behind you.', author: 'Walt Whitman' },
  { text: 'You miss 100% of the shots you don\'t take.', author: 'Wayne Gretzky' },
  { text: 'Whether you think you can or you think you can\'t, you\'re right.', author: 'Henry Ford' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'An unexamined life is not worth living.', author: 'Socrates' },
  { text: 'Spread love everywhere you go. Let no one ever come to you without leaving happier.', author: 'Mother Teresa' },
  { text: 'When you reach the end of your rope, tie a knot in it and hang on.', author: 'Franklin D. Roosevelt' },
  { text: 'Always remember that you are absolutely unique. Just like everyone else.', author: 'Margaret Mead' },
  { text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' },
  { text: 'You will face many defeats in life, but never let yourself be defeated.', author: 'Maya Angelou' },
  { text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', author: 'Nelson Mandela' },
  { text: 'In the end, it\'s not the years in your life that count. It\'s the life in your years.', author: 'Abraham Lincoln' },
  { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { text: 'Spread your wings and let the fairy in you fly.', author: 'Unknown' },
  { text: 'You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.', author: 'Dr. Seuss' },
  { text: 'If life were predictable it would cease to be life, and be without flavor.', author: 'Eleanor Roosevelt' },
  { text: 'If you look at what you have in life, you\'ll always have more.', author: 'Oprah Winfrey' },
  { text: 'If you want to live a happy life, tie it to a goal, not to people or things.', author: 'Albert Einstein' },
  { text: 'Never let the fear of striking out keep you from playing the game.', author: 'Babe Ruth' },
  { text: 'Money and success don\'t change people; they merely amplify what is already there.', author: 'Will Smith' },
  { text: 'Your time is limited, so don\'t waste it living someone else\'s life.', author: 'Steve Jobs' },
  { text: 'Not how long, but how well you have lived is the main thing.', author: 'Seneca' },
  { text: 'If life is not a great adventure, it is nothing.', author: 'Helen Keller' },
  { text: 'Many of life\'s failures are people who did not realize how close they were to success when they gave up.', author: 'Thomas A. Edison' },
  { text: 'You only live once, but if you do it right, once is enough.', author: 'Mae West' },
];

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayKey() {
  const now = new Date();
  // Grace period: before 12:01 AM local time, treat it as still the previous day
  // so the day's priorities don't vanish at midnight
  if (now.getHours() === 0 && now.getMinutes() < 1) {
    now.setDate(now.getDate() - 1);
  }
  return toDateStr(now);
}

/* ── Layout Styled Components ── */

const Page = styled.div`
  padding: 28px 24px 40px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
  @media (max-width: 640px) { padding: 32px 12px 32px; }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 36px;
  @media (max-width: 640px) { flex-direction: column; align-items: flex-start; gap: 4px; padding-left: 10px; margin-bottom: 28px; }
`;

const GreetingBlock = styled.div`
  display: flex;
  flex-direction: column;
  flex: 2;
  padding-right: 20px;
`;

const Greeting = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 32px;
  font-weight: 400;
  font-style: italic;
  line-height: 1.48em;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  @media (max-width: 640px) { font-size: 28px; }
`;

const DateLine = styled.p`
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  padding-left: 0.35rem;
`;

const DateLineRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InlineWeatherWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.colors.textMuted};
  &::before { content: '·'; margin-right: 2px; opacity: 0.5; }
`;

const InlineTemp = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
  font-style: normal;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  &:hover { opacity: 0.7; }
`;

const InlineHiLo = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-style: normal;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const QuoteBlock = styled.div`
  flex: 1;
  padding-left: 20px;
  text-align: right;
  @media (max-width: 640px) { display: none; }
`;

const QuoteText = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 19px;
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px;
  line-height: 1.5;
  @media (max-width: 640px) {
    margin: 0 0 10px;
  }
`;

const QuoteAuthor = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const Grid = styled.div`
  display: flex;
  gap: 0;
  align-items: flex-start;
  @media (max-width: 1024px) { flex-direction: column; }
`;

const LeftColumn = styled.div`
  flex: 0 0 66.666%;
  width: 66.666%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-right: 20px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 1024px) { flex: none; width: 100%; border-right: none; padding-right: 0; }
`;

const RightColumn = styled.div`
  flex: 0 0 33.333%;
  width: 33.333%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-left: 20px;
  @media (max-width: 1024px) { flex: none; width: 100%; padding-left: 0; }
`;

const DashCard = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardIconWrap = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  flex-shrink: 0;
`;

const CardTitle = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`;

const CardViewLink = styled(Link)`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 15px;
  font-weight: 500;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  white-space: nowrap;
  opacity: 0.55;
  &:hover { opacity: 1; text-decoration: underline; }
`;

const CardBody = styled.div`
  padding: 12px 14px;
  margin-top: 10px;
  flex: 1;
`;

const QuickEntryDashCard = styled(DashCard)`
  background: transparent;
  border-radius: 10px;
  & ${CardHeader} { border-top: 1px solid ${({ theme }) => theme.colors.border}; }
  & ${CardBody} { padding: 12px 0; }
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 15px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  transition: color 0.15s, background 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.text}; background: rgba(0,0,0,0.04); }
`;

const ItemRow = styled.div<{ $done?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  opacity: ${({ $done }) => $done ? 0.45 : 1};
`;

const CheckBtn = styled.button<{ $done?: boolean; $color: string }>`
  width: 20px;
  height: 20px;
  border: 1.5px solid ${({ $done, $color, theme }) => $done ? $color : theme.colors.border};
  border-radius: 4px;
  background: ${({ $done, $color }) => $done ? $color : 'transparent'};
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  transition: background 0.15s, border-color 0.15s;
  padding: 0;
`;

const ItemText = styled.span<{ $done?: boolean }>`
  font-size: 16px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  flex: 1;
  line-height: 1.4;
`;

const InlineInput = styled.input`
  flex: 1;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  font-size: 16px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 10px;
  outline: none;
  font-family: ${({ theme }) => theme.fontFamily.sans};
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:focus { border-color: var(--focus-color); }
`;

const QuickEditorWrap = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  margin-bottom: 0;

  /* Taller initial height, expands with content */
  > div { min-height: 120px; height: auto; }

  /* Compact content padding and size for dashboard context */
  .tiptap {
    padding: 8px 12px;
    font-size: 16px;
    line-height: 1.6;
    font-weight: 300;
    min-height: 120px;
    height: auto;
  }

  /* Toolbar row sits flush at the top */
  &:focus-within { border-color: var(--focus-color); }
`;

const SaveRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 8px;
`;

const SaveBtn = styled.button<{ $accent: string; $active?: boolean }>`
  padding: 7px 16px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: ${({ $active, $accent, theme }) => $active ? $accent : theme.colors.surface};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.textMuted};
  border: 1px solid ${({ $active, $accent, theme }) => $active ? $accent : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: ${({ $active }) => $active ? 'pointer' : 'default'};
  transition: background 0.15s, color 0.15s;
`;

const StatusText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.success};
`;

const EmptyNote = styled.p`
  font-size: 15px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 4px 0;
`;


const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 12px;
  margin-bottom: 14px;
`;

const FieldCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FieldInput = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  font-size: 15px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 8px;
  outline: none;
  font-family: ${({ theme }) => theme.fontFamily.sans};
  width: 100%;
  box-sizing: border-box;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &[type="date"], &[type="time"] { color-scheme: light dark; }
  &:focus { border-color: var(--focus-color); }
`;

const FieldSelect = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  font-size: 15px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 8px;
  outline: none;
  font-family: ${({ theme }) => theme.fontFamily.sans};
  width: 100%;
  box-sizing: border-box;
  appearance: none;
  cursor: pointer;
  &:focus { border-color: var(--focus-color); }
`;

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 6px;
`;


const EventMeta = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 300;
`;

const PriorityNumber = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  width: 14px;
  flex-shrink: 0;
`;

/* ── Drag & Drop ── */

type StaticCardId = 'priorities' | 'quick-entry' | 'tasks' | 'events' | 'shopping' | 'meds' | 'weather' | 'menu-plan' | 'affirmations' | 'wellness' | 'mini-calendar';
type CardId = StaticCardId | `topic-${number}`;

function isValidCardId(id: string): id is CardId {
  const STATIC: string[] = ['quick-entry', 'priorities', 'events', 'meds', 'tasks', 'shopping', 'weather', 'menu-plan', 'affirmations', 'wellness', 'mini-calendar'];
  return STATIC.includes(id) || /^topic-\d+$/.test(id);
}

const DEFAULT_LEFT: CardId[]  = ['quick-entry', 'priorities', 'events', 'menu-plan'];
const DEFAULT_RIGHT: CardId[] = ['mini-calendar', 'affirmations', 'wellness', 'meds'];
const LS_KEY = 'dashboard-layout-v2';

const STATIC_LABELS: Record<StaticCardId, string> = {
  'quick-entry': 'Quick Entry',
  'priorities': 'Priorities',
  'mini-calendar': 'Mini Calendar',
  'events': 'Events & Meetings',
  'tasks': 'Tasks',
  'shopping': 'Shopping',
  'meds': 'Medications',
  'weather': 'Weather',
  'menu-plan': 'Menu Plan',
  'affirmations': 'Affirmations',
  'wellness': 'Daily Check-in',
};

function cardLabel(id: CardId, allTopics: Topic[]): string {
  if (id.startsWith('topic-')) {
    const tid = parseInt(id.slice(6));
    return allTopics.find(t => t.id === tid)?.name ?? 'Topic';
  }
  return STATIC_LABELS[id as StaticCardId] ?? id;
}

interface DashLayout { left: CardId[]; right: CardId[]; hidden: CardId[]; }

function loadLayout(): DashLayout {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      let left: CardId[], right: CardId[], hidden: CardId[];
      if (Array.isArray(parsed.left)) {
        // New format
        left   = (parsed.left   as string[]).filter(isValidCardId);
        right  = (parsed.right  as string[] ?? []).filter(isValidCardId);
        hidden = (parsed.hidden as string[] ?? []).filter(isValidCardId);
      } else if (Array.isArray(parsed.order)) {
        // Migrate from old flat format — split alternately
        const order = (parsed.order as string[]).filter(isValidCardId);
        hidden = (parsed.hidden as string[] ?? []).filter(isValidCardId);
        left = []; right = [];
        order.forEach((id, i) => (i % 2 === 0 ? left : right).push(id));
      } else {
        return { left: [...DEFAULT_LEFT], right: [...DEFAULT_RIGHT], hidden: [] };
      }
      // Append brand-new defaults not yet in any list
      for (const id of DEFAULT_LEFT)  { if (!left.includes(id) && !right.includes(id) && !hidden.includes(id)) left.push(id); }
      for (const id of DEFAULT_RIGHT) { if (!left.includes(id) && !right.includes(id) && !hidden.includes(id)) right.push(id); }
      return { left, right, hidden };
    }
  } catch { /* ignore */ }
  return { left: [...DEFAULT_LEFT], right: [...DEFAULT_RIGHT], hidden: [] };
}

function saveLayout(layout: DashLayout) {
  localStorage.setItem(LS_KEY, JSON.stringify(layout));
}

const DragGrip = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  padding: 0;
  cursor: grab;
  color: ${({ theme }) => theme.colors.border};
  font-size: 15px;
  flex-shrink: 0;
  touch-action: none;
  &:hover { color: ${({ theme }) => theme.colors.textMuted}; }
  &:active { cursor: grabbing; }
`;

interface DragProps {
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
}

function SortableDashCard({ id, children }: { id: CardId; children: (drag: DragProps) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex',
    flexDirection: 'column',
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragAttributes: attributes as unknown as Record<string, unknown>, dragListeners: listeners as Record<string, unknown> })}
    </div>
  );
}

/* ── Edit-mode UI ── */

const CardWrapper = styled.div`
  position: relative;
`;

const RemoveBtn = styled.button`
  position: absolute;
  top: -9px;
  right: -9px;
  z-index: 10;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: #9B4444;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  &:hover { background: #7a3030; }
`;


const EditWidgetsBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text}; border-color: ${({ theme }) => theme.colors.textMuted}; }
`;

const EditWidgetsCard = styled.div`
  display: flex;
  flex-direction: column;
`;

const WidgetMenu = styled.div`
  margin-top: 10px;
  margin-bottom: 32px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
`;

const WidgetMenuHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const WidgetMenuChevron = styled.span<{ $open: boolean }>`
  display: inline-flex;
  font-size: 13px;
  transition: transform 0.2s ease;
  transform: ${({ $open }) => $open ? 'rotate(0deg)' : 'rotate(-90deg)'};
`;

const WidgetMenuBody = styled.div`
  padding: 4px 16px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const WidgetMenuSection = styled.div`
  & + & {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const WidgetSectionLabel = styled.p`
  font-size: 13px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 10px 0 8px;
`;

const WidgetChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const WidgetChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 15px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  &:hover { border-color: ${({ theme }) => theme.colors.textMuted}; }
`;

/* ── Widget: Daily Priorities ── */

interface Priority { id: string; text: string; done: boolean; }

function findTodayPrioritiesEntry() {
  const today = todayKey();
  const { decryptedEntries, allTopics } = useEntriesStore.getState();
  const topicId = allTopics.find(t => t.name.toLowerCase() === 'priorities')?.id;
  if (!topicId) return undefined;
  return decryptedEntries.find(e => {
    const meta = e.metadata as Record<string, unknown>;
    if (meta._taxonomyId !== topicId) return false;
    const d = e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt as string);
    return toDateStr(d) === today;
  });
}

function PrioritiesCard({ accentColor, dragAttributes, dragListeners }: { accentColor: string } & DragProps) {
  const { encryptPost } = useEncryption();
  const allTopics = useEntriesStore(s => s.allTopics);
  const setTopics = useEntriesStore(s => s.setTopics);
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);

  const prioritiesTopicId = useMemo(
    () => allTopics.find(t => t.name.toLowerCase() === 'priorities')?.id ?? null,
    [allTopics]
  );

  const [priorities, setPriorities] = useState<Priority[]>(() => {
    const entry = findTodayPrioritiesEntry();
    if (entry) {
      const cf = (entry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown>;
      const stored = cf?.priorities as Priority[] | undefined;
      if (stored?.length) return stored;
    }
    return [
      { id: '1', text: '', done: false },
      { id: '2', text: '', done: false },
      { id: '3', text: '', done: false },
    ];
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [entryId, setEntryId] = useState<number | null>(() => findTodayPrioritiesEntry()?.id ?? null);

  const handleChange = (id: string, text: string) => {
    setPriorities(p => p.map(x => x.id === id ? { ...x, text } : x));
    setDirty(true);
  };

  const handleToggle = (id: string) => {
    setPriorities(p => p.map(x => x.id === id ? { ...x, done: !x.done } : x));
    setDirty(true);
  };

  const handleAdd = () => {
    if (priorities.length >= 5) return;
    setPriorities(p => [...p, { id: Date.now().toString(), text: '', done: false }]);
    setDirty(true);
  };

  const handleRemove = (id: string) => {
    setPriorities(p => p.filter(x => x.id !== id));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      // Auto-create the Priorities topic if it doesn't exist yet
      let topicId = prioritiesTopicId;
      if (!topicId) {
        const created = await topicsApi.create({ name: 'Priorities', icon: 'bolt' });
        setTopics([...allTopics, created]);
        topicId = created.id;
      }

      const contentLines = priorities
        .filter(p => p.text.trim())
        .map((p, i) => `${i + 1}. ${p.text}${p.done ? ' ✓' : ''}`)
        .join('\n');
      const content = contentLines || 'Daily priorities';

      const metadata: Record<string, unknown> = {
        _taxonomyId: topicId,
        _customFields: { priorities },
      };
      const encrypted = await encryptPost(content, metadata);
      const payload = {
        contentEncrypted: encrypted.contentEncrypted,
        contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted,
        metadataIv: encrypted.metadataIv,
        isEncrypted: true,
        taxonomyIds: [topicId],
      };
      if (entryId) {
        await entriesApi.update(entryId, payload);
        updateDecryptedEntry(entryId, { content, metadata });
      } else {
        const result = await entriesApi.create(payload);
        const id = result.id as number;
        setEntryId(id);
        addDecryptedEntry({ id, content, metadata, isEncrypted: true, createdAt: new Date(result.createdAt as string), updatedAt: new Date(result.createdAt as string) });
      }
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faBolt} /></CardIconWrap>
        <CardTitle>Daily Priorities</CardTitle>
        {priorities.length < 5 && <AddBtn onClick={handleAdd}><FontAwesomeIcon icon={faPlus} /></AddBtn>}
        {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
      </CardHeader>
      <CardBody>
        {priorities.map((p, i) => (
          <ItemRow key={p.id} $done={p.done}>
            <CheckBtn $done={p.done} $color={accentColor} onClick={() => handleToggle(p.id)}>
              {p.done && <FontAwesomeIcon icon={faCheck} />}
            </CheckBtn>
            <PriorityNumber>{i + 1}</PriorityNumber>
            <InlineInput
              value={p.text}
              placeholder={`Priority ${i + 1}`}
              onChange={e => handleChange(p.id, e.target.value)}
            />
            <AddBtn onClick={() => handleRemove(p.id)} style={{ fontSize: 10 }}>
              <FontAwesomeIcon icon={faTrash} />
            </AddBtn>
          </ItemRow>
        ))}
        <SaveRow>
          {status && status !== 'Saved' && <StatusText>{status}</StatusText>}
          <SaveBtn $accent={accentColor} $active={dirty} onClick={handleSave} disabled={saving || !dirty}>
            {saving ? <Spinner size={10} /> : 'Save'}
          </SaveBtn>
        </SaveRow>
      </CardBody>
    </DashCard>
  );
}

/* ── Topic field definitions ── */

type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'time' | 'select';
interface FieldDef { key: string; label: string; type: FieldType; options?: string[]; }

const TOPIC_FIELDS: Record<string, FieldDef[]> = {
  'medication':  [],
  'symptom':     [{ key: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'] }, { key: 'duration', label: 'Duration', type: 'text' }],
  'food':        [{ key: 'mealType', label: 'Meal', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] }, { key: 'calories', label: 'Calories', type: 'number' }, { key: 'ingredients', label: 'Ingredients', type: 'text' }],
  'exercise':    [{ key: 'exerciseType', label: 'Type', type: 'text' }, { key: 'duration', label: 'Duration (min)', type: 'number' }, { key: 'intensity', label: 'Intensity', type: 'select', options: ['Low', 'Medium', 'High'] }],
  'allergy':     [{ key: 'allergen', label: 'Allergen', type: 'text' }, { key: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'] }, { key: 'reaction', label: 'Reaction', type: 'text' }],
  'task':        [{ key: 'priority', label: 'Priority', type: 'select', options: ['urgent', 'high', 'medium', 'low', 'none'] }],
  'event':       [{ key: 'startDate', label: 'Date', type: 'date' }, { key: 'startTime', label: 'Time', type: 'time' }],
  'meeting':     [{ key: 'startDate', label: 'Date', type: 'date' }, { key: 'startTime', label: 'Time', type: 'time' }],
};

/* ── Widget: Quick Entry ── */

function QuickEntryCard({ accentColor, topics, dragAttributes, dragListeners }: { accentColor: string; topics: Topic[] } & DragProps) {
  const { encryptPost } = useEncryption();
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const [content, setContent] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const reflectionPrompt = useMemo(() => {
    const d = new Date();
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length];
  }, []);

  const topicCustomFields = useUIStore(s => s.topicCustomFields);
  const allEntries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const selectedTopic = topics.find(t => t.id === selectedTopicId) ?? null;
  const fieldDefs = selectedTopic ? (TOPIC_FIELDS[selectedTopic.name.toLowerCase()] ?? []) : [];
  const userFieldDefs = selectedTopicId != null ? (topicCustomFields[selectedTopicId] ?? []) : [];

  const isTaskTopic = selectedTopic?.name.toLowerCase() === 'task';
  const isMedicationTopic = selectedTopic?.name.toLowerCase() === 'medication';
  const goalTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'goal')?.id, [allTopics]);
  const milestoneTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'milestone')?.id, [allTopics]);
  const goalOptions = useMemo(() => {
    if (!goalTopicId) return [];
    return allEntries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === goalTopicId)
      .map(e => ({ id: e.id, title: stripHtml(e.content).slice(0, 60) || 'Untitled' }));
  }, [allEntries, goalTopicId]);
  const milestoneOptions = useMemo(() => {
    if (!milestoneTopicId) return [];
    return allEntries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === milestoneTopicId)
      .map(e => {
        const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
        return { id: e.id, title: stripHtml(e.content).slice(0, 60) || 'Untitled', parentGoalId: (cf.parentGoalId as number) || null };
      });
  }, [allEntries, milestoneTopicId]);
  const visibleMilestones = useMemo(() => {
    const selectedGoalId = customFields.parentGoalId as number | undefined;
    if (!selectedGoalId) return milestoneOptions;
    return milestoneOptions.filter(m => m.parentGoalId === selectedGoalId);
  }, [milestoneOptions, customFields.parentGoalId]);

  const hasContent = !!stripHtml(content).trim();
  const userFields = (customFields._userFields as Record<string, unknown>) ?? {};
  const hasUserFieldValues = userFieldDefs.length > 0 && summarizeUserFields(userFieldDefs, userFields) !== '';
  const hasBuiltInFieldValues = fieldDefs.length > 0 || isMedicationTopic || isTaskTopic;
  const canSave = hasContent || hasUserFieldValues || (hasBuiltInFieldValues && selectedTopic !== null);

  const setField = (key: string, value: unknown) => setCustomFields(prev => ({ ...prev, [key]: value }));

  const handleTopicChange = (id: number | null) => {
    setSelectedTopicId(id);
    setCustomFields({});
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const finalContent = hasContent ? content : `<p>${summarizeUserFields(userFieldDefs, userFields)}</p>`;
      const effectiveTopicId = selectedTopic ? selectedTopic.id : await getOrCreateJournalTopic();
      const metadata: Record<string, unknown> = { _taxonomyId: effectiveTopicId };
      if ((fieldDefs.length > 0 || userFieldDefs.length > 0 || isMedicationTopic || isTaskTopic) && selectedTopic) metadata._customFields = customFields;
      const encrypted = await encryptPost(finalContent, metadata);
      const result = await entriesApi.create({
        contentEncrypted: encrypted.contentEncrypted,
        contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted,
        metadataIv: encrypted.metadataIv,
        isEncrypted: true,
        taxonomyIds: [effectiveTopicId],
      });
      addDecryptedEntry({ id: result.id as number, content: finalContent, metadata, isEncrypted: true, createdAt: new Date(result.createdAt as string), updatedAt: new Date(result.createdAt as string) });
      setContent('');
      setSelectedTopicId(null);
      setCustomFields({});
    } finally {
      setSaving(false);
    }
  };

  return (
    <QuickEntryDashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faPencil} /></CardIconWrap>
        <CardTitle>Quick Entry</CardTitle>
        <CardViewLink to="/journal">View all</CardViewLink>
        {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
      </CardHeader>
      <CardBody>
        <div style={{ marginBottom: 10 }}>
          <TopicSelector selectedId={selectedTopicId} onSelect={handleTopicChange} topics={topics} />
        </div>
        {fieldDefs.length > 0 && (
          <FieldGrid>
            {fieldDefs.map(f => (
              <FieldCol key={f.key} style={f.type === 'boolean' ? { gridColumn: 'span 2' } : undefined}>
                {f.type === 'boolean' ? (
                  <CheckRow>
                    <input
                      type="checkbox"
                      id={`qe-${f.key}`}
                      checked={!!customFields[f.key]}
                      onChange={e => setField(f.key, e.target.checked)}
                    />
                    <FieldLabel htmlFor={`qe-${f.key}`} style={{ textTransform: 'none', fontSize: 12, fontWeight: 300 }}>{f.label}</FieldLabel>
                  </CheckRow>
                ) : (
                  <>
                    <FieldLabel>{f.label}</FieldLabel>
                    {f.type === 'select' ? (
                      <FieldSelect value={(customFields[f.key] as string) || ''} onChange={e => setField(f.key, e.target.value)}>
                        <option value=""></option>
                        {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
                      </FieldSelect>
                    ) : (
                      <FieldInput
                        type={f.type}
                        value={(customFields[f.key] as string) ?? ''}
                        onChange={e => setField(f.key, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                      />
                    )}
                  </>
                )}
              </FieldCol>
            ))}
          </FieldGrid>
        )}
        {isTaskTopic && (
          <FieldGrid>
            <FieldCol style={{ gridColumn: 'span 2' }}>
              <FieldLabel>Goal</FieldLabel>
              <FieldSelect
                value={(customFields.parentGoalId as number | undefined) ?? ''}
                onChange={e => setCustomFields(prev => ({ ...prev, parentGoalId: e.target.value ? Number(e.target.value) : undefined, parentMilestoneId: undefined }))}
              >
                <option value="">No goal</option>
                {goalOptions.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </FieldSelect>
            </FieldCol>
            <FieldCol style={{ gridColumn: 'span 2' }}>
              <FieldLabel>Milestone</FieldLabel>
              <FieldSelect
                value={(customFields.parentMilestoneId as number | undefined) ?? ''}
                onChange={e => setField('parentMilestoneId', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">No milestone</option>
                {visibleMilestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </FieldSelect>
            </FieldCol>
          </FieldGrid>
        )}
        {isMedicationTopic && (
          <FieldGrid>
            <FieldCol>
              <FieldLabel>Dosage</FieldLabel>
              <FieldInput
                type="text"
                placeholder="e.g. 500mg"
                value={(customFields.dosage as string) ?? ''}
                onChange={e => setField('dosage', e.target.value)}
              />
            </FieldCol>
            <FieldCol>
              <FieldLabel>Frequency</FieldLabel>
              <FieldSelect value={(customFields.frequency as string) || 'once_daily'} onChange={e => setField('frequency', e.target.value)}>
                <option value="once_daily">Once daily</option>
                <option value="twice_daily">Twice daily</option>
                <option value="three_times_daily">Three times daily</option>
                <option value="as_needed">As needed</option>
                <option value="custom">Custom</option>
              </FieldSelect>
            </FieldCol>
            <FieldCol style={{ gridColumn: 'span 2' }}>
              <FieldLabel>Schedule Times</FieldLabel>
              {((customFields.scheduleTimes as string[]) ?? []).map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <FieldInput
                    type="time"
                    value={t}
                    onChange={e => {
                      const times = [...((customFields.scheduleTimes as string[]) ?? [])];
                      times[i] = e.target.value;
                      setField('scheduleTimes', times);
                    }}
                  />
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, fontSize: 12 }}
                    onClick={() => setField('scheduleTimes', ((customFields.scheduleTimes as string[]) ?? []).filter((_, j) => j !== i))}
                  >✕</button>
                </div>
              ))}
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'inherit', opacity: 0.6, padding: '2px 0' }}
                onClick={() => setField('scheduleTimes', [...((customFields.scheduleTimes as string[]) ?? []), '08:00'])}
              >+ Add time</button>
            </FieldCol>
            <FieldCol style={{ gridColumn: 'span 2' }}>
              <CheckRow>
                <input type="checkbox" id="qe-isActive" checked={!!(customFields.isActive ?? true)} onChange={e => setField('isActive', e.target.checked)} />
                <FieldLabel htmlFor="qe-isActive" style={{ textTransform: 'none', fontSize: 12, fontWeight: 300 }}>Currently active</FieldLabel>
              </CheckRow>
            </FieldCol>
          </FieldGrid>
        )}
        {userFieldDefs.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <UserFieldsForm
              fieldDefs={userFieldDefs}
              values={(customFields._userFields as Record<string, unknown>) ?? {}}
              onChange={vals => setCustomFields(prev => ({ ...prev, _userFields: vals }))}
            />
          </div>
        )}
        <QuickEditorWrap>
          <Editor
            content={content}
            onChange={setContent}
            placeholder={selectedTopicId === null ? reflectionPrompt : 'Add a note...'}
            onEnterSave={handleSave}
          />
        </QuickEditorWrap>
        <SaveRow>
          {status && status !== 'Saved' && <StatusText>{status}</StatusText>}
          <SaveBtn $accent={accentColor} $active={canSave} onClick={handleSave} disabled={saving || !canSave}>
            {saving ? <Spinner size={10} /> : 'Save'}
          </SaveBtn>
        </SaveRow>
      </CardBody>
    </QuickEntryDashCard>
  );
}

/* ── Widget: Tasks ── */

interface TaskEntry { id: number; content: string; metadata: Record<string, unknown>; isCompleted: boolean; }

function TasksCard({ accentColor, tasks, taskTopicId, dragAttributes, dragListeners }: { accentColor: string; tasks: TaskEntry[]; taskTopicId: number | null } & DragProps) {
  const { encryptPost } = useEncryption();
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleToggle = useCallback(async (task: TaskEntry) => {
    const entry = decryptedEntries.find(e => e.id === task.id);
    if (!entry) return;
    const cf = { ...((entry.metadata._customFields as Record<string, unknown>) || {}), isCompleted: !task.isCompleted };
    const newMeta = { ...entry.metadata, _customFields: cf };
    updateDecryptedEntry(task.id, { metadata: newMeta }); // optimistic
    try {
      const encrypted = await encryptPost(entry.content, newMeta);
      await entriesApi.update(task.id, {
        contentEncrypted: encrypted.contentEncrypted,
        contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted,
        metadataIv: encrypted.metadataIv,
        taxonomyIds: taskTopicId ? [taskTopicId] : [],
      });
    } catch { updateDecryptedEntry(task.id, { metadata: entry.metadata }); } // revert on error
  }, [decryptedEntries, encryptPost, updateDecryptedEntry, taskTopicId]);

  const handleAdd = async () => {
    const trimmed = newText.trim();
    if (!trimmed || !taskTopicId) return;
    setSaving(true);
    try {
      const content = `<p>${trimmed}</p>`;
      const metadata: Record<string, unknown> = { _taxonomyId: taskTopicId, _customFields: { isCompleted: false } };
      const encrypted = await encryptPost(content, metadata);
      const result = await entriesApi.create({
        contentEncrypted: encrypted.contentEncrypted,
        contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted,
        metadataIv: encrypted.metadataIv,
        isEncrypted: true,
        taxonomyIds: [taskTopicId],
      });
      addDecryptedEntry({ id: result.id as number, content, metadata, isEncrypted: true, createdAt: new Date(result.createdAt as string), updatedAt: new Date(result.createdAt as string) });
      setNewText(''); setAdding(false);
    } finally { setSaving(false); }
  };

  const incomplete = tasks.filter(t => !t.isCompleted).slice(0, 8);
  const completed = tasks.filter(t => t.isCompleted).slice(0, 3);

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faListCheck} /></CardIconWrap>
        <CardTitle>Tasks</CardTitle>
        <CardViewLink to="/goals/tasks">View all</CardViewLink>
        {taskTopicId && <AddBtn onClick={() => setAdding(a => !a)}><FontAwesomeIcon icon={faPlus} /></AddBtn>}
        {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
      </CardHeader>
      <CardBody>
        {adding && (
          <ItemRow>
            <CheckBtn $done={false} $color={accentColor} onClick={() => {}} style={{ opacity: 0.3 }} />
            <InlineInput
              autoFocus
              value={newText}
              placeholder="New task..."
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewText(''); } }}
            />
            <AddBtn onClick={handleAdd} disabled={saving}>{saving ? <Spinner size={10} /> : <FontAwesomeIcon icon={faCheck} />}</AddBtn>
          </ItemRow>
        )}
        {incomplete.length === 0 && !adding && <EmptyNote>No pending tasks</EmptyNote>}
        {incomplete.map(t => (
          <ItemRow key={t.id}>
            <CheckBtn $done={false} $color={accentColor} onClick={() => handleToggle(t)} />
            <ItemText>{stripHtml(t.content).slice(0, 80)}</ItemText>
          </ItemRow>
        ))}
        {completed.map(t => (
          <ItemRow key={t.id} $done>
            <CheckBtn $done $color={accentColor} onClick={() => handleToggle(t)}>
              <FontAwesomeIcon icon={faCheck} />
            </CheckBtn>
            <ItemText $done>{stripHtml(t.content).slice(0, 80)}</ItemText>
          </ItemRow>
        ))}
      </CardBody>
    </DashCard>
  );
}

/* ── Widget: Events & Meetings ── */

interface EventEntry { id: number; content: string; metadata: Record<string, unknown>; }

function EventsCard({ accentColor, events, dragAttributes, dragListeners }: { accentColor: string; events: EventEntry[] } & DragProps) {
  if (events.length === 0) {
    return (
      <DashCard>
        <CardHeader>
          <CardIconWrap><FontAwesomeIcon icon={faCalendarDay} /></CardIconWrap>
          <CardTitle>Upcoming Events & Meetings</CardTitle>
          <CardViewLink to="/calendar">View all</CardViewLink>
          {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
        </CardHeader>
        <CardBody><EmptyNote>No upcoming events</EmptyNote></CardBody>
      </DashCard>
    );
  }

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faCalendarDay} /></CardIconWrap>
        <CardTitle>Upcoming Events & Meetings</CardTitle>
        {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
      </CardHeader>
      <CardBody>
        {events.slice(0, 10).map(ev => {
          const cf = (ev.metadata._customFields as Record<string, unknown>) || {};
          const date = cf.startDate as string | undefined;
          const time = cf.startTime as string | undefined;
          const today = todayKey();
          const label = date === today ? 'Today' : date ? new Date(date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '') : '';
          return (
            <ItemRow key={ev.id}>
              <ItemText>{stripHtml(ev.content).slice(0, 70)}</ItemText>
              <EventMeta>{label}{time ? ` · ${formatTime12h(time)}` : ''}</EventMeta>
            </ItemRow>
          );
        })}
      </CardBody>
    </DashCard>
  );
}

/* ── Widget: Shopping List ── */

function ShoppingCard({ accentColor, listEntry, dragAttributes, dragListeners }: { accentColor: string; listEntry: { id: number; content: string; metadata: Record<string, unknown> } | null } & DragProps) {
  const { encryptPost } = useEncryption();
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState('');

  const currentEntry = useMemo(() => {
    if (!listEntry) return null;
    return decryptedEntries.find(e => e.id === listEntry.id) || listEntry;
  }, [decryptedEntries, listEntry]);

  const items = useMemo(() => {
    if (!currentEntry) return [];
    const cf = (currentEntry.metadata._customFields as Record<string, unknown>) || {};
    return (cf.items as { id: string; name: string; category: string; checked: boolean }[]) || [];
  }, [currentEntry]);

  const handleToggle = useCallback(async (itemId: string) => {
    if (!currentEntry) return;
    const cf = (currentEntry.metadata._customFields as Record<string, unknown>) || {};
    const updatedItems = (items).map(it => it.id === itemId ? { ...it, checked: !it.checked } : it);
    const newCf = { ...cf, items: updatedItems };
    const newMeta = { ...currentEntry.metadata, _customFields: newCf };
    updateDecryptedEntry(currentEntry.id, { metadata: newMeta });
    try {
      const encrypted = await encryptPost(currentEntry.content, newMeta);
      const taxId = currentEntry.metadata._taxonomyId as number | undefined;
      await entriesApi.update(currentEntry.id, {
        contentEncrypted: encrypted.contentEncrypted,
        contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted,
        metadataIv: encrypted.metadataIv,
        taxonomyIds: taxId ? [taxId] : [],
      });
    } catch { updateDecryptedEntry(currentEntry.id, { metadata: currentEntry.metadata }); }
  }, [currentEntry, items, encryptPost, updateDecryptedEntry]);

  const handleAddItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed || !currentEntry) return;
    const cf = (currentEntry.metadata._customFields as Record<string, unknown>) || {};
    const updatedItems = [...items, { id: crypto.randomUUID(), name: trimmed, category: 'other', checked: false }];
    const newCf = { ...cf, items: updatedItems };
    const newMeta = { ...currentEntry.metadata, _customFields: newCf };
    updateDecryptedEntry(currentEntry.id, { metadata: newMeta });
    try {
      const encrypted = await encryptPost(currentEntry.content, newMeta);
      const taxId = currentEntry.metadata._taxonomyId as number | undefined;
      await entriesApi.update(currentEntry.id, {
        contentEncrypted: encrypted.contentEncrypted,
        contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted,
        metadataIv: encrypted.metadataIv,
        taxonomyIds: taxId ? [taxId] : [],
      });
    } catch { updateDecryptedEntry(currentEntry.id, { metadata: currentEntry.metadata }); }
    setNewItem(''); setAdding(false);
  };

  if (!currentEntry) {
    return (
      <DashCard>
        <CardHeader>
          <CardIconWrap><FontAwesomeIcon icon={faCartShopping} /></CardIconWrap>
          <CardTitle>Shopping List</CardTitle>
          <CardViewLink to="/shopping">View all</CardViewLink>
          {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
        </CardHeader>
        <CardBody><EmptyNote>No active shopping list</EmptyNote></CardBody>
      </DashCard>
    );
  }

  const unchecked = items.filter(it => !it.checked);
  const checked = items.filter(it => it.checked);

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faCartShopping} /></CardIconWrap>
        <CardTitle>Shopping List</CardTitle>
        <CardViewLink to="/shopping">View all</CardViewLink>
        <AddBtn onClick={() => setAdding(a => !a)}><FontAwesomeIcon icon={faPlus} /></AddBtn>
        {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
      </CardHeader>
      <CardBody>
        {adding && (
          <ItemRow>
            <CheckBtn $done={false} $color={accentColor} onClick={() => {}} style={{ opacity: 0.3 }} />
            <InlineInput
              autoFocus
              value={newItem}
              placeholder="Add item..."
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddItem(); if (e.key === 'Escape') { setAdding(false); setNewItem(''); } }}
            />
          </ItemRow>
        )}
        {unchecked.slice(0, 10).map(it => (
          <ItemRow key={it.id}>
            <CheckBtn $done={false} $color={accentColor} onClick={() => handleToggle(it.id)} />
            <ItemText>{it.name}</ItemText>
          </ItemRow>
        ))}
        {checked.slice(0, 3).map(it => (
          <ItemRow key={it.id} $done>
            <CheckBtn $done $color={accentColor} onClick={() => handleToggle(it.id)}>
              <FontAwesomeIcon icon={faCheck} />
            </CheckBtn>
            <ItemText $done>{it.name}</ItemText>
          </ItemRow>
        ))}
        {unchecked.length === 0 && !adding && checked.length === 0 && <EmptyNote>List is empty</EmptyNote>}
      </CardBody>
    </DashCard>
  );
}

/* ── Widget: Medication Schedule ── */

const MedProgressBar = styled.div`
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
  margin-bottom: 8px;
`;

const MedProgressFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  border-radius: 2px;
  transition: width 0.3s ease;
`;

const MedRow = styled.div<{ $taken: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  opacity: ${({ $taken }) => $taken ? 0.45 : 1};
  & + & { border-top: 1px solid ${({ theme }) => theme.colors.border}; }
`;

const MedCircle = styled.button<{ $taken: boolean; $color: string }>`
  width: 22px; height: 22px; min-width: 22px;
  border-radius: 4px;
  border: 1.5px solid ${({ $taken, $color, theme }) => $taken ? $color : theme.colors.border};
  background: ${({ $taken, $color }) => $taken ? $color : 'transparent'};
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; color: white; font-size: 12px; padding: 0;
  transition: all 0.15s;
  &:disabled { opacity: 0.5; cursor: wait; }
`;

const MedName = styled.span<{ $taken: boolean }>`
  font-size: 16px;
  font-weight: ${({ $taken }) => $taken ? 300 : 400};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: ${({ $taken }) => $taken ? 'line-through' : 'none'};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MedTimeLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 300;
  flex-shrink: 0;
`;

/* ── Weather (inline header) ── */

interface CurrentWeather {
  temp: number;
  code: number;
}

function wmoIcon(code: number) {
  if (code === 0) return faSun;
  if (code <= 3) return faCloud;
  if (code <= 48) return faWind;
  if (code <= 67) return faCloudRain;
  if (code <= 77) return faSnowflake;
  if (code <= 82) return faCloudRain;
  return faBolt;
}

function wmoLabel(code: number) {
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Thunderstorm';
}

const US_STATES: Record<string, string> = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',
  KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',
  MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',
  NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',
  NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
  DC:'District of Columbia',
};

function geocodeCity(cityName: string): Promise<{ latitude: number; longitude: number }> {
  const [cityPart, qualifierRaw] = cityName.split(',');
  const searchName = cityPart.trim();
  const qualifier = qualifierRaw?.trim().toUpperCase() ?? '';
  return fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=10&language=en&format=json`
  )
    .then(r => r.json())
    .then((data: { results?: { latitude: number; longitude: number; admin1?: string; country_code?: string; country?: string }[] }) => {
      if (!data.results?.length) throw new Error(`City "${cityName}" not found`);
      let result = data.results[0];
      if (qualifier) {
        const fullState = US_STATES[qualifier];
        const match = data.results.find(r =>
          (fullState && r.admin1?.toLowerCase() === fullState.toLowerCase()) ||
          r.country_code?.toUpperCase() === qualifier ||
          r.admin1?.toUpperCase().startsWith(qualifier) ||
          r.country?.toUpperCase().startsWith(qualifier)
        );
        if (match) result = match;
      }
      return { latitude: result.latitude, longitude: result.longitude };
    });
}

function InlineWeather() {
  const cityName = useUIStore(s => s.weatherCity);

  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [todayHiLo, setTodayHiLo] = useState<{ max: number; min: number } | null>(null);

  useEffect(() => {
    if (!cityName) { setLat(null); setLon(null); setCurrent(null); setTodayHiLo(null); return; }
    geocodeCity(cityName)
      .then(({ latitude, longitude }) => { setLat(latitude); setLon(longitude); })
      .catch(() => {});
  }, [cityName]);

  useEffect(() => {
    if (lat == null || lon == null) return;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min&current=temperature_2m,weathercode` +
      `&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
    )
      .then(r => r.json())
      .then((data: {
        current: { temperature_2m: number; weathercode: number };
        daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
      }) => {
        setCurrent({ temp: Math.round(data.current.temperature_2m), code: data.current.weathercode });
        setTodayHiLo({ max: Math.round(data.daily.temperature_2m_max[0]), min: Math.round(data.daily.temperature_2m_min[0]) });
      })
      .catch(() => {});
  }, [lat, lon]);

  if (!current) return null;

  return (
    <InlineWeatherWrap>
      <FontAwesomeIcon icon={wmoIcon(current.code)} style={{ fontSize: 11 }} />
      <InlineTemp>{current.temp}°F</InlineTemp>
      {todayHiLo && <InlineHiLo>H:{todayHiLo.max}° L:{todayHiLo.min}°</InlineHiLo>}
    </InlineWeatherWrap>
  );
}

/* ── Weather Card ── */

const WeatherDayRow = styled.div<{ $today?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
  ${({ $today }) => $today && 'padding: 8px 0 10px;'}
`;

const WeatherDayLabel = styled.span<{ $today?: boolean }>`
  font-size: ${({ $today }) => $today ? '14px' : '13px'};
  font-weight: ${({ $today }) => $today ? 600 : 400};
  color: ${({ theme }) => theme.colors.text};
  width: 52px;
  flex-shrink: 0;
`;

const WeatherTodayTemp = styled.span`
  font-size: 31px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1;
`;

const WeatherCondition = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex: 1;
`;

const WeatherHiLo = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  margin-left: auto;
`;

const WeatherPrecip = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
`;

const UnitToggle = styled.button`
  background: none;
  border: none;
  padding: 2px 7px;
  font-size: 13px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

interface WeatherDay {
  date: string;
  max: number;
  min: number;
  code: number;
  precip: number;
}

function WeatherCard({ accentColor, dragAttributes, dragListeners }: { accentColor: string } & DragProps) {
  const cityName = useUIStore(s => s.weatherCity);

  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [forecast, setForecast] = useState<WeatherDay[] | null>(null);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cityName) { setLat(null); setLon(null); setForecast(null); setCurrent(null); return; }
    geocodeCity(cityName)
      .then(({ latitude, longitude }) => { setLat(latitude); setLon(longitude); setError(''); })
      .catch((err: Error) => setError(err.message ?? 'Unable to look up city'));
  }, [cityName]);

  useEffect(() => {
    if (lat == null || lon == null) return;
    setLoading(true);
    setError('');
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max` +
      `&current=temperature_2m,weathercode` +
      `&temperature_unit=fahrenheit&timezone=auto&forecast_days=5`
    )
      .then(r => r.json())
      .then((data: {
        current: { temperature_2m: number; weathercode: number };
        daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weathercode: number[]; precipitation_probability_max: number[] };
      }) => {
        setCurrent({ temp: Math.round(data.current.temperature_2m), code: data.current.weathercode });
        setForecast(data.daily.time.map((date, i) => ({
          date,
          max: Math.round(data.daily.temperature_2m_max[i]),
          min: Math.round(data.daily.temperature_2m_min[i]),
          code: data.daily.weathercode[i],
          precip: data.daily.precipitation_probability_max[i],
        })));
      })
      .catch(() => setError('Unable to load weather'))
      .finally(() => setLoading(false));
  }, [lat, lon]);

  const dayLabel = (dateStr: string) => {
    const today = toDateStr(new Date());
    if (dateStr === today) return 'Today';
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap>
          <FontAwesomeIcon icon={faSun} />
        </CardIconWrap>
        <CardTitle>Weather</CardTitle>
        <DragGrip {...(dragAttributes ?? {})} {...(dragListeners ?? {})}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragGrip>
      </CardHeader>
      <CardBody>
        {!cityName ? (
          <div style={{ fontSize: 13, color: 'inherit', opacity: 0.5, padding: '8px 0' }}>
            Set your city in Settings → Preferences to see the forecast.
          </div>
        ) : loading && !forecast ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}><Spinner size={20} /></div>
        ) : error ? (
          <div style={{ fontSize: 13, color: '#9B4444', padding: '8px 0' }}>{error}</div>
        ) : forecast && current ? (
          <>
            {forecast.map((day, i) => {
              const isToday = i === 0;
              return (
                <WeatherDayRow key={day.date} $today={isToday}>
                  <WeatherDayLabel $today={isToday}>{dayLabel(day.date)}</WeatherDayLabel>
                  <FontAwesomeIcon
                    icon={isToday ? wmoIcon(current.code) : wmoIcon(day.code)}
                    style={{ fontSize: isToday ? 18 : 13, width: 18, flexShrink: 0 }}
                  />
                  {isToday ? (
                    <>
                      <WeatherTodayTemp>{current.temp}°F</WeatherTodayTemp>
                      <WeatherCondition>{wmoLabel(current.code)}</WeatherCondition>
                      <WeatherHiLo>H:{day.max}° L:{day.min}°</WeatherHiLo>
                    </>
                  ) : (
                    <>
                      <WeatherCondition>{wmoLabel(day.code)}</WeatherCondition>
                      {day.precip > 20 && <WeatherPrecip><FontAwesomeIcon icon={faDroplet} style={{ marginRight: 3 }} />{day.precip}%</WeatherPrecip>}
                      <WeatherHiLo>H:{day.max}° L:{day.min}°</WeatherHiLo>
                    </>
                  )}
                </WeatherDayRow>
              );
            })}
          </>
        ) : null}
      </CardBody>
    </DashCard>
  );
}

/* ── Topic Widget ── */

const TopicEntryRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const TopicEntryPreview = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TopicEntryDate = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`;

function TopicWidget({ topicId, accentColor, dragAttributes, dragListeners }: { topicId: number; accentColor: string } & DragProps) {
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);

  const topic = useMemo(() => allTopics.find(t => t.id === topicId), [allTopics, topicId]);

  const entries = useMemo(() => {
    if (!topic) return [];
    return decryptedEntries
      .filter(e => (e.metadata as Record<string, unknown>)._taxonomyId === topicId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [decryptedEntries, topicId, topic]);

  if (!topic) return null;

  const formatDate = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    const today = new Date();
    const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap>
          <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
        </CardIconWrap>
        <CardTitle>{topic.name}</CardTitle>
        <CardViewLink to="/journal">View all</CardViewLink>
        <DragGrip {...(dragAttributes ?? {})} {...(dragListeners ?? {})}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragGrip>
      </CardHeader>
      <CardBody>
        {entries.length === 0 ? (
          <div style={{ fontSize: 13, opacity: 0.5, padding: '8px 0' }}>No entries yet.</div>
        ) : (
          entries.map(e => {
            const preview = stripHtml(e.content ?? '').trim().slice(0, 80) || '(no content)';
            return (
              <TopicEntryRow key={e.id}>
                <TopicEntryPreview>{preview}</TopicEntryPreview>
                <TopicEntryDate>{formatDate(e.createdAt)}</TopicEntryDate>
              </TopicEntryRow>
            );
          })
        )}
      </CardBody>
    </DashCard>
  );
}

/* ── Menu Plan Card ── */

interface MenuMealSlot { mealName: string; recipeName: string; }
interface MenuPlanDay {
  breakfast?: MenuMealSlot;
  lunch?: MenuMealSlot;
  dinner?: MenuMealSlot;
  snack?: MenuMealSlot;
}

const MealRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const MealLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textMuted};
  width: 68px;
  flex-shrink: 0;
`;

const MealName = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MEAL_SLOTS: { key: keyof MenuPlanDay; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch',     label: 'Lunch' },
  { key: 'dinner',    label: 'Dinner' },
  { key: 'snack',     label: 'Snack' },
];

function MenuPlanCard({ accentColor, dragAttributes, dragListeners }: { accentColor: string } & DragProps) {
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);

  const menuTopicId = useMemo(
    () => allTopics.find(t => t.name.toLowerCase() === 'menu plan')?.id ?? null,
    [allTopics]
  );

  const todayStr = useMemo(() => toDateStr(new Date()), []);

  // Find current week's plan, then show today or next upcoming day with meals
  const display = useMemo((): { dayLabel: string; meals: MenuPlanDay; slots: typeof MEAL_SLOTS } | null => {
    if (!menuTopicId) return null;
    const entry = decryptedEntries.find(e => {
      const meta = e.metadata as Record<string, unknown>;
      if (meta._taxonomyId !== menuTopicId) return false;
      const cf = meta._customFields as Record<string, unknown> | undefined;
      const weekStart = cf?.weekStart as string | undefined;
      if (!weekStart) return false;
      const end = new Date(`${weekStart}T12:00:00`);
      end.setDate(end.getDate() + 6);
      return todayStr >= weekStart && todayStr <= toDateStr(end);
    });
    if (!entry) return null;

    const cf = (entry.metadata as Record<string, unknown>)._customFields as Record<string, unknown> | undefined;
    const weekStart = cf?.weekStart as string;
    const days = cf?.days as Record<string, MenuPlanDay> | undefined;
    if (!days) return null;

    // Build the 7 dates of this week starting from weekStart
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(`${weekStart}T12:00:00`);
      d.setDate(d.getDate() + i);
      weekDates.push(toDateStr(d));
    }

    // Start from today, fall forward to next day with planned meals
    const startIdx = Math.max(0, weekDates.indexOf(todayStr));
    for (let i = startIdx; i < 7; i++) {
      const dateStr = weekDates[i];
      const meals = days[dateStr];
      const slots = MEAL_SLOTS.filter(s => meals?.[s.key]?.mealName);
      if (slots.length > 0) {
        let label = 'Today';
        if (dateStr !== todayStr) {
          const diff = i - weekDates.indexOf(todayStr);
          label = diff === 1 ? 'Tomorrow'
            : new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
        }
        return { dayLabel: label, meals, slots };
      }
    }
    return null;
  }, [decryptedEntries, menuTopicId, todayStr]);

  const cardTitle = display && display.dayLabel !== 'Today' ? `${display.dayLabel}'s Menu` : "Today's Menu";

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faUtensils} /></CardIconWrap>
        <CardTitle>{cardTitle}</CardTitle>
        <CardViewLink to="/menu">View plan</CardViewLink>
        <DragGrip {...(dragAttributes ?? {})} {...(dragListeners ?? {})}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragGrip>
      </CardHeader>
      <CardBody>
        {!menuTopicId ? (
          <div style={{ fontSize: 13, opacity: 0.5, padding: '8px 0' }}>No Menu Plan topic found.</div>
        ) : !display ? (
          <div style={{ fontSize: 13, opacity: 0.5, padding: '8px 0' }}>No meals planned for this week.</div>
        ) : (
          display.slots.map(({ key, label }) => (
            <MealRow key={key}>
              <MealLabel>{label}</MealLabel>
              <MealName>{display.meals[key]!.mealName}</MealName>
            </MealRow>
          ))
        )}
      </CardBody>
    </DashCard>
  );
}

/* ── Widget: Affirmations ── */

const AffirmationDisplay = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 20px;
  font-weight: 400;
  font-style: italic;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 0 12px;
  text-align: center;
`;

const AffirmationNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const AffirmationNavBtn = styled.button`
  background: none;
  border: none;
  padding: 4px 6px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const AffirmationCount = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  min-width: 40px;
  text-align: center;
`;

const AffirmationEditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
`;

const AffirmationEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`;

const AffirmationEditText = styled.span`
  flex: 1;
  font-size: 15px;
`;

const AffirmationAddRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const AffirmationInput = styled.input`
  flex: 1;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 15px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.textMuted}; }
`;

const AffirmationToggle = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  text-decoration: underline;
  margin-top: 4px;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const DEFAULT_AFFIRMATIONS: string[] = [
  'I am enough just as I am.',
  'I am capable of handling whatever comes my way.',
  'I choose to focus on what I can control.',
  'I am worthy of love, rest, and good things.',
  'Every day I grow a little stronger.',
  'I trust myself to make good decisions.',
  'I am grateful for this moment and what it holds.',
  'I give myself permission to take up space.',
  'My feelings are valid and I can move through them.',
  'I am proud of how far I have come.',
  'Progress, not perfection, is what matters.',
  'I bring something unique and valuable to the world.',
  'I am allowed to say no and honour my boundaries.',
  'I face challenges with courage and curiosity.',
  'Good things are unfolding for me.',
];

function AffirmationsCard({ accentColor, dragAttributes, dragListeners }: { accentColor: string } & DragProps) {
  const { encryptPost } = useEncryption();
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState('');
  const [saving, setSaving] = useState(false);
  const [offset, setOffset] = useState(0);

  const entry = useMemo(() =>
    decryptedEntries.find(e => (e.metadata as Record<string, unknown>)._widgetType === 'affirmations'),
    [decryptedEntries]
  );

  const items: string[] = useMemo(() => {
    if (!entry) return [];
    const cf = (entry.metadata as Record<string, unknown>)._customFields as Record<string, unknown> | undefined;
    return (cf?.items as string[]) ?? [];
  }, [entry]);

  // Day-of-year base index + user-controlled offset
  const baseIdx = useMemo(() => {
    const d = new Date();
    return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  }, []);

  const displayItems = items.length > 0 ? items : DEFAULT_AFFIRMATIONS;
  const currentIdx = ((baseIdx + offset) % displayItems.length + displayItems.length) % displayItems.length;
  const current = displayItems[currentIdx];

  const saveItems = async (newItems: string[]) => {
    setSaving(true);
    try {
      const metadata: Record<string, unknown> = { _widgetType: 'affirmations', _customFields: { items: newItems } };
      const encrypted = await encryptPost('', metadata);
      const payload = {
        contentEncrypted: encrypted.contentEncrypted,
        contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted,
        metadataIv: encrypted.metadataIv,
        isEncrypted: true,
        taxonomyIds: [] as number[],
      };
      if (entry) {
        await entriesApi.update(entry.id, payload);
        updateDecryptedEntry(entry.id, { metadata });
      } else {
        const result = await entriesApi.create(payload);
        addDecryptedEntry({ id: result.id as number, content: '', metadata, isEncrypted: true, createdAt: new Date(result.createdAt as string), updatedAt: new Date(result.createdAt as string) });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = newText.trim();
    if (!trimmed || saving) return;
    await saveItems([...items, trimmed]);
    setNewText('');
  };

  const handleRemove = (i: number) => saveItems(items.filter((_, j) => j !== i));

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faHeart} /></CardIconWrap>
        <CardTitle>Affirmations</CardTitle>
        <DragGrip {...(dragAttributes ?? {})} {...(dragListeners ?? {})}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragGrip>
      </CardHeader>
      <CardBody>
        {isEditing ? (
          <>
            <AffirmationEditList>
              {items.length === 0 ? (
                <div style={{ fontSize: 13, opacity: 0.5 }}>No affirmations yet.</div>
              ) : items.map((text, i) => (
                <AffirmationEditRow key={i}>
                  <AffirmationEditText>{text}</AffirmationEditText>
                  <AddBtn onClick={() => handleRemove(i)} style={{ fontSize: 10 }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </AddBtn>
                </AffirmationEditRow>
              ))}
            </AffirmationEditList>
            <AffirmationAddRow>
              <AffirmationInput
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="Add an affirmation…"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <SaveBtn $accent={accentColor} $active={!!newText.trim()} onClick={handleAdd} disabled={saving || !newText.trim()}>
                {saving ? <Spinner size={10} /> : 'Add'}
              </SaveBtn>
            </AffirmationAddRow>
          </>
        ) : (
          <>
            <AffirmationDisplay>"{current}"</AffirmationDisplay>
            {displayItems.length > 1 && (
              <AffirmationNav>
                <AffirmationNavBtn onClick={() => setOffset(o => o - 1)}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </AffirmationNavBtn>
                <AffirmationCount>{currentIdx + 1} / {displayItems.length}</AffirmationCount>
                <AffirmationNavBtn onClick={() => setOffset(o => o + 1)}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </AffirmationNavBtn>
              </AffirmationNav>
            )}
          </>
        )}
        <AffirmationToggle onClick={() => setIsEditing(e => !e)}>
          {isEditing ? 'Done' : 'Edit affirmations'}
        </AffirmationToggle>
      </CardBody>
    </DashCard>
  );
}

function MedsCard({ accentColor, dragAttributes, dragListeners }: { accentColor: string } & DragProps) {
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const todayStr = useMemo(() => toDateStr(new Date()), []);
  const [doseLogs, setDoseLogs] = useState<Record<string, DoseLogRecord>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const medicationTopicId = useMemo(
    () => allTopics.find(t => t.name.toLowerCase() === 'medication')?.id,
    [allTopics]
  );

  const scheduledDoses = useMemo<ScheduledDose[]>(() => {
    if (!medicationTopicId) return [];
    const doses: ScheduledDose[] = [];
    for (const entry of entries) {
      const meta = entry.metadata as Record<string, unknown> | undefined;
      if (!meta || meta._taxonomyId !== medicationTopicId) continue;
      const cf = (meta._customFields as Record<string, unknown>) || {};
      if (cf.isActive === false) continue;
      const name = stripHtml(entry.content).slice(0, 80) || 'Unnamed';
      const dosage = (cf.dosage as string) || '';
      const times = (cf.scheduleTimes as string[]) || [];
      for (const time of times) {
        doses.push({ medicationPostId: entry.id, medicationName: name, dosage, time });
      }
    }
    return doses.sort((a, b) => a.time.localeCompare(b.time));
  }, [entries, medicationTopicId]);

  const fetchLogs = useCallback(() => {
    dosesApi.getByDate(todayStr).then(data => {
      const map: Record<string, DoseLogRecord> = {};
      for (const log of data.logs) {
        map[`${log.medicationPostId}-${log.scheduledTime.substring(0, 5)}`] = log;
      }
      setDoseLogs(map);
    }).catch(() => {});
  }, [todayStr]);

  useEffect(() => {
    if (!scheduledDoses.length) return;
    fetchLogs();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchLogs();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchLogs, scheduledDoses.length]);

  const getStatus = (dose: ScheduledDose) =>
    doseLogs[`${dose.medicationPostId}-${dose.time.substring(0, 5)}`]?.status ?? 'pending';

  const handleToggle = async (dose: ScheduledDose) => {
    const normTime = dose.time.substring(0, 5);
    const key = `${dose.medicationPostId}-${normTime}`;
    const isTaken = getStatus(dose) === 'taken';
    setSaving(key);
    try {
      const { log } = await dosesApi.log({
        medicationPostId: dose.medicationPostId,
        scheduledTime: normTime,
        date: todayStr,
        status: isTaken ? 'pending' : 'taken',
        takenAt: isTaken ? null : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      });
      setDoseLogs(prev => ({ ...prev, [key]: { ...log, scheduledTime: log.scheduledTime.substring(0, 5) } }));
    } catch (err) {
      console.error('Failed to log dose:', err);
    } finally {
      setSaving(null);
    }
  };

  const taken = scheduledDoses.filter(d => getStatus(d) === 'taken').length;
  const pct = scheduledDoses.length > 0 ? Math.round((taken / scheduledDoses.length) * 100) : 0;

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faPills} /></CardIconWrap>
        <CardTitle>Medications Today</CardTitle>
        <CardViewLink to="/health/meds">View all</CardViewLink>
        {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
      </CardHeader>
      <CardBody>
        <MedProgressBar><MedProgressFill $pct={pct} $color={accentColor} /></MedProgressBar>
        <EventMeta style={{ display: 'block', marginBottom: 10 }}>{taken} of {scheduledDoses.length} taken today</EventMeta>
        {scheduledDoses.map((dose, i) => {
          const isTaken = getStatus(dose) === 'taken';
          const key = `${dose.medicationPostId}-${dose.time.substring(0, 5)}`;
          return (
            <MedRow key={`${key}-${i}`} $taken={isTaken}>
              <MedCircle $taken={isTaken} $color={accentColor} disabled={saving === key} onClick={() => handleToggle(dose)}>
                {isTaken && <FontAwesomeIcon icon={faCheck} />}
              </MedCircle>
              <MedName $taken={isTaken}>{dose.medicationName}{dose.dosage ? ` · ${dose.dosage}` : ''}</MedName>
              <MedTimeLabel>{formatTime12h(dose.time)}</MedTimeLabel>
            </MedRow>
          );
        })}
      </CardBody>
    </DashCard>
  );
}

/* ── Widget: Mini Calendar ── */

function MiniCalendarCard({ accentColor, dragAttributes, dragListeners }: { accentColor: string } & DragProps) {
  const navigate = useNavigate();
  const setSelectedDate = useUIStore(s => s.setSelectedDate);
  const setViewMode = useUIStore(s => s.setViewMode);
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const [selectedDate, setLocalDate] = useState(() => new Date());

  const entryDates = useMemo(() => {
    const set = new Set<string>();
    for (const e of decryptedEntries) {
      const d = e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt as string);
      set.add(toDateStr(d));
    }
    return set;
  }, [decryptedEntries]);

  const handleSelectDate = (date: Date) => {
    setLocalDate(date);
    setSelectedDate(date);
    setViewMode('date');
    navigate('/journal');
  };

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faCalendarDays} /></CardIconWrap>
        <CardTitle>Calendar</CardTitle>
        <DragGrip {...(dragAttributes ?? {})} {...(dragListeners ?? {})}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragGrip>
      </CardHeader>
      <div style={{ padding: '0 4px 8px' }}>
        <MiniCalendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          entryDates={entryDates}
          expanded
        />
      </div>
    </DashCard>
  );
}

/* ── Widget: Daily Check-in (Wellness) ── */

const WATER_GOAL = 8;
const SLEEP_GOAL = 10;
const MOOD_ICONS = [faFaceSadCry, faFaceFrown, faFaceMeh, faFaceSmile, faFaceGrinBeam] as const;

const WSection = styled.div`
  padding: 14px 0;
  & + & { border-top: 1px solid ${({ theme }) => theme.colors.border}; }
`;

const WSectionLabel = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 10px;
`;

const GlassRow = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
`;

const GlassBtn = styled.button<{ $filled: boolean }>`
  background: none;
  border: none;
  padding: 4px 3px;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  color: ${({ $filled, theme }) => $filled ? theme.colors.text : theme.colors.border};
  transition: color 0.1s, transform 0.1s;
  &:hover { color: ${({ theme }) => theme.colors.text}; transform: scale(1.15); }
  &:active { transform: scale(0.88); }
`;

const GlassCount = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: 6px;
`;

const MoodRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MoodBtn = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  font-size: 25px;
  line-height: 1;
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.border};
  transition: color 0.1s, transform 0.1s;
  &:hover { color: ${({ theme }) => theme.colors.text}; transform: scale(1.15); }
  &:active { transform: scale(0.88); }
`;


const CyclePredictionLine = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 12px;
  letter-spacing: 0.01em;
`;

const FLOW_OPTIONS = ['spotting', 'light', 'medium', 'heavy'] as const;
type FlowIntensity = typeof FLOW_OPTIONS[number] | '';
const FLOW_INDEX: Record<FlowIntensity, number> = { '': 0, spotting: 1, light: 2, medium: 3, heavy: 4 };
const FLOW_BY_INDEX: FlowIntensity[] = ['', 'spotting', 'light', 'medium', 'heavy'];

function WellnessCheckInCard({ accentColor, dragAttributes, dragListeners }: { accentColor: string } & DragProps) {
  const { encryptPost } = useEncryption();
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const cycleTrackingEnabled = useUIStore(s => s.cycleTrackingEnabled);
  const allTopics = useEntriesStore(s => s.allTopics);
  const setTopics = useEntriesStore(s => s.setTopics);
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const todayStr = todayKey();

  // Derive wellness entry from store — reactive to journal edits
  const wellnessEntry = useMemo(() => {
    return decryptedEntries.find(e => {
      const meta = e.metadata as Record<string, unknown>;
      if (meta._widgetType !== 'wellness-checkin') return false;
      const cf = meta._customFields as Record<string, unknown> | undefined;
      return cf?.date === todayStr;
    }) ?? null;
  }, [decryptedEntries, todayStr]);

  const storedCf = useMemo(() => {
    if (!wellnessEntry) return null;
    return ((wellnessEntry.metadata as Record<string, unknown>)._customFields as Record<string, unknown>) ?? null;
  }, [wellnessEntry]);

  // Pending state — used only before the first entry is created
  const [pendingWater, setPendingWater] = useState(0);
  const [pendingMood, setPendingMood] = useState(0);
  const [pendingSleep, setPendingSleep] = useState(0);
  const [pendingPeriod, setPendingPeriod] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<FlowIntensity>('');

  // Display values: prefer stored, fall back to pending
  const waterGlasses = wellnessEntry ? ((storedCf?.waterGlasses as number) || 0) : pendingWater;
  const moodScore    = wellnessEntry ? ((storedCf?.moodScore   as number) || 0) : pendingMood;
  const sleepHours   = wellnessEntry ? ((storedCf?.sleepHours  as number) || 0) : pendingSleep;
  const periodToday  = wellnessEntry ? !!(storedCf?.periodToday) : pendingPeriod;
  const flowIntensity = wellnessEntry ? ((storedCf?.flowIntensity as FlowIntensity) || '') : pendingFlow;

  const entryIdRef = useRef<number | null>(null);
  // Keep entryIdRef in sync with store
  useEffect(() => {
    if (wellnessEntry) entryIdRef.current = wellnessEntry.id;
  }, [wellnessEntry]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ water: 0, mood: 0, sleepH: 0, period: false, flow: '' as FlowIntensity });

  const wellnessTopicId = useMemo(
    () => allTopics.find(t => t.name.toLowerCase() === 'wellness')?.id ?? null,
    [allTopics]
  );

  const cyclePrediction = useMemo(() => {
    if (!cycleTrackingEnabled) return null;
    // Build date map from stored entries, then overlay today's live value
    const dateMap = new Map<string, boolean>();
    for (const e of decryptedEntries) {
      const meta = e.metadata as Record<string, unknown>;
      if (meta._widgetType !== 'wellness-checkin') continue;
      const cf = (meta._customFields as Record<string, unknown>) ?? {};
      const d = cf.date as string;
      if (d) dateMap.set(d, !!(cf.periodToday));
    }
    const allDates = [...dateMap.entries()]
      .map(([date, period]) => ({ date, period }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const firstDays: string[] = [];
    let inPeriod = false;
    for (const d of allDates) {
      if (d.period && !inPeriod) { firstDays.push(d.date); inPeriod = true; }
      else if (!d.period) inPeriod = false;
    }
    if (firstDays.length === 0) return { lastLabel: null, nextLabel: null, avgLen: null };
    const last = firstDays[firstDays.length - 1];
    const lastLabel = new Date(last + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const gaps: number[] = [];
    for (let i = 1; i < firstDays.length; i++) {
      const diff = Math.round((new Date(firstDays[i]).getTime() - new Date(firstDays[i - 1]).getTime()) / 86400000);
      if (diff > 0 && diff < 60) gaps.push(diff);
    }
    const avgLen = gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 28;
    const predicted = new Date(new Date(last + 'T12:00:00').getTime() + avgLen * 86400000);
    const nextLabel = predicted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { lastLabel, nextLabel, avgLen };
  }, [cycleTrackingEnabled, decryptedEntries]);

  // doSaveRef pattern — debounce timer always calls the latest version, avoiding stale closures
  const doSaveRef = useRef<() => Promise<void>>(async () => {});
  doSaveRef.current = async () => {
    const { water, mood, sleepH, period, flow } = latestRef.current;
    // Resolve the existing entry id — check ref first, then scan the store directly
    // (guards against race where useEffect hasn't run yet on first tap)
    if (!entryIdRef.current) {
      const existing = useEntriesStore.getState().decryptedEntries.find(e => {
        const meta = e.metadata as Record<string, unknown>;
        if (meta._widgetType !== 'wellness-checkin') return false;
        const cf = meta._customFields as Record<string, unknown> | undefined;
        return cf?.date === todayStr;
      });
      if (existing) entryIdRef.current = existing.id;
    }
    // Auto-create Wellness topic if needed
    let topicId = wellnessTopicId;
    if (!topicId) {
      try {
        const created = await topicsApi.create({ name: 'Wellness', icon: 'heart' });
        setTopics([...useEntriesStore.getState().allTopics, created]);
        topicId = created.id;
      } catch { topicId = null; }
    }
    const metadata: Record<string, unknown> = {
      _widgetType: 'wellness-checkin',
      _customFields: { date: todayStr, waterGlasses: water, waterGoal: WATER_GOAL, moodScore: mood, sleepHours: sleepH, sleepQuality: 0, periodToday: period, flowIntensity: flow },
    };
    if (topicId) metadata._taxonomyId = topicId;
    const summary = [
      water > 0 ? `${water}/${WATER_GOAL} glasses` : '',
      mood > 0 ? `Mood ${mood}/5` : '',
      sleepH > 0 ? `${sleepH}h sleep` : '',
    ].filter(Boolean).join(' · ') || 'Wellness check-in';
    try {
      const encrypted = await encryptPost(summary, metadata);
      const payload = {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        isEncrypted: true as const,
        taxonomyIds: topicId ? [topicId] : [] as number[],
      };
      if (entryIdRef.current) {
        await entriesApi.update(entryIdRef.current, payload);
        updateDecryptedEntry(entryIdRef.current, { content: summary, metadata });
      } else {
        const result = await entriesApi.create(payload);
        const id = result.id as number;
        entryIdRef.current = id;
        addDecryptedEntry({ id, content: summary, metadata, isEncrypted: true, createdAt: new Date(result.createdAt as string), updatedAt: new Date(result.createdAt as string) });
      }
    } catch { /* fire-and-forget */ }
  };

  const scheduleSave = (water: number, mood: number, sleepH: number, period: boolean, flow: FlowIntensity) => {
    latestRef.current = { water, mood, sleepH, period, flow };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSaveRef.current(), 600);
  };

  const optimisticUpdate = (updates: Partial<{ waterGlasses: number; moodScore: number; sleepHours: number; periodToday: boolean; flowIntensity: FlowIntensity }>) => {
    if (!entryIdRef.current) return;
    const entry = useEntriesStore.getState().decryptedEntries.find(e => e.id === entryIdRef.current);
    if (!entry) return;
    const meta = entry.metadata as Record<string, unknown>;
    const cf = (meta._customFields as Record<string, unknown>) ?? {};
    updateDecryptedEntry(entryIdRef.current, { metadata: { ...meta, _customFields: { ...cf, ...updates } } });
  };

  const handleGlass = (i: number) => {
    const newVal = i < waterGlasses ? i : i + 1;
    if (wellnessEntry) optimisticUpdate({ waterGlasses: newVal });
    else setPendingWater(newVal);
    scheduleSave(newVal, moodScore, sleepHours, periodToday, flowIntensity);
  };

  const handleMood = (score: number) => {
    const newVal = moodScore === score ? 0 : score;
    if (wellnessEntry) optimisticUpdate({ moodScore: newVal });
    else setPendingMood(newVal);
    scheduleSave(waterGlasses, newVal, sleepHours, periodToday, flowIntensity);
  };

  const handleSleepHours = (i: number) => {
    const newVal = i < sleepHours ? i : i + 1;
    if (wellnessEntry) optimisticUpdate({ sleepHours: newVal });
    else setPendingSleep(newVal);
    scheduleSave(waterGlasses, moodScore, newVal, periodToday, flowIntensity);
  };

  const handleFlow = (f: FlowIntensity) => {
    const newFlow: FlowIntensity = flowIntensity === f ? '' : f;
    const newPeriod = newFlow !== '';
    if (wellnessEntry) optimisticUpdate({ periodToday: newPeriod, flowIntensity: newFlow });
    else { setPendingPeriod(newPeriod); setPendingFlow(newFlow); }
    scheduleSave(waterGlasses, moodScore, sleepHours, newPeriod, newFlow);
  };

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap><FontAwesomeIcon icon={faHeart} /></CardIconWrap>
        <CardTitle>Daily Check-in</CardTitle>
        <DragGrip {...(dragAttributes ?? {})} {...(dragListeners ?? {})}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragGrip>
      </CardHeader>
      <CardBody>
        <WSection>
          <WSectionLabel>Water</WSectionLabel>
          <GlassRow>
            {Array.from({ length: WATER_GOAL }, (_, i) => (
              <GlassBtn key={i} $filled={i < waterGlasses} onClick={() => handleGlass(i)} title={`${i + 1} glass${i !== 0 ? 'es' : ''}`}>
                <FontAwesomeIcon icon={faGlassWater} />
              </GlassBtn>
            ))}
            <GlassCount>{waterGlasses}/{WATER_GOAL}</GlassCount>
          </GlassRow>
        </WSection>

        <WSection>
          <WSectionLabel>Mood</WSectionLabel>
          <MoodRow>
            {MOOD_ICONS.map((icon, i) => (
              <MoodBtn key={i} $active={moodScore === i + 1} onClick={() => handleMood(i + 1)} title={['Very sad', 'Sad', 'Neutral', 'Good', 'Great'][i]}>
                <FontAwesomeIcon icon={icon} />
              </MoodBtn>
            ))}
          </MoodRow>
        </WSection>

        <WSection>
          <WSectionLabel>Sleep</WSectionLabel>
          <GlassRow>
            {Array.from({ length: SLEEP_GOAL }, (_, i) => (
              <GlassBtn key={i} $filled={i < sleepHours} onClick={() => handleSleepHours(i)} title={`${i + 1}h`}>
                <FontAwesomeIcon icon={faCloudMoon} />
              </GlassBtn>
            ))}
            <GlassCount>{sleepHours > 0 ? `${sleepHours}h` : '—'}</GlassCount>
          </GlassRow>
        </WSection>

        {cycleTrackingEnabled && (
          <WSection>
            <WSectionLabel>Cycle</WSectionLabel>
            <GlassRow>
              {Array.from({ length: 4 }, (_, i) => (
                <GlassBtn key={i} $filled={i < FLOW_INDEX[flowIntensity]} onClick={() => handleFlow(FLOW_OPTIONS[i])} title={FLOW_OPTIONS[i]}>
                  <FontAwesomeIcon icon={faDroplet} />
                </GlassBtn>
              ))}
              <GlassCount>{flowIntensity || '—'}</GlassCount>
            </GlassRow>
            <CyclePredictionLine>
              {`LAST PERIOD: ${cyclePrediction?.lastLabel ?? '—'}`}
            </CyclePredictionLine>
            <CyclePredictionLine>
              {cyclePrediction?.nextLabel
                ? `NEXT PERIOD: ${cyclePrediction.nextLabel} (${cyclePrediction.avgLen}-day cycle)`
                : 'NEXT PERIOD: Log more to predict'}
            </CyclePredictionLine>
          </WSection>
        )}
      </CardBody>
    </DashCard>
  );
}

/* ── Main View ── */


export function DashboardView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#6A9B9B';
  const displayName = useUIStore(s => s.displayName);
  const weatherEnabled = useUIStore(s => s.weatherEnabled);
  const cityName = useUIStore(s => s.weatherCity);

  const [layout, setLayout] = useState<DashLayout>(loadLayout);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWidgetMenuOpen, setIsWidgetMenuOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = active.id as CardId;
    const overId   = over.id   as CardId;
    setLayout(prev => {
      const inLeft    = prev.left.includes(activeId);
      const overLeft  = prev.left.includes(overId);
      const overRight = prev.right.includes(overId);
      let next = prev;
      if (inLeft && overLeft) {
        // reorder within left
        next = { ...prev, left: arrayMove(prev.left, prev.left.indexOf(activeId), prev.left.indexOf(overId)) };
      } else if (!inLeft && overRight) {
        // reorder within right
        next = { ...prev, right: arrayMove(prev.right, prev.right.indexOf(activeId), prev.right.indexOf(overId)) };
      } else if (inLeft && overRight) {
        // move left → right
        const newRight = [...prev.right];
        newRight.splice(prev.right.indexOf(overId), 0, activeId);
        next = { ...prev, left: prev.left.filter(id => id !== activeId), right: newRight };
      } else if (!inLeft && overLeft) {
        // move right → left
        const newLeft = [...prev.left];
        newLeft.splice(prev.left.indexOf(overId), 0, activeId);
        next = { ...prev, left: newLeft, right: prev.right.filter(id => id !== activeId) };
      }
      if (next !== prev) saveLayout(next);
      return next;
    });
  }, []);

  // Auto-add weather to layout when enabled but not in any list (e.g. after localStorage cleared)
  useEffect(() => {
    if (!weatherEnabled) return;
    setLayout(prev => {
      if (prev.left.includes('weather') || prev.right.includes('weather') || prev.hidden.includes('weather')) return prev;
      const next: DashLayout = { ...prev, right: [...prev.right, 'weather' as CardId] };
      saveLayout(next);
      return next;
    });
  }, [weatherEnabled]);

  // Auto-remove stale topic-{id} widget for topics that now have a dedicated built-in card
  useEffect(() => {
    const menuPlanTopic = allTopics.find(t => t.name.toLowerCase() === 'menu plan');
    if (!menuPlanTopic) return;
    const staleId = `topic-${menuPlanTopic.id}` as CardId;
    setLayout(prev => {
      if (!prev.left.includes(staleId) && !prev.right.includes(staleId) && !prev.hidden.includes(staleId)) return prev;
      const next = {
        left: prev.left.filter(id => id !== staleId),
        right: prev.right.filter(id => id !== staleId),
        hidden: prev.hidden.filter(id => id !== staleId),
      };
      saveLayout(next);
      return next;
    });
  }, [allTopics]);

  const handleRemoveCard = useCallback((id: CardId) => {
    setLayout(prev => {
      const next = {
        left: prev.left.filter(c => c !== id),
        right: prev.right.filter(c => c !== id),
        hidden: [...prev.hidden.filter(c => c !== id), id],
      };
      saveLayout(next);
      return next;
    });
  }, []);

  const handleAddCard = useCallback((id: CardId) => {
    setLayout(prev => {
      // Add to whichever column has fewer visible items
      const addToRight = prev.right.length <= prev.left.length;
      const next = {
        left:   addToRight ? prev.left : [...prev.left, id],
        right:  addToRight ? [...prev.right, id] : prev.right,
        hidden: prev.hidden.filter(c => c !== id),
      };
      saveLayout(next);
      return next;
    });
  }, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Topic lookups
  const taskTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'task')?.id ?? null, [allTopics]);
  const eventTopicIds = useMemo(() => new Set(allTopics.filter(t => ['event', 'meeting'].includes(t.name.toLowerCase())).map(t => t.id)), [allTopics]);
  const shoppingTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'shopping list')?.id ?? null, [allTopics]);

  // Tasks
  const tasks = useMemo<TaskEntry[]>(() => {
    if (!taskTopicId) return [];
    return decryptedEntries
      .filter(e => (e.metadata as Record<string, unknown>)._taxonomyId === taskTopicId)
      .map(e => ({
        id: e.id,
        content: e.content,
        metadata: e.metadata as Record<string, unknown>,
        isCompleted: !!((e.metadata as Record<string, unknown>)._customFields as Record<string, unknown>)?.isCompleted,
      }))
      .sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }, [decryptedEntries, taskTopicId]);

  // Events & Meetings (today + next 7 days)
  const events = useMemo<EventEntry[]>(() => {
    const todayStr = todayKey();
    const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
    return decryptedEntries
      .filter(e => {
        const meta = e.metadata as Record<string, unknown>;
        if (!eventTopicIds.has(meta._taxonomyId as number)) return false;
        const cf = meta._customFields as Record<string, unknown> | undefined;
        const startDate = cf?.startDate as string | undefined;
        if (!startDate) return false;
        return startDate >= todayStr && startDate <= maxDate;
      })
      .map(e => ({ id: e.id, content: e.content, metadata: e.metadata as Record<string, unknown> }))
      .sort((a, b) => {
        const da = ((a.metadata._customFields as Record<string, unknown>)?.startDate as string) || '';
        const db = ((b.metadata._customFields as Record<string, unknown>)?.startDate as string) || '';
        return da.localeCompare(db);
      });
  }, [decryptedEntries, eventTopicIds]);

  // Meds — only show card if there are active medications with scheduled times
  const hasMeds = useMemo(() => {
    const medTopicId = allTopics.find(t => t.name.toLowerCase() === 'medication')?.id;
    if (!medTopicId) return false;
    return decryptedEntries.some(e => {
      const meta = e.metadata as Record<string, unknown> | undefined;
      if (!meta || meta._taxonomyId !== medTopicId) return false;
      const cf = (meta._customFields as Record<string, unknown>) || {};
      return cf.isActive !== false;
    });
  }, [decryptedEntries, allTopics]);

  const filterVisible = useCallback((ids: CardId[]) =>
    ids.filter(id => {
      if (id === 'meds' && !hasMeds) return false;
      if (id === 'weather' && !weatherEnabled) return false;
      return true;
    }), [hasMeds, weatherEnabled]);

  const visibleLeft  = useMemo(() => filterVisible(layout.left),   [layout.left,   filterVisible]);
  const visibleRight = useMemo(() => filterVisible(layout.right),  [layout.right,  filterVisible]);

  const hiddenAddable = useMemo(
    () => layout.hidden.filter(id => {
      if (id === 'meds' && !hasMeds) return false;
      if (id === 'weather' && !weatherEnabled) return false;
      return true;
    }),
    [layout.hidden, hasMeds, weatherEnabled]
  );

  // Topics that have a dedicated built-in widget — exclude from the topic widget picker
  const BUILTIN_TOPIC_NAMES = useMemo(() => new Set(['menu plan']), []);

  // Topics not already added as a widget (visible or hidden), and not covered by a built-in
  const addableTopics = useMemo(
    () => allTopics.filter(t => {
      if (BUILTIN_TOPIC_NAMES.has(t.name.toLowerCase())) return false;
      const tid = `topic-${t.id}` as CardId;
      return !layout.left.includes(tid) && !layout.right.includes(tid) && !layout.hidden.includes(tid);
    }),
    [allTopics, layout.left, layout.right, layout.hidden, BUILTIN_TOPIC_NAMES]
  );

  // Optional static widgets not yet placed anywhere
  const addableStatics = useMemo(() => {
    const OPTIONAL_STATICS: StaticCardId[] = ['affirmations', 'mini-calendar', 'wellness', 'meds'];
    if (weatherEnabled) OPTIONAL_STATICS.push('weather');
    return OPTIONAL_STATICS.filter(id =>
      !layout.left.includes(id) && !layout.right.includes(id) && !layout.hidden.includes(id)
    );
  }, [layout.left, layout.right, layout.hidden, weatherEnabled]);

  // Shopping list — first current (has unchecked items)
  const shoppingListEntry = useMemo(() => {
    if (!shoppingTopicId) return null;
    return decryptedEntries.find(e => {
      const meta = e.metadata as Record<string, unknown>;
      if (meta._taxonomyId !== shoppingTopicId) return false;
      const cf = meta._customFields as Record<string, unknown> | undefined;
      const items = cf?.items as { checked: boolean }[] | undefined;
      return items?.some(it => !it.checked);
    }) ?? null;
  }, [decryptedEntries, shoppingTopicId]);

  if (needsUnlock) return (
    <>
      <ContentTemplate><EmptyState message="Unlock your journal to view your dashboard" /></ContentTemplate>
      <UnlockDialog onUnlock={handleUnlock} />
    </>
  );

  if (isLoading || !isReady) return (
    <ContentTemplate>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Spinner size={40} />
      </div>
    </ContentTemplate>
  );

  return (
    <ContentTemplate>
      <Page>
        <PageHeader>
          <GreetingBlock>
            <Greeting>{getGreeting()}{displayName ? `, ${displayName}` : ''}</Greeting>
            <DateLineRow>
              <DateLine>{dateLabel}</DateLine>
              {weatherEnabled && cityName && <InlineWeather />}
            </DateLineRow>
          </GreetingBlock>
          {(() => { const q = getDailyQuote(); return (
            <QuoteBlock>
              <QuoteText>"{q.text}"</QuoteText>
              <QuoteAuthor>— {q.author}</QuoteAuthor>
            </QuoteBlock>
          ); })()}
        </PageHeader>

        {(() => {
          const renderCard = (id: CardId, drag: DragProps) => {
            if (id.startsWith('topic-')) return <TopicWidget topicId={parseInt(id.slice(6))} accentColor={headerColor} {...drag} />;
            switch (id as StaticCardId) {
              case 'priorities':  return <PrioritiesCard accentColor={headerColor} {...drag} />;
              case 'tasks':       return <TasksCard accentColor={headerColor} tasks={tasks} taskTopicId={taskTopicId} {...drag} />;
              case 'quick-entry': return <QuickEntryCard accentColor={headerColor} topics={allTopics} {...drag} />;
              case 'events':      return <EventsCard accentColor={headerColor} events={events} {...drag} />;
              case 'shopping':    return <ShoppingCard accentColor={headerColor} listEntry={shoppingListEntry ? { id: shoppingListEntry.id, content: shoppingListEntry.content, metadata: shoppingListEntry.metadata as Record<string, unknown> } : null} {...drag} />;
              case 'meds':        return <MedsCard accentColor={headerColor} {...drag} />;
              case 'weather':       return <WeatherCard accentColor={headerColor} {...drag} />;
              case 'menu-plan':     return <MenuPlanCard accentColor={headerColor} {...drag} />;
              case 'affirmations':  return <AffirmationsCard accentColor={headerColor} {...drag} />;
              case 'wellness':      return <WellnessCheckInCard accentColor={headerColor} {...drag} />;
              case 'mini-calendar': return <MiniCalendarCard accentColor={headerColor} {...drag} />;
            }
          };
          const renderCol = (ids: CardId[]) => ids.map(id => (
            <SortableDashCard key={id} id={id}>
              {(drag) => (
                <CardWrapper>
                  {isEditMode && (
                    <RemoveBtn onClick={() => handleRemoveCard(id)} title={`Remove ${cardLabel(id, allTopics)}`}>
                      <FontAwesomeIcon icon={faXmark} />
                    </RemoveBtn>
                  )}
                  {renderCard(id, drag)}
                </CardWrapper>
              )}
            </SortableDashCard>
          ));
          return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Grid>
                <SortableContext items={visibleLeft} strategy={rectSortingStrategy}>
                  <LeftColumn>{renderCol(visibleLeft)}</LeftColumn>
                </SortableContext>
                <SortableContext items={visibleRight} strategy={rectSortingStrategy}>
                  <RightColumn>
                    {renderCol(visibleRight)}
                    <EditWidgetsCard>
                      <EditWidgetsBtn onClick={() => setIsEditMode(e => !e)} style={{ width: '100%', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={isEditMode ? faXmark : faSlidersH} />
                        {isEditMode ? 'Done editing' : 'Edit widgets'}
                      </EditWidgetsBtn>
                      {isEditMode && (
                        <WidgetMenu style={{ marginTop: 12, marginBottom: 0 }}>
                          <WidgetMenuHeader onClick={() => setIsWidgetMenuOpen(o => !o)}>
                            Add widgets
                            <WidgetMenuChevron $open={isWidgetMenuOpen}>
                              <FontAwesomeIcon icon={faChevronDown} />
                            </WidgetMenuChevron>
                          </WidgetMenuHeader>
                          {isWidgetMenuOpen && (
                            <WidgetMenuBody>
                              {hiddenAddable.length === 0 && addableTopics.length === 0 && addableStatics.length === 0 ? (
                                <div style={{ fontSize: 13, color: 'inherit', opacity: 0.45, padding: '4px 0 4px' }}>
                                  All widgets are on the dashboard. Remove one first to add it back here.
                                </div>
                              ) : (
                                <>
                                  {addableStatics.length > 0 && (
                                    <WidgetMenuSection>
                                      <WidgetSectionLabel>Optional</WidgetSectionLabel>
                                      <WidgetChips>
                                        {addableStatics.map(id => (
                                          <WidgetChip key={id} onClick={() => handleAddCard(id)}>
                                            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} />
                                            {STATIC_LABELS[id]}
                                          </WidgetChip>
                                        ))}
                                      </WidgetChips>
                                    </WidgetMenuSection>
                                  )}
                                  {hiddenAddable.length > 0 && (
                                    <WidgetMenuSection>
                                      <WidgetSectionLabel>Hidden</WidgetSectionLabel>
                                      <WidgetChips>
                                        {hiddenAddable.map(id => (
                                          <WidgetChip key={id} onClick={() => handleAddCard(id)}>
                                            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} />
                                            {cardLabel(id, allTopics)}
                                          </WidgetChip>
                                        ))}
                                      </WidgetChips>
                                    </WidgetMenuSection>
                                  )}
                                  {addableTopics.length > 0 && (
                                    <WidgetMenuSection>
                                      <WidgetSectionLabel>Topics</WidgetSectionLabel>
                                      <WidgetChips>
                                        {addableTopics.map(topic => (
                                          <WidgetChip key={topic.id} onClick={() => handleAddCard(`topic-${topic.id}` as CardId)}>
                                            <FontAwesomeIcon icon={getTopicIcon(topic.icon)} style={{ fontSize: 11 }} />
                                            {topic.name}
                                          </WidgetChip>
                                        ))}
                                      </WidgetChips>
                                    </WidgetMenuSection>
                                  )}
                                </>
                              )}
                            </WidgetMenuBody>
                          )}
                        </WidgetMenu>
                      )}
                    </EditWidgetsCard>
                  </RightColumn>
                </SortableContext>
              </Grid>
            </DndContext>
          );
        })()}
      </Page>
    </ContentTemplate>
  );
}
