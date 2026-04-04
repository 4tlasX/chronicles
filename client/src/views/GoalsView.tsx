import { useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faFlag } from '@fortawesome/free-solid-svg-icons';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { ScrollList } from '../components/atoms/ScrollList.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { ViewHeader } from '../components/molecules/ViewHeader.js';
import { FilterTabs } from '../components/molecules/FilterTabs.js';
import { TabBar } from '../components/molecules/TabBar.js';
import { GoalCard } from '../components/organisms/GoalCard.js';
import { MilestoneCard } from '../components/organisms/MilestoneCard.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { entries as entriesApi } from '../services/api.js';
import { stripHtml } from '../utils/stripHtml.js';
import { useNavigate } from 'react-router-dom';
import type { GoalEntry, MilestoneEntryData, TaskEntryData } from '../types/goals.js';

/* ── Filter options ── */

const GOAL_FILTERS = [
  { value: 'active' as const, label: 'Active' },
  { value: 'short_term' as const, label: 'Short-term' },
  { value: 'long_term' as const, label: 'Long-term' },
  { value: 'completed' as const, label: 'Completed' },
  { value: 'all' as const, label: 'All' },
];

const MILESTONE_FILTERS = [
  { value: 'all' as const, label: 'All' },
  { value: 'active' as const, label: 'Active' },
  { value: 'in_progress' as const, label: 'In Progress' },
  { value: 'completed' as const, label: 'Completed' },
];

type GoalFilter = typeof GOAL_FILTERS[number]['value'];
type MilestoneFilter = typeof MILESTONE_FILTERS[number]['value'];

export function GoalsView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const headerColor = useUIStore(s => s.headerColor) || '#4E6E7E';
  const navigate = useNavigate();
  const { encryptPost } = useEncryption();

  const [tab, setTab] = useState<'goals' | 'milestones'>('goals');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('active');
  const [milestoneFilter, setMilestoneFilter] = useState<MilestoneFilter>('all');
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
          milestoneStatus: (cf.milestoneStatus as string) || 'active', isCompleted: !!cf.isCompleted,
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
          isCompleted: !!cf.isCompleted, parentMilestoneId: (cf.parentMilestoneId as number) || null,
          customFields: cf, taxonomyId: taskTopicId };
      });
  }, [entries, taskTopicId]);

  const goalOptions = useMemo(() => goals.map(g => ({ id: g.id, title: g.title })), [goals]);
  const goalTitles = useMemo(() => new Map(goals.map(g => [g.id, g.title])), [goals]);

  // Filtered lists
  const filteredGoals = useMemo(() => goals
    .filter(g => {
      if (goalFilter === 'all') return true;
      if (goalFilter === 'active') return g.goalStatus === 'active';
      if (goalFilter === 'completed') return g.goalStatus === 'completed';
      if (goalFilter === 'short_term') return g.goalType === 'short_term' && g.goalStatus !== 'completed';
      if (goalFilter === 'long_term') return g.goalType === 'long_term' && g.goalStatus !== 'completed';
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  [goals, goalFilter]);

  const filteredMilestones = useMemo(() => milestones
    .filter(m => {
      if (milestoneFilter === 'all') return true;
      if (milestoneFilter === 'active') return !m.isCompleted && m.milestoneStatus === 'active';
      if (milestoneFilter === 'in_progress') return !m.isCompleted;
      if (milestoneFilter === 'completed') return m.isCompleted;
      return true;
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  [milestones, milestoneFilter]);

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
              { ...parentCf, milestoneStatus: 'active', isCompleted: false });
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

  const handleDragEnd = useCallback((_event: DragEndEvent) => {}, []);
  const handleSelect = (id: number) => setEditingId(prev => prev === id ? null : id);

  if (needsUnlock) {
    return (<><ContentTemplate><EmptyState message="Unlock your journal to view goals" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  }
  if (isLoading || !isReady) {
    return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);
  }

  const TABS = [
    { value: 'goals' as const, label: <><FontAwesomeIcon icon={faBullseye} size="sm" /> Goals ({goals.length})</> },
    { value: 'milestones' as const, label: <><FontAwesomeIcon icon={faFlag} size="sm" /> Milestones ({milestones.length})</> },
  ];

  return (
    <ContentTemplate>
      <ViewHeader title="Goals & Milestones" onBack={() => navigate('/')} />

      <TabBar tabs={TABS} active={tab} onChange={v => { setTab(v); setEditingId(null); }} accentColor={headerColor} />

      {tab === 'goals' && <FilterTabs options={GOAL_FILTERS} active={goalFilter} onChange={setGoalFilter} />}
      {tab === 'milestones' && <FilterTabs options={MILESTONE_FILTERS} active={milestoneFilter} onChange={setMilestoneFilter} />}

      <ScrollList>
        {tab === 'goals' && (filteredGoals.length === 0
          ? <EmptyState message="No goals found." submessage="Create a journal entry with the Goal topic to get started." />
          : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredGoals.map(g => g.id)} strategy={verticalListSortingStrategy}>
                {filteredGoals.map(g => (
                  <GoalCard key={g.id} goal={g} milestones={milestones} headerColor={headerColor}
                    isEditing={editingId === g.id} onSelect={() => handleSelect(g.id)}
                    onClose={() => setEditingId(null)} onSaved={() => setEditingId(null)}
                    onToggleMilestone={handleToggleMilestone} onUnlinkMilestone={handleUnlinkMilestone}
                    onCreateMilestone={handleCreateMilestone} />
                ))}
              </SortableContext>
            </DndContext>
        )}

        {tab === 'milestones' && (filteredMilestones.length === 0
          ? <EmptyState message="No milestones found." submessage="Create a journal entry with the Milestone topic to get started." />
          : filteredMilestones.map(m => (
              <MilestoneCard key={m.id} milestone={m} tasks={tasks}
                goalTitle={m.parentGoalId ? (goalTitles.get(m.parentGoalId) || null) : null}
                goalOptions={goalOptions} headerColor={headerColor}
                isEditing={editingId === m.id} onSelect={() => handleSelect(m.id)}
                onClose={() => setEditingId(null)} onSaved={() => setEditingId(null)}
                onToggleTask={handleToggleTask} onUnlinkTask={handleUnlinkTask}
                onCreateTask={handleCreateTask} />
            ))
        )}
      </ScrollList>
    </ContentTemplate>
  );
}
