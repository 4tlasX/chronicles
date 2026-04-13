export type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

export interface ScheduledDose {
  medicationPostId: number;
  medicationName: string;
  dosage: string;
  time: string;
}

export type RecoverStep = 'email' | 'recovery' | 'newPassword' | 'newKey';
