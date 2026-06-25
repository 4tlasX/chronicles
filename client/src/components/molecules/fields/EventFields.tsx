import styled from 'styled-components';
import { TextInput } from '../../atoms/TextInput.js';
import { Textarea } from '../../atoms/Textarea.js';
import { DateTimeInput } from '../../atoms/DateTimeInput.js';
import { FormField } from '../FormField.js';
import type { EventFieldValues } from '../../../types/fields.js';
export type { EventFieldValues } from '../../../types/fields.js';

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

interface EventFieldsProps {
  values: EventFieldValues;
  onChange: (values: EventFieldValues) => void;
}

export function EventFields({ values, onChange }: EventFieldsProps) {
  return (
    <Wrapper>
      <Row>
        <FormField label="Start">
          <DateTimeInput
            dateValue={values.startDate}
            timeValue={values.startTime}
            onDateChange={v => onChange({ ...values, startDate: v })}
            onTimeChange={v => onChange({ ...values, startTime: v })}
          />
        </FormField>
      </Row>
      <Row>
        <FormField label="End">
          <DateTimeInput
            dateValue={values.endDate}
            timeValue={values.endTime}
            onDateChange={v => onChange({ ...values, endDate: v })}
            onTimeChange={v => onChange({ ...values, endTime: v })}
          />
        </FormField>
      </Row>
      <FormField label="Location">
        <TextInput
          value={values.location}
          onChange={e => onChange({ ...values, location: e.target.value })}
          placeholder="Venue name"
        />
      </FormField>
      <FormField label="Address">
        <TextInput
          value={values.address}
          onChange={e => onChange({ ...values, address: e.target.value })}
          placeholder="Full address"
        />
      </FormField>
      <FormField label="Phone">
        <TextInput
          type="tel"
          value={values.phone}
          onChange={e => onChange({ ...values, phone: e.target.value })}
          placeholder="Contact number"
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
