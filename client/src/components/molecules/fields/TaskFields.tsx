import { Checkbox } from '../../atoms/Checkbox.js';
import { Select } from '../../atoms/Select.js';
import { TextInput } from '../../atoms/TextInput.js';
import { FormField } from '../FormField.js';
import styled from 'styled-components';
import type { TaskFieldValues } from '../../../types/fields.js';
import type { MilestoneOption } from '../../../types/ui.js';
export type { TaskFieldValues } from '../../../types/fields.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

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
      <FormField label="Deadline">
        <TextInput
          type="date"
          value={values.deadline || ''}
          onChange={e => onChange({ ...values, deadline: e.target.value })}
        />
      </FormField>
      <CheckboxGroup>
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
      </CheckboxGroup>
    </Wrapper>
  );
}
