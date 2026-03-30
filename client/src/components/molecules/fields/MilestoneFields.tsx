import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Select } from '../../atoms/Select.js';
import { DateInput } from '../../atoms/DateInput.js';
import { Checkbox } from '../../atoms/Checkbox.js';
import { FormField } from '../FormField.js';
import type { MilestoneFieldValues } from '../../../types/fields.js';
import type { GoalOption, LinkedTask } from '../../../types/ui.js';
export type { MilestoneFieldValues } from '../../../types/fields.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const LinkedTasksSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const LinkedTasksLabel = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const TaskItem = styled.div<{ $completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ $completed, theme }) => $completed ? theme.colors.textMuted : theme.colors.text};
  text-decoration: ${({ $completed }) => $completed ? 'line-through' : 'none'};
  border-radius: 4px;

  &:hover { background: rgba(0,0,0,0.02); }
`;

const TaskCheckBtn = styled.button<{ $completed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  font-size: 10px;
  color: ${({ $completed, theme }) => $completed ? theme.colors.success : theme.colors.textMuted};
  background: none;
  border: 1.5px solid ${({ $completed, theme }) => $completed ? theme.colors.success : theme.colors.border};
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.success};
  }
`;

const TaskTitle = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UnlinkBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;

  ${TaskItem}:hover & { opacity: 1; }

  &:hover { color: ${({ theme }) => theme.colors.danger || '#ef4444'}; }
`;

const NoTasks = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px 8px;
  font-style: italic;
`;

interface MilestoneFieldsProps {
  values: MilestoneFieldValues;
  onChange: (values: MilestoneFieldValues) => void;
  goalOptions: GoalOption[];
  linkedTasks?: LinkedTask[];
  onToggleTaskComplete?: (taskId: number, completed: boolean) => void;
  onUnlinkTask?: (taskId: number) => void;
}

export function MilestoneFields({ values, onChange, goalOptions, linkedTasks = [], onToggleTaskComplete, onUnlinkTask }: MilestoneFieldsProps) {
  return (
    <Wrapper>
      <FormField label="Linked Goal">
        <Select
          value={values.parentGoalId?.toString() || ''}
          onChange={e => onChange({ ...values, parentGoalId: e.target.value ? parseInt(e.target.value) : null })}
        >
          <option value="">No goal</option>
          {goalOptions.map(g => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </Select>
      </FormField>
      <Row>
        <FormField label="Status">
          <Select
            value={values.isCompleted ? 'completed' : values.milestoneStatus}
            onChange={e => {
              const status = e.target.value as MilestoneFieldValues['milestoneStatus'];
              onChange({ ...values, milestoneStatus: status, isCompleted: status === 'completed' });
            }}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
        </FormField>
        <FormField label="Target Date">
          <DateInput
            value={values.targetDate}
            onChange={e => onChange({ ...values, targetDate: e.target.value })}
          />
        </FormField>
      </Row>
      <LinkedTasksSection>
        <LinkedTasksLabel>
          Linked Tasks: {linkedTasks.filter(t => t.isCompleted).length}/{linkedTasks.length} completed
        </LinkedTasksLabel>
      </LinkedTasksSection>
    </Wrapper>
  );
}
