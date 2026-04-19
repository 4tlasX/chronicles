import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
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
import { useUIStore } from '../../stores/uiStore.js';
import { settings as settingsApi } from '../../services/api.js';
import type { UserFieldDef } from '../../types/userFields.js';

const Pane = styled.div<{ $hidden?: boolean }>`
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 1024px) {
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
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 1.25rem;
  font-weight: 500;
  font-style: italic;
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
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.06)' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  text-align: left;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

const CountBadge = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 400;
  margin-left: auto;
`;

const FilterWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterIcon = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  flex-shrink: 0;
`;

const FilterInput = styled.input`
  flex: 1;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  outline: none;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

const ClearBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  padding: 0;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const NoMatch = styled.div`
  padding: 16px 12px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
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
  const [filter, setFilter] = useState('');

  const topicCustomFields = useUIStore(s => s.topicCustomFields);
  const updateTopicFields = useUIStore(s => s.updateTopicFields);
  // getState() used in handleFieldDefsChange to avoid stale closure

  const handleFieldDefsChange = useCallback((topicId: number, defs: UserFieldDef[]) => {
    updateTopicFields(topicId, defs);
    // Read latest state directly to avoid stale closure
    const currentFields = useUIStore.getState().topicCustomFields;
    const updated = { ...currentFields, [topicId]: defs };
    settingsApi.upsert('topicCustomFields', updated)
      .catch(err => console.error('Failed to save topic fields:', err));
  }, [updateTopicFields]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTopics = filter.trim()
    ? topics.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()))
    : topics;

  const isFiltering = filter.trim().length > 0;

  return (
    <Pane $hidden={hiddenMobile}>
      <Header>
        <Title>Topics</Title>
        <AddBtn $color={headerColor} onClick={onToggleAddForm} title={showAddForm ? 'Cancel' : 'Add topic'}>
          <FontAwesomeIcon icon={showAddForm ? faXmark : faPlus} />
        </AddBtn>
      </Header>

      <FilterWrap>
        <FilterIcon><FontAwesomeIcon icon={faMagnifyingGlass} /></FilterIcon>
        <FilterInput
          type="text"
          placeholder="Filter topics…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {isFiltering && (
          <ClearBtn onClick={() => setFilter('')} title="Clear filter">
            <FontAwesomeIcon icon={faXmark} />
          </ClearBtn>
        )}
      </FilterWrap>

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
        {!isFiltering && (
          <AllItem $active={selectedTopicId === null} onClick={() => onSelectTopic(null)}>
            All Entries
          </AllItem>
        )}

        {isFiltering ? (
          <>
            {filteredTopics.map(topic => (
              editingId === topic.id ? (
                <TopicEditForm
                  key={topic.id}
                  name={editName}
                  icon={editIcon}
                  accentColor={headerColor}
                  cancelLabel="Close"
                  onNameChange={onEditNameChange}
                  onIconChange={onEditIconChange}
                  onSave={onEditSave}
                  onCancel={onEditCancel}
                  topicId={topic.id}
                  fieldDefs={topicCustomFields[topic.id] ?? []}
                  onFieldDefsChange={defs => handleFieldDefsChange(topic.id, defs)}
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
            {filteredTopics.length === 0 && (
              <NoMatch>No topics match "{filter}"</NoMatch>
            )}
          </>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={topics.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {topics.map(topic => (
                editingId === topic.id ? (
                  <TopicEditForm
                    key={topic.id}
                    name={editName}
                    icon={editIcon}
                    accentColor={headerColor}
                    cancelLabel="Close"
                    onNameChange={onEditNameChange}
                    onIconChange={onEditIconChange}
                    onSave={onEditSave}
                    onCancel={onEditCancel}
                    topicId={topic.id}
                    fieldDefs={topicCustomFields[topic.id] ?? []}
                    onFieldDefsChange={defs => handleFieldDefsChange(topic.id, defs)}
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
        )}

        {topics.length === 0 && !showAddForm && !isFiltering && (
          <EmptyState message="No topics yet. Click + to create one." />
        )}
      </List>
    </Pane>
  );
}
