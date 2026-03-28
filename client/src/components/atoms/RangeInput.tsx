import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RangeLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RangeValue = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  min-width: 24px;
  text-align: right;
`;

const StyledRange = styled.input`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  appearance: none;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.textSecondary};
`;

interface RangeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  displayValue?: string;
}

export function RangeInput({ label, displayValue, value, ...props }: RangeInputProps) {
  return (
    <Wrapper>
      {(label || displayValue) && (
        <HeaderRow>
          {label && <RangeLabel>{label}</RangeLabel>}
          <RangeValue>{displayValue ?? value}</RangeValue>
        </HeaderRow>
      )}
      <StyledRange type="range" value={value} {...props} />
    </Wrapper>
  );
}
