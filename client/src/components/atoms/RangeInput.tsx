import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RangeLabel = styled.label`
  font-size: var(--text-sm, 12px);
  color: var(--text-secondary);
  font-family: var(--font-label, sans-serif);
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const RangeValue = styled.span`
  font-size: var(--text-sm, 12px);
  font-weight: 500;
  color: var(--text-primary);
  min-width: 24px;
  text-align: right;
`;

const StyledRange = styled.input`
  width: 100%;
  height: 6px;
  background: var(--border-subtle);
  border-radius: 3px;
  appearance: none;
  cursor: pointer;
  accent-color: var(--color-accent);

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-accent);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
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
