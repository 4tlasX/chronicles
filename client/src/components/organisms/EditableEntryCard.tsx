import { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faMinus } from '@fortawesome/free-solid-svg-icons';
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
import { EventFields } from '../molecules/fields/EventFields.js';
import { MeetingFields } from '../molecules/fields/MeetingFields.js';
import { WellnessFields, type WellnessFieldValues } from '../molecules/fields/WellnessFields.js';
import { UserFieldsForm } from '../molecules/fields/UserFieldsForm.js';
import { Badge } from '../atoms/Badge.js';
import { SwipeActions } from '../molecules/SwipeActions.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { useUIStore } from '../../stores/uiStore.js';
import { entries as entriesApi } from '../../services/api.js';
import { getTopicIcon } from '../../utils/topicIcons.js';
import { stripHtml, summarizeUserFields } from '../../utils/stripHtml.js';
import type { DecryptedPost } from '@shared/crypto/types';
import type { Topic } from '../../types/topics.js';

/* ── Helpers ── */

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', goal: 'goal', milestone: 'milestone',
  food: 'food', medication: 'medication', symptom: 'symptom',
  exercise: 'exercise', event: 'event', meeting: 'meeting',
  wellness: 'wellness',
};

function getCustomType(topicName: string | undefined): string | null {
  if (!topicName) return null;
  return TOPIC_TO_TYPE[topicName.toLowerCase()] || null;
}

/* ── Styled ── */

const TopicSelectorBorder = styled.div`
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
`;

const Card = styled.div<{ $editing?: boolean }>`
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  background: transparent;
  min-width: 0;
`;

const PreviewRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 16px 24px 20px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(0, 0, 0, 0.02); }
  @media (max-width: 768px) { padding: 14px 16px 18px; }
  @media (max-width: 480px) { padding: 12px 12px 16px; gap: 8px; flex-wrap: wrap; }
`;

const IconWrap = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
  margin-top: 3px;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Preview = styled.div<{ $done?: boolean }>`
  font-size: 17px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  opacity: ${({ $done }) => $done ? 0.55 : 1};
`;

const Meta = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const DateLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
  margin-top: 2px;
  margin-left: 12px;
`;

const TaskCheckButton = styled.button<{ $state: 'none' | 'progress' | 'done'; $color: string }>`
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 50%;
  border: 2px solid ${({ $state, $color, theme }) =>
    $state === 'done' ? $color :
    $state === 'progress' ? $color :
    theme.colors.border};
  background: ${({ $state, $color }) =>
    $state === 'done' ? $color :
    $state === 'progress' ? `${$color}30` :
    'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  padding: 0;
  transition: all 0.15s;
  color: ${({ $state }) => $state === 'done' ? 'white' : 'inherit'};
  font-size: 12px;
  &:hover { opacity: 0.8; }
`;

const RightInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  @media (max-width: 480px) { display: none; }
`;

const StatusLabel = styled.span<{ $clickable?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.text};
  ${({ $clickable }) => $clickable && `cursor: pointer; &:hover { opacity: 0.6; }`}
`;

const DeadlineLabel = styled.span<{ $overdue?: boolean }>`
  font-size: 13px;
  color: ${({ $overdue, theme }) => $overdue ? theme.colors.danger : theme.colors.textMuted};
  white-space: nowrap;
  @media (max-width: 480px) { white-space: normal; }
`;

/* ── Component ── */

interface EditableEntryCardProps {
  entry: DecryptedPost;
  topic?: Topic;
  headerColor: string;
  isEditing: boolean;
  onSelect: () => void;
  onClose: () => void;
  onDeleted: () => void;
  metaFields?: { key: string; label: string }[];
  onStatusClick?: (status: string) => void;
  showAsPlain?: boolean;
}

export function EditableEntryCard({ entry, topic, headerColor, isEditing, onSelect, onClose, onDeleted, metaFields = [], onStatusClick, showAsPlain }: EditableEntryCardProps) {
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

  const meta = entry.metadata as Record<string, unknown>;
  const cf = (meta?._customFields as Record<string, unknown>) || {};
  const taxonomyId = (meta?._taxonomyId as number) || 0;
  const customType = getCustomType(topic?.name);
  const preview = stripHtml(entry.content).slice(0, 120) || 'Empty entry';
  const d = new Date(entry.createdAt);
  const dateStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

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

  // Task status: not started → in progress → completed → not started
  const taskState = cf.isCompleted ? 'done' : cf.isInProgress ? 'progress' : 'none';

  const handleTaskCycle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let newCf: Record<string, unknown>;
    if (!cf.isInProgress && !cf.isCompleted) {
      newCf = { ...cf, isInProgress: true, isCompleted: false };
    } else if (cf.isInProgress && !cf.isCompleted) {
      newCf = { ...cf, isInProgress: false, isCompleted: true };
    } else {
      newCf = { ...cf, isInProgress: false, isCompleted: false };
    }
    const metadata: Record<string, unknown> = { _taxonomyId: taxonomyId, _customFields: newCf };
    try {
      const encrypted = await encryptPost(entry.content, metadata);
      await entriesApi.update(entry.id, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: taxonomyId ? [taxonomyId] : [],
      });
      updateDecryptedEntry(entry.id, { metadata });
    } catch (err) {
      console.error('Task status update failed:', err);
    }
  };

  const wellnessAutoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wellnessAutoSaveDoRef = useRef<() => Promise<void>>(async () => {});
  wellnessAutoSaveDoRef.current = async () => {
    const entryMeta = entry.metadata as Record<string, unknown>;
    const metadata: Record<string, unknown> = { _taxonomyId: selectedTopicId };
    if (entryMeta._widgetType) metadata._widgetType = entryMeta._widgetType;
    if (Object.keys(customFields).length > 0) metadata._customFields = customFields;
    const hasText = !!stripHtml(editContent).trim();
    let finalContent = editContent;
    if (!hasText) {
      const w = (customFields.waterGlasses as number) || 0;
      const g = (customFields.waterGoal as number) || 8;
      const m = (customFields.moodScore as number) || 0;
      const s = (customFields.sleepHours as number) || 0;
      const parts = [w > 0 ? `${w}/${g} glasses` : '', m > 0 ? `Mood ${m}/5` : '', s > 0 ? `${s}h sleep` : ''].filter(Boolean);
      finalContent = `<p>${parts.join(' · ') || 'Wellness check-in'}</p>`;
    }
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
      const hasText = !!stripHtml(editContent).trim();
      const userFieldValues = (customFields._userFields as Record<string, unknown>) ?? {};
      const fieldSummary = !hasText ? summarizeUserFields(userFieldDefs, userFieldValues) : '';
      const finalContent = hasText ? editContent : (fieldSummary ? `<p>${fieldSummary}</p>` : editContent);
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
        case 'goal': return <GoalFields values={{ goalType: 'short_term', goalStatus: 'active', targetDate: '', ...customFields } as never} onChange={onChange as never} />;
        case 'milestone': return <MilestoneFields values={{ milestoneStatus: 'active', targetDate: '', isCompleted: false, parentGoalId: null, ...customFields } as never} onChange={onChange as never} goalOptions={goalOptions} />;
        case 'food': return <FoodFields values={{ mealType: 'breakfast', consumedDate: '', consumedTime: '', ingredients: '', calories: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'medication': return <MedicationFields values={{ dosage: '', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'symptom': return <SymptomFields values={{ severity: 5, occurredDate: '', occurredTime: '', duration: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'exercise': return <ExerciseFields values={{ exerciseType: 'running', duration: '', intensity: 'medium', distance: '', distanceUnit: 'miles', calories: '', performedDate: '', performedTime: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'event': return <EventFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', location: '', address: '', phone: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'meeting': return <MeetingFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', meetingTopic: '', attendees: '', location: '', address: '', phone: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
        case 'wellness': return <WellnessFields values={{ date: '', waterGlasses: 0, waterGoal: 8, moodScore: 0, sleepHours: 0, sleepQuality: 0, ...customFields } as WellnessFieldValues} onChange={v => setCustomFields(v as unknown as Record<string, unknown>)} cycleTrackingEnabled={cycleTrackingEnabled} onAutoSave={scheduleWellnessAutoSave} />;
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
    <Card $editing={isEditing}>
      <SwipeActions onDelete={handleDelete} accentColor={headerColor} disabled={isEditing}>
      <PreviewRow role="button" tabIndex={0} onClick={onSelect} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}>
        {customType === 'task' && !showAsPlain ? (
          <TaskCheckButton
            $state={taskState}
            $color={headerColor}
            onClick={handleTaskCycle}
            title={taskState === 'none' ? 'Click: In Progress' : taskState === 'progress' ? 'Click: Completed' : 'Click: Not Started'}
          >
            {taskState === 'done' && <FontAwesomeIcon icon={faCheck} />}
            {taskState === 'progress' && <FontAwesomeIcon icon={faMinus} />}
          </TaskCheckButton>
        ) : topic && (
          <IconWrap>
            <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
          </IconWrap>
        )}
        <Content>
          <Preview $done={taskState === 'done'}>{preview}</Preview>
          {metaValues.length > 0 && (
            <Meta>{metaValues.map(m => <span key={m.label}>{m.label}: {m.value}</span>)}</Meta>
          )}
        </Content>
        {(customType === 'task' || customType === 'goal' || customType === 'milestone') && !showAsPlain ? (
          <RightInfo>
            <StatusLabel $clickable={!!onStatusClick} onClick={onStatusClick ? (e) => {
              e.stopPropagation();
              const s = cf.isCompleted || cf.goalStatus === 'completed' ? 'completed' :
                cf.isInProgress || cf.milestoneStatus === 'in_progress' ? 'in_progress' : 'not_started';
              onStatusClick(s);
            } : undefined}>
              {cf.isCompleted || cf.goalStatus === 'completed' ? 'Completed' :
               cf.isInProgress || cf.milestoneStatus === 'in_progress' ? 'In Progress' :
               'Not Started'}
            </StatusLabel>
            {!!(cf.deadline || cf.targetDate) && (
              <DeadlineLabel $overdue={new Date(cf.deadline as string || cf.targetDate as string) < new Date()}>
                {(() => { const dt = new Date((cf.deadline || cf.targetDate) as string + 'T00:00:00'); return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`; })()}
              </DeadlineLabel>
            )}
          </RightInfo>
        ) : (
          <DateLabel>{dateStr}</DateLabel>
        )}
      </PreviewRow>
      </SwipeActions>

      {isEditing && (
        <InlineEditPanel
          title={editingTopic ? `Editing ${editingTopic.name}` : 'Edit entry'}
          topicSelector={
            <TopicSelectorBorder>
              <TopicSelector
                selectedId={selectedTopicId || null}
                onSelect={handleTopicChange}
                topics={allTopics}
              />
            </TopicSelectorBorder>
          }
          editor={<Editor content={editContent} onChange={setEditContent} placeholder="Edit entry..." />}
          fields={renderFields()}
          accentColor={headerColor}
          saving={saving}
          status={status}
          onSave={handleSave}
          onCancel={onClose}
        />
      )}
    </Card>
  );
}
