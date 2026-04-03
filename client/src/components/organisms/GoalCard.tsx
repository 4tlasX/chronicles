import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from '../atoms/DragHandle.js';
import { ProgressBar } from '../atoms/ProgressBar.js';
import { Badge } from '../atoms/Badge.js';
import { Checkbox } from '../atoms/Checkbox.js';
import { Spinner } from '../atoms/Spinner.js';
import { InlineEditPanel } from '../molecules/InlineEditPanel.js';
import { Editor } from './Editor.js';
import { GoalFields, type GoalFieldValues } from '../molecules/fields/GoalFields.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { entries as entriesApi } from '../../services/api.js';
import type { GoalEntry, MilestoneEntryData } from '../../types/goals.js';

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  completed: '#6366f1',
  archived: '#9ca3af',
};

const Card = styled.div<{ $isDragging?: boolean; $editing?: boolean }>`
  border: 1px solid ${({ theme, $editing }) => $editing ? theme.colors.accent : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: ${({ theme }) => theme.colors.surface};
  opacity: ${({ $isDragging }) => $isDragging ? 0.7 : 1};
  box-shadow: ${({ $isDragging }) => $isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px ${({ theme }) => theme.borderRadius.lg}px 0 0;
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

const MilestoneCountLabel = styled.div`
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const MilestoneSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 12px;
  margin-bottom: 4px;
`;

const MilestoneRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
`;

const MilestoneTitle = styled.span<{ $completed?: boolean }>`
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

const AddRow = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const AddInput = styled.input`
  flex: 1;
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.accent}; }
`;

const AddBtn = styled.button<{ $color: string }>`
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

interface GoalCardProps {
  goal: GoalEntry;
  milestones: MilestoneEntryData[];
  headerColor: string;
  isEditing: boolean;
  onSelect: () => void;
  onClose: () => void;
  onSaved: () => void;
  onToggleMilestone: (m: MilestoneEntryData) => void;
  onUnlinkMilestone: (m: MilestoneEntryData) => void;
  onCreateMilestone: (goalId: number, title: string) => Promise<void>;
}

export function GoalCard({ goal, milestones, headerColor, isEditing, onSelect, onClose, onSaved, onToggleMilestone, onUnlinkMilestone, onCreateMilestone }: GoalCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: goal.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const { encryptPost } = useEncryption();
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const removeEntry = useEntriesStore(s => s.removeEntry);

  const [editContent, setEditContent] = useState(goal.content);
  const [editFields, setEditFields] = useState<GoalFieldValues>({
    goalType: (goal.goalType as GoalFieldValues['goalType']) || 'short_term',
    goalStatus: (goal.goalStatus as GoalFieldValues['goalStatus']) || 'active',
    targetDate: goal.targetDate,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  // Reset edit state when card opens for editing
  useEffect(() => {
    if (isEditing) {
      setEditContent(goal.content);
      setEditFields({
        goalType: (goal.goalType as GoalFieldValues['goalType']) || 'short_term',
        goalStatus: (goal.goalStatus as GoalFieldValues['goalStatus']) || 'active',
        targetDate: goal.targetDate,
      });
      setStatus('');
    }
  }, [isEditing, goal.content, goal.goalType, goal.goalStatus, goal.targetDate]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [creatingMilestone, setCreatingMilestone] = useState(false);

  const linkedMilestones = milestones.filter(m => m.parentGoalId === goal.id);
  const completedCount = linkedMilestones.filter(m => m.isCompleted).length;
  const progress = linkedMilestones.length > 0 ? Math.round((completedCount / linkedMilestones.length) * 100) : 0;

  const handleSave = async () => {
    setSaving(true); setStatus('');
    try {
      const cf = { ...goal.customFields, ...editFields };
      const metadata: Record<string, unknown> = { _taxonomyId: goal.taxonomyId, _customFields: cf };
      const encrypted = await encryptPost(editContent, metadata);
      await entriesApi.update(goal.id, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: [goal.taxonomyId],
      });
      updateDecryptedEntry(goal.id, { content: editContent, metadata });
      setStatus('Saved');
      setTimeout(() => { setStatus(''); onSaved(); }, 800);
    } catch (err) { console.error('Goal save failed:', err); setStatus('Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this goal?')) return;
    try { await entriesApi.delete(goal.id); removeEntry(goal.id); onClose(); }
    catch { setStatus('Delete failed'); }
  };

  return (
    <Card ref={setNodeRef} style={style} $isDragging={isDragging} $editing={isEditing}>
      <CardHeader onClick={onSelect}>
        <DragHandle {...attributes} {...listeners} onClick={e => e.stopPropagation()} />
        <Title $completed={goal.goalStatus === 'completed'}>{goal.title}</Title>
        <TypeLabel>{goal.goalType === 'short_term' ? 'Short' : 'Long'}</TypeLabel>
        <Badge color={STATUS_COLORS[goal.goalStatus] || '#9ca3af'} capitalize>{goal.goalStatus}</Badge>
        {goal.targetDate && <TypeLabel>{goal.targetDate}</TypeLabel>}
      </CardHeader>

      {linkedMilestones.length > 0 && !isEditing && (
        <>
          <ProgressBar percent={progress} color={headerColor} />
          <MilestoneCountLabel>Milestones ({completedCount}/{linkedMilestones.length})</MilestoneCountLabel>
        </>
      )}

      {isEditing && (
        <InlineEditPanel
          editor={<Editor content={editContent} onChange={setEditContent} placeholder="Goal description..." />}
          fields={
            <>
              <GoalFields values={editFields} onChange={setEditFields} />
              <MilestoneSectionLabel>Milestones ({completedCount}/{linkedMilestones.length})</MilestoneSectionLabel>
              {linkedMilestones.map(m => (
                <MilestoneRow key={m.id}>
                  <Checkbox
                    checked={m.isCompleted}
                    onChange={() => onToggleMilestone(m)}
                  />
                  <MilestoneTitle $completed={m.isCompleted}>{m.title}</MilestoneTitle>
                  <RemoveBtn title="Remove from goal" onClick={() => onUnlinkMilestone(m)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </RemoveBtn>
                </MilestoneRow>
              ))}
              <AddRow onSubmit={async e => {
                e.preventDefault();
                if (!newMilestoneTitle.trim() || creatingMilestone) return;
                setCreatingMilestone(true);
                try {
                  await onCreateMilestone(goal.id, newMilestoneTitle.trim());
                  setNewMilestoneTitle('');
                } finally { setCreatingMilestone(false); }
              }}>
                <AddInput
                  value={newMilestoneTitle}
                  onChange={e => setNewMilestoneTitle(e.target.value)}
                  placeholder="Add a milestone..."
                  disabled={creatingMilestone}
                />
                <AddBtn $color={headerColor} type="submit" disabled={!newMilestoneTitle.trim() || creatingMilestone}>
                  {creatingMilestone ? '...' : 'Add'}
                </AddBtn>
              </AddRow>
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
