import styled from 'styled-components';
import { Select } from '../../atoms/Select.js';
import { TextInput } from '../../atoms/TextInput.js';
import { Textarea } from '../../atoms/Textarea.js';
import { DateTimeInput } from '../../atoms/DateTimeInput.js';
import { FormField } from '../FormField.js';
import type { FoodFieldValues } from '../../../types/fields.js';
export type { FoodFieldValues } from '../../../types/fields.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  & > * { flex: 1; min-width: 0; }
`;

interface FoodFieldsProps {
  values: FoodFieldValues;
  onChange: (values: FoodFieldValues) => void;
}

export function FoodFields({ values, onChange }: FoodFieldsProps) {
  return (
    <Wrapper>
      <Row>
        <FormField label="Meal Type">
          <Select
            value={values.mealType}
            onChange={e => onChange({ ...values, mealType: e.target.value as FoodFieldValues['mealType'] })}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </Select>
        </FormField>
        <FormField label="Calories">
          <TextInput
            type="number"
            value={values.calories}
            onChange={e => onChange({ ...values, calories: e.target.value })}
            placeholder="kcal"
          />
        </FormField>
      </Row>
      <FormField label="Time Consumed">
        <DateTimeInput
          dateValue={values.consumedDate}
          timeValue={values.consumedTime}
          onDateChange={v => onChange({ ...values, consumedDate: v })}
          onTimeChange={v => onChange({ ...values, consumedTime: v })}
        />
      </FormField>
      <FormField label="Ingredients">
        <TextInput
          value={values.ingredients}
          onChange={e => onChange({ ...values, ingredients: e.target.value })}
          placeholder="Comma-separated (eggs, toast, bacon)"
        />
      </FormField>
      <FormField label="Notes">
        <Textarea
          value={values.notes}
          onChange={e => onChange({ ...values, notes: e.target.value })}
          placeholder="Additional notes"
          style={{ minHeight: 60 }}
        />
      </FormField>
    </Wrapper>
  );
}
