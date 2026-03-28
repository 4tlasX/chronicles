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
  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border: 2px solid ${({ $checked, theme }) => $checked ? theme.colors.accent : theme.colors.border};
  background: ${({ $checked, theme }) => $checked ? theme.colors.accent : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  transition: background 0.15s, border-color 0.15s;
`;

const CheckLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.text};
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
