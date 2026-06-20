import styled, { css } from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const sizeStyles = {
  md: css`padding: 10px 18px; font-size: 14px;`,
  sm: css`padding: 6px 12px; font-size: 12.5px;`,
};

const variantStyles = {
  primary: css`
    background: var(--color-accent, ${({ theme }) => theme.colors.accent});
    color: var(--on-accent, ${({ theme }) => theme.colors.textInverse});
    border: 1px solid var(--color-accent, ${({ theme }) => theme.colors.accent});
    &:hover:not(:disabled) {
      background: var(--color-accent-hover, ${({ theme }) => theme.colors.accentHover});
      border-color: var(--color-accent-hover, ${({ theme }) => theme.colors.accentHover});
    }
  `,
  secondary: css`
    background: var(--bg-sunken, ${({ theme }) => theme.colors.surfaceHover});
    color: var(--text-primary, ${({ theme }) => theme.colors.text});
    border: 1px solid var(--border-default, ${({ theme }) => theme.colors.border});
    &:hover:not(:disabled) {
      background: var(--bg-hover, ${({ theme }) => theme.colors.surfaceDeep});
      border-color: var(--border-strong, ${({ theme }) => theme.colors.border});
    }
  `,
  ghost: css`
    background: transparent;
    color: var(--text-primary, ${({ theme }) => theme.colors.text});
    border: 1px solid var(--border-default, ${({ theme }) => theme.colors.border});
    &:hover:not(:disabled) {
      background: var(--bg-hover, ${({ theme }) => theme.colors.surfaceHover});
      border-color: var(--border-strong, ${({ theme }) => theme.colors.border});
    }
  `,
  danger: css`
    background: var(--danger, ${({ theme }) => theme.colors.danger});
    color: #fff;
    border: 1px solid var(--danger, ${({ theme }) => theme.colors.danger});
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.dangerHover};
      border-color: ${({ theme }) => theme.colors.dangerHover};
    }
  `,
};

const StyledButton = styled.button<{ $variant: Variant; $size: Size; $fullWidth: boolean }>`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm}px;
    font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
    font-weight: 700;
    letter-spacing: 0.01em;
    border-radius: var(--r-md, ${({ theme }) => theme.borderRadius.md}px);
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
    width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
    white-space: nowrap;

    ${({ $size }) => sizeStyles[$size]}
    ${({ $variant }) => variantStyles[$variant]}

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus, 0 0 0 2px rgba(78,110,126,0.3));
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

export function Button({ variant = 'primary', size = 'md', fullWidth = false, ...props }: ButtonProps) {
  return <StyledButton $variant={variant} $size={size} $fullWidth={fullWidth} {...props} />;
}
