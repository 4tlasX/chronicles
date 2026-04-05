import styled, { css } from 'styled-components';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover:not(:disabled) { background: rgba(0,0,0,0.03); }
  `,
  secondary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
    &:hover:not(:disabled) { background: rgba(0,0,0,0.03); }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.textInverse};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.dangerHover}; }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.surfaceHover}; }
  `,
};

const StyledButton = styled.button<{ $variant: Variant; $fullWidth: boolean }>`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm}px;
    padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px;
    font-size: ${({ theme }) => theme.fontSize.md}px;
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    border-radius: ${({ theme }) => theme.borderRadius.md}px;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
    width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};

    ${({ $variant }) => variantStyles[$variant]}

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.borderFocus};
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

export function Button({ variant = 'primary', fullWidth = false, ...props }: ButtonProps) {
  return <StyledButton $variant={variant} $fullWidth={fullWidth} {...props} />;
}
