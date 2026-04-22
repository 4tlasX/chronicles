import styled from 'styled-components';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const StyledTextarea = styled.textarea<{ $error?: boolean }>`
  width: 100%;
  min-height: 96px;
  padding: 10px 12px;
  font-family: var(--serif, ${({ theme }) => theme.fontFamily.serif});
  font-size: 17px;
  font-style: italic;
  line-height: 1.6;
  -webkit-appearance: none;
  border: 1px solid ${({ $error }) => $error ? 'var(--danger)' : 'var(--rule)'};
  border-radius: var(--r-md, ${({ theme }) => theme.borderRadius.md}px);
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  color: var(--ink-2, ${({ theme }) => theme.colors.textSecondary});
  resize: vertical;
  outline: none;
  touch-action: auto;
  user-select: text;
  -webkit-user-select: text;
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus {
    border-color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
    box-shadow: var(--focus, 0 0 0 2px rgba(78,110,126,0.28));
  }

  &::placeholder {
    font-style: italic;
    color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
  }
`;

export function Textarea({ error, ...props }: TextareaProps) {
  return <StyledTextarea $error={error} {...props} />;
}
