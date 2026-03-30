import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EmptyState } from '../atoms/EmptyState.js';
import { Badge } from '../atoms/Badge.js';
import { TopicEditForm } from '../molecules/TopicEditForm.js';
import { SortableTopicItem } from './SortableTopicItem.js';
import type { Topic } from '../../types/topics.js';

const Pane = styled.div<{ $hidden?: boolean }>`
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.8);
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
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

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const AddBtn = styled.button<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: ${({ $color }) => $color};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

const List = styled.div`
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AllItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.06)' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  text-align: left;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

const CountBadge = styled.span<{ $color?: string }>`
  font-size: 12px;
  color: ${({ $color, theme }) => $color || theme.colors.textMuted};
  font-weight: 400;
  margin-left: auto;
`;

interface TopicSidebarPanelProps {
  topics: Topic[];
  selectedTopicId: number | null;
  totalEntryCount: number;
  entryCounts: Map<number, number>;
  headerColor: string;
  hiddenMobile?: boolean;
  // Add form state
  showAddForm: boolean;
  newName: string;
  newIcon: string | null;
  isAdding: boolean;
  onToggleAddForm: () => void;
  onNewNameChange: (name: string) => void;
  onNewIconChange: (icon: string | null) => void;
  onAdd: () => void;
  onCancelAdd: () => void;
  // Edit form state
  editingId: number | null;
  editName: string;
  editIcon: string | null;
  onEditNameChange: (name: string) => void;
  onEditIconChange: (icon: string | null) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  // Actions
  onSelectTopic: (id: number | null) => void;
  onStartEdit: (topic: Topic) => void;
  onDelete: (id: number) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function TopicSidebarPanel({
  topics, selectedTopicId, totalEntryCount, entryCounts, headerColor, hiddenMobile,
  showAddForm, newName, newIcon, isAdding, onToggleAddForm, onNewNameChange, onNewIconChange, onAdd, onCancelAdd,
  editingId, editName, editIcon, onEditNameChange, onEditIconChange, onEditSave, onEditCancel,
  onSelectTopic, onStartEdit, onDelete, onDragEnd,
}: TopicSidebarPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <Pane $hidden={hiddenMobile}>
      <Header>
        <Title>Topics</Title>
        <AddBtn $color={headerColor} onClick={onToggleAddForm} title={showAddForm ? 'Cancel' : 'Add topic'}>
          <FontAwesomeIcon icon={showAddForm ? faXmark : faPlus} />
        </AddBtn>
      </Header>

      {showAddForm && (
        <TopicEditForm
          name={newName}
          icon={newIcon}
          accentColor={headerColor}
          saving={isAdding}
          saveLabel={isAdding ? 'Adding...' : 'Add Topic'}
          onNameChange={onNewNameChange}
          onIconChange={onNewIconChange}
          onSave={onAdd}
          onCancel={onCancelAdd}
        />
      )}

      <List>
        <AllItem $active={selectedTopicId === null} onClick={() => onSelectTopic(null)}>
          All Entries
          <CountBadge $color={headerColor}>({totalEntryCount})</CountBadge>
        </AllItem>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={topics.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {topics.map(topic => (
              editingId === topic.id ? (
                <TopicEditForm
                  key={topic.id}
                  name={editName}
                  icon={editIcon}
                  accentColor={headerColor}
                  onNameChange={onEditNameChange}
                  onIconChange={onEditIconChange}
                  onSave={onEditSave}
                  onCancel={onEditCancel}
                />
              ) : (
                <SortableTopicItem
                  key={topic.id}
                  topic={topic}
                  isActive={selectedTopicId === topic.id}
                  count={entryCounts.get(topic.id) || 0}
                  headerColor={headerColor}
                  onSelect={() => onSelectTopic(topic.id)}
                  onEdit={() => onStartEdit(topic)}
                  onDelete={() => onDelete(topic.id)}
                />
              )
            ))}
          </SortableContext>
        </DndContext>

        {topics.length === 0 && !showAddForm && (
          <EmptyState message="No topics yet. Click + to create one." />
        )}
      </List>
    </Pane>
  );
}
