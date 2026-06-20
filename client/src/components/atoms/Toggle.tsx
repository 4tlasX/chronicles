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

const Track = styled.div<{ $checked: boolean }>`
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: ${({ $checked }) =>
    $checked ? 'var(--color-accent)' : 'var(--bg-active)'};
  border: 1px solid ${({ $checked }) =>
    $checked ? 'var(--color-accent)' : 'var(--border-default)'};
  position: relative;
  transition: background 150ms ease, border-color 150ms ease;
  flex-shrink: 0;
`;

const Thumb = styled.div<{ $checked: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $checked }) => $checked ? '20px' : '2px'};
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: left 150ms ease;
`;

const ToggleLabel = styled.span`
  font-family: var(--font-sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 14px;
  color: var(--text-primary, ${({ theme }) => theme.colors.text});
`;

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  activeColor?: string;
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
