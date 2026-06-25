import { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { InlineEditPanel } from '../molecules/InlineEditPanel.js';
import { TopicSelector } from './TopicSelector.js';
import { Editor } from './Editor.js';
import { TaskFields } from '../molecules/fields/TaskFields.js';
import { GoalFields } from '../molecules/fields/GoalFields.js';
import { MilestoneFields } from '../molecules/fields/MilestoneFields.js';
import { FoodFields } from '../molecules/fields/FoodFields.js';
import { MedicationFields } from '../molecules/fields/MedicationFields.js';
import { SymptomFields } from '../molecules/fields/SymptomFields.js';
import { ExerciseFields } from '../molecules/fields/ExerciseFields.js';
import { AllergyFields } from '../molecules/fields/AllergyFields.js';
import { EventFields } from '../molecules/fields/EventFields.js';
import { MeetingFields } from '../molecules/fields/MeetingFields.js';
import { WellnessFields, type WellnessFieldValues } from '../molecules/fields/WellnessFields.js';
import { ShoppingListFields, type ShoppingListFieldValues } from '../molecules/fields/ShoppingListFields.js';
import { MenuPlanFields, type MenuPlanFieldValues } from '../molecules/fields/MenuPlanFields.js';
import { UserFieldsForm } from '../molecules/fields/UserFieldsForm.js';
import { Badge } from '../atoms/Badge.js';
import { SwipeActions } from '../molecules/SwipeActions.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { useUIStore } from '../../stores/uiStore.js';
import { entries as entriesApi } from '../../services/api.js';
import { stripHtml, summarizeUserFields } from '../../utils/stripHtml.js';
import type { DecryptedPost } from '@shared/crypto/types';
import type { Topic } from '../../types/topics.js';

/* ── Helpers ── */

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', goal: 'goal', milestone: 'milestone',
  meals: 'food', medication: 'medication', symptom: 'symptom',
  exercise: 'exercise', event: 'event', meeting: 'meeting',
  wellness: 'wellness', allergy: 'allergy', 'shopping list': 'shopping_list',
  'menu plan': 'menu_plan',
};

function getCustomType(topicName: string | undefined): string | null {
  if (!topicName) return null;
  return TOPIC_TO_TYPE[topicName.toLowerCase()] || null;
}

/* ── Styled ── */

const TopicSelectorBorder = styled.div`
  display: block;

  & > div > button {
    border: none;
    border-bottom: 1px solid var(--border-subtle);
    border-radius: 0;
    background: transparent;
  }
  & > div > button:hover { background: transparent; }
`;

const Card = styled.div<{ $accentColor?: string; $flat?: boolean; $bare?: boolean; $flush?: boolean }>`
  background: transparent;
  border: ${({ $bare, $flush }) => ($bare || $flush) ? 'none' : '1px solid var(--rule, #d5d0c5)'};
  border-left: ${({ $bare, $flush, $accentColor }) => ($bare || $flush) ? 'none' : `3px solid ${$accentColor || 'var(--accent)'}`};
  ${({ $flush }) => $flush && 'border-top: 1px solid var(--border-subtle);'}
  border-radius: 0;
  margin: ${({ $flat, $bare, $flush }) => ($bare || $flush) ? '0' : ($flat ? '0 0 8px 0' : '6px var(--s-4, 16px)')};
  min-width: 0;
  ${({ $flat, $bare, $flush }) => !$flat && !$bare && !$flush && `&:first-child { margin-top: 12px; }`}
`;

const EditWrapper = styled.div<{ $compact?: boolean }>`
  margin: 0 0 20px;
`;

const Row = styled.div<{ $centered?: boolean; $active?: boolean; $noDate?: boolean; $flush?: boolean; $rightDate?: boolean }>`
  padding: ${({ $flush }) => $flush ? '16px 4px' : '14px var(--s-4, 16px)'};
  cursor: pointer;
  display: grid;
  grid-template-columns: ${({ $noDate, $rightDate }) => $rightDate ? '1fr auto' : ($noDate ? '1fr' : '44px 1fr')};
  gap: 10px;
  align-items: ${({ $centered }) => $centered ? 'center' : 'start'};
  background: ${({ $active }) => $active ? 'var(--paper-well, rgba(0,0,0,0.03))' : 'transparent'};
  border: none;
  width: 100%;
  text-align: left;
  transition: background 120ms;
  min-height: 60px;
  border-radius: var(--r-sm, 2px);
  &:hover { background: var(--bg-hover, var(--paper-well, rgba(0,0,0,0.03))); }
  @media (max-width: 768px) { padding: ${({ $flush }) => $flush ? '14px 4px' : '12px 16px'}; }
  @media (max-width: 480px) { gap: 8px; min-height: 52px; }
`;

const RightDate = styled.div`
  grid-column: 2;
  align-self: center;
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  white-space: nowrap;
`;

const DateCol = styled.div`
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: var(--ink-4, #8a857c);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: right;
  line-height: 1.3;
  padding-right: 7px;
`;

const DayNum = styled.span`
  font-family: var(--serif, 'Playfair Display', Georgia, serif);
  font-style: normal;
  font-size: 26px;
  color: var(--ink, #2b2824);
  letter-spacing: 0;
  display: block;
  line-height: 1;
  margin-bottom: 7px;
  padding-bottom: 5px;
`;


const ContentArea = styled.div`
  min-width: 0;
`;

const TitleText = styled.div<{ $done?: boolean }>`
  font-family: var(--sans, 'Lato', sans-serif);
  font-style: normal;
  font-size: 15px;
  color: ${({ $done }) => $done ? 'var(--ink-4, #8a857c)' : 'var(--ink, #2b2824)'};
  line-height: 1.4;
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  margin-bottom: 3px;
`;

const PreviewText = styled.div`
  font-family: var(--sans, 'Lato', sans-serif);
  font-size: 12.5px;
  color: var(--ink-3, #6b645a);
  line-height: 1.45;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 3px;
`;

const FooterMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-4, #8a857c);
  flex-wrap: wrap;
`;

const TopicDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 1px;
  background: var(--ink, ${({ theme }) => theme.colors.text});
  flex-shrink: 0;
  display: inline-block;
`;

/* ── Component ── */

interface EditableEntryCardProps {
  entry: DecryptedPost;
  topic?: Topic;
  accentColor: string;
  isEditing: boolean;
  onSelect: () => void;
  onClose: () => void;
  onDeleted: () => void;
  metaFields?: { key: string; label: string }[];
  onStatusClick?: (status: string) => void;
  showAsPlain?: boolean;
  hidePreview?: boolean;
  compactMargin?: boolean;
  hideDate?: boolean;
  hideTopic?: boolean;
  autoExpandFields?: boolean;
  /** Flat list style: no card border/accent-bar/side-margin, hairline top divider. */
  flush?: boolean;
}

export function EditableEntryCard({ entry, topic, accentColor, isEditing, onSelect, onClose, onDeleted, metaFields = [], onStatusClick, showAsPlain, hidePreview, compactMargin, hideDate, hideTopic, autoExpandFields, flush }: EditableEntryCardProps) {
  const { encryptPost } = useEncryption();
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const removeEntry = useEntriesStore(s => s.removeEntry);
  const allEntries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const topicCustomFields = useUIStore(s => s.topicCustomFields);
  const cycleTrackingEnabled = useUIStore(s => s.cycleTrackingEnabled);

  const goalOptions = useMemo(() => {
    const goalTopicId = allTopics.find(t => t.name.toLowerCase() === 'goal')?.id;
    if (!goalTopicId) return [];
    return allEntries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === goalTopicId)
      .map(e => ({ id: e.id, title: stripHtml(e.content).slice(0, 80) || 'Untitled goal' }));
  }, [allEntries, allTopics]);

  const milestoneOptions = useMemo(() => {
    const milestoneTopicId = allTopics.find(t => t.name.toLowerCase() === 'milestone')?.id;
    if (!milestoneTopicId) return [];
    return allEntries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === milestoneTopicId)
      .map(e => {
        const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> | undefined;
        return { id: e.id, title: stripHtml(e.content).slice(0, 60) || `Milestone #${e.id}`, parentGoalId: (cf?.parentGoalId as number) || undefined };
      });
  }, [allEntries, allTopics]);

  const recipeOptions = useMemo(() => {
    const recipeTopicId = allTopics.find(t => t.name.toLowerCase() === 'recipe')?.id;
    if (!recipeTopicId) return [];
    return allEntries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === recipeTopicId)
      .map(e => ({ id: e.id, title: stripHtml(e.content).slice(0, 80) || 'Untitled recipe' }));
  }, [allEntries, allTopics]);

  const meta = entry.metadata as Record<string, unknown>;
  const cf = (meta?._customFields as Record<string, unknown>) || {};
  const taxonomyId = (meta?._taxonomyId as number) || 0;
  const customType = getCustomType(topic?.name);
  const textContent = stripHtml(entry.content).trim();
  const preview = (() => {
    if (textContent) return textContent.slice(0, 120);
    // Shopping list preview
    if (customType === 'shopping_list' && Array.isArray(cf.items) && cf.items.length > 0) {
      const items = cf.items as { name: string; checked: boolean }[];
      const checked = items.filter(i => i.checked).length;
      const names = items.slice(0, 3).map(i => i.name).filter(Boolean).join(', ');
      return `${checked}/${items.length} items${names ? ` · ${names}${items.length > 3 ? '…' : ''}` : ''}`;
    }
    // Menu plan preview
    if (customType === 'menu_plan' && cf.days && typeof cf.days === 'object') {
      const days = cf.days as Record<string, { breakfast?: { mealName?: string }; lunch?: { mealName?: string }; dinner?: { mealName?: string }; snack?: { mealName?: string } }>;
      const meals: string[] = [];
      Object.values(days).forEach(day => {
        ['breakfast', 'lunch', 'dinner', 'snack'].forEach(slot => {
          const name = (day as Record<string, { mealName?: string }>)[slot]?.mealName;
          if (name && !meals.includes(name)) meals.push(name);
        });
      });
      if (meals.length > 0) {
        return `${meals.length} meals · ${meals.slice(0, 3).join(', ')}${meals.length > 3 ? '…' : ''}`;
      }
      return 'Empty menu plan';
    }
    const userFields = (cf._userFields as Record<string, unknown>) ?? {};
    const fieldDefs = taxonomyId ? (topicCustomFields[taxonomyId] ?? []) : [];
    const fieldSummary = summarizeUserFields(fieldDefs, userFields);
    if (fieldSummary) return fieldSummary;
    return 'Empty entry';
  })();
  const d = new Date(entry.createdAt);
  const dayNum = d.getDate();
  const monthCode = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const rightDateStr = (() => {
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
    return d.toLocaleDateString('en-US', opts);
  })();
  /* In flush list mode, show the date on the right instead of the left column. */
  const showRightDate = !!flush;

  const [editContent, setEditContent] = useState(entry.content);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>(cf);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(taxonomyId);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  // Derive topic + custom type from the currently selected topic (may differ from entry's original)
  const editingTopic = useMemo(
    () => allTopics.find(t => t.id === selectedTopicId),
    [allTopics, selectedTopicId]
  );
  const editingCustomType = getCustomType(editingTopic?.name);
  const userFieldDefs = selectedTopicId ? (topicCustomFields[selectedTopicId] ?? []) : [];

  const taskState = cf.isCompleted ? 'done' : cf.isInProgress ? 'progress' : 'none';

  const wellnessAutoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wellnessAutoSaveDoRef = useRef<() => Promise<void>>(async () => {});
  wellnessAutoSaveDoRef.current = async () => {
    const entryMeta = entry.metadata as Record<string, unknown>;
    const metadata: Record<string, unknown> = { _taxonomyId: selectedTopicId };
    if (entryMeta._widgetType) metadata._widgetType = entryMeta._widgetType;
    if (Object.keys(customFields).length > 0) metadata._customFields = customFields;
    const finalContent = editContent;
    try {
      const encrypted = await encryptPost(finalContent, metadata);
      await entriesApi.update(entry.id, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: selectedTopicId ? [selectedTopicId] : [],
      });
      updateDecryptedEntry(entry.id, { content: finalContent, metadata });
      setStatus('Saved'); setTimeout(() => setStatus(''), 1200);
    } catch (err) { console.error('Wellness auto-save failed:', err); }
  };
  const scheduleWellnessAutoSave = () => {
    if (wellnessAutoDebounceRef.current) clearTimeout(wellnessAutoDebounceRef.current);
    wellnessAutoDebounceRef.current = setTimeout(() => { wellnessAutoSaveDoRef.current(); }, 600);
  };

  const prevEditingRef = useRef(false);
  useEffect(() => {
    if (isEditing && !prevEditingRef.current) {
      setEditContent(entry.content);
      const entryMeta = (entry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
      setCustomFields(entryMeta);
      setSelectedTopicId((entry.metadata as Record<string, unknown>)?._taxonomyId as number || 0);
      setStatus('');
    }
    prevEditingRef.current = isEditing;
  }, [isEditing]);

  const handleTopicChange = (id: number | null) => {
    if (id === null) return;
    const newType = getCustomType(allTopics.find(t => t.id === id)?.name);
    if (newType !== editingCustomType) setCustomFields({});
    setSelectedTopicId(id);
  };

  const handleSave = async () => {
    setSaving(true); setStatus('');
    try {
      const finalContent = editContent;
      const metadata: Record<string, unknown> = { _taxonomyId: selectedTopicId };
      if (Object.keys(customFields).length > 0) metadata._customFields = customFields;
      const encrypted = await encryptPost(finalContent, metadata);
      await entriesApi.update(entry.id, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: selectedTopicId ? [selectedTopicId] : [],
      });
      updateDecryptedEntry(entry.id, { content: finalContent, metadata });
      setStatus('Saved');
      setTimeout(() => { setStatus(''); onClose(); }, 800);
    } catch (err) {
      console.error('Entry save failed:', err);
      setStatus('Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await entriesApi.delete(entry.id);
      removeEntry(entry.id);
      onDeleted();
    } catch (err) {
      console.error('Entry delete failed:', err);
      setStatus('Delete failed');
    }
  };

  // Meta values for preview
  const metaValues = metaFields
    .map(f => {
      const v = cf[f.key];
      if (v == null || v === false) return null;
      const formatted = typeof v === 'boolean' ? 'Yes' : String(v).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
      return { label: f.label, value: formatted };
    })
    .filter((m): m is { label: string; value: string } => m != null);

  // Render custom fields based on the currently selected topic type (may differ from original)
  const renderFields = () => {
    const onChange = (v: Record<string, unknown>) => setCustomFields(v as Record<string, unknown>);
    const builtIn = (() => {
      if (!editingCustomType) return null;
      switch (editingCustomType) {
        case 'task': return <TaskFields values={{ isInProgress: false, isCompleted: false, isAutoMigrating: true, parentGoalId: null, parentMilestoneId: null, deadline: '', priority: 'none', ...customFields } as never} onChange={onChange as never} goalOptions={goalOptions} milestoneOptions={milestoneOptions} />;
        case 'goal': return <GoalFields values={{ goalType: 'short_term', goalStatus: 'new', targetDate: '', ...customFields } as never} onChange={onChange as never} />;
        case 'milestone': return <MilestoneFields values={{ milestoneStatus: 'active', targetDate: '', isCompleted: false, parentGoalId: null, ...customFields } as never} onChange={onChange as never} goalOptions={goalOptions} />;
        case 'food': return <FoodFields values={{ mealType: 'breakfast', consumedDate: '', consumedTime: '', ingredients: '', calories: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'medication': return <MedicationFields values={{ dosage: '', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'symptom': return <SymptomFields values={{ severity: 5, occurredDate: '', occurredTime: '', duration: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'exercise': return <ExerciseFields values={{ exerciseType: 'running', duration: '', intensity: 'medium', distance: '', distanceUnit: 'miles', calories: '', performedDate: '', performedTime: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'allergy': return <AllergyFields values={{ allergen: '', severity: 5, reaction: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'event': return <EventFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', location: '', address: '', phone: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'meeting': return <MeetingFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', meetingTopic: '', attendees: '', location: '', address: '', phone: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'wellness': return <WellnessFields values={{ date: '', waterGlasses: 0, waterGoal: 8, moodScore: 0, sleepHours: 0, sleepQuality: 0, ...customFields } as WellnessFieldValues} onChange={v => setCustomFields(v as unknown as Record<string, unknown>)} cycleTrackingEnabled={cycleTrackingEnabled} onAutoSave={scheduleWellnessAutoSave} />;
        case 'shopping_list': return <ShoppingListFields values={{ items: [], notes: '', linkedRecipeIds: [], ...customFields } as ShoppingListFieldValues} onChange={onChange as never} recipeOptions={recipeOptions} />;
        case 'menu_plan': return <MenuPlanFields values={{ weekStart: '', days: {}, ...customFields } as MenuPlanFieldValues} onChange={onChange as never} recipeOptions={recipeOptions} />;
        default: return null;
      }
    })();
    const userFields = userFieldDefs.length > 0 ? (
      <UserFieldsForm
        fieldDefs={userFieldDefs}
        values={(customFields._userFields as Record<string, unknown>) ?? {}}
        onChange={vals => setCustomFields(prev => ({ ...prev, _userFields: vals }))}
      />
    ) : null;
    if (!builtIn && !userFields) return null;
    return <>{builtIn}{userFields}</>;
  };

  return (
    <Card $accentColor={accentColor} $flat={hideDate} $bare={hidePreview} $flush={flush}>
      {!hidePreview && <SwipeActions onDelete={handleDelete} accentColor={accentColor} disabled={isEditing}>
      <Row role="button" tabIndex={0} onClick={onSelect} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }} $centered $active={isEditing} $noDate={hideDate} $flush={flush} $rightDate={showRightDate}>
        {!hideDate && !showRightDate && (
          <DateCol>
            <DayNum>{dayNum}</DayNum>
            {monthCode}<br />{timeStr}
          </DateCol>
        )}
        <ContentArea>
          <TitleText $done={taskState === 'done'}>{preview}</TitleText>
          {metaValues.length > 0 && (
            <PreviewText>{metaValues.map(m => `${m.label}: ${m.value}`).join(' · ')}</PreviewText>
          )}
          <FooterMeta>
            {topic && !hideTopic && customType !== 'task' && customType !== 'medication' && customType !== 'food' && customType !== 'symptom' && customType !== 'exercise' && customType !== 'allergy' && (
              <>
                <TopicDot />
                <span>{topic.name}</span>
              </>
            )}
            {(customType === 'goal' || customType === 'milestone') && !showAsPlain && (
              <>
                {topic && <span>·</span>}
                <span
                  style={{ cursor: onStatusClick ? 'pointer' : 'default' }}
                  onClick={onStatusClick ? (e) => {
                    e.stopPropagation();
                    const s = cf.isCompleted || cf.goalStatus === 'completed' ? 'completed' :
                      cf.isInProgress || cf.milestoneStatus === 'in_progress' ? 'in_progress' : 'not_started';
                    onStatusClick(s);
                  } : undefined}
                >
                  {cf.isCompleted || cf.goalStatus === 'completed' ? 'Completed' :
                   cf.isInProgress || cf.milestoneStatus === 'in_progress' ? 'In Progress' :
                   'Not Started'}
                </span>
              </>
            )}
            {!!(cf.deadline || cf.targetDate) && (
              <>
                <span>·</span>
                <span style={{ color: new Date((cf.deadline || cf.targetDate) as string + 'T00:00:00') < new Date() ? 'var(--danger)' : undefined }}>
                  {(() => { const dt = new Date(((cf.deadline || cf.targetDate) as string) + 'T00:00:00'); return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`; })()}
                </span>
              </>
            )}
          </FooterMeta>
        </ContentArea>
        {showRightDate && <RightDate>{rightDateStr}</RightDate>}
      </Row>
      </SwipeActions>}

      {isEditing && (
        <EditWrapper $compact={compactMargin}>
          <InlineEditPanel
            topicSelector={
              <TopicSelectorBorder>
                <TopicSelector
                  selectedId={selectedTopicId || null}
                  onSelect={handleTopicChange}
                  topics={allTopics}
                  allowNone={false}
                />
              </TopicSelectorBorder>
            }
            editor={<Editor content={editContent} onChange={setEditContent} placeholder="Edit entry..." />}
            fields={renderFields()}
            accentColor={accentColor}
            saving={saving}
            status={status}
            onSave={handleSave}
            onCancel={onClose}
          />
        </EditWrapper>
      )}
    </Card>
  );
}
