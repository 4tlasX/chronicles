import styled from 'styled-components';

const StyledLabel = styled.label`
  display: block;
  font-family: var(--font-label, ${({ theme }) => theme.fontFamily.ui});
  font-size: var(--text-xs, 13px);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: var(--text-secondary);
  margin-bottom: 0;
`;

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <StyledLabel {...props} />;
}
