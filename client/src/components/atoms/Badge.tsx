import styled from 'styled-components';

const StyledBadge = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background: ${({ $color }) => $color ? `${$color}20` : 'rgba(0,0,0,0.05)'};
  color: ${({ $color, theme }) => $color || theme.colors.textSecondary};
`;

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

export function Badge({ children, color }: BadgeProps) {
  return <StyledBadge $color={color}>{children}</StyledBadge>;
}
