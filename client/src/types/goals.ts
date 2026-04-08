export interface GoalEntry {
  id: number;
  content: string;
  title: string;
  goalType: string;
  goalStatus: string;
  targetDate: string;
  customFields: Record<string, unknown>;
  taxonomyId: number;
  createdAt: Date;
}

export interface MilestoneEntryData {
  id: number;
  content: string;
  title: string;
  milestoneStatus: string;
  isCompleted: boolean;
  targetDate: string;
  parentGoalId: number | null;
  customFields: Record<string, unknown>;
  taxonomyId: number;
  createdAt: Date;
}

export interface TaskEntryData {
  id: number;
  content: string;
  title: string;
  isCompleted: boolean;
  parentMilestoneId: number | null;
  priority: string;
  customFields: Record<string, unknown>;
  taxonomyId: number;
}
