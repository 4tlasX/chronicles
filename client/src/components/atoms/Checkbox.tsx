import styled from 'styled-components';

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
`;

const Box = styled.div<{ $checked: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 2px;
  border: ${({ $checked, theme }) => $checked ? 'none' : `1.5px solid ${theme.colors.border}`};
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 11px;
  transition: color 0.15s, border-color 0.15s;
`;

const CheckLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
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
