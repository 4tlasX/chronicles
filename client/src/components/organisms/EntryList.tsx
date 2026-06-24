import styled from 'styled-components';
import { useMemo, useCallback } from 'react';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { EntryCard } from './EntryCard.js';
import { entries as entriesApi } from '../../services/api.js';
import { stripHtml, summarizeUserFields } from '../../utils/stripHtml.js';

const TOPIC_TO_TYPE: Record<string, string> = {
  task: 'task', goal: 'goal', milestone: 'milestone',
  meals: 'food', medication: 'medication', symptom: 'symptom',
  exercise: 'exercise', event: 'event', meeting: 'meeting',
};

/* DS entry-type color palette for the left color bar.
   journal=teal, task=amber, event=blue, goal=lime, quote=purple, meal=rose. */
const TYPE_COLOR: Record<string, string> = {
  journal: 'var(--color-accent)',
  task: '#d97706',
  event: '#2563eb',
  meeting: '#2563eb',
  goal: '#65a30d',
  milestone: '#65a30d',
  quote: '#9333ea',
  meal: '#e11d48',
  food: '#e11d48',
  meals: '#e11d48',
};

/** Resolve the color-bar tint for an entry from its topic name, falling back
 *  to the topic's own stored color, then the accent. */
function topicBarColor(topicName: string | undefined, fallback: string | null | undefined): string | undefined {
  if (topicName) {
    const key = topicName.toLowerCase();
    if (TYPE_COLOR[key]) return TYPE_COLOR[key];
  }
  return fallback || 'var(--color-accent)';
}

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
  padding: var(--s-7, 32px);
  color: var(--text-secondary);
  font-size: var(--text-sm, 15px);
`;

const CHECKABLE_TYPES = new Set(['task', 'goal', 'milestone']);

// ── Helpers ────────────────────────────────────────────────────────

/** YYYY-MM-DD string in local time */
function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}


// ── Interface ──────────────────────────────────────────────────────

interface EntryListProps {
  onToggleBookmark?: (entryId: number, isFavorite: boolean) => void;
}

export function EntryList({ onToggleBookmark }: EntryListProps = {}) {
  const entries = useEntriesStore(s => s.decryptedEntries);
  const topics = useEntriesStore(s => s.topics);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const removeEntry = useEntriesStore(s => s.removeEntry);
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const selectedEntryId = useUIStore(s => s.selectedEntryId);
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const viewMode = useUIStore(s => s.viewMode);
  const selectedDate = useUIStore(s => s.selectedDate);
  const topicCustomFields = useUIStore(s => s.topicCustomFields);
  const searchKeyword = useUIStore(s => s.searchKeyword);
  const searchDateFrom = useUIStore(s => s.searchDateFrom);
  const searchDateTo = useUIStore(s => s.searchDateTo);

  const handleTopicClick = useCallback((topicId: number) => {
    setSelectedTopicId(topicId);
  }, [setSelectedTopicId]);

  const handleToggleBookmarkLocal = useCallback((entryId: number, isFavorite: boolean) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    const meta = entry.metadata as Record<string, unknown>;
    const existingFields = (meta?._customFields as Record<string, unknown>) || {};
    const updatedFields = { ...existingFields, _isFavorite: isFavorite };
    const updatedMeta = { ...meta, _customFields: updatedFields };
    updateDecryptedEntry(entryId, { metadata: updatedMeta });
    onToggleBookmark?.(entryId, isFavorite);
  }, [entries, updateDecryptedEntry, onToggleBookmark]);

  const handleDelete = useCallback(async (entryId: number) => {
    try {
      await entriesApi.delete(entryId);
      removeEntry(entryId);
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  }, [removeEntry]);

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

  const enabledTopicIds = useMemo(() => new Set(topics.map(t => t.id)), [topics]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const meta = entry.metadata as Record<string, unknown>;
      const customFields = meta?._customFields as Record<string, unknown> | undefined;
      const taxId = meta?._taxonomyId as number | undefined;

      // Orphaned mode: show only entries with topic ID that doesn't exist
      if (viewMode === 'orphaned') {
        return taxId !== undefined && !enabledTopicIds.has(taxId);
      }

      // Normal modes: hide orphaned entries
      if (taxId && !enabledTopicIds.has(taxId)) return false;

      if (viewMode === 'date') {
        const entryDate = new Date(entry.createdAt);
        if (
          entryDate.getFullYear() !== selectedDate.getFullYear() ||
          entryDate.getMonth() !== selectedDate.getMonth() ||
          entryDate.getDate() !== selectedDate.getDate()
        ) return false;
      }

      if (viewMode === 'tasks') {
        const tid = meta?._taxonomyId as number | undefined;
        const topic = tid ? topics.find(t => t.id === tid) : undefined;
        const type = getCustomType(topic?.name);
        if (type !== 'task') return false;
      }

      if (viewMode === 'favorites') {
        if (!customFields?._isFavorite) return false;
      }

      if (selectedTopicId !== null) {
        if (meta?._taxonomyId !== selectedTopicId) return false;
      }

      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const contentMatch = entry.content.toLowerCase().includes(keyword);
        const metadataMatch = JSON.stringify(entry.metadata).toLowerCase().includes(keyword);
        const topic = taxId ? topics.find(t => t.id === taxId) : undefined;
        const topicMatch = topic?.name?.toLowerCase().includes(keyword) ?? false;
        if (!contentMatch && !metadataMatch && !topicMatch) return false;
      }

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

  // Group entries by local date key, newest first
  const groups = useMemo(() => {
    const map = new Map<string, typeof filteredEntries>();
    for (const entry of filteredEntries) {
      const key = toLocalDateKey(new Date(entry.createdAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    // Sort groups descending (newest first)
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredEntries]);

  if (filteredEntries.length === 0) {
    return <EmptyState>{viewMode === 'orphaned' ? 'No orphaned entries' : 'No entries yet'}</EmptyState>;
  }

  return (
    <ListContainer>
      {groups.map(([dateKey, groupEntries]) => {
        return (
          <div key={dateKey}>
            {groupEntries.map(entry => {
              const meta = entry.metadata as Record<string, unknown>;
              const customFields = meta?._customFields as Record<string, unknown> | undefined;
              const topic = getTopicForEntry(entry);
              const customType = getCustomType(topic?.name);
              const hasCheckbox = customType !== null && CHECKABLE_TYPES.has(customType);
              const isCompleted = hasCheckbox && !!customFields?.isCompleted;
              const isFavorite = !!customFields?._isFavorite;

              let previewText: string | undefined;
              if (!stripHtml(entry.content).trim() && customFields) {
                if ((meta._widgetType as string) === 'wellness-checkin') {
                  const w = (customFields.waterGlasses as number) || 0;
                  const g = (customFields.waterGoal as number) || 8;
                  const m = (customFields.moodScore as number) || 0;
                  const s = (customFields.sleepHours as number) || 0;
                  const parts = [w > 0 ? `${w}/${g} glasses` : '', m > 0 ? `Mood ${m}/5` : '', s > 0 ? `${s}h sleep` : ''].filter(Boolean);
                  previewText = parts.join(' · ') || 'Wellness check-in';
                } else if (topic?.id) {
                  const defs = topicCustomFields[topic.id] ?? [];
                  const uf = (customFields._userFields as Record<string, unknown>) ?? {};
                  previewText = summarizeUserFields(defs, uf) || undefined;
                }
              }

              return (
                <EntryCard
                  key={entry.id}
                  id={entry.id}
                  content={entry.content}
                  date={entry.createdAt instanceof Date ? entry.createdAt.toISOString() : String(entry.createdAt)}
                  topicName={topic?.name}
                  topicColor={topicBarColor(topic?.name, topic?.color)}
                  topicId={topic?.id}
                  active={selectedEntryId === entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  onDelete={() => handleDelete(entry.id)}
                  onTopicClick={handleTopicClick}
                  onToggleComplete={hasCheckbox ? handleToggleComplete : undefined}
                  onToggleBookmark={handleToggleBookmarkLocal}
                  hasCheckbox={hasCheckbox}
                  isCompleted={isCompleted}
                  isFavorite={isFavorite}
                  customType={customType || undefined}
                  previewText={previewText}
                />
              );
            })}
          </div>
        );
      })}
    </ListContainer>
  );
}
