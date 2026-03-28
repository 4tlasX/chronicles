import styled from 'styled-components';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const StyledTextarea = styled.textarea<{ $error?: boolean }>`
  width: 100%;
  min-height: 100px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  border: 1px solid ${({ theme, $error }) => $error ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.7);
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export function Textarea({ error, ...props }: TextareaProps) {
  return <StyledTextarea $error={error} {...props} />;
}
