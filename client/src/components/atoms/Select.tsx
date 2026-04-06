import styled from 'styled-components';
import type { SelectHTMLAttributes } from 'react';

const StyledSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  padding-right: 32px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  appearance: none;
  cursor: pointer;
  outline: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 1.2em 1.2em;

  &:focus {
    border-color: var(--focus-color, ${({ theme }) => theme.colors.text});
  }
`;

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <StyledSelect {...props} />;
}
