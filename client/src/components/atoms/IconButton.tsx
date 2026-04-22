import styled from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  color: var(--ink-2, ${({ theme }) => theme.colors.textSecondary});
  border: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  border-radius: var(--r-md, ${({ theme }) => theme.borderRadius.md}px);
  cursor: pointer;
  font-size: 14px;
  transition: background 120ms ease, color 120ms ease, border-color 120ms ease;

  &:hover:not(:disabled) {
    background: var(--paper-hover, ${({ theme }) => theme.colors.surfaceHover});
    color: var(--ink, ${({ theme }) => theme.colors.text});
    border-color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--focus, 0 0 0 2px rgba(78,110,126,0.28));
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function IconButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <StyledButton type="button" {...props} />;
}
