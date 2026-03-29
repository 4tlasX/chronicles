import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheck } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useUIStore } from '../../stores/uiStore.js';

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
  onTopicClick?: (topicId: number) => void;
  onToggleComplete?: (id: number, completed: boolean) => void;
  onToggleBookmark?: (id: number, isFavorite: boolean) => void;
  hasCheckbox?: boolean;
  isCompleted?: boolean;
  isFavorite?: boolean;
  customType?: string;
}

const Card = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 12px;
  margin-bottom: 5px;
  text-align: left;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: ${({ $active }) =>
    $active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: ${({ $active }) =>
    $active ? '2px solid #6b7280' : '1px solid transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${({ $active }) =>
      $active ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.6)'};
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const TopicBadge = styled.div<{ $bgColor: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 4px;
  background: ${({ $bgColor }) => $bgColor}80;
  flex-shrink: 0;
  cursor: pointer;
`;

const TopicIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 11px;
  flex-shrink: 0;
`;

const TopicLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: white;
`;

const Timestamp = styled.span`
  margin-left: auto;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`;

const ContentArea = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const Checkbox = styled.div<{ $checked?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  min-width: 16px;
  margin-top: 2px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border: 2px solid ${({ theme, $checked }) =>
    $checked ? theme.colors.accent : theme.colors.accentLight};
  background: ${({ theme, $checked }) =>
    $checked ? theme.colors.accent : 'transparent'};
  cursor: pointer;
  padding: 0;
  color: white;
  font-size: 9px;
  line-height: 1;
`;

const PreviewText = styled.div<{ $completed?: boolean }>`
  font-size: 14px;
  color: ${({ $completed, theme }) =>
    $completed ? theme.colors.textMuted : theme.colors.textSecondary};
  text-decoration: ${({ $completed }) => ($completed ? 'line-through' : 'none')};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  task: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
  goal: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8b5cf6' },
  food: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  medication: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
  exercise: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
  symptom: { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899' },
};

const TypeBadge = styled.span<{ $type: string }>`
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background: ${({ $type }) => TYPE_COLORS[$type]?.bg || 'rgba(0,0,0,0.05)'};
  color: ${({ $type, theme }) => TYPE_COLORS[$type]?.text || theme.colors.textSecondary};
  text-transform: capitalize;
`;

const FavoriteStar = styled.button`
  margin-left: auto;
  color: #f59e0b;
  font-size: 12px;
  background: none;
  border: none;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
  transition: opacity 0.15s;
  &:hover { opacity: 0.7; }
`;

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function EntryCard({
  id,
  content,
  date,
  topicName,
  topicColor,
  topicIcon,
  topicId,
  active,
  onClick,
  onTopicClick,
  onToggleComplete,
  onToggleBookmark,
  hasCheckbox,
  isCompleted,
  isFavorite,
  customType,
}: EntryCardProps) {
  const headerColor = useUIStore(s => s.headerColor) || '#0F4C5C';
  const plainText = stripHtml(content);
  const preview = plainText.slice(0, 160) || 'Untitled entry';

  const formatted = new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Card $active={active} onClick={onClick}>
      <HeaderRow>
        {topicName && (
          <TopicBadge
            $bgColor={headerColor}
            onClick={(e) => {
              e.stopPropagation();
              if (topicId && onTopicClick) onTopicClick(topicId);
            }}
          >
            {topicIcon && <TopicIcon><FontAwesomeIcon icon={topicIcon} /></TopicIcon>}
            <TopicLabel>{topicName}</TopicLabel>
          </TopicBadge>
        )}
        <Timestamp>{formatted}</Timestamp>
      </HeaderRow>

      <ContentArea>
        {hasCheckbox && (
          <Checkbox
            $checked={isCompleted}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleComplete) onToggleComplete(id, !isCompleted);
            }}
          >
            {isCompleted && <FontAwesomeIcon icon={faCheck} size="xs" />}
          </Checkbox>
        )}
        <PreviewText $completed={hasCheckbox && isCompleted}>{preview}</PreviewText>
      </ContentArea>

      {((!topicName && customType) || isFavorite) && (
        <Footer>
          {!topicName && customType && <TypeBadge $type={customType}>{customType}</TypeBadge>}
          {isFavorite && (
            <FavoriteStar
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark?.(id, false);
              }}
              title="Remove bookmark"
            >
              <FontAwesomeIcon icon={faStar} />
            </FavoriteStar>
          )}
        </Footer>
      )}
    </Card>
  );
}
