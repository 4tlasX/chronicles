import styled from 'styled-components';
import type { ReactNode } from 'react';
import { Icon } from '../../../../design-system/components/core/Icon';

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

const Box = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: color 120ms ease;

  &:hover {
    color: var(--text-secondary);
  }
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
      <Box
        type="button"
        onClick={() => onChange(!checked)}
        style={{ color: checked ? 'var(--color-accent)' : 'var(--text-tertiary)' }}
      >
        <Icon
          name={checked ? 'check-circle' : 'circle'}
          size={18}
          strokeWidth={2}
        />
      </Box>
      {label && <CheckLabel>{label}</CheckLabel>}
    </Wrapper>
  );
}
