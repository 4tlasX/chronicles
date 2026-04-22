import styled, { css } from 'styled-components';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'ink' | 'accent' | 'danger' | 'success' | 'warning';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, ReturnType<typeof css>> = {
  default: css`
    background: var(--paper-hover, ${({ theme }) => theme.colors.surfaceHover});
    border: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
    color: var(--ink-2, ${({ theme }) => theme.colors.textSecondary});
  `,
  ink: css`
    background: var(--accent-fill, ${({ theme }) => theme.colors.text});
    border: 1px solid var(--accent-fill, ${({ theme }) => theme.colors.text});
    color: var(--accent-fill-ink, ${({ theme }) => theme.colors.textInverse});
  `,
  accent: css`
    background: var(--accent-tint, rgba(78,110,126,0.12));
    border: 1px solid transparent;
    color: var(--accent, ${({ theme }) => theme.colors.accent});
  `,
  danger: css`
    background: rgba(155, 68, 68, 0.1);
    border: 1px solid transparent;
    color: var(--danger, ${({ theme }) => theme.colors.danger});
  `,
  success: css`
    background: rgba(90, 138, 106, 0.12);
    border: 1px solid transparent;
    color: var(--success, ${({ theme }) => theme.colors.success});
  `,
  warning: css`
    background: rgba(184, 150, 90, 0.12);
    border: 1px solid transparent;
    color: var(--warning, ${({ theme }) => theme.colors.warning});
  `,
};

const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--r-sm, ${({ theme }) => theme.borderRadius.sm}px);
  letter-spacing: 0.02em;
  white-space: nowrap;
  ${({ $variant }) => variantStyles[$variant]}
`;

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <StyledBadge $variant={variant} className={className}>{children}</StyledBadge>;
}
