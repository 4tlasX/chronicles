import { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '../../../../../design-system/components/core/Icon.jsx';
import { TextInput } from '../../atoms/TextInput.js';
import { Select } from '../../atoms/Select.js';
import { Textarea } from '../../atoms/Textarea.js';
import { Checkbox } from '../../atoms/Checkbox.js';
import { Button } from '../../atoms/Button.js';
import { FormField } from '../FormField.js';
import type { MedicationFieldValues } from '../../../types/fields.js';
export type { MedicationFieldValues } from '../../../types/fields.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  & > * { flex: 1; min-width: 0; margin-top: 0; }
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: 8px;
`;

const TimeInput = styled.input`
  padding: 8px 12px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: var(--focus-color, ${({ theme }) => theme.colors.text});
  }
`;

const RemoveBtn = styled.button`
  padding: 4px;
  color: ${({ theme }) => theme.colors.danger};
  background: none;
  border: none;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  &:hover { background: rgba(239, 68, 68, 0.1); }
`;

interface MedicationFieldsProps {
  values: MedicationFieldValues;
  onChange: (values: MedicationFieldValues) => void;
}

export function MedicationFields({ values, onChange }: MedicationFieldsProps) {
  const addTime = () => {
    onChange({ ...values, scheduleTimes: [...values.scheduleTimes, '08:00'] });
  };

  const removeTime = (index: number) => {
    onChange({ ...values, scheduleTimes: values.scheduleTimes.filter((_, i) => i !== index) });
  };

  const updateTime = (index: number, time: string) => {
    const times = [...values.scheduleTimes];
    times[index] = time;
    onChange({ ...values, scheduleTimes: times });
  };

  return (
    <Wrapper>
      <Row>
        <FormField label="Dosage">
          <TextInput
            value={values.dosage}
            onChange={e => onChange({ ...values, dosage: e.target.value })}
            placeholder="e.g. 500mg"
          />
        </FormField>
        <FormField label="Frequency">
          <Select
            value={values.frequency}
            onChange={e => onChange({ ...values, frequency: e.target.value as MedicationFieldValues['frequency'] })}
          >
            <option value="once_daily">Once daily</option>
            <option value="twice_daily">Twice daily</option>
            <option value="three_times_daily">Three times daily</option>
            <option value="as_needed">As needed</option>
            <option value="custom">Custom</option>
          </Select>
        </FormField>
      </Row>
      <FormField label="Schedule Times">
        {values.scheduleTimes.map((time, i) => (
          <TimeRow key={i}>
            <TimeInput
              type="time"
              value={time}
              onChange={e => updateTime(i, e.target.value)}
            />
            <RemoveBtn onClick={() => removeTime(i)}>
              <Icon name="x" size={14} strokeWidth={2} />
            </RemoveBtn>
          </TimeRow>
        ))}
        <Button variant="ghost" onClick={addTime} style={{ alignSelf: 'flex-start', padding: '4px 8px', fontSize: 12 }}>
          <Icon name="plus" size={12} strokeWidth={2} /> Add time
        </Button>
      </FormField>
      <div>
        <Checkbox
          checked={values.isActive}
          onChange={v => onChange({ ...values, isActive: v })}
          label="Currently active"
        />
      </div>
      <FormField label="Notes">
        <Textarea
          value={values.notes}
          onChange={e => onChange({ ...values, notes: e.target.value })}
          placeholder="e.g. Take with food"
          style={{ minHeight: 60 }}
        />
      </FormField>
    </Wrapper>
  );
}
