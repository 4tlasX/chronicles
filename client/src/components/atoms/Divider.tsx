import styled from 'styled-components';

const StyledDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md}px 0;
`;

export function Divider() {
  return <StyledDivider />;
}
