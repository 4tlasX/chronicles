import styled from 'styled-components';
import { Select } from '../../atoms/Select.js';
import { DateInput } from '../../atoms/DateInput.js';
import { FormField } from '../FormField.js';
import type { GoalFieldValues } from '../../../types/fields.js';
export type { GoalFieldValues } from '../../../types/fields.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;

  & > * {
    flex: 1;
    min-width: 0;
  }
`;

interface GoalFieldsProps {
  values: GoalFieldValues;
  onChange: (values: GoalFieldValues) => void;
}

export function GoalFields({ values, onChange }: GoalFieldsProps) {
  return (
    <Wrapper>
      <Row>
        <FormField label="Type">
          <Select
            value={values.goalType}
            onChange={e => onChange({ ...values, goalType: e.target.value as GoalFieldValues['goalType'] })}
          >
            <option value="short_term">Short-term</option>
            <option value="long_term">Long-term</option>
          </Select>
        </FormField>
        <FormField label="Status">
          <Select
            value={values.goalStatus}
            onChange={e => onChange({ ...values, goalStatus: e.target.value as GoalFieldValues['goalStatus'] })}
          >
            <option value="new">New</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>
        </FormField>
      </Row>
      <FormField label="Target Date">
        <DateInput
          value={values.targetDate}
          onChange={e => onChange({ ...values, targetDate: e.target.value })}
        />
      </FormField>
    </Wrapper>
  );
}
