import styled from 'styled-components';
import { RangeInput } from '../../atoms/RangeInput.js';
import { TextInput } from '../../atoms/TextInput.js';
import { Textarea } from '../../atoms/Textarea.js';
import { FormField } from '../FormField.js';
import type { AllergyFieldValues } from '../../../types/fields.js';
export type { AllergyFieldValues } from '../../../types/fields.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

interface AllergyFieldsProps {
  values: AllergyFieldValues;
  onChange: (values: AllergyFieldValues) => void;
}

export function AllergyFields({ values, onChange }: AllergyFieldsProps) {
  return (
    <Wrapper>
      <FormField label="Allergen">
        <TextInput
          value={values.allergen}
          onChange={e => onChange({ ...values, allergen: e.target.value })}
          placeholder="e.g. Peanuts, Pollen, Dust"
        />
      </FormField>
      <FormField label="Severity">
        <RangeInput
          min={1}
          max={10}
          value={values.severity}
          displayValue={`${values.severity}/10`}
          onChange={e => onChange({ ...values, severity: parseInt((e.target as HTMLInputElement).value) })}
        />
      </FormField>
      <FormField label="Reaction">
        <TextInput
          value={values.reaction}
          onChange={e => onChange({ ...values, reaction: e.target.value })}
          placeholder="e.g. Hives, Swelling, Difficulty breathing"
        />
      </FormField>
      <FormField label="Notes">
        <Textarea
          value={values.notes}
          onChange={e => onChange({ ...values, notes: e.target.value })}
          placeholder="Additional details"
          style={{ minHeight: 60 }}
        />
      </FormField>
    </Wrapper>
  );
}
