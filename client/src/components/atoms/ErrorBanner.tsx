import styled from 'styled-components';

export const ErrorBanner = styled.div`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSize.sm}px;
`;
