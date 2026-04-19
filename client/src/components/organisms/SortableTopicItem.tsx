import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from '../atoms/DragHandle.js';
import { ICON_MAP } from '../molecules/IconPicker.js';
import { getTopicIcon } from '../../utils/topicIcons.js';
import { SwipeActions } from '../molecules/SwipeActions.js';

const Wrapper = styled.div<{ $isDragging?: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  opacity: ${({ $isDragging }) => $isDragging ? 0.7 : 1};
  box-shadow: ${({ $isDragging }) => $isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
`;

const Row = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.06)' : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  &:hover { background: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.04)'}; }
`;

const TopicIcon = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
`;

const NameAndCount = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Count = styled.span<{ $color?: string }>`
  font-size: 14px;
  color: ${({ $color, theme }) => $color || theme.colors.textMuted};
  font-weight: 400;
  margin-left: 4px;
`;

interface SortableTopicItemProps {
  topic: { id: number; name: string; icon: string | null; color: string | null };
  isActive: boolean;
  count: number;
  headerColor: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableTopicItem({ topic, isActive, count, headerColor, onSelect, onEdit, onDelete }: SortableTopicItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: topic.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Wrapper ref={setNodeRef} style={style} $isDragging={isDragging}>
      <SwipeActions onEdit={onEdit} onDelete={onDelete} accentColor={headerColor} disabled={isDragging} buttonWidth={48}>
        <Row $active={isActive} onClick={onSelect}>
          <DragHandle {...attributes} {...listeners} onClick={e => e.stopPropagation()} />
          <TopicIcon>
            <FontAwesomeIcon icon={ICON_MAP[topic.icon || ''] || getTopicIcon(topic.icon)} />
          </TopicIcon>
          <NameAndCount>
            {topic.name}
          </NameAndCount>
        </Row>
      </SwipeActions>
    </Wrapper>
  );
}
