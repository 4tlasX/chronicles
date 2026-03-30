import { useState } from 'react';
import styled from 'styled-components';
import { stripHtml } from '../../utils/stripHtml.js';
import { faChevronDown, faChevronUp, faBookmark, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Editor } from './Editor.js';
import { TopicSelector } from './TopicSelector.js';
import { Checkbox } from '../atoms/Checkbox.js';
import { Spinner } from '../atoms/Spinner.js';
import { TaskFields, type TaskFieldValues } from '../molecules/fields/TaskFields.js';
import { GoalFields, type GoalFieldValues } from '../molecules/fields/GoalFields.js';
import { MilestoneFields, type MilestoneFieldValues } from '../molecules/fields/MilestoneFields.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { FoodFields, type FoodFieldValues } from '../molecules/fields/FoodFields.js';
import { MedicationFields, type MedicationFieldValues } from '../molecules/fields/MedicationFields.js';
import { SymptomFields, type SymptomFieldValues } from '../molecules/fields/SymptomFields.js';
import { ExerciseFields, type ExerciseFieldValues } from '../molecules/fields/ExerciseFields.js';
import { EventFields, type EventFieldValues } from '../molecules/fields/EventFields.js';
import { MeetingFields, type MeetingFieldValues } from '../molecules/fields/MeetingFields.js';

/* ── Styled components ── */

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ExpandControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IconBtn = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: ${({ $active, theme }) => $active ? '#f59e0b' : theme.colors.textMuted};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: ${({ $active, theme }) => $active ? '#d97706' : theme.colors.text};
    background: rgba(0, 0, 0, 0.05);
  }
`;

const CustomFieldsSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const CustomFieldsHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: rgba(255, 255, 255, 0.2); }
`;

const CustomFieldsBody = styled.div`
  padding: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const EditorArea = styled.div<{ $expanded?: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: ${({ $expanded }) => $expanded ? '400px' : '100px'};
  overflow: hidden;
`;

const SaveRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  gap: 8px;
`;

const LeftActions = styled.div`
  display: flex;
  gap: 8px;
  margin-right: auto;
`;

const ActionBtn = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.surfaceHover}; }
`;

const SaveButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: ${({ theme, $disabled }) => $disabled ? theme.colors.border : theme.colors.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

const StatusText = styled.span<{ $error?: boolean }>`
  font-size: 13px;
  color: ${({ $error }) => $error ? '#ef4444' : '#22c55e'};
  margin-right: auto;
`;

/* ── Helpers ── */

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', goal: 'goal', milestone: 'milestone',
  food: 'food', medication: 'medication', symptom: 'symptom',
  exercise: 'exercise', event: 'event', meeting: 'meeting',
};

function getCustomType(topicName: string | undefined): string | null {
  if (!topicName) return null;
  return TOPIC_TO_TYPE[topicName.toLowerCase()] || null;
}


/* ── Component ── */

interface EntryFormProps {
  entryId: number | null;
  content: string;
  onContentChange: (content: string) => void;
  topicId: number | null;
  onTopicChange: (id: number | null) => void;
  topics: { id: number; name: string; icon: string | null; color: string | null }[];
  customFields: Record<string, unknown>;
  onCustomFieldsChange: (fields: Record<string, unknown>) => void;
  onSave: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onNew: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  isEditing: boolean;
  isSaving: boolean;
  saveStatus: string;
  placeholder?: string;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export function EntryForm({
  entryId, content, onContentChange, topicId, onTopicChange, topics,
  customFields, onCustomFieldsChange, onSave, onDelete, onNew,
  onBookmark, onShare,
  isEditing, isSaving, saveStatus, placeholder = 'Start writing...',
  expanded = false, onExpandChange,
}: EntryFormProps) {
  const isFavorite = !!customFields._isFavorite;
  const [fieldsExpanded, setFieldsExpanded] = useState(true);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);

  const selectedTopic = topics.find(t => t.id === topicId);
  const customType = getCustomType(selectedTopic?.name);

  // Build goal options for milestone linking
  const goalOptions = entries
    .filter(e => {
      const meta = e.metadata as Record<string, unknown>;
      const tid = meta?._taxonomyId as number | undefined;
      const t = tid ? topics.find(tp => tp.id === tid) : undefined;
      return t && getCustomType(t.name) === 'goal';
    })
    .map(e => ({ id: e.id, title: stripHtml(e.content).slice(0, 60) || `Goal #${e.id}` }));

  // Build milestone options for task linking
  const milestoneOptions = entries
    .filter(e => {
      const meta = e.metadata as Record<string, unknown>;
      const tid = meta?._taxonomyId as number | undefined;
      const t = tid ? topics.find(tp => tp.id === tid) : undefined;
      return t && getCustomType(t.name) === 'milestone';
    })
    .map(e => ({ id: e.id, title: stripHtml(e.content).slice(0, 60) || `Milestone #${e.id}` }));

  // Build linked tasks for the current milestone (tasks whose parentMilestoneId === this entry)
  const linkedTasks = entryId ? entries
    .filter(e => {
      const meta = e.metadata as Record<string, unknown>;
      const cf = meta?._customFields as Record<string, unknown> | undefined;
      const tid = meta?._taxonomyId as number | undefined;
      const t = tid ? topics.find(tp => tp.id === tid) : undefined;
      return t && getCustomType(t.name) === 'task' && cf?.parentMilestoneId === entryId;
    })
    .map(e => {
      const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> | undefined;
      return { id: e.id, title: stripHtml(e.content).slice(0, 60) || `Task #${e.id}`, isCompleted: !!cf?.isCompleted };
    }) : [];

  // Toggle a linked task's completion status
  const handleToggleTaskComplete = (taskId: number, completed: boolean) => {
    const entry = entries.find(e => e.id === taskId);
    if (!entry) return;
    const meta = entry.metadata as Record<string, unknown>;
    const existingFields = (meta?._customFields as Record<string, unknown>) || {};
    const updatedFields = { ...existingFields, isCompleted: completed };
    const updatedMeta = { ...meta, _customFields: updatedFields };
    updateDecryptedEntry(taskId, { metadata: updatedMeta });
  };

  // Unlink a task from this milestone
  const handleUnlinkTask = (taskId: number) => {
    const entry = entries.find(e => e.id === taskId);
    if (!entry) return;
    const meta = entry.metadata as Record<string, unknown>;
    const existingFields = (meta?._customFields as Record<string, unknown>) || {};
    const updatedFields = { ...existingFields, parentMilestoneId: null };
    const updatedMeta = { ...meta, _customFields: updatedFields };
    updateDecryptedEntry(taskId, { metadata: updatedMeta });
  };

  const charCount = stripHtml(content).length;
  const canSave = charCount > 0;
  const atLimit = !expanded && charCount >= 200;

  const handleContentChange = (newContent: string) => {
    if (!expanded && stripHtml(newContent).length > 200) return;
    onContentChange(newContent);
  };

  return (
    <FormWrapper>
      {/* Top bar: topic selector left, expand entry right */}
      <TopBar>
        <TopicSelector selectedId={topicId} onSelect={onTopicChange} topics={topics} />
        <ExpandControl>
          <Checkbox
            checked={expanded}
            onChange={(val) => onExpandChange?.(val)}
            label={`Expand entry (${charCount}/200)`}
          />
          <IconBtn
            type="button"
            $active={isFavorite}
            title={isFavorite ? 'Remove bookmark' : 'Bookmark'}
            onClick={() => entryId && onBookmark?.()}
            style={{ opacity: entryId ? 1 : 0.35, cursor: entryId ? 'pointer' : 'default' }}
          >
            <FontAwesomeIcon icon={faBookmark} />
          </IconBtn>
          <IconBtn
            type="button"
            title="Share"
            onClick={() => entryId && onShare?.()}
            style={{ opacity: entryId ? 1 : 0.35, cursor: entryId ? 'pointer' : 'default' }}
          >
            <FontAwesomeIcon icon={faShareNodes} />
          </IconBtn>
        </ExpandControl>
      </TopBar>

      <ScrollArea>
        {/* Editor (toolbar + content) — compact by default, taller when expanded */}
        <EditorArea $expanded={expanded}>
          <Editor content={content} onChange={handleContentChange} placeholder={placeholder} charLimit={expanded ? undefined : 200} />
        </EditorArea>

        {/* Custom fields section (collapsible) — below editor */}
        {customType && (
          <CustomFieldsSection>
            <CustomFieldsHeader onClick={() => setFieldsExpanded(!fieldsExpanded)}>
              <span>{selectedTopic?.name} Settings</span>
              <FontAwesomeIcon icon={fieldsExpanded ? faChevronUp : faChevronDown} size="xs" />
            </CustomFieldsHeader>
            {fieldsExpanded && (
              <CustomFieldsBody>
                {customType === 'task' && <TaskFields values={{ isInProgress: false, isCompleted: false, isAutoMigrating: true, parentMilestoneId: null, ...customFields } as TaskFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} milestoneOptions={milestoneOptions} />}
                {customType === 'goal' && <GoalFields values={{ goalType: 'short_term', goalStatus: 'active', targetDate: '', ...customFields } as GoalFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'milestone' && <MilestoneFields values={{ milestoneStatus: 'active', targetDate: '', isCompleted: false, parentGoalId: null, ...customFields } as MilestoneFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} goalOptions={goalOptions} linkedTasks={linkedTasks} onToggleTaskComplete={handleToggleTaskComplete} onUnlinkTask={handleUnlinkTask} />}
                {customType === 'food' && <FoodFields values={{ mealType: 'breakfast', consumedDate: '', consumedTime: '', ingredients: '', calories: '', notes: '', ...customFields } as FoodFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'medication' && <MedicationFields values={{ dosage: '', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: '', ...customFields } as MedicationFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'symptom' && <SymptomFields values={{ severity: 5, occurredDate: '', occurredTime: '', duration: '', notes: '', ...customFields } as SymptomFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'exercise' && <ExerciseFields values={{ exerciseType: 'running', duration: '', intensity: 'medium', distance: '', distanceUnit: 'miles', calories: '', performedDate: '', performedTime: '', notes: '', ...customFields } as ExerciseFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'event' && <EventFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', location: '', address: '', phone: '', notes: '', ...customFields } as EventFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'meeting' && <MeetingFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', meetingTopic: '', attendees: '', location: '', address: '', phone: '', notes: '', ...customFields } as MeetingFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
              </CustomFieldsBody>
            )}
          </CustomFieldsSection>
        )}
        {/* Action bar — below custom fields, scrolls with content */}
        <SaveRow>
          <LeftActions>
            {isEditing && onDelete && (
              <ActionBtn onClick={onDelete}>Delete</ActionBtn>
            )}
            {isEditing && (
              <ActionBtn onClick={onNew}>Close</ActionBtn>
            )}
          </LeftActions>
          {saveStatus && <StatusText $error={saveStatus === 'Save failed'}>{saveStatus}</StatusText>}
          <SaveButton $disabled={!canSave || isSaving} disabled={!canSave || isSaving} onClick={onSave}>
            {isSaving ? <><Spinner size={14} /> Saving...</> : 'Save'}
          </SaveButton>
        </SaveRow>
      </ScrollArea>
    </FormWrapper>
  );
}
