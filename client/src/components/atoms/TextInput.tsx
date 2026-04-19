import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const StyledInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 8px 12px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #faf8f2 inset;
    -webkit-text-fill-color: ${({ theme }) => theme.colors.text};
    transition: background-color 5000s ease-in-out 0s;
  }
`;

export function TextInput({ error, ...props }: TextInputProps) {
  return <StyledInput $error={error} {...props} />;
}
