import styled from 'styled-components';
import type { ReactNode } from 'react';

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  &:focus-visible + div {
    outline: 2px solid ${({ theme }) => theme.colors.borderFocus};
    outline-offset: 2px;
  }
`;

const Box = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  flex-shrink: 0;
  transition: border-color 0.15s;
`;

const CheckLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textSecondary};
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
