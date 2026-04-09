import { useState, useMemo, useCallback, useEffect, type ReactNode } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faTrash, faCalendarDay, faListCheck,
  faBolt, faCartShopping, faCheck, faPencil, faGripVertical, faPills,
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
import { entries as entriesApi, doses as dosesApi, topics as topicsApi } from '../services/api.js';
import type { DoseLogRecord } from '../services/api.js';
import type { ScheduledDose } from '../types/health.js';
import { toDateStr, formatTime12h } from '../utils/dateUtils.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { stripHtml } from '../utils/stripHtml.js';
import { TopicSelector } from '../components/organisms/TopicSelector.js';
import type { Topic } from '../types/topics.js';

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
  return new Date().toISOString().slice(0, 10);
}

/* ── Layout Styled Components ── */

const Page = styled.div`
  padding: 20px 24px 40px;
  overflow-y: auto;
  height: 100%;
  box-sizing: border-box;
  @media (max-width: 640px) { padding: 12px 12px 32px; }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  @media (max-width: 640px) { flex-direction: column; gap: 12px; }
`;

const GreetingBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const Greeting = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 32px;
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px;
  @media (max-width: 640px) { font-size: 26px; }
`;

const DateLine = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const QuoteBlock = styled.div`
  max-width: 340px;
  text-align: right;
  flex-shrink: 0;
  @media (max-width: 640px) { text-align: left; max-width: 100%; }
`;

const QuoteText = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px;
  line-height: 1.5;
`;

const QuoteAuthor = styled.p`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 40px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    transform: translateX(-50%);
    width: 1px;
    background: ${({ theme }) => theme.colors.border};
    pointer-events: none;
  }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    &::after { display: none; }
  }
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
  padding: 10px 14px 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const CardIconWrap = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 12px;
  flex-shrink: 0;
`;

const CardTitle = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`;

const CardBody = styled.div`
  padding: 12px 14px;
  flex: 1;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  transition: color 0.15s, background 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.text}; background: rgba(0,0,0,0.04); }
`;

const ItemRow = styled.div<{ $done?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  opacity: ${({ $done }) => $done ? 0.45 : 1};
`;

const CheckBtn = styled.button<{ $done?: boolean; $color: string }>`
  width: 16px;
  height: 16px;
  border: 1.5px solid ${({ $done, $color, theme }) => $done ? $color : theme.colors.border};
  border-radius: 3px;
  background: ${({ $done, $color }) => $done ? $color : 'transparent'};
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 8px;
  transition: background 0.15s, border-color 0.15s;
  padding: 0;
`;

const ItemText = styled.span<{ $done?: boolean }>`
  font-size: 13px;
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
  font-size: 13px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 8px;
  outline: none;
  font-family: ${({ theme }) => theme.fontFamily.sans};
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:focus { border-color: var(--focus-color); }
`;

const QuickTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  font-size: 14px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
  outline: none;
  font-family: ${({ theme }) => theme.fontFamily.sans};
  line-height: 1.6;
  box-sizing: border-box;
  padding: 8px;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:focus { border-color: var(--focus-color); }
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
  padding: 4px 14px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
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
  font-size: 11px;
  color: ${({ theme }) => theme.colors.success};
`;

const EmptyNote = styled.p`
  font-size: 13px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 4px 0;
  font-style: italic;
`;


const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-bottom: 10px;
`;

const FieldCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const FieldLabel = styled.label`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FieldInput = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  font-size: 12px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 6px;
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
  font-size: 12px;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 6px;
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
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 300;
`;

const PriorityNumber = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  width: 14px;
  flex-shrink: 0;
`;

/* ── Drag & Drop ── */

type CardId = 'priorities' | 'quick-entry' | 'tasks' | 'events' | 'shopping' | 'meds';

const DEFAULT_ORDER: CardId[] = ['quick-entry', 'priorities', 'events', 'meds', 'tasks', 'shopping'];
const LS_KEY = 'dashboard-card-order';

function loadOrder(): CardId[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = (JSON.parse(raw) as string[]).filter((id): id is CardId => DEFAULT_ORDER.includes(id as CardId));
      const missing = DEFAULT_ORDER.filter(id => !parsed.includes(id));
      return [...parsed, ...missing];
    }
  } catch { /* ignore */ }
  return DEFAULT_ORDER;
}

const DragGrip = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  padding: 0;
  cursor: grab;
  color: ${({ theme }) => theme.colors.border};
  font-size: 11px;
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

/* ── Widget: Daily Priorities ── */

interface Priority { id: string; text: string; done: boolean; }

function findTodayPrioritiesEntry() {
  const today = todayKey();
  const { decryptedEntries, allTopics } = useEntriesStore.getState();
  const topicId = allTopics.find(t => t.name.toLowerCase() === 'priorities')?.id;
  if (!topicId) return undefined;
  return decryptedEntries.find(e => {
    const meta = e.metadata as Record<string, unknown>;
    return meta._taxonomyId === topicId &&
      (e.createdAt as Date).toISOString().slice(0, 10) === today;
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
      setStatus('Saved');
      setTimeout(() => setStatus(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap $color={accentColor}><FontAwesomeIcon icon={faBolt} /></CardIconWrap>
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
          {status && <StatusText>{status}</StatusText>}
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
  'medication':  [{ key: 'dosage', label: 'Dosage', type: 'text' }, { key: 'frequency', label: 'Frequency', type: 'text' }, { key: 'isActive', label: 'Active', type: 'boolean' }],
  'symptom':     [{ key: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'] }, { key: 'duration', label: 'Duration', type: 'text' }],
  'food':        [{ key: 'mealType', label: 'Meal', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] }, { key: 'calories', label: 'Calories', type: 'number' }, { key: 'ingredients', label: 'Ingredients', type: 'text' }],
  'exercise':    [{ key: 'exerciseType', label: 'Type', type: 'text' }, { key: 'duration', label: 'Duration (min)', type: 'number' }, { key: 'intensity', label: 'Intensity', type: 'select', options: ['Low', 'Medium', 'High'] }],
  'allergy':     [{ key: 'allergen', label: 'Allergen', type: 'text' }, { key: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe'] }, { key: 'reaction', label: 'Reaction', type: 'text' }],
  'task':        [{ key: 'isCompleted', label: 'Completed', type: 'boolean' }],
  'event':       [{ key: 'startDate', label: 'Date', type: 'date' }, { key: 'startTime', label: 'Time', type: 'time' }],
  'meeting':     [{ key: 'startDate', label: 'Date', type: 'date' }, { key: 'startTime', label: 'Time', type: 'time' }],
};

/* ── Widget: Quick Entry ── */

function QuickEntryCard({ accentColor, topics, dragAttributes, dragListeners }: { accentColor: string; topics: Topic[] } & DragProps) {
  const { encryptPost } = useEncryption();
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const [text, setText] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const reflectionPrompt = useMemo(() => {
    const d = new Date();
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length];
  }, []);

  const selectedTopic = topics.find(t => t.id === selectedTopicId) ?? null;
  const fieldDefs = selectedTopic ? (TOPIC_FIELDS[selectedTopic.name.toLowerCase()] ?? []) : [];

  const setField = (key: string, value: unknown) => setCustomFields(prev => ({ ...prev, [key]: value }));

  const handleTopicChange = (id: number | null) => {
    setSelectedTopicId(id);
    setCustomFields({});
  };

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const content = `<p>${trimmed}</p>`;
      const metadata: Record<string, unknown> = {};
      if (selectedTopic) {
        metadata._taxonomyId = selectedTopic.id;
        if (fieldDefs.length > 0) metadata._customFields = customFields;
      }
      const encrypted = await encryptPost(content, metadata);
      const result = await entriesApi.create({
        contentEncrypted: encrypted.contentEncrypted,
        contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted,
        metadataIv: encrypted.metadataIv,
        isEncrypted: true,
        taxonomyIds: selectedTopic ? [selectedTopic.id] : [],
      });
      addDecryptedEntry({ id: result.id as number, content, metadata, isEncrypted: true, createdAt: new Date(result.createdAt as string), updatedAt: new Date(result.createdAt as string) });
      setText('');
      setSelectedTopicId(null);
      setCustomFields({});
      setStatus('Saved');
      setTimeout(() => setStatus(''), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap $color={accentColor}><FontAwesomeIcon icon={faPencil} /></CardIconWrap>
        <CardTitle>Quick Entry</CardTitle>
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
        <QuickTextarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={selectedTopicId === null ? reflectionPrompt : 'Add a note...'}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSave(); }}
        />
        <SaveRow>
          {status && <StatusText>{status}</StatusText>}
          <SaveBtn $accent={accentColor} $active={!!text.trim()} onClick={handleSave} disabled={saving || !text.trim()}>
            {saving ? <Spinner size={10} /> : 'Save'}
          </SaveBtn>
        </SaveRow>
      </CardBody>
    </DashCard>
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
        <CardIconWrap $color={accentColor}><FontAwesomeIcon icon={faListCheck} /></CardIconWrap>
        <CardTitle>Tasks</CardTitle>
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
          <CardIconWrap $color={accentColor}><FontAwesomeIcon icon={faCalendarDay} /></CardIconWrap>
          <CardTitle>Upcoming Events & Meetings</CardTitle>
          {dragAttributes && <DragGrip {...dragAttributes as any} {...dragListeners as any}><FontAwesomeIcon icon={faGripVertical} /></DragGrip>}
        </CardHeader>
        <CardBody><EmptyNote>No upcoming events</EmptyNote></CardBody>
      </DashCard>
    );
  }

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap $color={accentColor}><FontAwesomeIcon icon={faCalendarDay} /></CardIconWrap>
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
          <CardIconWrap $color={accentColor}><FontAwesomeIcon icon={faCartShopping} /></CardIconWrap>
          <CardTitle>Shopping List</CardTitle>
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
        <CardIconWrap $color={accentColor}><FontAwesomeIcon icon={faCartShopping} /></CardIconWrap>
        <CardTitle>Shopping List</CardTitle>
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
  padding: 5px 0;
  opacity: ${({ $taken }) => $taken ? 0.45 : 1};
  & + & { border-top: 1px solid ${({ theme }) => theme.colors.border}; padding-top: 6px; }
`;

const MedCircle = styled.button<{ $taken: boolean; $color: string }>`
  width: 18px; height: 18px; min-width: 18px;
  border-radius: 50%;
  border: 2px solid ${({ $taken, $color, theme }) => $taken ? $color : theme.colors.border};
  background: ${({ $taken, $color }) => $taken ? $color : 'transparent'};
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; color: white; font-size: 9px; padding: 0;
  transition: all 0.15s;
  &:disabled { opacity: 0.5; cursor: wait; }
`;

const MedName = styled.span<{ $taken: boolean }>`
  font-size: 13px;
  font-weight: ${({ $taken }) => $taken ? 300 : 400};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: ${({ $taken }) => $taken ? 'line-through' : 'none'};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MedTimeLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: 300;
  flex-shrink: 0;
`;

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

  useEffect(() => {
    if (!scheduledDoses.length) return;
    dosesApi.getByDate(todayStr).then(data => {
      const map: Record<string, DoseLogRecord> = {};
      for (const log of data.logs) {
        map[`${log.medicationPostId}-${log.scheduledTime.substring(0, 5)}`] = log;
      }
      setDoseLogs(map);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayStr]);

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
    } catch { /* ignore */ } finally {
      setSaving(null);
    }
  };

  const taken = scheduledDoses.filter(d => getStatus(d) === 'taken').length;
  const pct = scheduledDoses.length > 0 ? Math.round((taken / scheduledDoses.length) * 100) : 0;

  return (
    <DashCard>
      <CardHeader>
        <CardIconWrap $color={accentColor}><FontAwesomeIcon icon={faPills} /></CardIconWrap>
        <CardTitle>Medications Today</CardTitle>
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

/* ── Main View ── */


export function DashboardView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#4E6E7E';

  const [cardOrder, setCardOrder] = useState<CardId[]>(loadOrder);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCardOrder(prev => {
        const oldIndex = prev.indexOf(active.id as CardId);
        const newIndex = prev.indexOf(over.id as CardId);
        const next = arrayMove(prev, oldIndex, newIndex);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        return next;
      });
    }
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

  const visibleOrder = useMemo(
    () => hasMeds ? cardOrder : cardOrder.filter(id => id !== 'meds'),
    [cardOrder, hasMeds]
  );

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
            <Greeting>{getGreeting()}</Greeting>
            <DateLine>{dateLabel}</DateLine>
          </GreetingBlock>
          {(() => { const q = getDailyQuote(); return (
            <QuoteBlock>
              <QuoteText>"{q.text}"</QuoteText>
              <QuoteAuthor>— {q.author}</QuoteAuthor>
            </QuoteBlock>
          ); })()}
        </PageHeader>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleOrder} strategy={rectSortingStrategy}>
            <Grid>
              {visibleOrder.map(id => (
                <SortableDashCard key={id} id={id}>
                  {(drag) => {
                    switch (id) {
                      case 'priorities': return <PrioritiesCard accentColor={headerColor} {...drag} />;
                      case 'tasks': return <TasksCard accentColor={headerColor} tasks={tasks} taskTopicId={taskTopicId} {...drag} />;
                      case 'quick-entry': return <QuickEntryCard accentColor={headerColor} topics={allTopics} {...drag} />;
                      case 'events': return <EventsCard accentColor={headerColor} events={events} {...drag} />;
                      case 'shopping': return <ShoppingCard accentColor={headerColor} listEntry={shoppingListEntry ? { id: shoppingListEntry.id, content: shoppingListEntry.content, metadata: shoppingListEntry.metadata as Record<string, unknown> } : null} {...drag} />;
                      case 'meds': return <MedsCard accentColor={headerColor} {...drag} />;
                    }
                  }}
                </SortableDashCard>
              ))}
            </Grid>
          </SortableContext>
        </DndContext>
      </Page>
    </ContentTemplate>
  );
}
