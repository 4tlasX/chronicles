import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faXmark, faPen, faTrash, faChevronLeft, faGripVertical,
} from '@fortawesome/free-solid-svg-icons';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AppTemplate } from '../components/templates/AppTemplate.js';
import { IconPicker, ICON_MAP } from '../components/molecules/IconPicker.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { topics as topicsApi } from '../services/api.js';
import { getTopicIcon } from '../utils/topicIcons.js';
import { useNavigate } from 'react-router-dom';

/* ── Styled ── */

const Container = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const SidebarPane = styled.div<{ $hidden?: boolean }>`
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

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SidebarTitle = styled.h2`
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

const TopicList = styled.div`
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TopicItemRow = styled.div<{ $active?: boolean; $isDragging?: boolean }>`
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

const AllEntriesItem = styled.button<{ $active?: boolean }>`
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

const TopicItemIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 14px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
`;

const TopicNameAndCount = styled.span`
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

const TopicActions = styled.div`
  display: flex;
  gap: 2px;
  flex-shrink: 0;
`;

const SmallIconBtn = styled.button`
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
  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: rgba(0, 0, 0, 0.06);
  }
`;

const DragHandle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: grab;
  font-size: 12px;
  flex-shrink: 0;
  touch-action: none;
  &:active { cursor: grabbing; }
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const FormCard = styled.div`
  margin: 8px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.accent}; }
`;

const IconSection = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  padding: 8px;
`;

const IconLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 4px;
`;

const FormActions = styled.div`
  display: flex;
  gap: 8px;
`;

const PrimaryBtn = styled.button<{ $color: string; $disabled?: boolean }>`
  flex: 1;
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: ${({ $color, $disabled, theme }) => $disabled ? theme.colors.border : $color};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
`;

const GhostBtn = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

/* ── Right panel ── */

const EntriesPanel = styled.div<{ $hidden?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.9);

  @media (max-width: 768px) {
    display: ${({ $hidden }) => $hidden ? 'none' : 'flex'};
  }
`;

const EntriesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const EntriesTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const BackButton = styled.button`
  display: none;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
  @media (max-width: 768px) { display: flex; }
`;

const BackLink = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.accent};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { text-decoration: underline; }
  @media (max-width: 768px) { display: none; }
`;

const EntryRow = styled.button`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(0, 0, 0, 0.02); }
`;

const EntryTopicBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}20;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
`;

const EntryPreview = styled.p<{ $strikethrough?: boolean }>`
  font-size: 14px;
  color: ${({ theme, $strikethrough }) => $strikethrough ? theme.colors.textMuted : theme.colors.text};
  text-decoration: ${({ $strikethrough }) => $strikethrough ? 'line-through' : 'none'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EntryDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  padding: 40px;
`;

/* ── Helpers ── */

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/* ── Sortable Topic Item ── */

interface SortableTopicProps {
  topic: { id: number; name: string; icon: string | null; color: string | null };
  isActive: boolean;
  count: number;
  headerColor: string;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableTopicItem({ topic, isActive, count, headerColor, onSelect, onEdit, onDelete }: SortableTopicProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TopicItemRow
      ref={setNodeRef}
      style={style}
      $active={isActive}
      $isDragging={isDragging}
      onClick={onSelect}
    >
      <DragHandle {...attributes} {...listeners} onClick={e => e.stopPropagation()}>
        <FontAwesomeIcon icon={faGripVertical} />
      </DragHandle>
      <TopicItemIcon $color={headerColor}>
        <FontAwesomeIcon icon={ICON_MAP[topic.icon || ''] || getTopicIcon(topic.icon)} />
      </TopicItemIcon>
      <TopicNameAndCount>
        {topic.name}<Count $color={headerColor}>({count})</Count>
      </TopicNameAndCount>
      <TopicActions>
        <SmallIconBtn title="Edit" onClick={e => { e.stopPropagation(); onEdit(); }}>
          <FontAwesomeIcon icon={faPen} />
        </SmallIconBtn>
        <SmallIconBtn title="Delete" onClick={e => { e.stopPropagation(); onDelete(); }}>
          <FontAwesomeIcon icon={faTrash} />
        </SmallIconBtn>
      </TopicActions>
    </TopicItemRow>
  );
}

/* ── Component ── */

export function TopicsView() {
  const allTopics = useEntriesStore(s => s.allTopics);
  const topics = useEntriesStore(s => s.topics);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const setTopics = useEntriesStore(s => s.setTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#2d2c2a';
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const navigate = useNavigate();

  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [mobileShowEntries, setMobileShowEntries] = useState(false);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Edit form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState<string | null>(null);

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Entry counts per topic
  const entryCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const entry of entries) {
      const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
      if (taxId) counts.set(taxId, (counts.get(taxId) || 0) + 1);
    }
    return counts;
  }, [entries]);

  // Filtered entries for selected topic
  const filteredEntries = useMemo(() => {
    if (selectedTopicId === null) return entries;
    return entries.filter(e => {
      const taxId = (e.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
      return taxId === selectedTopicId;
    });
  }, [entries, selectedTopicId]);

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  const handleAdd = useCallback(async () => {
    if (!newName.trim()) return;
    setIsAdding(true);
    try {
      const created = await topicsApi.create({ name: newName.trim(), icon: newIcon || undefined });
      setTopics([...allTopics, created]);
      setNewName('');
      setNewIcon(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create topic:', err);
    } finally {
      setIsAdding(false);
    }
  }, [newName, newIcon, allTopics, setTopics]);

  const handleEditSave = useCallback(async () => {
    if (editingId === null || !editName.trim()) return;
    try {
      const updated = await topicsApi.update(editingId, { name: editName.trim(), icon: editIcon || undefined });
      setTopics(allTopics.map(t => t.id === editingId ? updated : t));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update topic:', err);
    }
  }, [editingId, editName, editIcon, allTopics, setTopics]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm('Delete this topic? Entries with this topic will become untagged.')) return;
    try {
      await topicsApi.delete(id);
      setTopics(allTopics.filter(t => t.id !== id));
      if (selectedTopicId === id) setSelectedTopicId(null);
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  }, [allTopics, setTopics, selectedTopicId]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Reorder the filtered (visible) topics
    const oldIndex = topics.findIndex(t => t.id === active.id);
    const newIndex = topics.findIndex(t => t.id === over.id);
    const reorderedVisible = arrayMove(topics, oldIndex, newIndex);

    // Rebuild allTopics: replace visible topics in their new order, keep hidden ones in place
    const visibleIds = new Set(topics.map(t => t.id));
    const hidden = allTopics.filter(t => !visibleIds.has(t.id));
    const reordered = [...reorderedVisible, ...hidden];

    // Optimistic update
    setTopics(reordered);

    // Persist full order to server
    try {
      await topicsApi.reorder(reordered.map(t => t.id));
    } catch (err) {
      console.error('Failed to reorder topics:', err);
    }
  }, [allTopics, topics, setTopics]);

  const handleSelectTopic = (id: number | null) => {
    setSelectedTopicId(id);
    setMobileShowEntries(true);
  };

  const handleEntryClick = (entryId: number) => {
    setSelectedEntryId(entryId);
    navigate('/');
  };

  return (
    <AppTemplate hideSidebar transparentContent>
      <Container>
        {/* ── Left: topics list ── */}
        <SidebarPane $hidden={mobileShowEntries}>
          <SidebarHeader>
            <SidebarTitle>Topics</SidebarTitle>
            <AddBtn $color={headerColor} onClick={() => setShowAddForm(!showAddForm)} title={showAddForm ? 'Cancel' : 'Add topic'}>
              <FontAwesomeIcon icon={showAddForm ? faXmark : faPlus} />
            </AddBtn>
          </SidebarHeader>

          {showAddForm && (
            <FormCard>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Topic name"
                autoFocus
              />
              <IconSection>
                <IconLabel>Icon (optional)</IconLabel>
                <IconPicker selectedIcon={newIcon} onSelectIcon={setNewIcon} />
              </IconSection>
              <FormActions>
                <PrimaryBtn
                  $color={headerColor}
                  $disabled={isAdding || !newName.trim()}
                  disabled={isAdding || !newName.trim()}
                  onClick={handleAdd}
                >
                  {isAdding ? 'Adding...' : 'Add Topic'}
                </PrimaryBtn>
                <GhostBtn onClick={() => { setShowAddForm(false); setNewName(''); setNewIcon(null); }}>
                  Cancel
                </GhostBtn>
              </FormActions>
            </FormCard>
          )}

          <TopicList>
            <AllEntriesItem $active={selectedTopicId === null} onClick={() => handleSelectTopic(null)}>
              All Entries<Count $color={headerColor} style={{ marginLeft: 'auto' }}>({entries.length})</Count>
            </AllEntriesItem>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={topics.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {topics.map(topic => (
                  editingId === topic.id ? (
                    <FormCard key={topic.id}>
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                      />
                      <IconSection>
                        <IconLabel>Icon</IconLabel>
                        <IconPicker selectedIcon={editIcon} onSelectIcon={setEditIcon} />
                      </IconSection>
                      <FormActions>
                        <PrimaryBtn $color={headerColor} $disabled={!editName.trim()} disabled={!editName.trim()} onClick={handleEditSave}>
                          Save
                        </PrimaryBtn>
                        <GhostBtn onClick={() => setEditingId(null)}>Cancel</GhostBtn>
                      </FormActions>
                    </FormCard>
                  ) : (
                    <SortableTopicItem
                      key={topic.id}
                      topic={topic}
                      isActive={selectedTopicId === topic.id}
                      count={entryCounts.get(topic.id) || 0}
                      headerColor={headerColor}
                      onSelect={() => handleSelectTopic(topic.id)}
                      onEdit={() => {
                        setEditingId(topic.id);
                        setEditName(topic.name);
                        setEditIcon(topic.icon);
                      }}
                      onDelete={() => handleDelete(topic.id)}
                    />
                  )
                ))}
              </SortableContext>
            </DndContext>

            {topics.length === 0 && !showAddForm && (
              <EmptyState>No topics yet. Click + to create one.</EmptyState>
            )}
          </TopicList>
        </SidebarPane>

        {/* ── Right: entries for selected topic ── */}
        <EntriesPanel $hidden={!mobileShowEntries}>
          <EntriesHeader>
            <div>
              <BackButton onClick={() => setMobileShowEntries(false)}>
                <FontAwesomeIcon icon={faChevronLeft} size="xs" />
                Back to Topics
              </BackButton>
              <EntriesTitle>
                {selectedTopic ? selectedTopic.name : 'All Entries'}
              </EntriesTitle>
            </div>
            <BackLink onClick={() => navigate('/')}>Back to Journal</BackLink>
          </EntriesHeader>

          {filteredEntries.length === 0 ? (
            <EmptyState>No entries found.</EmptyState>
          ) : (
            filteredEntries.map(entry => {
              const meta = entry.metadata as Record<string, unknown>;
              const cf = meta?._customFields as Record<string, unknown> | undefined;
              const taxId = meta?._taxonomyId as number | undefined;
              const topic = taxId ? allTopics.find(t => t.id === taxId) : undefined;
              const isCompleted = !!cf?.isCompleted;
              const preview = stripHtml(entry.content).slice(0, 150) || 'Empty entry';

              return (
                <EntryRow key={entry.id} onClick={() => handleEntryClick(entry.id)}>
                  {topic && (
                    <EntryTopicBadge $color={headerColor}>
                      <FontAwesomeIcon icon={ICON_MAP[topic.icon || ''] || getTopicIcon(topic.icon)} style={{ fontSize: 11 }} />
                      {topic.name}
                    </EntryTopicBadge>
                  )}
                  <EntryPreview $strikethrough={isCompleted}>
                    {preview}
                  </EntryPreview>
                  <EntryDate>
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </EntryDate>
                </EntryRow>
              );
            })
          )}
        </EntriesPanel>
      </Container>
    </AppTemplate>
  );
}
