import styled from 'styled-components';
import type { InputHTMLAttributes } from 'react';

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: var(--focus-color, ${({ theme }) => theme.colors.borderFocus});
    box-shadow: 0 0 0 3px rgba(var(--focus-color-rgb, 78, 110, 126), 0.12);
  }
`;

export function DateInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <StyledInput type="date" {...props} />;
}
