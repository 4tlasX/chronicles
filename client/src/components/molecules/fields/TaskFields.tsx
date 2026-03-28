import { Checkbox } from '../../atoms/Checkbox.js';
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
}

interface TaskFieldsProps {
  values: TaskFieldValues;
  onChange: (values: TaskFieldValues) => void;
}

export function TaskFields({ values, onChange }: TaskFieldsProps) {
  return (
    <Wrapper>
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
