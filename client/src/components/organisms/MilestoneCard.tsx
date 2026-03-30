import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircle, faCircleHalfStroke, faLink, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar } from '../atoms/ProgressBar.js';
import { Badge } from '../atoms/Badge.js';
import { Checkbox } from '../atoms/Checkbox.js';
import { InlineEditPanel } from '../molecules/InlineEditPanel.js';
import { Editor } from './Editor.js';
import { MilestoneFields, type MilestoneFieldValues } from '../molecules/fields/MilestoneFields.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { entries as entriesApi } from '../../services/api.js';
import type { MilestoneEntryData, TaskEntryData } from '../../types/goals.js';

const Card = styled.div<{ $editing?: boolean }>`
  border: 1px solid ${({ theme, $editing }) => $editing ? theme.colors.accent : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: white;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px ${({ theme }) => theme.borderRadius.lg}px 0 0;
`;

const StatusIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 14px;
  flex-shrink: 0;
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
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
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
  padding: 8px 14px;
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
  margin-top: 12px;
  margin-bottom: 4px;
`;

const LinkedGoalLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 14px 8px;
`;

const AddTaskRow = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const AddTaskInput = styled.input`
  flex: 1;
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.accent}; }
`;

const AddTaskBtn = styled.button<{ $color: string }>`
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: ${({ $color }) => $color};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  white-space: nowrap;
  &:hover { opacity: 0.9; }
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
}

export function MilestoneCard({ milestone, tasks, goalTitle, goalOptions, headerColor, isEditing, onSelect, onClose, onSaved, onToggleTask, onUnlinkTask, onCreateTask }: MilestoneCardProps) {
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
  const completedCount = linkedTasks.filter(t => t.isCompleted).length;
  const progress = linkedTasks.length > 0 ? Math.round((completedCount / linkedTasks.length) * 100) : 0;

  const statusIcon = milestone.isCompleted ? faCircleCheck : milestone.milestoneStatus === 'active' ? faCircleHalfStroke : faCircle;
  const statusColor = milestone.isCompleted ? '#6366f1' : milestone.milestoneStatus === 'active' ? '#10b981' : '#9ca3af';

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
      setStatus('Saved');
      setTimeout(() => { setStatus(''); onSaved(); }, 800);
    } catch (err) { console.error('Milestone save failed:', err); setStatus('Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this milestone?')) return;
    try { await entriesApi.delete(milestone.id); removeEntry(milestone.id); onClose(); }
    catch { setStatus('Delete failed'); }
  };

  return (
    <Card $editing={isEditing}>
      <CardHeader onClick={onSelect}>
        <StatusIcon $color={statusColor}>
          <FontAwesomeIcon icon={statusIcon} />
        </StatusIcon>
        <Title $completed={milestone.isCompleted}>{milestone.title}</Title>
        <Badge color={statusColor} capitalize>
          {milestone.isCompleted ? 'Completed' : milestone.milestoneStatus}
        </Badge>
        {milestone.targetDate && <TypeLabel>{milestone.targetDate}</TypeLabel>}
      </CardHeader>

      {goalTitle && !isEditing && (
        <LinkedGoalLabel>
          <FontAwesomeIcon icon={faLink} style={{ fontSize: 10 }} />
          Goal: {goalTitle}
        </LinkedGoalLabel>
      )}

      {linkedTasks.length > 0 && !isEditing && (
        <>
          <ProgressBar percent={progress} color={headerColor} />
          <TaskCountLabel>Tasks ({completedCount}/{linkedTasks.length})</TaskCountLabel>
        </>
      )}

      {isEditing && (
        <InlineEditPanel
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
                  placeholder="Add a task..."
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
          onDelete={handleDelete}
        />
      )}
    </Card>
  );
}
