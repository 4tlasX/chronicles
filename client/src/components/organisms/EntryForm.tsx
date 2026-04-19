import { useState } from 'react';
import styled from 'styled-components';
import { stripHtml, summarizeUserFields } from '../../utils/stripHtml.js';
import { faChevronDown, faChevronUp, faChevronLeft, faChevronRight, faBookmark, faShareNodes, faPenNib } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Editor } from './Editor.js';
import { TopicSelector } from './TopicSelector.js';
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
import { AllergyFields, type AllergyFieldValues } from '../molecules/fields/AllergyFields.js';
import { ShoppingListFields, type ShoppingListFieldValues } from '../molecules/fields/ShoppingListFields.js';
import { RecipeFields, type RecipeFieldValues } from '../molecules/fields/RecipeFields.js';
import { PrioritiesFields, type PrioritiesFieldValues } from '../molecules/fields/PrioritiesFields.js';
import { WellnessFields, type WellnessFieldValues } from '../molecules/fields/WellnessFields.js';
import { UserFieldsForm } from '../molecules/fields/UserFieldsForm.js';
import { useUIStore } from '../../stores/uiStore.js';

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
  min-height: 46px;
  max-height: 46px;
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const MobileBackBtn = styled.button`
  display: none;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  margin-right: 8px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { opacity: 0.7; }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const ExpandControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const IconBtn = styled.button<{ $active?: boolean; $activeColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: ${({ $active, $activeColor, theme }) => $active ? ($activeColor || theme.colors.warning) : theme.colors.textMuted};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: ${({ $active, $activeColor, theme }) => $active ? ($activeColor || theme.colors.warning) : theme.colors.text};
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
  padding: 8px 24px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: rgba(255, 255, 255, 0.2); }
`;

const CollapseToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const CustomFieldsBody = styled.div`
  padding: 16px 24px 24px;
`;

const EditorArea = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: hidden;
  padding-top: 12px;
`;

const SaveRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  gap: 8px;
`;

const RightActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const ActionBtn = styled.button`
  padding: 6px 16px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(0,0,0,0.04); color: ${({ theme }) => theme.colors.text}; border-color: rgba(0,0,0,0.04); }
`;


const SaveButton = styled.button<{ $disabled?: boolean }>`
  padding: 4px 14px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06rem;
  color: ${({ theme, $disabled }) => $disabled ? theme.colors.border : theme.colors.text};
  background: transparent;
  border: 1px solid ${({ theme, $disabled }) => $disabled ? theme.colors.border : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.surface};
  }
`;

const StatusText = styled.span<{ $error?: boolean }>`
  font-size: 15px;
  color: ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.success};
  margin-right: auto;
`;

/* ── Helpers ── */

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', goal: 'goal', milestone: 'milestone',
  food: 'food', medication: 'medication', symptom: 'symptom',
  exercise: 'exercise', event: 'event', meeting: 'meeting',
  allergy: 'allergy', 'shopping list': 'shopping_list', recipe: 'recipe',
  priorities: 'priorities', wellness: 'wellness',
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
  onNew: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  isEditing: boolean;
  isSaving: boolean;
  saveStatus: string;
  placeholder?: string;
}

export function EntryForm({
  entryId, content, onContentChange, topicId, onTopicChange, topics,
  customFields, onCustomFieldsChange, onSave, onNew,
  onBookmark, onShare, onBack,
  isEditing, isSaving, saveStatus, placeholder = 'Start writing...',
}: EntryFormProps) {
  const isFavorite = !!customFields._isFavorite;
  const headerColor = useUIStore(s => s.headerColor) || '#6A9B9B';
  const [fieldsExpanded, setFieldsExpanded] = useState(true);
  const [userFieldsExpanded, setUserFieldsExpanded] = useState(true);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const topicCustomFields = useUIStore(s => s.topicCustomFields);
  const userFieldDefs = topicId != null ? (topicCustomFields[topicId] ?? []) : [];

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

  // Build milestone options for task linking (include parentGoalId for cascading)
  const milestoneOptions = entries
    .filter(e => {
      const meta = e.metadata as Record<string, unknown>;
      const tid = meta?._taxonomyId as number | undefined;
      const t = tid ? topics.find(tp => tp.id === tid) : undefined;
      return t && getCustomType(t.name) === 'milestone';
    })
    .map(e => {
      const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> | undefined;
      return {
        id: e.id,
        title: stripHtml(e.content).slice(0, 60) || `Milestone #${e.id}`,
        parentGoalId: (cf?.parentGoalId as number) || undefined,
      };
    });

  // Build recipe options for shopping list linking
  const recipeOptions = entries
    .filter(e => {
      const meta = e.metadata as Record<string, unknown>;
      const tid = meta?._taxonomyId as number | undefined;
      const t = tid ? topics.find(tp => tp.id === tid) : undefined;
      return t && getCustomType(t.name) === 'recipe' && e.id !== entryId;
    })
    .map(e => ({ id: e.id, title: stripHtml(e.content).slice(0, 60) || `Recipe #${e.id}` }));

  // Build shopping list options for recipe linking
  const shoppingListOptions = entries
    .filter(e => {
      const meta = e.metadata as Record<string, unknown>;
      const tid = meta?._taxonomyId as number | undefined;
      const t = tid ? topics.find(tp => tp.id === tid) : undefined;
      return t && getCustomType(t.name) === 'shopping_list' && e.id !== entryId;
    })
    .map(e => ({ id: e.id, title: stripHtml(e.content).slice(0, 60) || `Shopping List #${e.id}` }));

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

  const userFieldValues = (customFields._userFields as Record<string, unknown>) ?? {};
  const canSave = stripHtml(content).length > 0 || (userFieldDefs.length > 0 && summarizeUserFields(userFieldDefs, userFieldValues) !== '');

  return (
    <FormWrapper>
      <TopBar>
        <TopicSelector selectedId={topicId} onSelect={onTopicChange} topics={topics} />
        <ExpandControl>
          <IconBtn
            type="button"
            $active={isFavorite}
            $activeColor={headerColor}
            aria-label={isFavorite ? 'Remove bookmark' : 'Bookmark entry'}
            onClick={() => entryId && onBookmark?.()}
            style={{ opacity: entryId ? 1 : 0.35, cursor: entryId ? 'pointer' : 'default' }}
          >
            <FontAwesomeIcon icon={faBookmark} />
          </IconBtn>
          <IconBtn
            type="button"
            aria-label="Share entry"
            onClick={() => entryId && onShare?.()}
            style={{ opacity: entryId ? 1 : 0.35, cursor: entryId ? 'pointer' : 'default' }}
          >
            <FontAwesomeIcon icon={faShareNodes} />
          </IconBtn>
          <IconBtn
            type="button"
            $active={toolbarOpen}
            aria-label="Toggle formatting toolbar"
            aria-expanded={toolbarOpen}
            onClick={() => setToolbarOpen(!toolbarOpen)}
          >
            <FontAwesomeIcon icon={faPenNib} />
          </IconBtn>
        </ExpandControl>
      </TopBar>

      <ScrollArea>
        <EditorArea>
          <Editor content={content} onChange={onContentChange} placeholder={placeholder} onEnterSave={canSave && !isSaving ? onSave : undefined} toolbarOpen={toolbarOpen} onToolbarToggle={setToolbarOpen} hideToolbarToggle />
        </EditorArea>

        {/* Custom fields section (collapsible) — below editor */}
        {customType && (
          <CustomFieldsSection>
            <CustomFieldsHeader onClick={() => setFieldsExpanded(!fieldsExpanded)}>
              <span>{customType === 'task' ? 'Task Options' : customType === 'goal' ? 'Goal Type' : customType === 'milestone' ? 'Milestone Status' : customType === 'food' ? 'Meal Type' : customType === 'medication' ? 'Dosage' : customType === 'symptom' ? 'Severity' : customType === 'exercise' ? 'Exercise Type' : customType === 'event' ? 'Event Details' : customType === 'meeting' ? 'Meeting Details' : customType === 'allergy' ? 'Allergy Details' : customType === 'shopping_list' ? 'Shopping List' : customType === 'recipe' ? 'Recipe Details' : customType === 'wellness' ? 'Check-in Details' : 'Settings'}</span>
              <FontAwesomeIcon icon={fieldsExpanded ? faChevronUp : faChevronDown} size="xs" />
            </CustomFieldsHeader>
            {fieldsExpanded && (
              <CustomFieldsBody>
                {customType === 'task' && <TaskFields values={{ isInProgress: false, isCompleted: false, isAutoMigrating: true, parentGoalId: null, parentMilestoneId: null, priority: 'none', deadline: '', ...customFields } as TaskFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} goalOptions={goalOptions} milestoneOptions={milestoneOptions} />}
                {customType === 'goal' && <GoalFields values={{ goalType: 'short_term', goalStatus: 'active', targetDate: '', ...customFields } as GoalFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'milestone' && <MilestoneFields values={{ milestoneStatus: 'active', targetDate: '', isCompleted: false, parentGoalId: null, ...customFields } as MilestoneFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} goalOptions={goalOptions} linkedTasks={linkedTasks} onToggleTaskComplete={handleToggleTaskComplete} onUnlinkTask={handleUnlinkTask} />}
                {customType === 'food' && <FoodFields values={{ mealType: 'breakfast', consumedDate: '', consumedTime: '', ingredients: '', calories: '', notes: '', ...customFields } as FoodFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'medication' && <MedicationFields values={{ dosage: '', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: '', ...customFields } as MedicationFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'symptom' && <SymptomFields values={{ severity: 5, occurredDate: '', occurredTime: '', duration: '', notes: '', ...customFields } as SymptomFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'exercise' && <ExerciseFields values={{ exerciseType: 'running', duration: '', intensity: 'medium', distance: '', distanceUnit: 'miles', calories: '', performedDate: '', performedTime: '', notes: '', ...customFields } as ExerciseFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'event' && <EventFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', location: '', address: '', phone: '', notes: '', ...customFields } as EventFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'meeting' && <MeetingFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', meetingTopic: '', attendees: '', location: '', address: '', phone: '', notes: '', ...customFields } as MeetingFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'allergy' && <AllergyFields values={{ allergen: '', severity: 5, reaction: '', occurredDate: '', occurredTime: '', notes: '', ...customFields } as AllergyFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'shopping_list' && <ShoppingListFields values={{ items: [], notes: '', linkedRecipeIds: [], ...(customFields as Partial<ShoppingListFieldValues>) } as ShoppingListFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} recipeOptions={recipeOptions} />}
                {customType === 'recipe' && <RecipeFields values={{ servings: '', prepTime: '', cookTime: '', cuisine: '', ingredients: [], instructions: '', linkedShoppingListIds: [], ...(customFields as Partial<RecipeFieldValues>) } as RecipeFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} shoppingListOptions={shoppingListOptions} />}
                {customType === 'priorities' && <PrioritiesFields values={{ priorities: [], ...(customFields as Partial<PrioritiesFieldValues>) } as PrioritiesFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                {customType === 'wellness' && <WellnessFields values={{ date: '', waterGlasses: 0, waterGoal: 8, moodScore: 0, sleepHours: 0, sleepQuality: 0, ...customFields } as WellnessFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
              </CustomFieldsBody>
            )}
          </CustomFieldsSection>
        )}
        {/* User-defined custom fields */}
        {userFieldDefs.length > 0 && (
          <CustomFieldsSection>
            <CustomFieldsHeader onClick={() => setUserFieldsExpanded(!userFieldsExpanded)}>
              <span>Custom Fields</span>
              <FontAwesomeIcon icon={userFieldsExpanded ? faChevronUp : faChevronDown} size="xs" />
            </CustomFieldsHeader>
            {userFieldsExpanded && (
              <CustomFieldsBody>
                <UserFieldsForm
                  fieldDefs={userFieldDefs}
                  values={(customFields._userFields as Record<string, unknown>) ?? {}}
                  onChange={vals => onCustomFieldsChange({ ...customFields, _userFields: vals })}
                />
              </CustomFieldsBody>
            )}
          </CustomFieldsSection>
        )}

        {/* Action bar — below custom fields, scrolls with content */}
        <SaveRow>
          {saveStatus && saveStatus !== 'Saved' && saveStatus !== 'Created' && <StatusText $error={saveStatus === 'Save failed'}>{saveStatus}</StatusText>}
          <RightActions>
            <ActionBtn onClick={onNew}>Close</ActionBtn>
            <SaveButton $disabled={!canSave || isSaving} disabled={!canSave || isSaving} onClick={onSave}>
              {isSaving ? <><Spinner size={14} /> Saving...</> : 'Save'}
            </SaveButton>
          </RightActions>
        </SaveRow>
      </ScrollArea>
    </FormWrapper>
  );
}
