export interface PlannerFilterConfig {
  keyword: string;
  itemTypes: Array<'goals' | 'milestones' | 'tasks' | 'todos'>;
  goalStatus: string;
  taskStatus: string;
  priority: string;
  parentGoalId: number | null;
  parentMilestoneId: number | null;
}

export interface SavedPlannerFilter {
  id: string;
  name: string;
  config: PlannerFilterConfig;
}

export const EMPTY_PLANNER_FILTER: PlannerFilterConfig = {
  keyword: '',
  itemTypes: [],
  goalStatus: 'all',
  taskStatus: 'all',
  priority: 'all',
  parentGoalId: null,
  parentMilestoneId: null,
};

export function filtersEqual(a: PlannerFilterConfig, b: PlannerFilterConfig): boolean {
  return (
    a.keyword === b.keyword &&
    a.goalStatus === b.goalStatus &&
    a.taskStatus === b.taskStatus &&
    a.priority === b.priority &&
    a.parentGoalId === b.parentGoalId &&
    a.parentMilestoneId === b.parentMilestoneId &&
    a.itemTypes.length === b.itemTypes.length &&
    a.itemTypes.every(t => b.itemTypes.includes(t))
  );
}

export function isFilterEmpty(f: PlannerFilterConfig): boolean {
  return (
    !f.keyword.trim() &&
    f.itemTypes.length === 0 &&
    f.goalStatus === 'all' &&
    f.taskStatus === 'all' &&
    f.priority === 'all' &&
    f.parentGoalId === null &&
    f.parentMilestoneId === null
  );
}
