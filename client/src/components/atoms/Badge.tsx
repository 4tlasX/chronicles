import styled from 'styled-components';

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
`;

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  capitalize?: boolean;
}

export function Badge({ children }: BadgeProps) {
  return <StyledBadge>{children}</StyledBadge>;
}
