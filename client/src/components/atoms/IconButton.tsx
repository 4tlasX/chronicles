import styled from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.4);
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.borderFocus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function IconButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <StyledButton type="button" {...props} />;
}
