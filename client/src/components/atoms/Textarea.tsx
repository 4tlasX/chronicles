import styled from 'styled-components';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const StyledTextarea = styled.textarea<{ $error?: boolean }>`
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  font-size: 16px;
  -webkit-appearance: none;
  border: 1px solid ${({ theme, $error }) => $error ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
  outline: none;
  touch-action: auto;
  user-select: text;
  -webkit-user-select: text;
  transition: border-color 0.15s;
  font-family: inherit;

  &:focus {
    border-color: var(--focus-color, ${({ theme }) => theme.colors.text});
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export function Textarea({ error, ...props }: TextareaProps) {
  return <StyledTextarea $error={error} {...props} />;
}
