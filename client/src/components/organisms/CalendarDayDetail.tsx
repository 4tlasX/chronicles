import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { EmptyState } from '../atoms/EmptyState.js';

const Panel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  max-height: 300px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h3`
  font-family: ${({ theme }) => theme.typography.bodySm.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Count = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: 8px;
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
  flex: 1;
`;

const Row = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(0, 0, 0, 0.02); }
  &:last-child { border-bottom: none; }
`;

const ColorBar = styled.div<{ $color: string }>`
  width: 3px;
  min-height: 24px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
  align-self: stretch;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const EntryTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EntryMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: capitalize;
`;

import type { DetailEntry } from '../../types/ui.js';

interface CalendarDayDetailProps {
  dateStr: string;
  entries: DetailEntry[];
  accentColor: string;
  onClose: () => void;
  onEntryClick: (id: number) => void;
}

export function CalendarDayDetail({ dateStr, entries, accentColor, onClose, onEntryClick }: CalendarDayDetailProps) {
  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <Panel>
      <Header>
        <div>
          <Title>{dateLabel}</Title>
          <Count>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</Count>
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
            <Row key={entry.id} onClick={() => onEntryClick(entry.id)}>
              <ColorBar $color={accentColor} />
              <Content>
                <EntryTitle>{entry.preview}</EntryTitle>
                {entry.topicName && entry.topicIcon && (
                  <EntryMeta>
                    <FontAwesomeIcon icon={entry.topicIcon} style={{ marginRight: 4, fontSize: 11 }} />
                    {entry.topicName}
                  </EntryMeta>
                )}
              </Content>
            </Row>
          ))
        )}
      </List>
    </Panel>
  );
}
