import styled from 'styled-components';
import { RangeInput } from '../../atoms/RangeInput.js';
import { FormField } from '../FormField.js';
import type { WellnessFieldValues } from '../../../types/fields.js';
export type { WellnessFieldValues } from '../../../types/fields.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  & > * { flex: 1; min-width: 0; }
`;

const NumberInput = styled.input`
  width: 100%;
  padding: 7px 10px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  box-sizing: border-box;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.textMuted}; }
`;

const DateLabel = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px 0;
`;

const MOOD_LABELS: Record<number, string> = { 1: 'Very sad', 2: 'Sad', 3: 'Neutral', 4: 'Good', 5: 'Great' };

interface WellnessFieldsProps {
  values: WellnessFieldValues;
  onChange: (values: WellnessFieldValues) => void;
}

export function WellnessFields({ values, onChange }: WellnessFieldsProps) {
  const moodLabel = values.moodScore > 0 ? MOOD_LABELS[values.moodScore] : 'Not set';
  const waterLabel = `${values.waterGlasses} / ${values.waterGoal || 8} glasses`;
  const sleepLabel = values.sleepHours > 0 ? `${values.sleepHours}h` : 'Not set';

  return (
    <Wrapper>
      {values.date && (
        <FormField label="Check-in Date">
          <DateLabel>{values.date}</DateLabel>
        </FormField>
      )}

      <FormField label="Water">
        <RangeInput
          min={0}
          max={values.waterGoal || 8}
          value={values.waterGlasses}
          displayValue={waterLabel}
          onChange={e => onChange({ ...values, waterGlasses: parseInt((e.target as HTMLInputElement).value) })}
        />
      </FormField>

      <FormField label="Mood">
        <RangeInput
          min={0}
          max={5}
          value={values.moodScore}
          displayValue={moodLabel}
          onChange={e => onChange({ ...values, moodScore: parseInt((e.target as HTMLInputElement).value) })}
        />
      </FormField>

      <Row>
        <FormField label="Sleep (hours)">
          <NumberInput
            type="number"
            min={0}
            max={12}
            step={0.5}
            value={values.sleepHours || ''}
            placeholder={sleepLabel}
            onChange={e => onChange({ ...values, sleepHours: parseFloat(e.target.value) || 0 })}
          />
        </FormField>
      </Row>
    </Wrapper>
  );
}
