import { useState, type InputHTMLAttributes } from 'react';
import styled from 'styled-components';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean;
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  padding-right: 48px;
  font-size: ${({ theme }) => theme.fontSize.md}px;
  border: 1px solid ${({ theme, $error }) => $error ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: none;
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

export function PasswordInput({ error, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Wrapper>
      <StyledInput
        type={visible ? 'text' : 'password'}
        $error={error}
        {...props}
      />
      <ToggleButton type="button" onClick={() => setVisible(!visible)}>
        {visible ? 'Hide' : 'Show'}
      </ToggleButton>
    </Wrapper>
  );
}
