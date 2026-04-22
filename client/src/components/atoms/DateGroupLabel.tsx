import styled from 'styled-components';

/** Wrapper for a group of entries under a date heading. */
export const DateGroup = styled.div`
  & + & {
    margin-top: 24px;
  }
`;

/**
 * Italic serif date heading with day-of-week in mono and an accent-stroke
 * bottom border — matches the design spec's .date-group pattern.
 */
export const DateGroupLabel = styled.h3`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: nowrap;
  font-family: var(--serif, ${({ theme }) => theme.fontFamily.serif});
  font-size: 22px;
  font-style: italic;
  font-weight: 400;
  color: var(--ink, ${({ theme }) => theme.colors.text});
  padding-bottom: 8px;
  border-bottom: 1px solid var(--accent-stroke, ${({ theme }) => theme.colors.accentStroke});
  margin: 0 0 12px;
  line-height: 1;
`;

/** Day-of-week label (MON, TUE…) in mono uppercase — sits right of the date. */
export const DateGroupDow = styled.span`
  font-family: var(--mono, ${({ theme }) => theme.fontFamily.mono});
  font-size: 11px;
  font-style: normal;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
  white-space: nowrap;
`;
