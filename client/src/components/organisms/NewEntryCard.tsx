import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
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
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { entries as entriesApi } from '../../services/api.js';
import type { Topic } from '../../types/topics.js';

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', goal: 'goal', milestone: 'milestone',
  food: 'food', medication: 'medication', symptom: 'symptom',
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
  padding: 16px 24px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  border-radius: 0;
  cursor: pointer;
  width: 100%;
  @media (max-width: 768px) { padding: 14px 16px; }
  @media (max-width: 480px) { padding: 12px 12px; }
  background: rgba(0, 0, 0, 0.04);
`;

const Card = styled.div`
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  background: transparent;
`;

interface NewEntryCardProps {
  /** Topic to pre-tag the new entry with */
  topic: Topic;
  headerColor: string;
  onCreated?: (id: number) => void;
}

export function NewEntryCard({ topic, headerColor, onCreated }: NewEntryCardProps) {
  const { encryptPost } = useEncryption();
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);

  const goalOptions = useMemo(() => {
    const goalTopicId = allTopics.find(t => t.name.toLowerCase() === 'goal')?.id;
    if (!goalTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === goalTopicId)
      .map(e => {
        const content = e.content.replace(/<[^>]+>/g, '').slice(0, 80) || 'Untitled goal';
        return { id: e.id, title: content };
      });
  }, [entries, allTopics]);

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
      const newId = result.id as number;
      setContent(''); setCustomFields({}); setStatus('Created');
      setTimeout(() => { setStatus(''); setIsOpen(false); if (onCreated) onCreated(newId); }, 600);
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
      case 'task': return <TaskFields values={{ isInProgress: false, isCompleted: false, isAutoMigrating: true, parentMilestoneId: null, deadline: '', ...customFields } as never} onChange={onChange as never} />;
      case 'goal': return <GoalFields values={{ goalType: 'short_term', goalStatus: 'active', targetDate: '', ...customFields } as never} onChange={onChange as never} />;
      case 'milestone': return <MilestoneFields values={{ milestoneStatus: 'active', targetDate: '', isCompleted: false, parentGoalId: null, ...customFields } as never} onChange={onChange as never} goalOptions={goalOptions} />;
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
