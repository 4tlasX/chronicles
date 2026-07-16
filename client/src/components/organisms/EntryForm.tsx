import { useState, useEffect, useRef, Fragment, type MutableRefObject } from 'react';
import styled from 'styled-components';
import { stripHtml, summarizeUserFields } from '../../utils/stripHtml.js';
import { getTopicTrail } from '../../utils/topicBreadcrumb.js';
import { Icon } from '../../../../design-system/components/core/Icon.jsx';
import { Editor, type DictationControls } from './Editor.js';
import { TopicSelector } from './TopicSelector.js';
import { Spinner } from '../atoms/Spinner.js';
import { FieldRowLayoutContext } from '../molecules/FormField.js';
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
import { EntryHeroBanner, EntryImageStrip, EntryLightbox } from './EntryImageGallery.js';
import type { EntryImage } from '../../services/imageStorage.js';

/* ── Styled components ── */

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const EdActions = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const IconBtn = styled.button<{ $active?: boolean; $activeColor?: string; $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${({ $active, $activeColor, $danger }) =>
    $active ? ($activeColor || 'var(--color-accent)') :
    $danger ? 'var(--text-tertiary)' :
    'var(--text-secondary)'};
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    background: var(--bg-hover);
    color: ${({ $danger }) => $danger ? 'var(--color-danger)' : 'var(--text-primary)'};
  }
`;

/* Scrollable body — all editing content */
const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

/* Centered content column */
const EdBody = styled.div`
  max-width: 90%;
  width: 100%;
  margin: 0 auto;
  padding: var(--s-6, 24px) var(--s-5, 20px) var(--s-4, 16px);
`;

/* DS date block — large thin numeral + weekday, under a 2px accent bottom rule. */
const EdDateBlock = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 0;
  padding-top: 26px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--border-default);
`;

const EdDateContent = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;
`;

const EdDateNum = styled.span`
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 200;
  line-height: 0.82;
  letter-spacing: -0.02em;
  color: var(--text-primary);
`;

const EdDateMeta = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 8px;
`;

const EdDateMonth = styled.span`
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-tertiary);
`;

const EdDateDow = styled.span`
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-tertiary);
`;

/* Actions row — icon buttons right-aligned, flanked by hairline rules (DS spec). */
const EdTopicRow = styled.div`
  display: flex;
  gap: var(--s-3, 12px);
  align-items: center;
  margin-bottom: 28px;
  padding: 16px 0 20px;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
`;

/* Breadcrumb at the very top of the entry: VIEW / SUBVIEW / TOPIC.
   Ancestors derive from the topic's home view; the topic is the last crumb. */
const EdCrumbRow = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 20px;
`;

const CrumbLink = styled.button`
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  transition: color 120ms ease;
  &:hover { color: var(--text-primary); }
  &:disabled { cursor: default; }
  &:disabled:hover { color: var(--text-tertiary); }
`;

const CrumbSep = styled.span`
  font-family: var(--font-label);
  font-size: 11px;
  color: var(--text-tertiary);
`;

/* The topic is the last crumb AND the topic picker — restyle the
   TopicSelector trigger to read as bright tracked-uppercase crumb text,
   keeping its dropdown intact. */
const CrumbTopic = styled.div`
  /* Trigger only (direct child button of the picker wrapper). */
  & > div > button {
    border: none;
    border-radius: 0;
    padding: 0 2px;
    background: transparent;
    font-family: var(--font-label);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-primary);
    gap: 6px;
  }
  & > div > button:hover {
    background: transparent;
    color: var(--color-accent);
  }
  /* Dropdown menu: drop the outer border (matches Quick Entry). */
  & > div > div { border: none; }
`;


const TopicHint = styled.span`
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
`;

/* Title — the most prominent element */
const EdTitle = styled.div`
  font-family: var(--font-display, sans-serif);
  font-size: 38px;
  font-weight: 200;
  letter-spacing: -0.01em;
  color: var(--text-primary, ${({ theme }) => theme.colors.text});
  line-height: 1.1;
  margin: 15px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* cf-card: the card that wraps each custom-fields section */
const CustomFieldsSection = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  padding: var(--s-5, 20px) 0;
  position: relative;
  margin-top: var(--s-5, 20px);
`;

const CustomFieldsBody = styled.div`
  /* Editor wrappers/rows: no extra gap — each field row carries its own padding. */
  & > div { gap: 0 !important; }
`;

const EditorArea = styled.div<{ $hidden?: boolean }>`
  display: ${({ $hidden }) => ($hidden ? 'none' : 'flex')};
  flex-direction: column;
  overflow: hidden;
`;

/* Shown in place of the editor when a field-only entry collapses it —
   quiet tracked-uppercase affordance to expand and write notes. */
const AddNotesBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 12px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  transition: color 120ms ease;
  &:hover { color: var(--text-primary); }
`;

/* Inline image upload error under the action row (dictation-error pattern). */
const ImageErrorText = styled.div`
  margin: 8px 0 0;
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--color-danger, #c0392b);
`;

/* Catch-all delete in the footer — quiet gray text that turns red on hover. */
const FooterDeleteBtn = styled.button`
  padding: 6px 0;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-disabled);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s;
  &:hover { color: var(--color-danger, #dc3232); }
`;

const FooterLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`;

/* Footer — bottom-docked, outside the scroll area */
const SaveRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px var(--s-6, 24px);
  border-top: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  gap: 8px;
  flex-shrink: 0;
`;

const SaveRowActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
`;

const DiscardBtn = styled.button`
  padding: 7px 16px;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: color 150ms;
  &:hover { color: var(--text-secondary); }
`;

const SaveHint = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
`;

const StatusText = styled.span`
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--danger, #c0392b);
`;

const SaveButton = styled.button<{ $disabled?: boolean }>`
  padding: 7px 22px;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ $disabled }) => $disabled ? 'var(--text-disabled)' : 'var(--color-accent)'};
  background: transparent;
  border: 1px solid ${({ $disabled }) => $disabled ? 'var(--border-default)' : 'var(--color-accent)'};
  border-radius: var(--r-full, 999px);
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: background 150ms, color 150ms;
  &:hover:not(:disabled) { background: var(--color-accent-subtle); }
`;

/* ── Helpers ── */

function extractTitle(html: string): string {
  const headingMatch = html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
  if (headingMatch) {
    const tmp = document.createElement('div');
    tmp.innerHTML = headingMatch[1];
    const text = (tmp.textContent || tmp.innerText || '').trim();
    if (text) return text;
  }
  return stripHtml(html).trim().slice(0, 80) || '';
}

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', goal: 'goal', milestone: 'milestone',
  meals: 'food', medication: 'medication', symptom: 'symptom',
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
  onAutoSave?: () => void;
  onDelete?: () => Promise<void>;
  onNew: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  /** Navigate to a breadcrumb ancestor (router injected by the view). */
  onNavigate?: (path: string) => void;
  isEditing: boolean;
  isSaving: boolean;
  saveStatus: string;
  lastSavedAt?: Date | null;
  placeholder?: string;
  dictationControlRef?: MutableRefObject<DictationControls | null>;
  // Entry images (only active when image storage is enabled + configured)
  images?: EntryImage[];
  featuredKey?: string | null;
  onImagesSelected?: (files: File[]) => void;
  onImageRemoved?: (key: string) => void;
  onSetFeatured?: (key: string | null) => void;
  imageUploading?: boolean;
  imageError?: string;
  imagesReady?: boolean;
}

export function EntryForm({
  entryId, content, onContentChange, topicId, onTopicChange, topics,
  customFields, onCustomFieldsChange, onSave, onAutoSave, onDelete, onNew,
  onBookmark, onShare, onBack, onNavigate,
  isEditing, isSaving, saveStatus, lastSavedAt, placeholder = 'Start writing...',
  dictationControlRef,
  images = [], featuredKey = null, onImagesSelected, onImageRemoved, onSetFeatured,
  imageUploading = false, imageError, imagesReady = false,
}: EntryFormProps) {
  const isFavorite = !!customFields._isFavorite;
  const accentColor = useUIStore(s => s.accentColor) || '#4A5568';
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const featuredImage = featuredKey ? images.find(img => img.key === featuredKey) ?? null : null;
  const imagesFull = images.length >= 7;
  const [savedAgoText, setSavedAgoText] = useState('');
  useEffect(() => {
    if (!lastSavedAt) { setSavedAgoText(''); return; }
    const update = () => {
      const s = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      setSavedAgoText(s < 60 ? `Auto-saved ${s}s ago` : `Auto-saved ${Math.floor(s / 60)}m ago`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastSavedAt]);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const topicCustomFields = useUIStore(s => s.topicCustomFields);
  const cycleTrackingEnabled = useUIStore(s => s.cycleTrackingEnabled);
  const calendarSyncEnabled = useUIStore(s => s.calendarSyncEnabled);

  const userFieldDefs = topicId != null ? (topicCustomFields[topicId] ?? []) : [];

  const selectedTopic = topics.find(t => t.id === topicId);
  const customType = getCustomType(selectedTopic?.name);
  const trail = getTopicTrail(selectedTopic?.name);

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
  const canSave = stripHtml(content).length > 0
    || (userFieldDefs.length > 0 && summarizeUserFields(userFieldDefs, userFieldValues) !== '')
    || images.length > 0;

  // Field-only entries (Books, Quotes, Music, …) collapse the empty editor so
  // the fields lead; "Add notes" (or dictate/draw) expands it back
  const [notesExpanded, setNotesExpanded] = useState(false);
  useEffect(() => { setNotesExpanded(false); }, [entryId]);
  const hasTextContent = stripHtml(content).trim().length > 0 || content.includes('data-type="drawing"');
  const hasFieldsUi = customType !== null || userFieldDefs.length > 0;
  const editorCollapsed = !notesExpanded && !!entryId && !hasTextContent && hasFieldsUi;

  // Entry meta data for datestrip
  const currentEntry = entryId ? entries.find(e => e.id === entryId) : null;
  const entryCreatedAt = currentEntry ? new Date(currentEntry.createdAt) : null;

  const entryTitle = entryId ? extractTitle(content) : null;

  const saveStatusNode = (() => {
    if (saveStatus === 'Save failed') return <StatusText>Save failed</StatusText>;
    if (isSaving) return <SaveHint>Saving...</SaveHint>;
    if (savedAgoText) return (
      <SaveHint>
        <Icon name="check-circle" size={8} strokeWidth={1.5} />
        {savedAgoText}
      </SaveHint>
    );
    if (entryId) return (
      <SaveHint>
        <Icon name="check-circle" size={8} strokeWidth={1.5} />
        Saved
      </SaveHint>
    );
    return null;
  })();

  return (
    <FormWrapper>
      {/* Scrollable body */}
      <ScrollArea>
        {/* Featured image hero — outside EdBody for full-bleed width */}
        {featuredImage && <EntryHeroBanner image={featuredImage} />}
        <EdBody>
          {/* Breadcrumb: view / subview / topic — the topic crumb is the picker */}
          <EdCrumbRow aria-label="Entry location">
            {trail.map(crumb => (
              <Fragment key={crumb.label}>
                <CrumbLink
                  type="button"
                  disabled={!crumb.path || !onNavigate}
                  onClick={() => crumb.path && onNavigate?.(crumb.path)}
                >
                  {crumb.label}
                </CrumbLink>
                <CrumbSep>/</CrumbSep>
              </Fragment>
            ))}
            <CrumbTopic>
              <TopicSelector
                selectedId={topicId}
                onSelect={id => onTopicChange(id)}
                topics={topics}
                allowNone={false}
              />
            </CrumbTopic>
          </EdCrumbRow>

          {/* DS date block — big numeral + weekday under a 2px accent rule */}
          {(entryCreatedAt || !entryId) && (
            <EdDateBlock>
              <EdDateContent>
                <EdDateNum>{(entryCreatedAt || new Date()).getDate()}</EdDateNum>
                <EdDateMeta>
                  <EdDateDow>{(entryCreatedAt || new Date()).toLocaleDateString('en-US', { weekday: 'long' })}</EdDateDow>
                  <EdDateMonth>{(entryCreatedAt || new Date()).toLocaleDateString('en-US', { month: 'long' })}</EdDateMonth>
                </EdDateMeta>
              </EdDateContent>
            </EdDateBlock>
          )}

          {/* Action buttons row, flanked by hairline rules */}
          <EdTopicRow>
            <EdActions style={{ marginLeft: 'auto' }}>
              <IconBtn
                type="button"
                $active={isFavorite}
                $activeColor={accentColor}
                aria-label={isFavorite ? 'Remove bookmark' : 'Bookmark entry'}
                title="Bookmark"
                onClick={() => entryId && onBookmark?.()}
                style={{ opacity: entryId ? 1 : 0.35, cursor: entryId ? 'pointer' : 'default' }}
              >
                <Icon name="bookmark" size={16} strokeWidth={2} />
              </IconBtn>
              {/* Share is hidden entirely on entries with images — sharing
                  can never distribute user-hosted imagery */}
              {images.length === 0 && (
                <IconBtn
                  type="button"
                  aria-label="Share entry"
                  title="Share"
                  onClick={() => entryId && onShare?.()}
                  style={{ opacity: entryId ? 1 : 0.35, cursor: entryId ? 'pointer' : 'default' }}
                >
                  <Icon name="share" size={16} strokeWidth={2} />
                </IconBtn>
              )}
              {imagesReady && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length > 0) onImagesSelected?.(files);
                      e.target.value = '';
                    }}
                  />
                  <IconBtn
                    type="button"
                    aria-label="Add images"
                    title={imagesFull ? 'Maximum of 7 images per entry' : 'Add images'}
                    disabled={imagesFull || imageUploading}
                    onClick={() => !imagesFull && !imageUploading && fileInputRef.current?.click()}
                    style={{ opacity: imagesFull ? 0.35 : 1, cursor: imagesFull ? 'default' : 'pointer' }}
                  >
                    {imageUploading ? <Spinner size={14} /> : <Icon name="image" size={16} strokeWidth={2} />}
                  </IconBtn>
                </>
              )}
              <IconBtn
                type="button"
                title="Dictate"
                aria-label="Toggle dictation"
                onClick={() => { setNotesExpanded(true); dictationControlRef?.current?.toggle(); }}
              >
                <Icon name="mic" size={16} strokeWidth={2} />
              </IconBtn>
              <IconBtn
                type="button"
                $active={toolbarOpen}
                aria-label="Toggle drawing toolbar"
                title="Draw"
                aria-expanded={toolbarOpen}
                onClick={() => { setNotesExpanded(true); setToolbarOpen(!toolbarOpen); }}
              >
                <Icon name="pencil" size={16} strokeWidth={2} />
              </IconBtn>
              <IconBtn
                type="button"
                $danger
                aria-label="Delete entry"
                title="Delete"
                onClick={() => entryId && onDelete?.()}
                style={{ opacity: entryId ? 1 : 0.35, cursor: entryId ? 'pointer' : 'default' }}
              >
                <Icon name="trash" size={16} strokeWidth={2} />
              </IconBtn>
            </EdActions>
          </EdTopicRow>

          {imageError && <ImageErrorText>{imageError}</ImageErrorText>}

          {/* Rich text editor — collapsed for field-only entries */}
          {editorCollapsed && (
            <AddNotesBtn type="button" onClick={() => setNotesExpanded(true)}>
              <Icon name="plus" size={13} strokeWidth={2.5} />
              Add notes
            </AddNotesBtn>
          )}
          <EditorArea $hidden={editorCollapsed}>
            <Editor
              content={content}
              onChange={onContentChange}
              placeholder={placeholder}
              onEnterSave={canSave && !isSaving ? onSave : undefined}
              toolbarOpen={toolbarOpen}
              onToolbarToggle={setToolbarOpen}
              hideToolbarToggle
              dictationControlRef={dictationControlRef}
            />
          </EditorArea>

          {/* Custom fields, below editor */}
          {customType && (
            <CustomFieldsSection>
                <CustomFieldsBody>
                  <FieldRowLayoutContext.Provider value={true}>
                  {customType === 'task' && <TaskFields values={{ isInProgress: false, isCompleted: false, isAutoMigrating: true, parentGoalId: null, parentMilestoneId: null, priority: 'none', deadline: '', ...customFields } as TaskFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} goalOptions={goalOptions} milestoneOptions={milestoneOptions} />}
                  {customType === 'goal' && <GoalFields values={{ goalType: 'short_term', goalStatus: 'new', targetDate: '', ...customFields } as GoalFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                  {customType === 'milestone' && <MilestoneFields values={{ milestoneStatus: 'not_started', targetDate: '', isCompleted: false, parentGoalId: null, ...customFields } as MilestoneFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} goalOptions={goalOptions} linkedTasks={linkedTasks} onToggleTaskComplete={handleToggleTaskComplete} onUnlinkTask={handleUnlinkTask} />}
                  {customType === 'food' && <FoodFields values={{ mealType: 'breakfast', consumedDate: '', consumedTime: '', ingredients: '', calories: '', notes: '', ...customFields } as FoodFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                  {customType === 'medication' && <MedicationFields values={{ dosage: '', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: '', ...customFields } as MedicationFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                  {customType === 'symptom' && <SymptomFields values={{ severity: 5, occurredDate: '', occurredTime: '', duration: '', notes: '', ...customFields } as SymptomFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                  {customType === 'exercise' && <ExerciseFields values={{ exerciseType: 'running', duration: '', intensity: 'medium', distance: '', distanceUnit: 'miles', calories: '', performedDate: '', performedTime: '', notes: '', ...customFields } as ExerciseFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                  {customType === 'event' && <EventFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', location: '', address: '', phone: '', notes: '', ...customFields } as EventFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} showCalendarSync={calendarSyncEnabled} />}
                  {customType === 'meeting' && <MeetingFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', meetingTopic: '', attendees: '', location: '', address: '', phone: '', notes: '', ...customFields } as MeetingFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} showCalendarSync={calendarSyncEnabled} />}
                  {customType === 'allergy' && <AllergyFields values={{ allergen: '', severity: 5, reaction: '', occurredDate: '', occurredTime: '', notes: '', ...customFields } as AllergyFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                  {customType === 'shopping_list' && <ShoppingListFields values={{ items: [], notes: '', linkedRecipeIds: [], ...(customFields as Partial<ShoppingListFieldValues>) } as ShoppingListFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} recipeOptions={recipeOptions} />}
                  {customType === 'recipe' && <RecipeFields values={{ servings: '', prepTime: '', cookTime: '', cuisine: '', ingredients: [], instructions: '', linkedShoppingListIds: [], ...(customFields as Partial<RecipeFieldValues>) } as RecipeFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} shoppingListOptions={shoppingListOptions} />}
                  {customType === 'priorities' && <PrioritiesFields values={{ priorities: [], ...(customFields as Partial<PrioritiesFieldValues>) } as PrioritiesFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} />}
                  {customType === 'wellness' && <WellnessFields values={{ date: '', waterGlasses: 0, waterGoal: 8, moodScore: 0, sleepHours: 0, sleepQuality: 0, ...customFields } as WellnessFieldValues} onChange={v => onCustomFieldsChange(v as unknown as Record<string, unknown>)} cycleTrackingEnabled={cycleTrackingEnabled} onAutoSave={onAutoSave} />}
                  </FieldRowLayoutContext.Provider>
                </CustomFieldsBody>
            </CustomFieldsSection>
          )}

          {/* User-defined custom fields */}
          {userFieldDefs.length > 0 && (
            <CustomFieldsSection>
                <CustomFieldsBody>
                  <FieldRowLayoutContext.Provider value={true}>
                    <UserFieldsForm
                      fieldDefs={userFieldDefs}
                      values={(customFields._userFields as Record<string, unknown>) ?? {}}
                      onChange={vals => onCustomFieldsChange({ ...customFields, _userFields: vals })}
                    />
                  </FieldRowLayoutContext.Provider>
                </CustomFieldsBody>
            </CustomFieldsSection>
          )}

          {/* Image thumbnail strip at the bottom of the post */}
          {(imagesReady || images.length > 0) && (
            <EntryImageStrip
              images={images}
              featuredKey={featuredKey}
              uploading={imageUploading}
              onSetFeatured={key => onSetFeatured?.(key)}
              onRemove={key => onImageRemoved?.(key)}
              onOpen={setLightboxIndex}
            />
          )}
        </EdBody>
      </ScrollArea>

      {lightboxIndex !== null && images.length > 0 && (
        <EntryLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Footer — bottom-docked save/discard */}
      <SaveRow>
        <FooterLeft>
          {entryId && onDelete && (
            <FooterDeleteBtn type="button" onClick={onDelete} title="Delete entry">
              Delete
            </FooterDeleteBtn>
          )}
          {saveStatusNode}
        </FooterLeft>
        <SaveRowActions>
          <DiscardBtn onClick={onNew}>Discard changes</DiscardBtn>
          <SaveButton $disabled={!canSave || isSaving} disabled={!canSave || isSaving} onClick={onSave}>
            {isSaving ? <><Spinner size={14} /> Saving...</> : 'Save entry'}
          </SaveButton>
        </SaveRowActions>
      </SaveRow>
    </FormWrapper>
  );
}
