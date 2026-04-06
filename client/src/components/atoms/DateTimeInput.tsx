import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const StyledInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentLight};
  }
`;

interface DateTimeInputProps {
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  dateProps?: InputHTMLAttributes<HTMLInputElement>;
  timeProps?: InputHTMLAttributes<HTMLInputElement>;
}

export function DateTimeInput({ dateValue, timeValue, onDateChange, onTimeChange, dateProps, timeProps }: DateTimeInputProps) {
  return (
    <Wrapper>
      <StyledInput
        type="date"
        value={dateValue}
        onChange={e => onDateChange(e.target.value)}
        {...dateProps}
      />
      <StyledInput
        type="time"
        value={timeValue}
        onChange={e => onTimeChange(e.target.value)}
        {...timeProps}
      />
    </Wrapper>
  );
}
