import styled from 'styled-components';

const StyledLabel = styled.label`
  display: block;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0;
`;

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <StyledLabel {...props} />;
}
