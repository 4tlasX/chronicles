import styled from 'styled-components';
import type { ReactNode } from 'react';

interface SectionDividerProps {
  label?: ReactNode;
  dashed?: boolean;
  spacing?: number;
  className?: string;
}

const Rule = styled.hr<{ $dashed?: boolean; $spacing?: number }>`
  border: none;
  border-top: 1px ${({ $dashed }) => $dashed ? 'dashed' : 'solid'} var(--rule, ${({ theme }) => theme.colors.border});
  margin: ${({ $spacing }) =>
    $spacing !== undefined ? `${$spacing}px` : `var(--s-6, 24px)`} 0;
`;

const LabeledWrapper = styled.div<{ $spacing?: number }>`
  display: flex;
  align-items: center;
  gap: var(--s-2, 8px);
  margin: ${({ $spacing }) =>
    $spacing !== undefined ? `${$spacing}px` : `var(--s-6, 24px)`} 0;
`;

const LabeledRule = styled.div`
  flex: 1;
  height: 1px;
  background: var(--rule, ${({ theme }) => theme.colors.border});
`;

const LabelText = styled.span`
  font-family: var(--mono, ${({ theme }) => theme.fontFamily.mono});
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
  white-space: nowrap;
  font-style: italic;
`;

export function SectionDivider({ label, dashed, spacing, className }: SectionDividerProps) {
  if (label) {
    return (
      <LabeledWrapper $spacing={spacing} className={className}>
        <LabeledRule />
        <LabelText>{label}</LabelText>
        <LabeledRule />
      </LabeledWrapper>
    );
  }
  return <Rule $dashed={dashed} $spacing={spacing} className={className} />;
}
