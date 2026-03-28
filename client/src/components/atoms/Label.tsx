import styled from 'styled-components';

const StyledLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <StyledLabel {...props} />;
}
