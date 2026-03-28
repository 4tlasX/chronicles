import styled from 'styled-components';

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  cursor: pointer;
`;

const Track = styled.div<{ $checked: boolean }>`
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: ${({ $checked, theme }) => $checked ? theme.colors.accent : theme.colors.border};
  position: relative;
  transition: background 0.2s;
`;

const Thumb = styled.div<{ $checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  left: ${({ $checked }) => $checked ? '20px' : '2px'};
  transition: left 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
`;

const ToggleLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.text};
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <Wrapper>
      <HiddenInput
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <Track $checked={checked}>
        <Thumb $checked={checked} />
      </Track>
      {label && <ToggleLabel>{label}</ToggleLabel>}
    </Wrapper>
  );
}
