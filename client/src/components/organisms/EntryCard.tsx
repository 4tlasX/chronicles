import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { SwipeActions } from '../molecules/SwipeActions.js';
import { useUIStore } from '../../stores/uiStore.js';
import { stripHtml } from '../../utils/stripHtml.js';

interface EntryCardProps {
  id: number;
  content: string;
  date: string;
  topicName?: string;
  topicColor?: string;
  topicIcon?: IconDefinition;
  topicId?: number;
  active?: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onTopicClick?: (topicId: number) => void;
  onToggleComplete?: (id: number, completed: boolean) => void;
  onToggleBookmark?: (id: number, isFavorite: boolean) => void;
  hasCheckbox?: boolean;
  isCompleted?: boolean;
  isFavorite?: boolean;
  customType?: string;
  previewText?: string;
}

function extractTitle(html: string, fallback?: string): string {
  const headingMatch = html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
  if (headingMatch) {
    const tmp = document.createElement('div');
    tmp.innerHTML = headingMatch[1];
    const text = (tmp.textContent || tmp.innerText || '').trim();
    if (text) return text;
  }
  const plain = stripHtml(html).trim();
  return plain.slice(0, 70) || fallback || 'Untitled entry';
}

function extractPreview(html: string): string {
  const headingMatch = html.match(/<h[1-4][^>]*>.*?<\/h[1-4]>/i);
  let remainder = html;
  if (headingMatch) {
    remainder = html.slice((headingMatch.index ?? 0) + headingMatch[0].length);
  } else {
    const plain = stripHtml(html).trim();
    if (plain.length <= 70) return '';
    remainder = plain.slice(70);
  }
  return stripHtml(remainder).trim();
}

/* DS entry-list row: [accent bar][title + subtitle][time]. Borderless except a
   hairline bottom rule; selected row gets a topic-colored left bar + faint fill. */
const Row = styled.div<{ $active?: boolean; $accent?: string }>`
  display: grid;
  grid-template-columns: 3px 1fr auto;
  gap: 12px;
  align-items: start;
  cursor: pointer;
  padding: 13px 18px 13px 0;
  border-bottom: 1px solid var(--border-subtle);
  background: ${({ $active }) => $active ? 'var(--bg-active)' : 'transparent'};
  transition: background 120ms;

  &::before {
    content: '';
    grid-column: 1;
    align-self: stretch;
    background: ${({ $active, $accent }) => $active ? ($accent || 'var(--color-accent)') : 'transparent'};
  }

  &:hover {
    background: var(--bg-hover);
  }
`;

const ContentArea = styled.div`
  min-width: 0;
  grid-column: 2;
`;

const TitleText = styled.div<{ $completed?: boolean }>`
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 13.5px;
  color: var(--text-primary);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: ${({ $completed }) => $completed ? 'line-through' : 'none'};
  margin: 0;
`;

const PreviewText = styled.div`
  font-family: var(--font-sans);
  font-size: 11.5px;
  color: var(--text-tertiary);
  line-height: 1.4;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeStamp = styled.div<{ $active?: boolean; $accent?: string }>`
  grid-column: 3;
  font-family: var(--font-label);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  padding-top: 1px;
  color: ${({ $active, $accent }) => $active ? ($accent || 'var(--color-accent)') : 'var(--text-tertiary)'};
`;

const BookmarkIcon = styled.span`
  margin-left: 6px;
  color: var(--color-accent);
  font-size: 11px;
  line-height: 1;
  flex-shrink: 0;
  cursor: pointer;
  &:hover { opacity: 0.7; }
`;

export function EntryCard({
  id, content, date, topicName, topicColor, topicId,
  active, onClick, onDelete, onTopicClick, onToggleBookmark,
  isCompleted, isFavorite, previewText,
}: EntryCardProps) {
  const headerColor = useUIStore(s => s.headerColor) || '#4A5568';

  const d = new Date(date);
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const title = extractTitle(content, previewText);
  const preview = extractPreview(content);
  const subtitle = preview || (topicName ?? '');

  const inner = (
    <Row $active={active} $accent={topicColor} onClick={onClick}>
      <ContentArea>
        <TitleText $completed={isCompleted}>{title}</TitleText>
        {subtitle && <PreviewText>{subtitle}</PreviewText>}
      </ContentArea>
      <TimeStamp $active={active} $accent={topicColor}>
        {timeStr}
        {isFavorite && (
          <BookmarkIcon
            onClick={e => { e.stopPropagation(); onToggleBookmark?.(id, false); }}
            title="Remove bookmark"
          >
            <FontAwesomeIcon icon={faBookmark} />
          </BookmarkIcon>
        )}
      </TimeStamp>
    </Row>
  );

  return onDelete ? (
    <SwipeActions onDelete={onDelete} accentColor={headerColor}>
      {inner}
    </SwipeActions>
  ) : inner;
}
