import styled from 'styled-components';
import { TextInput } from '../../atoms/TextInput.js';
import { Textarea } from '../../atoms/Textarea.js';
import { DateTimeInput } from '../../atoms/DateTimeInput.js';
import { FormField } from '../FormField.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export interface MeetingFieldValues {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  meetingTopic: string;
  attendees: string;
  location: string;
  address: string;
  phone: string;
  notes: string;
}

interface MeetingFieldsProps {
  values: MeetingFieldValues;
  onChange: (values: MeetingFieldValues) => void;
}

export function MeetingFields({ values, onChange }: MeetingFieldsProps) {
  return (
    <Wrapper>
      <FormField label="Meeting Topic">
        <TextInput
          value={values.meetingTopic}
          onChange={e => onChange({ ...values, meetingTopic: e.target.value })}
          placeholder="What is the meeting about?"
        />
      </FormField>
      <FormField label="Attendees">
        <TextInput
          value={values.attendees}
          onChange={e => onChange({ ...values, attendees: e.target.value })}
          placeholder="Comma-separated names"
        />
      </FormField>
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
          placeholder="Agenda or additional details"
          style={{ minHeight: 60 }}
        />
      </FormField>
    </Wrapper>
  );
}
