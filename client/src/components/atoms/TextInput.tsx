import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const StyledInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  font-family: var(--font-sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 15px;
  border: 1px solid ${({ $error }) => $error ? 'var(--color-danger)' : 'var(--border-subtle)'};
  border-radius: var(--r-md, ${({ theme }) => theme.borderRadius.md}px);
  background: var(--bg-sunken, ${({ theme }) => theme.colors.surfaceDeep});
  color: var(--text-primary, ${({ theme }) => theme.colors.text});
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    border-color: var(--border-strong, ${({ theme }) => theme.colors.textFaint});
    box-shadow: var(--focus, 0 0 0 3px rgba(91,83,214,0.28));
  }

  &::placeholder {
    color: var(--text-disabled, ${({ theme }) => theme.colors.textFaint});
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--bg-sunken, #f5f6f8) inset;
    -webkit-text-fill-color: var(--text-primary, ${({ theme }) => theme.colors.text});
    transition: background-color 5000s ease-in-out 0s;
  }
`;

export function TextInput({ error, ...props }: TextInputProps) {
  return <StyledInput $error={error} {...props} />;
}
