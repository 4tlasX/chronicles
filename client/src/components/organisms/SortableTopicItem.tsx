import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from '../atoms/DragHandle.js';
import { ICON_MAP } from '../molecules/IconPicker.js';
import { getTopicIcon } from '../../utils/topicIcons.js';

const Row = styled.div<{ $active?: boolean; $isDragging?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ $active, $isDragging }) => $isDragging ? 'rgba(255,255,255,0.95)' : $active ? 'rgba(0, 0, 0, 0.06)' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
  opacity: ${({ $isDragging }) => $isDragging ? 0.8 : 1};
  box-shadow: ${({ $isDragging }) => $isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'};
  &:hover { background: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.04)'}; }
`;

const TopicIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 14px;
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
  font-size: 12px;
  color: ${({ $color, theme }) => $color || theme.colors.textMuted};
  font-weight: 400;
  margin-left: 4px;
`;

const Actions = styled.div`
  display: flex;
  gap: 2px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
  ${Row}:hover & { opacity: 1; }
`;

const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.85;
  transition: opacity 0.15s, color 0.15s;
  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.text};
  }
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
    <Row ref={setNodeRef} style={style} $active={isActive} $isDragging={isDragging} onClick={onSelect}>
      <DragHandle {...attributes} {...listeners} onClick={e => e.stopPropagation()} />
      <TopicIcon $color={headerColor}>
        <FontAwesomeIcon icon={ICON_MAP[topic.icon || ''] || getTopicIcon(topic.icon)} />
      </TopicIcon>
      <NameAndCount>
        {topic.name}<Count $color={headerColor}>({count})</Count>
      </NameAndCount>
      <Actions>
        <ActionBtn title="Edit" onClick={e => { e.stopPropagation(); onEdit(); }}>
          <FontAwesomeIcon icon={faPen} />
        </ActionBtn>
        <ActionBtn title="Delete" onClick={e => { e.stopPropagation(); onDelete(); }}>
          <FontAwesomeIcon icon={faTrash} />
        </ActionBtn>
      </Actions>
    </Row>
  );
}
