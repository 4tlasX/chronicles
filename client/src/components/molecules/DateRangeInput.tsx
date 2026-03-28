import styled from 'styled-components';
import { DateInput } from '../atoms/DateInput.js';

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
`;

const RangeLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`;

interface DateRangeInputProps {
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangeInput({ fromValue, toValue, onFromChange, onToChange }: DateRangeInputProps) {
  return (
    <Row>
      <RangeLabel>From</RangeLabel>
      <DateInput value={fromValue} onChange={e => onFromChange(e.target.value)} />
      <RangeLabel>To</RangeLabel>
      <DateInput value={toValue} onChange={e => onToChange(e.target.value)} />
    </Row>
  );
}
