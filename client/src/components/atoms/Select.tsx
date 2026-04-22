import styled from 'styled-components';
import type { SelectHTMLAttributes } from 'react';

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  padding-right: 32px;
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 15px;
  border: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  border-radius: var(--r-md, ${({ theme }) => theme.borderRadius.md}px);
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  color: var(--ink, ${({ theme }) => theme.colors.text});
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b645a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 1.2em 1.2em;

  &:focus {
    border-color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
    box-shadow: var(--focus, 0 0 0 2px rgba(78,110,126,0.28));
  }
`;

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <StyledSelect {...props} />;
}
