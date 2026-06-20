import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { ScrollList } from '../components/atoms/ScrollList.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { HeaderAddButton } from '../components/atoms/HeaderAddButton.js';
import { ViewHeader } from '../components/molecules/ViewHeader.js';
import { DayGroupedList } from '../components/molecules/DayGroupedList.js';
import { PlanningTabBar } from '../components/molecules/PlanningTabBar.js';
import { GoalCard } from '../components/organisms/GoalCard.js';
import { MilestoneCard } from '../components/organisms/MilestoneCard.js';
import { EditableEntryCard } from '../components/organisms/EditableEntryCard.js';
import { NewEntryCard } from '../components/organisms/NewEntryCard.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { entries as entriesApi } from '../services/api.js';
import { stripHtml } from '../utils/stripHtml.js';
import { useNavigate, useLocation } from 'react-router-dom';
import type { GoalEntry, MilestoneEntryData, TaskEntryData } from '../types/goals.js';

export function GoalsView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const accentColor = useUIStore(s => s.accentColor) || '#4A5568';
  const navigate = useNavigate();
  const location = useLocation();
  const { encryptPost } = useEncryption();

  const tabFromPath = location.pathname.endsWith('/milestones') ? 'milestones' as const
    : location.pathname.endsWith('/tasks') ? 'tasks' as const
    : location.pathname.endsWith('/todos') ? 'todos' as const : 'goals' as const;
  const [tab, setTab] = useState<'goals' | 'milestones' | 'tasks' | 'todos'>(tabFromPath);

  useEffect(() => {
    setTab(tabFromPath);
  }, [tabFromPath]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Resolve topic IDs
  const goalTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'goal')?.id, [allTopics]);
  const milestoneTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'milestone')?.id, [allTopics]);
  const taskTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'task')?.id, [allTopics]);

  // Parse entries into typed data
  const goals: GoalEntry[] = useMemo(() => {
    if (!goalTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === goalTopicId)
      .map(e => {
        const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
        return { id: e.id, content: e.content, title: stripHtml(e.content).slice(0, 120) || 'Untitled goal',
          goalType: (cf.goalType as string) || 'short_term', goalStatus: (cf.goalStatus as string) || 'active',
          targetDate: (cf.targetDate as string) || '', customFields: cf, taxonomyId: goalTopicId,
          createdAt: e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt) };
      });
  }, [entries, goalTopicId]);

  const milestones: MilestoneEntryData[] = useMemo(() => {
    if (!milestoneTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === milestoneTopicId)
      .map(e => {
        const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
        return { id: e.id, content: e.content, title: stripHtml(e.content).slice(0, 120) || 'Untitled milestone',
          milestoneStatus: (cf.milestoneStatus as string) || 'not_started', isCompleted: !!cf.isCompleted,
          targetDate: (cf.targetDate as string) || '', parentGoalId: (cf.parentGoalId as number) || null,
          customFields: cf, taxonomyId: milestoneTopicId,
          createdAt: e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt) };
      });
  }, [entries, milestoneTopicId]);

  const tasks: TaskEntryData[] = useMemo(() => {
    if (!taskTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === taskTopicId)
      .map(e => {
        const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
        return { id: e.id, content: e.content, title: stripHtml(e.content).slice(0, 80) || 'Untitled task',
          isCompleted: !!cf.isCompleted,
          parentGoalId: (cf.parentGoalId as number) || null,
          parentMilestoneId: (cf.parentMilestoneId as number) || null,
          priority: (cf.priority as string) || 'none', customFields: cf, taxonomyId: taskTopicId,
          createdAt: e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt) };
      });
  }, [entries, taskTopicId]);

  // Todos have no parent goal or milestone connection
  const todos = useMemo(() => tasks.filter(t => !t.parentMilestoneId && !t.parentGoalId), [tasks]);

  const goalOptions = useMemo(() => goals.map(g => ({ id: g.id, title: g.title })), [goals]);
  const goalTitles = useMemo(() => new Map(goals.map(g => [g.id, g.title])), [goals]);

  // Sorted lists
  const filteredGoals = useMemo(() =>
    [...goals].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  [goals]);

  const filteredMilestones = useMemo(() =>
    [...milestones].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  [milestones]);

  // Shared persist helper
  const persistEntry = useCallback(async (id: number, content: string, taxonomyId: number, customFields: Record<string, unknown>) => {
    const metadata: Record<string, unknown> = { _taxonomyId: taxonomyId, _customFields: customFields };
    updateDecryptedEntry(id, { metadata });
    const encrypted = await encryptPost(content, metadata);
    await entriesApi.update(id, {
      contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
      metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
      taxonomyIds: [taxonomyId],
    });
  }, [encryptPost, updateDecryptedEntry]);

  const handleToggleMilestone = useCallback(async (m: MilestoneEntryData) => {
    let newStatus: string, newCompleted: boolean;
    if (!m.isCompleted && m.milestoneStatus !== 'active') { newStatus = 'active'; newCompleted = false; }
    else if (!m.isCompleted) { newStatus = 'completed'; newCompleted = true; }
    else { newStatus = 'not_started'; newCompleted = false; }
    try {
      await persistEntry(m.id, m.content, m.taxonomyId, { ...m.customFields, milestoneStatus: newStatus, isCompleted: newCompleted });

      // Auto-update parent goal — read fresh from store
      if (m.parentGoalId && goalTopicId && milestoneTopicId) {
        const freshEntries = useEntriesStore.getState().decryptedEntries;

        const parentEntry = freshEntries.find(e => e.id === m.parentGoalId);
        if (parentEntry) {
          const parentCf = (parentEntry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
          const parentStatus = (parentCf.goalStatus as string) || 'active';

          const siblingMilestones = freshEntries
            .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === milestoneTopicId)
            .filter(e => {
              const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
              return cf.parentGoalId === m.parentGoalId;
            });

          const allCompleted = siblingMilestones.length > 0 && siblingMilestones.every(e => {
            const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
            return !!cf.isCompleted;
          });

          const anyIncomplete = siblingMilestones.some(e => {
            const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
            return !cf.isCompleted;
          });

          if (allCompleted && parentStatus !== 'completed') {
            await persistEntry(parentEntry.id, parentEntry.content, goalTopicId, { ...parentCf, goalStatus: 'completed' });
          } else if (anyIncomplete && parentStatus === 'completed') {
            await persistEntry(parentEntry.id, parentEntry.content, goalTopicId, { ...parentCf, goalStatus: 'active' });
          }
        }
      }
    }
    catch (err) { console.error('Failed to toggle milestone:', err); }
  }, [persistEntry, goalTopicId, milestoneTopicId]);

  const handleUnlinkMilestone = useCallback(async (m: MilestoneEntryData) => {
    try { await persistEntry(m.id, m.content, m.taxonomyId, { ...m.customFields, parentGoalId: null }); }
    catch (err) { console.error('Failed to unlink milestone:', err); }
  }, [persistEntry]);

  const handleToggleTask = useCallback(async (t: TaskEntryData) => {
    const newCompleted = !t.isCompleted;
    try {
      await persistEntry(t.id, t.content, t.taxonomyId, { ...t.customFields, isCompleted: newCompleted });

      // Auto-complete parent milestone when all tasks are done
      // Read fresh from store to avoid stale closure
      if (t.parentMilestoneId && milestoneTopicId && taskTopicId) {
        const freshEntries = useEntriesStore.getState().decryptedEntries;

        const parentEntry = freshEntries.find(e => e.id === t.parentMilestoneId);
        if (parentEntry) {
          const parentCf = (parentEntry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
          const parentIsCompleted = !!parentCf.isCompleted;

          const siblingTasks = freshEntries
            .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === taskTopicId)
            .filter(e => {
              const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
              return cf.parentMilestoneId === t.parentMilestoneId;
            });

          const allDone = siblingTasks.length > 0 && siblingTasks.every(e => {
            const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
            return !!cf.isCompleted;
          });

          const anyUndone = siblingTasks.some(e => {
            const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
            return !cf.isCompleted;
          });

          if (allDone && !parentIsCompleted) {
            await persistEntry(parentEntry.id, parentEntry.content, milestoneTopicId,
              { ...parentCf, milestoneStatus: 'completed', isCompleted: true });
          } else if (anyUndone && parentIsCompleted) {
            await persistEntry(parentEntry.id, parentEntry.content, milestoneTopicId,
              { ...parentCf, milestoneStatus: 'in_progress', isCompleted: false });
          }
        }
      }
    }
    catch (err) { console.error('Failed to toggle task:', err); }
  }, [persistEntry, milestoneTopicId, taskTopicId]);

  const handleUnlinkTask = useCallback(async (t: TaskEntryData) => {
    try { await persistEntry(t.id, t.content, t.taxonomyId, { ...t.customFields, parentMilestoneId: null }); }
    catch (err) { console.error('Failed to unlink task:', err); }
  }, [persistEntry]);

  const handleCreateTask = useCallback(async (milestoneId: number, title: string) => {
    if (!taskTopicId) return;
    const content = `<p>${title}</p>`;
    const customFields = { isCompleted: false, isInProgress: false, isAutoMigrating: true, parentMilestoneId: milestoneId };
    const metadata: Record<string, unknown> = { _taxonomyId: taskTopicId, _customFields: customFields };
    const encrypted = await encryptPost(content, metadata);
    const result = await entriesApi.create({
      contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
      metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
      isEncrypted: true, taxonomyIds: [taskTopicId],
    });
    addDecryptedEntry({
      id: result.id as number, content, metadata, isEncrypted: true,
      createdAt: new Date(result.createdAt as string), updatedAt: new Date((result.updatedAt || result.createdAt) as string),
    });
  }, [taskTopicId, encryptPost, addDecryptedEntry]);

  const handleLinkMilestone = useCallback(async (goalId: number, milestoneId: number) => {
    const m = milestones.find(ms => ms.id === milestoneId);
    if (!m) return;
    await persistEntry(m.id, m.content, m.taxonomyId, { ...m.customFields, parentGoalId: goalId });
  }, [milestones, persistEntry]);

  const handleLinkTask = useCallback(async (milestoneId: number, taskId: number) => {
    const t = tasks.find(ts => ts.id === taskId);
    if (!t) return;
    if (!taskTopicId) return;
    await persistEntry(t.id, t.content, t.taxonomyId, { ...t.customFields, parentMilestoneId: milestoneId });
  }, [tasks, taskTopicId, persistEntry]);

  const handleCreateMilestone = useCallback(async (goalId: number, title: string) => {
    if (!milestoneTopicId) return;
    const content = `<p>${title}</p>`;
    const customFields = { milestoneStatus: 'active', isCompleted: false, targetDate: '', parentGoalId: goalId };
    const metadata: Record<string, unknown> = { _taxonomyId: milestoneTopicId, _customFields: customFields };
    const encrypted = await encryptPost(content, metadata);
    const result = await entriesApi.create({
      contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
      metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
      isEncrypted: true, taxonomyIds: [milestoneTopicId],
    });
    addDecryptedEntry({
      id: result.id as number, content, metadata, isEncrypted: true,
      createdAt: new Date(result.createdAt as string), updatedAt: new Date((result.updatedAt || result.createdAt) as string),
    });
  }, [milestoneTopicId, encryptPost, addDecryptedEntry]);

  // Local display order — synced from filtered lists, reordered by drag
  const [orderedGoals, setOrderedGoals] = useState<typeof filteredGoals>([]);
  const [orderedMilestones, setOrderedMilestones] = useState<typeof filteredMilestones>([]);

  useEffect(() => { setOrderedGoals(filteredGoals); }, [filteredGoals]);
  useEffect(() => { setOrderedMilestones(filteredMilestones); }, [filteredMilestones]);

  const handleGoalDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedGoals(prev => {
      const oldIndex = prev.findIndex(g => g.id === active.id);
      const newIndex = prev.findIndex(g => g.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleMilestoneDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedMilestones(prev => {
      const oldIndex = prev.findIndex(m => m.id === active.id);
      const newIndex = prev.findIndex(m => m.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleSelect = (id: number) => setEditingId(prev => prev === id ? null : id);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const activeAddTopic = tab === 'goals' ? allTopics.find(t => t.id === goalTopicId)
    : tab === 'milestones' ? allTopics.find(t => t.id === milestoneTopicId)
    : allTopics.find(t => t.id === taskTopicId);
  const addLabel = tab === 'goals' ? 'New Goal'
    : tab === 'milestones' ? 'New Milestone'
    : tab === 'todos' ? 'New Todo' : 'New Task';

  if (needsUnlock) {
    return (<><ContentTemplate><EmptyState message="Unlock your journal to view goals" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  }
  if (isLoading || !isReady) {
    return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);
  }

  return (
    <ContentTemplate>
      <ViewHeader
        title="Planning"
        titleTo="/goals"
        onBack={() => navigate('/')}
        right={activeAddTopic ? <HeaderAddButton label={addLabel} onClick={() => setIsAddOpen(true)} /> : undefined}
      />

      <PlanningTabBar />

      <ScrollList $padding="0" $gap="0">
        {activeAddTopic && (
          <NewEntryCard
            topic={activeAddTopic}
            accentColor={accentColor}
            onCreated={(id) => setEditingId(id)}
            hideButton
            isOpen={isAddOpen}
            onOpenChange={setIsAddOpen}
          />
        )}

        {tab === 'goals' && (orderedGoals.length === 0
          ? <EmptyState message="No goals found." submessage="Create a journal entry with the Goal topic to get started." />
          : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGoalDragEnd}>
              <SortableContext items={orderedGoals.map(g => g.id)} strategy={verticalListSortingStrategy}>
                {orderedGoals.map(g => (
                  <GoalCard key={g.id} goal={g} milestones={milestones} accentColor={accentColor}
                    isEditing={editingId === g.id} onSelect={() => handleSelect(g.id)}
                    onClose={() => setEditingId(null)} onSaved={() => setEditingId(null)}
                    onToggleMilestone={handleToggleMilestone} onUnlinkMilestone={handleUnlinkMilestone}
                    onLinkMilestone={handleLinkMilestone}
                    onCreateMilestone={handleCreateMilestone} />
                ))}
              </SortableContext>
            </DndContext>
        )}

        {tab === 'milestones' && (orderedMilestones.length === 0
          ? <EmptyState message="No milestones found." submessage="Create a journal entry with the Milestone topic to get started." />
          : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMilestoneDragEnd}>
              <SortableContext items={orderedMilestones.map(m => m.id)} strategy={verticalListSortingStrategy}>
                {orderedMilestones.map(m => (
                  <MilestoneCard key={m.id} milestone={m} tasks={tasks}
                    goalTitle={m.parentGoalId ? (goalTitles.get(m.parentGoalId) || null) : null}
                    goalOptions={goalOptions} accentColor={accentColor}
                    isEditing={editingId === m.id} onSelect={() => handleSelect(m.id)}
                    onClose={() => setEditingId(null)} onSaved={() => setEditingId(null)}
                    onToggleTask={handleToggleTask} onUnlinkTask={handleUnlinkTask}
                    onCreateTask={handleCreateTask}
                    onLinkTask={handleLinkTask} />
                ))}
              </SortableContext>
            </DndContext>
        )}

        {tab === 'tasks' && (tasks.length === 0
            ? <EmptyState message="No tasks found." submessage="Create a journal entry with the Task topic to get started." />
            : <DayGroupedList
                items={tasks}
                getDate={t => t.createdAt}
                getKey={t => t.id}
                renderItem={t => {
                  const entry = entries.find(e => e.id === t.id);
                  if (!entry) return null;
                  const topic = allTopics.find(tp => tp.id === t.taxonomyId);
                  return (
                    <EditableEntryCard
                      entry={entry}
                      topic={topic}
                      accentColor={accentColor}
                      isEditing={editingId === t.id}
                      onSelect={() => handleSelect(t.id)}
                      onClose={() => setEditingId(null)}
                      onDeleted={() => setEditingId(null)}
                      metaFields={[]}
                      hideDate
                    />
                  );
                }}
              />
        )}

        {tab === 'todos' && (todos.length === 0
            ? <EmptyState message="No todos found." submessage="Create a task without linking it to a milestone or goal." />
            : <DayGroupedList
                items={todos}
                getDate={t => t.createdAt}
                getKey={t => t.id}
                renderItem={t => {
                  const entry = entries.find(e => e.id === t.id);
                  if (!entry) return null;
                  const topic = allTopics.find(tp => tp.id === t.taxonomyId);
                  return (
                    <EditableEntryCard
                      entry={entry}
                      topic={topic}
                      accentColor={accentColor}
                      isEditing={editingId === t.id}
                      onSelect={() => handleSelect(t.id)}
                      onClose={() => setEditingId(null)}
                      onDeleted={() => setEditingId(null)}
                      metaFields={[]}
                      hideDate
                    />
                  );
                }}
              />
        )}
      </ScrollList>
    </ContentTemplate>
  );
}
