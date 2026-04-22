import styled from 'styled-components';
import type { ReactNode } from 'react';

const Wrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  &:focus-visible + div {
    box-shadow: var(--focus, 0 0 0 2px rgba(78,110,126,0.28));
  }
`;

const Box = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: var(--r-sm, ${({ theme }) => theme.borderRadius.sm}px);
  border: 1px solid ${({ $checked }) =>
    $checked ? 'var(--ink, #2b2824)' : 'var(--ink-3, #6b645a)'};
  background: ${({ $checked }) =>
    $checked ? 'var(--ink, #2b2824)' : 'var(--paper-surface, #f7f4ee)'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--paper-surface, #f7f4ee);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  transition: background 120ms ease, border-color 120ms ease;
`;

const CheckLabel = styled.span`
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 14px;
  font-weight: 400;
  color: var(--ink-2, ${({ theme }) => theme.colors.textSecondary});
`;

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <Wrapper>
      <HiddenInput
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <Box $checked={checked}>
        {checked && '✓'}
      </Box>
      {label && <CheckLabel>{label}</CheckLabel>}
    </Wrapper>
  );
}
