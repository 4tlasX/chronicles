import { useState, useMemo, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { TwoPanelTemplate } from '../components/templates/TwoPanelTemplate.js';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { TopicSidebarPanel } from '../components/organisms/TopicSidebarPanel.js';
import { TopicEntryList } from '../components/organisms/TopicEntryList.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { topics as topicsApi } from '../services/api.js';

export function TopicsView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const allTopics = useEntriesStore(s => s.allTopics);
  const topics = useEntriesStore(s => s.topics);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const setTopics = useEntriesStore(s => s.setTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#4A5568';

  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [mobileShowEntries, setMobileShowEntries] = useState(false);

  // Edit form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState<string | null>(null);

  const entryCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const entry of entries) {
      const taxId = entry.metadata?._taxonomyId as number | undefined;
      if (taxId) counts.set(taxId, (counts.get(taxId) || 0) + 1);
    }
    return counts;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (selectedTopicId === null) return entries;
    return entries.filter(e => e.metadata?._taxonomyId === selectedTopicId);
  }, [entries, selectedTopicId]);

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  const handleAdd = useCallback(async (name: string, icon: string | null) => {
    const created = await topicsApi.create({ name, icon: icon || undefined });
    setTopics([...allTopics, created]);
  }, [allTopics, setTopics]);

  const handleEditSave = useCallback(async () => {
    if (editingId === null || !editName.trim()) return;
    try {
      const updated = await topicsApi.update(editingId, { name: editName.trim(), icon: editIcon || undefined });
      setTopics(allTopics.map(t => t.id === editingId ? updated : t));
    } catch (err) { console.error('Failed to update topic:', err); }
  }, [editingId, editName, editIcon, allTopics, setTopics]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await topicsApi.delete(id);
      setTopics(allTopics.filter(t => t.id !== id));
      if (selectedTopicId === id) setSelectedTopicId(null);
    } catch (err) { console.error('Failed to delete topic:', err); }
  }, [allTopics, setTopics, selectedTopicId]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = topics.findIndex(t => t.id === active.id);
    const newIndex = topics.findIndex(t => t.id === over.id);
    const reorderedVisible = arrayMove(topics, oldIndex, newIndex);
    const visibleIds = new Set(topics.map(t => t.id));
    const hidden = allTopics.filter(t => !visibleIds.has(t.id));
    const reordered = [...reorderedVisible, ...hidden];
    setTopics(reordered);
    try { await topicsApi.reorder(reordered.map(t => t.id)); }
    catch (err) { console.error('Failed to reorder topics:', err); }
  }, [allTopics, topics, setTopics]);

  const handleSelectTopic = (id: number | null) => {
    setSelectedTopicId(id);
    setMobileShowEntries(true);
  };

  if (needsUnlock) return (
    <>
      <ContentTemplate><EmptyState message="Unlock your journal to view topics" /></ContentTemplate>
      <UnlockDialog onUnlock={handleUnlock} />
    </>
  );

  if (isLoading || !isReady) return (
    <ContentTemplate>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Spinner size={40} />
      </div>
    </ContentTemplate>
  );

  return (
    <TwoPanelTemplate>
      <TopicSidebarPanel
        topics={topics}
        selectedTopicId={selectedTopicId}
        totalEntryCount={entries.length}
        entryCounts={entryCounts}
        headerColor={headerColor}
        hiddenMobile={mobileShowEntries}
        editingId={editingId}
        editName={editName}
        editIcon={editIcon}
        onEditNameChange={setEditName}
        onEditIconChange={setEditIcon}
        onEditSave={handleEditSave}
        onEditCancel={() => setEditingId(null)}
        onSelectTopic={handleSelectTopic}
        onStartEdit={topic => { setEditingId(topic.id); setEditName(topic.name); setEditIcon(topic.icon); }}
        onDelete={handleDelete}
        onDragEnd={handleDragEnd}
        onAdd={handleAdd}
      />

      <TopicEntryList
        title={selectedTopic ? selectedTopic.name : 'All Topics'}
        entries={filteredEntries}
        allTopics={allTopics}
        headerColor={headerColor}
        hiddenMobile={!mobileShowEntries}
        onMobileBack={() => setMobileShowEntries(false)}
        onBackToJournal={() => { setSelectedTopicId(null); setMobileShowEntries(false); }}
        backLabel="Back to Topics"
        selectedTopic={selectedTopic}
        entryCount={selectedTopic ? (entryCounts.get(selectedTopic.id) ?? 0) : entries.length}
      />
    </TwoPanelTemplate>
  );
}
