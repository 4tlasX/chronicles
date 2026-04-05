import { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '../atoms/EmptyState.js';
import { EditableEntryCard } from './EditableEntryCard.js';
import type { DecryptedPost } from '@shared/crypto/types';
import type { Topic } from '../../types/topics.js';

const Panel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text};
`;

const Count = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  &:hover { background: rgba(0, 0, 0, 0.05); }
`;

const List = styled.div`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  padding-bottom: 48px;
`;

interface CalendarDayDetailProps {
  dateStr: string;
  entries: DecryptedPost[];
  allTopics: Topic[];
  accentColor: string;
  onClose: () => void;
}

export function CalendarDayDetail({ dateStr, entries, allTopics, accentColor, onClose }: CalendarDayDetailProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const getTopicForEntry = (entry: DecryptedPost) => {
    const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
    return taxId ? allTopics.find(t => t.id === taxId) : undefined;
  };

  return (
    <Panel>
      <Header>
        <div>
          <Title>{dateLabel}</Title>
          <Count>{entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}</Count>
        </div>
        <CloseBtn onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} />
        </CloseBtn>
      </Header>

      <List>
        {entries.length === 0 ? (
          <EmptyState message="No entries for this day." />
        ) : (
          entries.map(entry => (
            <EditableEntryCard
              key={entry.id}
              entry={entry}
              topic={getTopicForEntry(entry)}
              headerColor={accentColor}
              isEditing={editingId === entry.id}
              onSelect={() => setEditingId(editingId === entry.id ? null : entry.id)}
              onClose={() => setEditingId(null)}
              onDeleted={() => setEditingId(null)}
              showAsPlain
            />
          ))
        )}
      </List>
    </Panel>
  );
}
