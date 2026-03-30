import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InlineEditPanel } from '../molecules/InlineEditPanel.js';
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
import { Badge } from '../atoms/Badge.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { entries as entriesApi } from '../../services/api.js';
import { getTopicIcon } from '../../utils/topicIcons.js';
import { stripHtml } from '../../utils/stripHtml.js';
import type { DecryptedPost } from '@shared/crypto/types';
import type { Topic } from '../../types/topics.js';

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

/* ── Styled ── */

const Card = styled.div<{ $editing?: boolean }>`
  border: 1px solid ${({ theme, $editing }) => $editing ? theme.colors.accent : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: white;
  margin-bottom: 4px;
`;

const PreviewRow = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(0, 0, 0, 0.02); }
`;

const IconWrap = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Preview = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const DateLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
  margin-top: 2px;
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
}

export function EditableEntryCard({ entry, topic, headerColor, isEditing, onSelect, onClose, onDeleted, metaFields = [] }: EditableEntryCardProps) {
  const { encryptPost } = useEncryption();
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const removeEntry = useEntriesStore(s => s.removeEntry);

  const meta = entry.metadata as Record<string, unknown>;
  const cf = (meta?._customFields as Record<string, unknown>) || {};
  const taxonomyId = (meta?._taxonomyId as number) || 0;
  const customType = getCustomType(topic?.name);
  const preview = stripHtml(entry.content).slice(0, 120) || 'Empty entry';
  const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const [editContent, setEditContent] = useState(entry.content);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>(cf);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (isEditing) {
      setEditContent(entry.content);
      setCustomFields((entry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {});
      setStatus('');
    }
  }, [isEditing, entry.content, entry.metadata]);

  const handleSave = async () => {
    setSaving(true); setStatus('');
    try {
      const metadata: Record<string, unknown> = { _taxonomyId: taxonomyId };
      if (Object.keys(customFields).length > 0) metadata._customFields = customFields;
      const encrypted = await encryptPost(editContent, metadata);
      await entriesApi.update(entry.id, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: taxonomyId ? [taxonomyId] : [],
      });
      updateDecryptedEntry(entry.id, { content: editContent, metadata });
      setStatus('Saved');
      setTimeout(() => { setStatus(''); onClose(); }, 800);
    } catch (err) {
      console.error('Entry save failed:', err);
      setStatus('Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry?')) return;
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
      if (v == null) return null;
      return { label: f.label, value: typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v) };
    })
    .filter((m): m is { label: string; value: string } => m != null);

  // Render custom fields based on topic type
  const renderFields = () => {
    if (!customType) return null;
    const onChange = (v: Record<string, unknown>) => setCustomFields(v as Record<string, unknown>);
    switch (customType) {
      case 'task': return <TaskFields values={{ isInProgress: false, isCompleted: false, isAutoMigrating: true, parentMilestoneId: null, ...customFields } as never} onChange={onChange as never} />;
      case 'goal': return <GoalFields values={{ goalType: 'short_term', goalStatus: 'active', targetDate: '', ...customFields } as never} onChange={onChange as never} />;
      case 'milestone': return <MilestoneFields values={{ milestoneStatus: 'active', targetDate: '', isCompleted: false, parentGoalId: null, ...customFields } as never} onChange={onChange as never} goalOptions={[]} />;
      case 'food': return <FoodFields values={{ mealType: 'breakfast', consumedDate: '', consumedTime: '', ingredients: '', calories: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'medication': return <MedicationFields values={{ dosage: '', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'symptom': return <SymptomFields values={{ severity: 5, occurredDate: '', occurredTime: '', duration: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'exercise': return <ExerciseFields values={{ exerciseType: 'running', duration: '', intensity: 'medium', distance: '', distanceUnit: 'miles', calories: '', performedDate: '', performedTime: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'event': return <EventFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', location: '', address: '', phone: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'meeting': return <MeetingFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', meetingTopic: '', attendees: '', location: '', address: '', phone: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      default: return null;
    }
  };

  return (
    <Card $editing={isEditing}>
      <PreviewRow onClick={onSelect}>
        {topic && (
          <IconWrap $color={headerColor}>
            <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
          </IconWrap>
        )}
        <Content>
          <Preview>{preview}</Preview>
          {metaValues.length > 0 && (
            <Meta>{metaValues.map(m => <span key={m.label}>{m.label}: {m.value}</span>)}</Meta>
          )}
        </Content>
        <DateLabel>{dateStr}</DateLabel>
      </PreviewRow>

      {isEditing && (
        <InlineEditPanel
          editor={<Editor content={editContent} onChange={setEditContent} placeholder="Edit entry..." />}
          fields={renderFields()}
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
