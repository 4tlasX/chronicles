import styled from 'styled-components';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { EntryCard } from './EntryCard.js';
import { getTopicIcon } from '../../utils/topicIcons.js';
import { useMemo, useCallback } from 'react';

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', goal: 'goal', milestone: 'milestone',
  food: 'food', medication: 'medication', symptom: 'symptom',
  exercise: 'exercise', event: 'event', meeting: 'meeting',
};

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  flex-shrink: 0;
  background: transparent;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm}px;
`;

const CHECKABLE_TYPES = new Set(['task', 'goal', 'milestone']);

interface EntryListProps {
  onToggleBookmark?: (entryId: number, isFavorite: boolean) => void;
}

export function EntryList({ onToggleBookmark }: EntryListProps = {}) {
  const entries = useEntriesStore(s => s.decryptedEntries);
  const topics = useEntriesStore(s => s.topics);
  const allTopics = useEntriesStore(s => s.allTopics);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const selectedEntryId = useUIStore(s => s.selectedEntryId);
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const viewMode = useUIStore(s => s.viewMode);
  const selectedDate = useUIStore(s => s.selectedDate);
  const searchKeyword = useUIStore(s => s.searchKeyword);
  const searchDateFrom = useUIStore(s => s.searchDateFrom);
  const searchDateTo = useUIStore(s => s.searchDateTo);

  const handleTopicClick = useCallback((topicId: number) => {
    setSelectedTopicId(topicId);
  }, [setSelectedTopicId]);

  const handleToggleBookmarkLocal = useCallback((entryId: number, isFavorite: boolean) => {
    // Optimistic store update
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    const meta = entry.metadata as Record<string, unknown>;
    const existingFields = (meta?._customFields as Record<string, unknown>) || {};
    const updatedFields = { ...existingFields, _isFavorite: isFavorite };
    const updatedMeta = { ...meta, _customFields: updatedFields };
    updateDecryptedEntry(entryId, { metadata: updatedMeta });
    // Delegate persist to parent if provided
    onToggleBookmark?.(entryId, isFavorite);
  }, [entries, updateDecryptedEntry, onToggleBookmark]);

  const handleToggleComplete = useCallback((entryId: number, completed: boolean) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    const meta = entry.metadata as Record<string, unknown>;
    const existingFields = (meta?._customFields as Record<string, unknown>) || {};
    const updatedFields = { ...existingFields, isCompleted: completed };
    const updatedMeta = { ...meta, _customFields: updatedFields };
    updateDecryptedEntry(entryId, { metadata: updatedMeta });
  }, [entries, updateDecryptedEntry]);

  const getTopicForEntry = (entry: { metadata: Record<string, unknown> }) => {
    const taxId = entry.metadata?._taxonomyId as number | undefined;
    return taxId ? topics.find(t => t.id === taxId) : undefined;
  };

  const getCustomType = (topicName: string | undefined): string | null => {
    if (!topicName) return null;
    return TOPIC_TO_TYPE[topicName.toLowerCase()] || null;
  };

  // Set of enabled (visible) topic IDs for fast lookup
  const enabledTopicIds = useMemo(() => new Set(topics.map(t => t.id)), [topics]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const meta = entry.metadata as Record<string, unknown>;
      const customFields = meta?._customFields as Record<string, unknown> | undefined;
      const taxId = meta?._taxonomyId as number | undefined;

      // Hide entries whose topic is disabled (exists in allTopics but not in filtered topics)
      if (taxId && !enabledTopicIds.has(taxId)) return false;

      // View mode filters
      if (viewMode === 'date') {
        const entryDate = new Date(entry.createdAt);
        if (
          entryDate.getFullYear() !== selectedDate.getFullYear() ||
          entryDate.getMonth() !== selectedDate.getMonth() ||
          entryDate.getDate() !== selectedDate.getDate()
        ) return false;
      }

      if (viewMode === 'tasks') {
        const taxId = meta?._taxonomyId as number | undefined;
        const topic = taxId ? topics.find(t => t.id === taxId) : undefined;
        const type = getCustomType(topic?.name);
        if (type !== 'task') return false;
      }

      if (viewMode === 'favorites') {
        if (!customFields?._isFavorite) return false;
      }

      // Topic filter
      if (selectedTopicId !== null) {
        if (meta?._taxonomyId !== selectedTopicId) return false;
      }

      // Keyword search (client-side on decrypted content + topic name)
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const contentMatch = entry.content.toLowerCase().includes(keyword);
        const metadataMatch = JSON.stringify(entry.metadata).toLowerCase().includes(keyword);
        const topic = taxId ? topics.find(t => t.id === taxId) : undefined;
        const topicMatch = topic?.name?.toLowerCase().includes(keyword) ?? false;
        if (!contentMatch && !metadataMatch && !topicMatch) return false;
      }

      // Date range
      if (searchDateFrom || searchDateTo) {
        const entryDate = new Date(entry.createdAt);
        if (searchDateFrom && entryDate < new Date(searchDateFrom)) return false;
        if (searchDateTo) {
          const toDate = new Date(searchDateTo);
          toDate.setHours(23, 59, 59, 999);
          if (entryDate > toDate) return false;
        }
      }

      return true;
    });
  }, [entries, topics, enabledTopicIds, selectedTopicId, selectedDate, viewMode, searchKeyword, searchDateFrom, searchDateTo]);

  if (filteredEntries.length === 0) {
    return <EmptyState>No entries yet</EmptyState>;
  }

  return (
    <ListContainer>
      {filteredEntries.map(entry => {
        const meta = entry.metadata as Record<string, unknown>;
        const customFields = meta?._customFields as Record<string, unknown> | undefined;
        const topic = getTopicForEntry(entry);
        const customType = getCustomType(topic?.name);
        const hasCheckbox = customType !== null && CHECKABLE_TYPES.has(customType);
        const isCompleted = hasCheckbox && !!customFields?.isCompleted;
        const isFavorite = !!customFields?._isFavorite;

        return (
          <EntryCard
            key={entry.id}
            id={entry.id}
            content={entry.content}
            date={entry.createdAt instanceof Date ? entry.createdAt.toISOString() : String(entry.createdAt)}
            topicName={topic?.name}
            topicColor={topic?.color || undefined}
            topicIcon={getTopicIcon(topic?.icon)}
            topicId={topic?.id}
            active={selectedEntryId === entry.id}
            onClick={() => setSelectedEntryId(entry.id)}
            onTopicClick={handleTopicClick}
            onToggleComplete={hasCheckbox ? handleToggleComplete : undefined}
            onToggleBookmark={handleToggleBookmarkLocal}
            hasCheckbox={hasCheckbox}
            isCompleted={isCompleted}
            isFavorite={isFavorite}
            customType={customType || undefined}
          />
        );
      })}
    </ListContainer>
  );
}
