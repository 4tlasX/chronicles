import { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { InlineEditPanel } from '../molecules/InlineEditPanel.js';
import { Editor } from './Editor.js';
import { TaskFields } from '../molecules/fields/TaskFields.js';
import { FoodFields } from '../molecules/fields/FoodFields.js';
import { MedicationFields } from '../molecules/fields/MedicationFields.js';
import { SymptomFields } from '../molecules/fields/SymptomFields.js';
import { ExerciseFields } from '../molecules/fields/ExerciseFields.js';
import { EventFields } from '../molecules/fields/EventFields.js';
import { MeetingFields } from '../molecules/fields/MeetingFields.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { entries as entriesApi } from '../../services/api.js';
import type { Topic } from '../../types/topics.js';

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', food: 'food', medication: 'medication', symptom: 'symptom',
  exercise: 'exercise', event: 'event', meeting: 'meeting',
};

function getCustomType(topicName: string | undefined): string | null {
  if (!topicName) return null;
  return TOPIC_TO_TYPE[topicName.toLowerCase()] || null;
}

const AddButton = styled.button<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $color }) => $color};
  background: none;
  border: 1px dashed ${({ $color }) => $color}50;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  cursor: pointer;
  width: 100%;
  margin-bottom: 8px;
  transition: background 0.1s;
  &:hover { background: ${({ $color }) => $color}08; }
`;

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: ${({ theme }) => theme.colors.surface};
  margin-bottom: 8px;
`;

interface NewEntryCardProps {
  /** Topic to pre-tag the new entry with */
  topic: Topic;
  headerColor: string;
}

export function NewEntryCard({ topic, headerColor }: NewEntryCardProps) {
  const { encryptPost } = useEncryption();
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  const customType = getCustomType(topic.name);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true); setStatus('');
    try {
      const metadata: Record<string, unknown> = { _taxonomyId: topic.id };
      if (Object.keys(customFields).length > 0) metadata._customFields = customFields;
      const encrypted = await encryptPost(content, metadata);
      const result = await entriesApi.create({
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        isEncrypted: true, taxonomyIds: [topic.id],
      });
      addDecryptedEntry({
        id: result.id as number, content, metadata, isEncrypted: true,
        createdAt: new Date(result.createdAt as string),
        updatedAt: new Date((result.updatedAt || result.createdAt) as string),
      });
      setContent(''); setCustomFields({}); setStatus('Created');
      setTimeout(() => { setStatus(''); setIsOpen(false); }, 600);
    } catch (err) {
      console.error('Create entry failed:', err);
      setStatus('Failed');
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setIsOpen(false); setContent(''); setCustomFields({}); setStatus('');
  };

  const renderFields = () => {
    if (!customType) return null;
    const onChange = (v: Record<string, unknown>) => setCustomFields(v as Record<string, unknown>);
    switch (customType) {
      case 'task': return <TaskFields values={{ isInProgress: false, isCompleted: false, isAutoMigrating: true, parentMilestoneId: null, ...customFields } as never} onChange={onChange as never} />;
      case 'food': return <FoodFields values={{ mealType: 'breakfast', consumedDate: '', consumedTime: '', ingredients: '', calories: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'medication': return <MedicationFields values={{ dosage: '', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'symptom': return <SymptomFields values={{ severity: 5, occurredDate: '', occurredTime: '', duration: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'exercise': return <ExerciseFields values={{ exerciseType: 'running', duration: '', intensity: 'medium', distance: '', distanceUnit: 'miles', calories: '', performedDate: '', performedTime: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'event': return <EventFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', location: '', address: '', phone: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      case 'meeting': return <MeetingFields values={{ startDate: '', startTime: '', endDate: '', endTime: '', meetingTopic: '', attendees: '', location: '', address: '', phone: '', notes: '', ...customFields } as never} onChange={onChange as never} />;
      default: return null;
    }
  };

  if (!isOpen) {
    return (
      <AddButton $color={headerColor} onClick={() => setIsOpen(true)}>
        <FontAwesomeIcon icon={faPlus} /> New {topic.name} Entry
      </AddButton>
    );
  }

  return (
    <Card>
      <InlineEditPanel
        editor={<Editor content={content} onChange={setContent} placeholder={`Write a new ${topic.name.toLowerCase()} entry...`} />}
        fields={renderFields()}
        accentColor={headerColor}
        saving={saving}
        status={status}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleCancel}
      />
    </Card>
  );
}
