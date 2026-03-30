import styled from 'styled-components';

/** Container for a group of entries under a date header. Adds top border between groups. */
export const DateGroup = styled.div`
  &:not(:first-child) { border-top: 1px solid ${({ theme }) => theme.colors.border}; }
`;

/** Uppercase date header for grouped lists. */
export const DateGroupLabel = styled.div`
  padding: 8px 20px 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
