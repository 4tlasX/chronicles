import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import DOMPurify from 'dompurify';
import { useUIStore } from '../../stores/uiStore.js';
import { SwipeActions } from '../molecules/SwipeActions.js';

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
}

/* Card is a div so we can safely nest buttons inside (action buttons) */
const Card = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  background: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.04)' : 'transparent'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

const CardContent = styled.div`
  padding: 20px 24px 25px 24px;
  width: 100%;
  box-sizing: border-box;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 17px;
`;

const TopicBadge = styled.div<{ $bgColor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  background: none;
  flex-shrink: 0;
  cursor: pointer;
`;

const TopicIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  flex-shrink: 0;
`;

const TopicLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.75;
`;

const Separator = styled.span`
  color: ${({ theme }) => theme.colors.border};
  font-size: 13px;
  user-select: none;
`;

const Timestamp = styled.span`
  font-size: 13px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.75;
  flex-shrink: 0;
`;

const ContentArea = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const PreviewText = styled.div<{ $completed?: boolean }>`
  font-family: ${({ theme }) => theme.fontFamily.sans};
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: ${({ $completed, theme }) =>
    $completed ? theme.colors.textMuted : theme.colors.textSecondary};
  text-decoration: ${({ $completed }) => ($completed ? 'line-through' : 'none')};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;

  p, li, h1, h2, h3, blockquote { display: inline; }
  p + p::before { content: ' '; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  s { text-decoration: line-through; }
  code { font-size: 0.9em; font-family: monospace; }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  task:       { bg: 'rgba(59, 130, 246, 0.15)',  text: '#2563eb' },
  goal:       { bg: 'rgba(139, 92, 246, 0.15)',  text: '#7c3aed' },
  food:       { bg: 'rgba(245, 158, 11, 0.15)',  text: '#b45309' },
  medication: { bg: 'rgba(16, 185, 129, 0.15)',  text: '#047857' },
  exercise:   { bg: 'rgba(239, 68, 68, 0.15)',   text: '#9B4444' },
  symptom:    { bg: 'rgba(236, 72, 153, 0.15)',  text: '#be185d' },
};

const TypeBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  font-size: 13px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: ${({ $type }) => TYPE_COLORS[$type]?.bg || 'rgba(0,0,0,0.05)'};
  color: ${({ $type, theme }) => TYPE_COLORS[$type]?.text || theme.colors.textSecondary};
  text-transform: capitalize;
`;

const FavoriteStar = styled.span<{ $color: string }>`
  margin-left: auto;
  color: ${({ $color }) => $color};
  font-size: 14px;
  background: none;
  border: none;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
  transition: opacity 0.15s;
  &:hover { opacity: 0.7; }
`;

export function EntryCard({
  id, content, date, topicName, topicColor, topicIcon, topicId,
  active, onClick, onDelete, onTopicClick, onToggleComplete, onToggleBookmark,
  hasCheckbox, isCompleted, isFavorite, customType,
}: EntryCardProps) {
  const headerColor = useUIStore(s => s.headerColor) || '#6A9B9B';
  const previewHtml = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['strong', 'em', 's', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'code'],
    ALLOWED_ATTR: [],
  }) || 'Untitled entry';

  const d = new Date(date);
  const formatted = d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const inner = (
    <CardContent onClick={onClick}>
      <HeaderRow>
        {topicName && (
          <TopicBadge
            $bgColor={headerColor}
            onClick={e => { e.stopPropagation(); if (topicId && onTopicClick) onTopicClick(topicId); }}
          >
            {topicIcon && <TopicIcon><FontAwesomeIcon icon={topicIcon} /></TopicIcon>}
            <TopicLabel>{topicName}</TopicLabel>
          </TopicBadge>
        )}
        {topicName && <Separator>|</Separator>}
        <Timestamp>{formatted}</Timestamp>
        {isFavorite && (
          <FavoriteStar
            $color={headerColor}
            onClick={e => { e.stopPropagation(); onToggleBookmark?.(id, false); }}
            title="Remove bookmark"
          >
            <FontAwesomeIcon icon={faStar} />
          </FavoriteStar>
        )}
      </HeaderRow>

      <ContentArea>
        <PreviewText $completed={isCompleted} dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </ContentArea>

      {(!topicName && customType) && (
        <Footer>
          <TypeBadge $type={customType}>{customType}</TypeBadge>
        </Footer>
      )}
    </CardContent>
  );

  return (
    <Card $active={active}>
      {onDelete ? (
        <SwipeActions onDelete={onDelete} accentColor={headerColor}>
          {inner}
        </SwipeActions>
      ) : inner}
    </Card>
  );
}
