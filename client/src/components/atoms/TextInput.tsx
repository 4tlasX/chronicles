import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const StyledInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 15px;
  border: 1px solid ${({ $error }) => $error ? 'var(--danger)' : 'var(--rule)'};
  border-radius: var(--r-md, ${({ theme }) => theme.borderRadius.md}px);
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  color: var(--ink, ${({ theme }) => theme.colors.text});
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    border-color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
    box-shadow: var(--focus, 0 0 0 2px rgba(78,110,126,0.28));
  }

  &::placeholder {
    color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
    font-style: italic;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--paper-surface, #f7f4ee) inset;
    -webkit-text-fill-color: var(--ink, ${({ theme }) => theme.colors.text});
    transition: background-color 5000s ease-in-out 0s;
  }
`;

export function TextInput({ error, ...props }: TextInputProps) {
  return <StyledInput $error={error} {...props} />;
}
