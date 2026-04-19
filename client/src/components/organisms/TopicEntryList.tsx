import { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '../atoms/EmptyState.js';
import { EditableEntryCard } from './EditableEntryCard.js';
import { NewEntryCard } from './NewEntryCard.js';
import type { DecryptedPost } from '@shared/crypto/types';
import type { Topic } from '../../types/topics.js';

const Panel = styled.div<{ $hidden?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  @media (max-width: 1024px) {
    display: ${({ $hidden }) => $hidden ? 'none' : 'flex'};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 1.25rem;
  font-weight: 500;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
`;

const MobileBack = styled.button`
  display: none;
  align-items: center;
  gap: 4px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  &:hover { opacity: 0.7; }
  @media (max-width: 1024px) { display: flex; }
`;

const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { opacity: 0.7; }
  @media (max-width: 1024px) { display: none; }
`;

const ListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
`;

interface TopicEntryListProps {
  title: string;
  entries: DecryptedPost[];
  allTopics: Topic[];
  headerColor: string;
  hiddenMobile?: boolean;
  onMobileBack: () => void;
  onBackToJournal: () => void;
  /** When a specific topic is selected, show a "New Entry" button */
  selectedTopic?: Topic;
}

export function TopicEntryList({ title, entries, allTopics, headerColor, hiddenMobile, onMobileBack, onBackToJournal, selectedTopic }: TopicEntryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const getTopicForEntry = (entry: DecryptedPost) => {
    const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
    return taxId ? allTopics.find(t => t.id === taxId) : undefined;
  };

  return (
    <Panel $hidden={hiddenMobile}>
      <Header>
        <Title>{title}</Title>
        <MobileBack onClick={onMobileBack}>
          <FontAwesomeIcon icon={faChevronLeft} size="xs" /> Topics
        </MobileBack>
        <BackLink onClick={onBackToJournal}><FontAwesomeIcon icon={faChevronLeft} size="xs" /> Back to Journal</BackLink>
      </Header>

      <ListArea>
        {selectedTopic && <NewEntryCard topic={selectedTopic} headerColor={headerColor} />}
        {entries.length === 0 && !selectedTopic ? (
          <EmptyState message="No entries found." />
        ) : (
          entries.map(entry => (
            <EditableEntryCard
              key={entry.id}
              entry={entry}
              topic={getTopicForEntry(entry)}
              headerColor={headerColor}
              isEditing={editingId === entry.id}
              onSelect={() => setEditingId(editingId === entry.id ? null : entry.id)}
              onClose={() => setEditingId(null)}
              onDeleted={() => setEditingId(null)}
              showAsPlain
            />
          ))
        )}
      </ListArea>
    </Panel>
  );
}
