import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye, faFlag, faChevronDown, faChevronUp, faPen, faGripVertical,
  faCircleCheck, faCircle, faCircleHalfStroke, faLink,
} from '@fortawesome/free-solid-svg-icons';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppTemplate } from '../components/templates/AppTemplate.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useNavigate } from 'react-router-dom';

/* ── Helpers ── */

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

type GoalEntry = {
  id: number;
  title: string;
  goalType: string;
  goalStatus: string;
  targetDate: string;
  milestoneIds: number[];
  createdAt: Date;
};

type MilestoneEntry = {
  id: number;
  title: string;
  milestoneStatus: string;
  isCompleted: boolean;
  targetDate: string;
  parentGoalId: number | null;
  taskIds: number[];
  createdAt: Date;
};

type TaskEntry = {
  id: number;
  title: string;
  isCompleted: boolean;
  parentMilestoneId: number | null;
};

/* ── Styled ── */

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.9);
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const BackLink = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.accent};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const TabRow = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button<{ $active?: boolean; $color: string }>`
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active, $color }) => $active ? $color : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
`;

const FilterBtn = styled.button<{ $active?: boolean }>`
  padding: 4px 12px;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  background: ${({ $active }) => $active ? 'rgba(0,0,0,0.06)' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

const ListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  gap: 4px;
`;

const EmptySub = styled.span`
  font-size: 12px;
`;

/* ── Card Styles ── */

const Card = styled.div<{ $isDragging?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: white;
  overflow: hidden;
  opacity: ${({ $isDragging }) => $isDragging ? 0.7 : 1};
  box-shadow: ${({ $isDragging }) => $isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  cursor: pointer;
`;

const DragHandle = styled.button`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: grab;
  font-size: 12px;
  touch-action: none;
  flex-shrink: 0;
  &:active { cursor: grabbing; }
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const CardTitle = styled.div<{ $completed?: boolean }>`
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

const StatusBadge = styled.span<{ $color: string }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}15;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: capitalize;
  flex-shrink: 0;
`;

const TypeLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`;

const EditBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.text}; background: rgba(0,0,0,0.06); }
`;

const ProgressBarOuter = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
`;

const ProgressBarInner = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

const ExpandSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ExpandHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { background: rgba(0,0,0,0.02); }
`;

const SubItemList = styled.div`
  padding: 0 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SubItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
`;

const SubItemIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 14px;
  flex-shrink: 0;
`;

const SubItemTitle = styled.span<{ $completed?: boolean }>`
  flex: 1;
  color: ${({ theme, $completed }) => $completed ? theme.colors.textMuted : theme.colors.text};
  text-decoration: ${({ $completed }) => $completed ? 'line-through' : 'none'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const LinkedGoalLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 14px 8px;
`;

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  completed: '#6366f1',
  archived: '#9ca3af',
};

/* ── Sortable Goal Card ── */

interface GoalCardProps {
  goal: GoalEntry;
  milestones: MilestoneEntry[];
  headerColor: string;
  onEdit: (id: number) => void;
}

function SortableGoalCard({ goal, milestones, headerColor, onEdit }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: goal.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const linkedMilestones = milestones.filter(m => m.parentGoalId === goal.id);
  const completedCount = linkedMilestones.filter(m => m.isCompleted).length;
  const progress = linkedMilestones.length > 0 ? Math.round((completedCount / linkedMilestones.length) * 100) : 0;

  return (
    <Card ref={setNodeRef} style={style} $isDragging={isDragging}>
      <CardHeader onClick={() => onEdit(goal.id)}>
        <DragHandle {...attributes} {...listeners} onClick={e => e.stopPropagation()}>
          <FontAwesomeIcon icon={faGripVertical} />
        </DragHandle>
        <CardTitle $completed={goal.goalStatus === 'completed'}>{goal.title}</CardTitle>
        <TypeLabel>{goal.goalType === 'short_term' ? 'Short' : 'Long'}</TypeLabel>
        <StatusBadge $color={STATUS_COLORS[goal.goalStatus] || '#9ca3af'}>{goal.goalStatus}</StatusBadge>
        {goal.targetDate && <TypeLabel>{goal.targetDate}</TypeLabel>}
        <EditBtn onClick={e => { e.stopPropagation(); onEdit(goal.id); }} title="Edit">
          <FontAwesomeIcon icon={faPen} />
        </EditBtn>
      </CardHeader>

      {linkedMilestones.length > 0 && (
        <>
          <ProgressBarOuter>
            <ProgressBarInner $percent={progress} $color={headerColor} />
          </ProgressBarOuter>
          <ExpandSection>
            <ExpandHeader onClick={() => setExpanded(!expanded)}>
              <span>Milestones ({completedCount}/{linkedMilestones.length})</span>
              <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size="xs" />
            </ExpandHeader>
            {expanded && (
              <SubItemList>
                {linkedMilestones.map(m => (
                  <SubItem key={m.id}>
                    <SubItemIcon $color={m.isCompleted ? '#6366f1' : m.milestoneStatus === 'active' ? '#f59e0b' : '#d1d5db'}>
                      <FontAwesomeIcon icon={m.isCompleted ? faCircleCheck : m.milestoneStatus === 'active' ? faCircleHalfStroke : faCircle} />
                    </SubItemIcon>
                    <SubItemTitle $completed={m.isCompleted}>{m.title}</SubItemTitle>
                  </SubItem>
                ))}
              </SubItemList>
            )}
          </ExpandSection>
        </>
      )}
    </Card>
  );
}

/* ── Milestone Card (non-sortable) ── */

interface MilestoneCardProps {
  milestone: MilestoneEntry;
  tasks: TaskEntry[];
  goalTitle: string | null;
  headerColor: string;
  onEdit: (id: number) => void;
}

function MilestoneCard({ milestone, tasks, goalTitle, headerColor, onEdit }: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(false);

  const linkedTasks = tasks.filter(t => t.parentMilestoneId === milestone.id);
  const completedCount = linkedTasks.filter(t => t.isCompleted).length;
  const progress = linkedTasks.length > 0 ? Math.round((completedCount / linkedTasks.length) * 100) : 0;

  const statusIcon = milestone.isCompleted ? faCircleCheck : milestone.milestoneStatus === 'active' ? faCircleHalfStroke : faCircle;
  const statusColor = milestone.isCompleted ? '#6366f1' : milestone.milestoneStatus === 'active' ? '#10b981' : '#9ca3af';

  return (
    <Card>
      <CardHeader onClick={() => onEdit(milestone.id)}>
        <SubItemIcon $color={statusColor}>
          <FontAwesomeIcon icon={statusIcon} />
        </SubItemIcon>
        <CardTitle $completed={milestone.isCompleted}>{milestone.title}</CardTitle>
        <StatusBadge $color={statusColor}>
          {milestone.isCompleted ? 'Completed' : milestone.milestoneStatus}
        </StatusBadge>
        {milestone.targetDate && <TypeLabel>{milestone.targetDate}</TypeLabel>}
        <EditBtn onClick={e => { e.stopPropagation(); onEdit(milestone.id); }} title="Edit">
          <FontAwesomeIcon icon={faPen} />
        </EditBtn>
      </CardHeader>

      {goalTitle && (
        <LinkedGoalLabel>
          <FontAwesomeIcon icon={faLink} style={{ fontSize: 10 }} />
          Goal: {goalTitle}
        </LinkedGoalLabel>
      )}

      {linkedTasks.length > 0 && (
        <>
          <ProgressBarOuter>
            <ProgressBarInner $percent={progress} $color={headerColor} />
          </ProgressBarOuter>
          <ExpandSection>
            <ExpandHeader onClick={() => setExpanded(!expanded)}>
              <span>Tasks ({completedCount}/{linkedTasks.length})</span>
              <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size="xs" />
            </ExpandHeader>
            {expanded && (
              <SubItemList>
                {linkedTasks.map(t => (
                  <SubItem key={t.id}>
                    <SubItemIcon $color={t.isCompleted ? '#6366f1' : '#d1d5db'}>
                      <FontAwesomeIcon icon={t.isCompleted ? faCircleCheck : faCircle} />
                    </SubItemIcon>
                    <SubItemTitle $completed={t.isCompleted}>{t.title}</SubItemTitle>
                  </SubItem>
                ))}
              </SubItemList>
            )}
          </ExpandSection>
        </>
      )}
    </Card>
  );
}

/* ── Main View ── */

type GoalFilter = 'all' | 'active' | 'short_term' | 'long_term' | 'completed';
type MilestoneFilter = 'all' | 'active' | 'in_progress' | 'completed';

export function GoalsView() {
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#2d2c2a';
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const navigate = useNavigate();

  const [tab, setTab] = useState<'goals' | 'milestones'>('goals');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('active');
  const [milestoneFilter, setMilestoneFilter] = useState<MilestoneFilter>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Resolve topic IDs
  const goalTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'goal')?.id, [allTopics]);
  const milestoneTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'milestone')?.id, [allTopics]);
  const taskTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'task')?.id, [allTopics]);

  // Parse goals
  const goals: GoalEntry[] = useMemo(() => {
    if (!goalTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === goalTopicId)
      .map(e => {
        const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
        return {
          id: e.id,
          title: stripHtml(e.content).slice(0, 120) || 'Untitled goal',
          goalType: (cf.goalType as string) || 'short_term',
          goalStatus: (cf.goalStatus as string) || 'active',
          targetDate: (cf.targetDate as string) || '',
          milestoneIds: [],
          createdAt: e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt),
        };
      });
  }, [entries, goalTopicId]);

  // Parse milestones
  const milestones: MilestoneEntry[] = useMemo(() => {
    if (!milestoneTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === milestoneTopicId)
      .map(e => {
        const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
        return {
          id: e.id,
          title: stripHtml(e.content).slice(0, 120) || 'Untitled milestone',
          milestoneStatus: (cf.milestoneStatus as string) || 'active',
          isCompleted: !!cf.isCompleted,
          targetDate: (cf.targetDate as string) || '',
          parentGoalId: (cf.parentGoalId as number) || null,
          taskIds: [],
          createdAt: e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt),
        };
      });
  }, [entries, milestoneTopicId]);

  // Parse tasks
  const tasks: TaskEntry[] = useMemo(() => {
    if (!taskTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === taskTopicId)
      .map(e => {
        const cf = (e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> || {};
        return {
          id: e.id,
          title: stripHtml(e.content).slice(0, 80) || 'Untitled task',
          isCompleted: !!cf.isCompleted,
          parentMilestoneId: (cf.parentMilestoneId as number) || null,
        };
      });
  }, [entries, taskTopicId]);

  // Goal title lookup for milestones
  const goalTitles = useMemo(() => new Map(goals.map(g => [g.id, g.title])), [goals]);

  // Filter goals
  const filteredGoals = useMemo(() => {
    return goals
      .filter(g => {
        if (goalFilter === 'all') return true;
        if (goalFilter === 'active') return g.goalStatus === 'active';
        if (goalFilter === 'completed') return g.goalStatus === 'completed';
        if (goalFilter === 'short_term') return g.goalType === 'short_term' && g.goalStatus !== 'completed';
        if (goalFilter === 'long_term') return g.goalType === 'long_term' && g.goalStatus !== 'completed';
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [goals, goalFilter]);

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    return milestones
      .filter(m => {
        if (milestoneFilter === 'all') return true;
        if (milestoneFilter === 'active') return !m.isCompleted && m.milestoneStatus === 'active';
        if (milestoneFilter === 'in_progress') return !m.isCompleted;
        if (milestoneFilter === 'completed') return m.isCompleted;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [milestones, milestoneFilter]);

  const handleEdit = useCallback((entryId: number) => {
    setSelectedEntryId(entryId);
    navigate('/');
  }, [setSelectedEntryId, navigate]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    // Reorder is visual only for now — goals derive from entries store
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Future: persist order via custom field priority
  }, []);

  return (
    <AppTemplate hideSidebar transparentContent>
      <PageWrapper>
        <HeaderBar>
          <Title>Goals & Milestones</Title>
          <BackLink onClick={() => navigate('/')}>Back to Journal</BackLink>
        </HeaderBar>

        <TabRow>
          <Tab $active={tab === 'goals'} $color={headerColor} onClick={() => setTab('goals')}>
            <FontAwesomeIcon icon={faBullseye} size="sm" /> Goals ({goals.length})
          </Tab>
          <Tab $active={tab === 'milestones'} $color={headerColor} onClick={() => setTab('milestones')}>
            <FontAwesomeIcon icon={faFlag} size="sm" /> Milestones ({milestones.length})
          </Tab>
        </TabRow>

        {tab === 'goals' && (
          <FilterRow>
            {(['active', 'short_term', 'long_term', 'completed', 'all'] as GoalFilter[]).map(f => (
              <FilterBtn key={f} $active={goalFilter === f} onClick={() => setGoalFilter(f)}>
                {f === 'all' ? 'All' : f === 'short_term' ? 'Short-term' : f === 'long_term' ? 'Long-term' : f.charAt(0).toUpperCase() + f.slice(1)}
              </FilterBtn>
            ))}
          </FilterRow>
        )}

        {tab === 'milestones' && (
          <FilterRow>
            {(['all', 'active', 'in_progress', 'completed'] as MilestoneFilter[]).map(f => (
              <FilterBtn key={f} $active={milestoneFilter === f} onClick={() => setMilestoneFilter(f)}>
                {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </FilterBtn>
            ))}
          </FilterRow>
        )}

        <ListArea>
          {tab === 'goals' && (
            filteredGoals.length === 0 ? (
              <EmptyState>
                No goals found.
                <EmptySub>Create a journal entry with the Goal topic to get started.</EmptySub>
              </EmptyState>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredGoals.map(g => g.id)} strategy={verticalListSortingStrategy}>
                  {filteredGoals.map(goal => (
                    <SortableGoalCard
                      key={goal.id}
                      goal={goal}
                      milestones={milestones}
                      headerColor={headerColor}
                      onEdit={handleEdit}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )
          )}

          {tab === 'milestones' && (
            filteredMilestones.length === 0 ? (
              <EmptyState>
                No milestones found.
                <EmptySub>Create a journal entry with the Milestone topic to get started.</EmptySub>
              </EmptyState>
            ) : (
              filteredMilestones.map(milestone => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  tasks={tasks}
                  goalTitle={milestone.parentGoalId ? (goalTitles.get(milestone.parentGoalId) || null) : null}
                  headerColor={headerColor}
                  onEdit={handleEdit}
                />
              ))
            )
          )}
        </ListArea>
      </PageWrapper>
    </AppTemplate>
  );
}
