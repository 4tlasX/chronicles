import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faMinus, faLink, faTrash, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar } from '../atoms/ProgressBar.js';
import { Badge } from '../atoms/Badge.js';
import { Checkbox } from '../atoms/Checkbox.js';
import { InlineEditPanel } from '../molecules/InlineEditPanel.js';
import { SwipeActions } from '../molecules/SwipeActions.js';
import { Editor } from './Editor.js';
import { MilestoneFields, type MilestoneFieldValues } from '../molecules/fields/MilestoneFields.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { entries as entriesApi } from '../../services/api.js';
import type { MilestoneEntryData, TaskEntryData } from '../../types/goals.js';

const Card = styled.div<{ $editing?: boolean; $dragging?: boolean }>`
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  background: ${({ $dragging, theme }) => $dragging ? theme.colors.surfaceHover : 'transparent'};
  opacity: ${({ $dragging }) => $dragging ? 0.6 : 1};
  min-width: 0;
  touch-action: manipulation;
`;

const DragHandle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  padding: 0;
  cursor: grab;
  flex-shrink: 0;
  font-size: 11px;
  opacity: 0;
  transition: opacity 150ms;
  ${Card}:hover & { opacity: 1; }
  &:active { cursor: grabbing; }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 16px 24px 20px;
  cursor: pointer;
  @media (max-width: 768px) { padding: 14px 16px 18px; }
  @media (max-width: 480px) { padding: 12px 12px 16px; gap: 6px; flex-wrap: wrap; }
`;

const ContentWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const Meta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  @media (max-width: 480px) { display: none; }
`;

const MilestoneCheckButton = styled.button<{ $state: 'none' | 'progress' | 'done'; $color: string }>`
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
  padding: 0;
  transition: all 0.15s;
  color: ${({ $state }) => $state === 'done' ? 'white' : 'inherit'};
  font-size: 10px;
  &:hover { opacity: 0.8; }
`;

const Title = styled.div<{ $completed?: boolean }>`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme, $completed }) => $completed ? theme.colors.textMuted : theme.colors.text};
  text-decoration: ${({ $completed }) => $completed ? 'line-through' : 'none'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const TypeLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.text};
  flex-shrink: 0;
`;

const TaskRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
`;

const TaskTitle = styled.span<{ $completed?: boolean }>`
  flex: 1;
  color: ${({ theme, $completed }) => $completed ? theme.colors.textMuted : theme.colors.text};
  text-decoration: ${({ $completed }) => $completed ? 'line-through' : 'none'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const RemoveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.text}; background: rgba(0,0,0,0.06); }
`;

const TaskCountLabel = styled.div`
  padding: 16px 24px 8px;
  @media (max-width: 768px) { padding: 16px 16px 8px; }
  @media (max-width: 480px) { padding: 16px 12px 8px; }
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TaskSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 24px;
  padding-top: 16px;
  margin-bottom: 4px;
`;

const LinkedGoalLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
  white-space: nowrap;
  @media (max-width: 480px) { display: none; }
`;

const AddTaskRow = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
`;

const LinkSelect = styled.select`
  flex: 1;
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  appearance: none;
  cursor: pointer;
  &:focus { border-color: ${({ theme }) => theme.colors.text}; }
`;

const AddTaskInput = styled.input`
  flex: 1;
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.text}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

const AddTaskBtn = styled.button<{ $color: string }>`
  padding: 4px 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: rgba(0,0,0,0.04); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

interface MilestoneCardProps {
  milestone: MilestoneEntryData;
  tasks: TaskEntryData[];
  goalTitle: string | null;
  goalOptions: { id: number; title: string }[];
  headerColor: string;
  isEditing: boolean;
  onSelect: () => void;
  onClose: () => void;
  onSaved: () => void;
  onToggleTask: (t: TaskEntryData) => void;
  onUnlinkTask: (t: TaskEntryData) => void;
  onCreateTask: (milestoneId: number, title: string) => Promise<void>;
  onLinkTask?: (milestoneId: number, taskId: number) => void;
}

export function MilestoneCard({ milestone, tasks, goalTitle, goalOptions, headerColor, isEditing, onSelect, onClose, onSaved, onToggleTask, onUnlinkTask, onCreateTask, onLinkTask }: MilestoneCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: milestone.id });
  const dragStyle = { transform: CSS.Transform.toString(transform), transition };

  const { encryptPost } = useEncryption();
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const removeEntry = useEntriesStore(s => s.removeEntry);

  const [editContent, setEditContent] = useState(milestone.content);
  const [editFields, setEditFields] = useState<MilestoneFieldValues>({
    milestoneStatus: (milestone.milestoneStatus as MilestoneFieldValues['milestoneStatus']) || 'active',
    targetDate: milestone.targetDate,
    isCompleted: milestone.isCompleted,
    parentGoalId: milestone.parentGoalId,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Reset edit state when card opens for editing
  useEffect(() => {
    if (isEditing) {
      setEditContent(milestone.content);
      setEditFields({
        milestoneStatus: (milestone.milestoneStatus as MilestoneFieldValues['milestoneStatus']) || 'active',
        targetDate: milestone.targetDate,
        isCompleted: milestone.isCompleted,
        parentGoalId: milestone.parentGoalId,
      });
      setStatus('');
      setNewTaskTitle('');
    }
  }, [isEditing, milestone.content, milestone.milestoneStatus, milestone.targetDate, milestone.isCompleted, milestone.parentGoalId]);

  const linkedTasks = tasks.filter(t => t.parentMilestoneId === milestone.id);
  const availableTasks = tasks.filter(t => t.parentMilestoneId !== milestone.id);
  const completedCount = linkedTasks.filter(t => t.isCompleted).length;
  const progress = linkedTasks.length > 0 ? Math.round((completedCount / linkedTasks.length) * 100) : 0;

  // Three-click cycle: not started → active (in progress) → completed → not started
  const checkState = milestone.isCompleted ? 'done' : milestone.milestoneStatus === 'active' ? 'progress' : 'none';

  const handleStatusCycle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let newCf: Record<string, unknown>;
    if (checkState === 'none') {
      newCf = { ...milestone.customFields, milestoneStatus: 'active', isCompleted: false };
    } else if (checkState === 'progress') {
      newCf = { ...milestone.customFields, milestoneStatus: 'completed', isCompleted: true };
    } else {
      newCf = { ...milestone.customFields, milestoneStatus: 'archived', isCompleted: false };
    }
    const metadata: Record<string, unknown> = { _taxonomyId: milestone.taxonomyId, _customFields: newCf };
    try {
      const encrypted = await encryptPost(milestone.content, metadata);
      await entriesApi.update(milestone.id, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: [milestone.taxonomyId],
      });
      updateDecryptedEntry(milestone.id, { metadata });
    } catch (err) {
      console.error('Milestone status update failed:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true); setStatus('');
    try {
      const cf = { ...milestone.customFields, ...editFields };
      const metadata: Record<string, unknown> = { _taxonomyId: milestone.taxonomyId, _customFields: cf };
      const encrypted = await encryptPost(editContent, metadata);
      await entriesApi.update(milestone.id, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: [milestone.taxonomyId],
      });
      updateDecryptedEntry(milestone.id, { content: editContent, metadata });
      onSaved();
    } catch (err) { console.error('Milestone save failed:', err); setStatus('Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await entriesApi.delete(milestone.id); removeEntry(milestone.id); onClose(); }
    catch { setStatus('Delete failed'); }
  };

  return (
    <Card ref={setNodeRef} style={dragStyle} $editing={isEditing} $dragging={isDragging}>
      <SwipeActions onDelete={handleDelete} accentColor={headerColor} disabled={isEditing || isDragging}>
      <CardHeader onClick={onSelect}>
        <DragHandle {...attributes} {...listeners} onClick={e => e.stopPropagation()} title="Drag to reorder">
          <FontAwesomeIcon icon={faGripVertical} />
        </DragHandle>
        <MilestoneCheckButton
          $state={checkState}
          $color={headerColor}
          onClick={handleStatusCycle}
          title={checkState === 'none' ? 'Click: In Progress' : checkState === 'progress' ? 'Click: Completed' : 'Click: Not Started'}
        >
          {checkState === 'done' && <FontAwesomeIcon icon={faCheck} />}
          {checkState === 'progress' && <FontAwesomeIcon icon={faMinus} />}
        </MilestoneCheckButton>
        <ContentWrap>
          <Title $completed={milestone.isCompleted}>{milestone.title}</Title>
          <Meta>
            <span>Status: {milestone.isCompleted ? 'Completed' : (milestone.milestoneStatus || '').replace(/_/g, ' ')}</span>
            {milestone.targetDate && <span>Target: {new Date(milestone.targetDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          </Meta>
          {linkedTasks.length > 0 && <div style={{ marginTop: 8 }}><ProgressBar percent={progress} color={headerColor} /></div>}
        </ContentWrap>
        {goalTitle && !isEditing && (
          <LinkedGoalLabel>
            <FontAwesomeIcon icon={faLink} style={{ fontSize: 10 }} />
            Goal: {goalTitle}
          </LinkedGoalLabel>
        )}
      </CardHeader>
      {isEditing && (
        <InlineEditPanel
          title="Editing Milestone"
          editor={<Editor content={editContent} onChange={setEditContent} placeholder="Milestone description..." />}
          fields={
            <>
              <MilestoneFields
                values={editFields}
                onChange={setEditFields}
                goalOptions={goalOptions}
                linkedTasks={linkedTasks.map(t => ({ id: t.id, title: t.title, isCompleted: t.isCompleted }))}
              />
              <TaskSectionLabel>Tasks ({completedCount}/{linkedTasks.length})</TaskSectionLabel>
              {linkedTasks.map(t => (
                <TaskRow key={t.id}>
                  <Checkbox
                    checked={t.isCompleted}
                    onChange={() => onToggleTask(t)}
                  />
                  <TaskTitle $completed={t.isCompleted}>{t.title}</TaskTitle>
                  <RemoveBtn title="Remove from milestone" onClick={() => onUnlinkTask(t)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </RemoveBtn>
                </TaskRow>
              ))}
              {onLinkTask && (
                <AddTaskRow onSubmit={e => e.preventDefault()}>
                  <LinkSelect
                    value=""
                    onChange={e => {
                      const id = parseInt(e.target.value);
                      if (id) onLinkTask(milestone.id, id);
                    }}
                  >
                    <option value="">Link task...</option>
                    {availableTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </LinkSelect>
                </AddTaskRow>
              )}
              <AddTaskRow onSubmit={async e => {
                e.preventDefault();
                if (!newTaskTitle.trim() || creatingTask) return;
                setCreatingTask(true);
                try {
                  await onCreateTask(milestone.id, newTaskTitle.trim());
                  setNewTaskTitle('');
                } finally { setCreatingTask(false); }
              }}>
                <AddTaskInput
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Or create new task..."
                  disabled={creatingTask}
                />
                <AddTaskBtn $color={headerColor} type="submit" disabled={!newTaskTitle.trim() || creatingTask}>
                  {creatingTask ? '...' : 'Add'}
                </AddTaskBtn>
              </AddTaskRow>
            </>
          }
          accentColor={headerColor}
          saving={saving}
          status={status}
          onSave={handleSave}
          onCancel={onClose}
        />
      )}
      </SwipeActions>
    </Card>
  );
}
