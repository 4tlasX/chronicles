import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../atoms/Button.js';
import { sessions as sessionsApi } from '../../services/api.js';

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.md}px;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const SessionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
`;

const SessionInfo = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
`;

const SessionMeta = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CurrentBadge = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.success};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

import type { SessionData } from '../../types/ui.js';

export function SessionManager() {
  const [sessionList, setSessionList] = useState<SessionData[]>([]);

  useEffect(() => {
    sessionsApi.getAll().then(setSessionList).catch(console.error);
  }, []);

  const handleRevoke = async (id: number) => {
    await sessionsApi.revoke(id);
    setSessionList(prev => prev.filter(s => s.id !== id));
  };

  const handleRevokeAll = async () => {
    await sessionsApi.revokeAll();
    setSessionList(prev => prev.filter(s => s.isCurrent));
  };

  return (
    <Section>
      <SectionTitle>Active Sessions</SectionTitle>
      <SessionList>
        {sessionList.map(session => (
          <SessionRow key={session.id}>
            <div>
              <SessionInfo>
                {session.deviceInfo || 'Unknown device'}
                {session.isCurrent && <CurrentBadge> (Current)</CurrentBadge>}
              </SessionInfo>
              <SessionMeta>
                {session.ipAddress} · Last active {new Date(session.lastActiveAt).toLocaleDateString()}
              </SessionMeta>
            </div>
            {!session.isCurrent && (
              <Button variant="danger" onClick={() => handleRevoke(session.id)}>
                Revoke
              </Button>
            )}
          </SessionRow>
        ))}
      </SessionList>
      {sessionList.length > 1 && (
        <Button variant="danger" onClick={handleRevokeAll} style={{ marginTop: 12 }}>
          Revoke all other sessions
        </Button>
      )}
    </Section>
  );
}
