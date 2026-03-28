import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext.js';

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.md}px;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const InfoRow = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.sm}px 0;
`;

const EmailLabel = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`;

export function AccountSection() {
  const { user } = useAuth();

  return (
    <Section>
      <SectionTitle>Account</SectionTitle>
      <InfoRow>
        Logged in as <EmailLabel>{user?.email || 'Unknown'}</EmailLabel>
      </InfoRow>
      {user?.username && (
        <InfoRow>
          Username: <EmailLabel>{user.username}</EmailLabel>
        </InfoRow>
      )}
    </Section>
  );
}
