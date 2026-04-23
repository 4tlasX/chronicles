import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faXmark, faPlus, faSlidersH, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { ScrollList } from '../components/atoms/ScrollList.js';
import { Spinner } from '../components/atoms/Spinner.js';
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
import { entries as entriesApi, settings as settingsApi } from '../services/api.js';
import { stripHtml } from '../utils/stripHtml.js';
import { useNavigate } from 'react-router-dom';
import type { MilestoneEntryData, TaskEntryData } from '../types/goals.js';
import type { PlannerFilterConfig, SavedPlannerFilter } from '../types/planner.js';
import { EMPTY_PLANNER_FILTER, isFilterEmpty, filtersEqual } from '../types/planner.js';

/* ── Styled components ── */

const FilterPanel = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterToggleRow = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
  &:hover { background: rgba(0, 0, 0, 0.03); }
`;

const ToggleLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  flex-shrink: 0;
`;

const FilterSummary = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FilterBody = styled.div`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FieldLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06rem;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  min-width: 72px;
`;

const KeywordInput = styled.input`
  flex: 1;
  min-width: 160px;
  padding: 6px 10px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.accent}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

const TypeChip = styled.button<{ $active: boolean; $color: string }>`
  padding: 5px 12px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border: 1px solid ${({ $active, $color, theme }) => $active ? $color : theme.colors.border};
  background: transparent;
  color: ${({ $active, $color, theme }) => $active ? $color : theme.colors.textSecondary};
  cursor: pointer;
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  padding: 6px 8px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  outline: none;
  cursor: pointer;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 2px 0;
`;

/* ── Saved filters dropdown ── */

const SavedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SavedDropdown = styled.select<{ $active: boolean; $color: string }>`
  flex: 1;
  padding: 6px 10px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 1px solid ${({ $active, $color, theme }) => $active ? $color : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
`;

const IconOnlyBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.danger}; border-color: ${({ theme }) => theme.colors.danger}; }
  &:disabled { opacity: 0.3; cursor: default; &:hover { color: ${({ theme }) => theme.colors.textMuted}; border-color: ${({ theme }) => theme.colors.border}; } }
`;

/* ── Action row ── */

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ApplyBtn = styled.button<{ $color: string; $pending: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
  color: white;
  background: ${({ $color, $pending }) => $pending ? $color : $color + 'aa'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: ${({ $pending, $color }) => $pending ? `0 2px 8px ${$color}55` : 'none'};
  transform: ${({ $pending }) => $pending ? 'scale(1.02)' : 'scale(1)'};
  &:hover { filter: brightness(1.1); }
  &:active { transform: scale(0.98); }
`;


const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  &:hover { background: rgba(0, 0, 0, 0.04); }
  &:disabled { opacity: 0.4; cursor: default; }
`;

const ClearBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
  &:hover { opacity: 0.7; }
`;

const SaveRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const SaveInput = styled.input`
  flex: 1;
  min-width: 180px;
  padding: 6px 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.accent}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

const SaveBtn = styled.button<{ $color: string }>`
  padding: 6px 16px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
  color: white;
  background: ${({ $color }) => $color};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
`;

/* ── Results section header ── */

const SectionHeader = styled.div<{ $color: string }>`
  padding: 16px 16px 12px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ResultCount = styled.span`
  font-weight: 400;
  opacity: 0.6;
  margin-left: 6px;
  font-size: 14px;
`;

const EmptyHint = styled.div`
  padding: 48px 16px;
  text-align: center;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const HintIcon = styled.div`
  font-size: 28px;
  opacity: 0.3;
`;

/* ── Add button dropdown ── */

const AddBtnWrap = styled.div`
  position: relative;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const AddDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 140px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  z-index: 50;
  overflow: hidden;
`;

const AddDropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 10px 14px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { background: rgba(0, 0, 0, 0.04); }
  &:not(:last-child) { border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft}; }
`;

/* ── Data ── */

const ITEM_TYPES = [
  { value: 'goals' as const, label: 'Goals' },
  { value: 'milestones' as const, label: 'Milestones' },
  { value: 'tasks' as const, label: 'Tasks' },
  { value: 'todos' as const, label: 'Todos' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Any Status' },
  { value: 'active', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'not_completed', label: 'Not Completed' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Any Priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
];

export function PlannerFilterView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const headerColor = useUIStore(s => s.headerColor) || '#4A5568';
  const navigate = useNavigate();
  const { encryptPost } = useEncryption();

  // pending = what the user is editing; applied = what actually drives results
  const [pending, setPending] = useState<PlannerFilterConfig>(EMPTY_PLANNER_FILTER);
  const [filter, setFilter] = useState<PlannerFilterConfig>(EMPTY_PLANNER_FILTER);
  const [savedFilters, setSavedFilters] = useState<SavedPlannerFilter[]>([]);
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  // Add new item state
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [addType, setAddType] = useState<'goal' | 'milestone' | 'task' | null>(null);
  const addDropdownRef = useRef<HTMLDivElement>(null);

  // Close add dropdown on outside click
  useEffect(() => {
    if (!addDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) {
        setAddDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [addDropdownOpen]);

  // Load saved filters
  useEffect(() => {
    settingsApi.getAll()
      .then(all => {
        const rec = all.find(s => s.key === 'plannerFilters');
        if (rec && Array.isArray(rec.value)) setSavedFilters(rec.value as SavedPlannerFilter[]);
      })
      .catch(() => {});
  }, []);

  const persistSaved = useCallback(async (filters: SavedPlannerFilter[]) => {
    setSavedFilters(filters);
    await settingsApi.upsert('plannerFilters', filters).catch(() => {});
  }, []);

  // Resolve topic IDs
  const goalTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'goal')?.id, [allTopics]);
  const milestoneTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'milestone')?.id, [allTopics]);
  const taskTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'task')?.id, [allTopics]);

  // Parse all planner items
  const goals = useMemo(() => {
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

  const goalOptions = useMemo(() => goals.map(g => ({ id: g.id, title: g.title })), [goals]);
  const goalTitles = useMemo(() => new Map(goals.map(g => [g.id, g.title])), [goals]);
  const milestoneOptions = useMemo(() => milestones.map(m => ({ id: m.id, title: m.title, parentGoalId: m.parentGoalId })), [milestones]);

  // Milestone IDs under selected goal (for cross-hierarchy task filtering — uses applied filter)
  const milestoneIdsUnderGoal = useMemo(() => {
    if (!filter.parentGoalId) return null;
    return new Set(milestones.filter(m => m.parentGoalId === filter.parentGoalId).map(m => m.id));
  }, [milestones, filter.parentGoalId]);

  // Visible milestone options in the dropdown — responsive to pending goal selection
  const visibleMilestoneOptions = useMemo(() => {
    if (!pending.parentGoalId) return milestoneOptions;
    return milestoneOptions.filter(m => m.parentGoalId === pending.parentGoalId);
  }, [milestoneOptions, pending.parentGoalId]);

  // Cross-hierarchy filter results
  const results = useMemo(() => {
    if (isFilterEmpty(filter)) return null;

    const { keyword, itemTypes, goalStatus, taskStatus, priority, parentGoalId, parentMilestoneId } = filter;
    const kw = keyword.trim().toLowerCase();
    const showAll = itemTypes.length === 0;

    const matchGoalStatus = (status: string) => {
      if (goalStatus === 'all') return true;
      if (goalStatus === 'completed') return status === 'completed';
      if (goalStatus === 'not_completed') return status !== 'completed';
      if (goalStatus === 'active') return status === 'active' || status === 'not_started' || status === '';
      if (goalStatus === 'not_started') return status === 'not_started' || status === '';
      if (goalStatus === 'in_progress') return status === 'in_progress';
      return true;
    };

    const matchTaskStatus = (completed: boolean, inProgress: boolean) => {
      if (taskStatus === 'all') return true;
      if (taskStatus === 'completed') return completed;
      if (taskStatus === 'not_completed') return !completed;
      if (taskStatus === 'in_progress') return !completed && inProgress;
      if (taskStatus === 'not_started') return !completed && !inProgress;
      return true;
    };

    const matchPriority = (p: string) => priority === 'all' || p === priority;
    const matchKeyword = (text: string) => !kw || stripHtml(text).toLowerCase().includes(kw);

    const goalResults: typeof goals = [];
    const milestoneResults: MilestoneEntryData[] = [];
    const taskResults: TaskEntryData[] = [];
    const todoResults: TaskEntryData[] = [];

    if (showAll || itemTypes.includes('goals')) {
      goals.forEach(g => {
        if (!matchKeyword(g.content)) return;
        if (!matchGoalStatus(g.goalStatus)) return;
        goalResults.push(g);
      });
    }

    if (showAll || itemTypes.includes('milestones')) {
      milestones.forEach(m => {
        if (!matchKeyword(m.content)) return;
        if (!matchGoalStatus(m.milestoneStatus)) return;
        if (parentGoalId && m.parentGoalId !== parentGoalId) return;
        milestoneResults.push(m);
      });
    }

    if (showAll || itemTypes.includes('tasks') || itemTypes.includes('todos')) {
      tasks.forEach(t => {
        // A todo has no goal or milestone connection at all
        const isTodo = !t.parentMilestoneId && !t.parentGoalId;
        const wantTasks = showAll || itemTypes.includes('tasks');
        const wantTodos = showAll || itemTypes.includes('todos');
        if (isTodo && !wantTodos) return;
        if (!isTodo && !wantTasks) return;
        if (!matchKeyword(t.content)) return;
        if (!matchTaskStatus(t.isCompleted, !!(t.customFields as Record<string,unknown>).isInProgress)) return;
        if (!matchPriority(t.priority)) return;
        if (parentMilestoneId && t.parentMilestoneId !== parentMilestoneId) return;
        if (parentGoalId && !parentMilestoneId) {
          // Match tasks directly linked to the goal OR linked via one of the goal's milestones
          const linkedDirectly = t.parentGoalId === parentGoalId;
          const linkedViaMilestone = milestoneIdsUnderGoal ? milestoneIdsUnderGoal.has(t.parentMilestoneId as number) : false;
          if (!linkedDirectly && !linkedViaMilestone) return;
        }
        if (isTodo) todoResults.push(t);
        else taskResults.push(t);
      });
    }

    return { goalResults, milestoneResults, taskResults, todoResults };
  }, [filter, goals, milestones, tasks, milestoneIdsUnderGoal]);

  const totalCount = results
    ? results.goalResults.length + results.milestoneResults.length + results.taskResults.length + results.todoResults.length
    : 0;

  // Persist helper
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
    const newCompleted = !m.isCompleted;
    const newStatus = newCompleted ? 'completed' : 'active';
    try { await persistEntry(m.id, m.content, m.taxonomyId, { ...m.customFields, milestoneStatus: newStatus, isCompleted: newCompleted }); }
    catch (err) { console.error(err); }
  }, [persistEntry]);

  const handleToggleTask = useCallback(async (t: TaskEntryData) => {
    try { await persistEntry(t.id, t.content, t.taxonomyId, { ...t.customFields, isCompleted: !t.isCompleted }); }
    catch (err) { console.error(err); }
  }, [persistEntry]);

  const hasPendingChanges = !filtersEqual(pending, filter);
  const isApplied = !isFilterEmpty(filter);

  const filterSummary = useMemo(() => {
    if (isFilterEmpty(filter)) return '';
    const parts: string[] = [];
    if (filter.itemTypes.length > 0) parts.push(filter.itemTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', '));
    if (filter.keyword.trim()) parts.push(`"${filter.keyword.trim()}"`);
    if (filter.parentGoalId) {
      const g = goalOptions.find(g => g.id === filter.parentGoalId);
      if (g) parts.push(`Goal: ${g.title.slice(0, 30)}`);
    }
    if (filter.goalStatus !== 'all') parts.push(filter.goalStatus.replace('_', ' '));
    if (filter.priority !== 'all') parts.push(filter.priority);
    return parts.join(' · ');
  }, [filter, goalOptions]);

  // Filter helpers — all operate on pending; Apply commits to filter
  const toggleType = (type: PlannerFilterConfig['itemTypes'][number]) => {
    const next = pending.itemTypes.includes(type)
      ? pending.itemTypes.filter(t => t !== type)
      : [...pending.itemTypes, type];
    setPending(f => ({ ...f, itemTypes: next }));
    setActiveSavedId(null);
  };

  const updateFilter = (patch: Partial<PlannerFilterConfig>) => {
    setPending(f => ({ ...f, ...patch }));
    setActiveSavedId(null);
  };

  const handleApply = () => {
    setFilter({ ...pending });
    setPanelOpen(false);
  };

  const handleApplySaved = (sf: SavedPlannerFilter) => {
    setPending(sf.config);
    setActiveSavedId(sf.id);
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    const sf: SavedPlannerFilter = { id: `${Date.now()}`, name: saveName.trim(), config: { ...pending } };
    persistSaved([...savedFilters, sf]);
    setActiveSavedId(sf.id);
    setSaveName('');
    setShowSaveInput(false);
  };

  const handleDeleteSaved = (id: string) => {
    persistSaved(savedFilters.filter(f => f.id !== id));
    if (activeSavedId === id) setActiveSavedId(null);
  };

  const handleClear = () => {
    setPending(EMPTY_PLANNER_FILTER);
    setFilter(EMPTY_PLANNER_FILTER);
    setActiveSavedId(null);
    setPanelOpen(true);
  };

  if (needsUnlock) {
    return (<><ContentTemplate><EmptyState message="Unlock your journal to use planner filters" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  }
  if (isLoading || !isReady) {
    return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);
  }

  const goalTopic = allTopics.find(t => t.name.toLowerCase() === 'goal');
  const milestoneTopic = allTopics.find(t => t.name.toLowerCase() === 'milestone');
  const taskTopic = allTopics.find(t => t.name.toLowerCase() === 'task');
  const activeTopic = addType === 'goal' ? goalTopic : addType === 'milestone' ? milestoneTopic : addType === 'task' ? taskTopic : undefined;

  return (
    <ContentTemplate>
      <ViewHeader
        title="Planning"
        titleTo="/goals"
        onBack={() => navigate('/goals')}
        right={
          <AddBtnWrap ref={addDropdownRef}>
            <AddBtn onClick={() => setAddDropdownOpen(o => !o)}>
              <FontAwesomeIcon icon={faPlus} />
              Add
            </AddBtn>
            {addDropdownOpen && (
              <AddDropdown>
                {goalTopic && (
                  <AddDropdownItem onClick={() => { setAddType('goal'); setAddDropdownOpen(false); }}>
                    Goal
                  </AddDropdownItem>
                )}
                {milestoneTopic && (
                  <AddDropdownItem onClick={() => { setAddType('milestone'); setAddDropdownOpen(false); }}>
                    Milestone
                  </AddDropdownItem>
                )}
                {taskTopic && (
                  <AddDropdownItem onClick={() => { setAddType('task'); setAddDropdownOpen(false); }}>
                    Task / Todo
                  </AddDropdownItem>
                )}
              </AddDropdown>
            )}
          </AddBtnWrap>
        }
      />

      {activeTopic && (
        <NewEntryCard
          topic={activeTopic}
          headerColor={headerColor}
          onCreated={(id) => { setEditingId(id); setAddType(null); }}
          hideButton
          isOpen={addType !== null}
          onOpenChange={(open) => { if (!open) setAddType(null); }}
        />
      )}

      <PlanningTabBar />

      {/* Filter panel */}
      <FilterPanel>
        <FilterToggleRow onClick={() => setPanelOpen(o => !o)}>
          <ToggleLabel>Filters</ToggleLabel>
          {!panelOpen && filterSummary && <FilterSummary>{filterSummary}</FilterSummary>}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {isApplied && (
              <ClearBtn as="span" onClick={e => { e.stopPropagation(); handleClear(); }}>
                <FontAwesomeIcon icon={faXmark} size="xs" /> Clear
              </ClearBtn>
            )}
            <FontAwesomeIcon icon={panelOpen ? faChevronUp : faChevronDown} style={{ fontSize: 11, color: 'inherit', opacity: 0.5 }} />
          </div>
        </FilterToggleRow>

        {panelOpen && (
          <FilterBody>
            {savedFilters.length > 0 && (
              <SavedRow>
                <FieldLabel>Filter</FieldLabel>
                <SavedDropdown
                  $active={activeSavedId !== null}
                  $color={headerColor}
                  value={activeSavedId ?? ''}
                  onChange={e => {
                    const sf = savedFilters.find(f => f.id === e.target.value);
                    if (sf) handleApplySaved(sf);
                    else { setPending(EMPTY_PLANNER_FILTER); setFilter(EMPTY_PLANNER_FILTER); setActiveSavedId(null); }
                  }}
                >
                  <option value="">— No saved filter —</option>
                  {savedFilters.map(sf => <option key={sf.id} value={sf.id}>{sf.name}</option>)}
                </SavedDropdown>
                <IconOnlyBtn
                  title="Delete this saved filter"
                  disabled={activeSavedId === null}
                  onClick={() => activeSavedId && handleDeleteSaved(activeSavedId)}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </IconOnlyBtn>
              </SavedRow>
            )}

            <Row>
              <FieldLabel>Keyword</FieldLabel>
              <KeywordInput
                type="text"
                placeholder="Search across all planner items…"
                value={pending.keyword}
                onChange={e => updateFilter({ keyword: e.target.value })}
              />
            </Row>

            <Row>
              <FieldLabel>Show</FieldLabel>
              {ITEM_TYPES.map(({ value, label }) => (
                <TypeChip key={value} $active={pending.itemTypes.includes(value)} $color={headerColor} onClick={() => toggleType(value)}>
                  {label}
                </TypeChip>
              ))}
            </Row>

            <Row>
              <FieldLabel>Status</FieldLabel>
              <FilterSelect value={pending.goalStatus} onChange={e => updateFilter({ goalStatus: e.target.value, taskStatus: e.target.value })}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FilterSelect>
              <FieldLabel style={{ minWidth: 'unset' }}>Priority</FieldLabel>
              <FilterSelect value={pending.priority} onChange={e => updateFilter({ priority: e.target.value })}>
                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FilterSelect>
            </Row>

            <Row>
              <FieldLabel>Goal</FieldLabel>
              <FilterSelect
                value={pending.parentGoalId ?? ''}
                onChange={e => updateFilter({ parentGoalId: e.target.value ? Number(e.target.value) : null, parentMilestoneId: null })}
              >
                <option value="">Any Goal</option>
                {goalOptions.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </FilterSelect>
              <FieldLabel style={{ minWidth: 'unset' }}>Milestone</FieldLabel>
              <FilterSelect
                value={pending.parentMilestoneId ?? ''}
                onChange={e => updateFilter({ parentMilestoneId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Any Milestone</option>
                {visibleMilestoneOptions.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </FilterSelect>
            </Row>

            <Divider />

            {showSaveInput ? (
              <SaveRow>
                <SaveInput
                  autoFocus
                  placeholder="Name this filter…"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') { setShowSaveInput(false); setSaveName(''); }
                  }}
                />
                <SaveBtn $color={headerColor} onClick={handleSave}>Save</SaveBtn>
                <GhostBtn onClick={() => { setShowSaveInput(false); setSaveName(''); }}>Cancel</GhostBtn>
              </SaveRow>
            ) : (
              <ActionRow>
                <ActionLeft>
                  <GhostBtn onClick={() => setShowSaveInput(true)} disabled={isFilterEmpty(pending)}>
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} /> Save
                  </GhostBtn>
                </ActionLeft>
                <ApplyBtn
                  $color={headerColor}
                  $pending={hasPendingChanges || (!isApplied && !isFilterEmpty(pending))}
                  onClick={handleApply}
                  disabled={isFilterEmpty(pending)}
                >
                  Apply Filter
                </ApplyBtn>
              </ActionRow>
            )}
          </FilterBody>
        )}
      </FilterPanel>

      {/* Results */}
      <ScrollList $padding="0" $gap="0">
        {isFilterEmpty(filter) ? (
          <EmptyHint>
            <HintIcon><FontAwesomeIcon icon={faSlidersH} /></HintIcon>
            Set filter criteria above to find goals, milestones, tasks, and todos.
            <br />Save a named filter to reuse it anytime.
          </EmptyHint>
        ) : totalCount === 0 ? (
          <EmptyState message="No items match this filter." submessage="Try adjusting the criteria." />
        ) : (
          <>
            {results && results.goalResults.length > 0 && (
              <>
                <SectionHeader $color={headerColor}>
                  Goals <ResultCount>({results.goalResults.length})</ResultCount>
                </SectionHeader>
                <DayGroupedList
                  items={results.goalResults}
                  getDate={g => g.createdAt}
                  getKey={g => g.id}
                  renderItem={g => (
                    <GoalCard goal={g} milestones={milestones} headerColor={headerColor}
                      isEditing={editingId === g.id} onSelect={() => setEditingId(prev => prev === g.id ? null : g.id)}
                      onClose={() => setEditingId(null)} onSaved={() => setEditingId(null)}
                      onToggleMilestone={handleToggleMilestone} onUnlinkMilestone={async () => {}}
                      onLinkMilestone={async () => {}} onCreateMilestone={async () => {}} />
                  )}
                />
              </>
            )}

            {results && results.milestoneResults.length > 0 && (
              <>
                <SectionHeader $color={headerColor}>
                  Milestones <ResultCount>({results.milestoneResults.length})</ResultCount>
                </SectionHeader>
                <DayGroupedList
                  items={results.milestoneResults}
                  getDate={m => m.createdAt}
                  getKey={m => m.id}
                  renderItem={m => (
                    <MilestoneCard milestone={m} tasks={tasks}
                      goalTitle={m.parentGoalId ? (goalTitles.get(m.parentGoalId) || null) : null}
                      goalOptions={goalOptions} headerColor={headerColor}
                      isEditing={editingId === m.id} onSelect={() => setEditingId(prev => prev === m.id ? null : m.id)}
                      onClose={() => setEditingId(null)} onSaved={() => setEditingId(null)}
                      onToggleTask={handleToggleTask} onUnlinkTask={async () => {}}
                      onCreateTask={async () => {}} onLinkTask={async () => {}} />
                  )}
                />
              </>
            )}

            {results && results.taskResults.length > 0 && (
              <>
                <SectionHeader $color={headerColor}>
                  Tasks <ResultCount>({results.taskResults.length})</ResultCount>
                </SectionHeader>
                <DayGroupedList
                  items={results.taskResults}
                  getDate={t => t.createdAt}
                  getKey={t => t.id}
                  renderItem={t => {
                    const entry = entries.find(e => e.id === t.id);
                    if (!entry) return null;
                    const topic = allTopics.find(tp => tp.id === t.taxonomyId);
                    return (
                      <EditableEntryCard entry={entry} topic={topic} headerColor={headerColor}
                        isEditing={editingId === t.id} onSelect={() => setEditingId(prev => prev === t.id ? null : t.id)}
                        onClose={() => setEditingId(null)} onDeleted={() => setEditingId(null)}
                        metaFields={[]} hideDate />
                    );
                  }}
                />
              </>
            )}

            {results && results.todoResults.length > 0 && (
              <>
                <SectionHeader $color={headerColor}>
                  Todos <ResultCount>({results.todoResults.length})</ResultCount>
                </SectionHeader>
                <DayGroupedList
                  items={results.todoResults}
                  getDate={t => t.createdAt}
                  getKey={t => t.id}
                  renderItem={t => {
                    const entry = entries.find(e => e.id === t.id);
                    if (!entry) return null;
                    const topic = allTopics.find(tp => tp.id === t.taxonomyId);
                    return (
                      <EditableEntryCard entry={entry} topic={topic} headerColor={headerColor}
                        isEditing={editingId === t.id} onSelect={() => setEditingId(prev => prev === t.id ? null : t.id)}
                        onClose={() => setEditingId(null)} onDeleted={() => setEditingId(null)}
                        metaFields={[]} hideDate />
                    );
                  }}
                />
              </>
            )}
          </>
        )}
      </ScrollList>
    </ContentTemplate>
  );
}
