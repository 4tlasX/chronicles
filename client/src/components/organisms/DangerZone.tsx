import styled from 'styled-components';
import { Button } from '../atoms/Button.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { useNavigate } from 'react-router-dom';

const Section = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xxl}px;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
  border-top: 1px solid ${({ theme }) => theme.colors.danger};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.md}px;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export function DangerZone() {
  const { logout } = useAuth();
  const { lock } = useEncryption();
  const clearAll = useEntriesStore(s => s.clearAll);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    lock();
    clearAll();
    await logout();
    navigate('/login');
  };

  return (
    <Section>
      <SectionTitle>Danger Zone</SectionTitle>
      <Description>
        Signing out will clear your encryption key from memory. You will need to re-enter your password to access your entries.
      </Description>
      <Button variant="danger" onClick={handleSignOut}>
        Sign Out
      </Button>
    </Section>
  );
}
