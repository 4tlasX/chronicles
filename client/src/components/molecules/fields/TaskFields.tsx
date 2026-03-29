import { Checkbox } from '../../atoms/Checkbox.js';
import { Select } from '../../atoms/Select.js';
import { FormField } from '../FormField.js';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export interface TaskFieldValues {
  isInProgress: boolean;
  isCompleted: boolean;
  isAutoMigrating: boolean;
  parentMilestoneId: number | null;
}

interface MilestoneOption {
  id: number;
  title: string;
}

interface TaskFieldsProps {
  values: TaskFieldValues;
  onChange: (values: TaskFieldValues) => void;
  milestoneOptions?: MilestoneOption[];
}

export function TaskFields({ values, onChange, milestoneOptions = [] }: TaskFieldsProps) {
  return (
    <Wrapper>
      {milestoneOptions.length > 0 && (
        <FormField label="Linked Milestone">
          <Select
            value={values.parentMilestoneId?.toString() || ''}
            onChange={e => onChange({ ...values, parentMilestoneId: e.target.value ? parseInt(e.target.value) : null })}
          >
            <option value="">No milestone</option>
            {milestoneOptions.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </Select>
        </FormField>
      )}
      <Checkbox
        checked={values.isInProgress}
        onChange={v => onChange({ ...values, isInProgress: v })}
        label="In Progress"
      />
      <Checkbox
        checked={values.isCompleted}
        onChange={v => onChange({ ...values, isCompleted: v })}
        label="Completed"
      />
      <Checkbox
        checked={values.isAutoMigrating}
        onChange={v => onChange({ ...values, isAutoMigrating: v })}
        label="Auto-migrate"
      />
    </Wrapper>
  );
}
