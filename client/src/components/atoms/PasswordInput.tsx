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
  padding: 8px 12px;
  padding-right: 56px;
  font-size: 16px;
  border: 1px solid ${({ theme, $error }) => $error ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--focus-color, ${({ theme }) => theme.colors.text});
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--paper-surface, #f7f4ee) inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text};
    transition: background-color 5000s ease-in-out 0s;
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
