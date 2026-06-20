import { useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { ViewHeader } from '../components/molecules/ViewHeader.js';
import { FilterTabs } from '../components/molecules/FilterTabs.js';
import { EditableEntryCard } from '../components/organisms/EditableEntryCard.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import type { ShoppingItem } from '../types/fields.js';

/* ── Styled ── */

const TabsRow = styled.div`
  padding: 0 24px;
  border-bottom: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  @media (max-width: 480px) { padding: 0 16px; }
`;

const ListArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 480px) { padding: 12px 16px; }
`;

/* ── Tabs ── */

const TABS = [
  { value: 'current' as const, label: 'Current' },
  { value: 'completed' as const, label: 'Completed' },
];
type Tab = 'current' | 'completed';

/* ── ShoppingListsView ── */

export function ShoppingListsView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries   = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const accentColor = useUIStore(s => s.accentColor) || '#4A5568';

  const [tab, setTab] = useState<Tab>('current');
  const [editingId, setEditingId] = useState<number | null>(null);

  const shoppingListTopic = useMemo(
    () => allTopics.find(t => t.name.toLowerCase() === 'shopping list'),
    [allTopics]
  );

  const lists = useMemo(() => {
    if (!shoppingListTopic) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === shoppingListTopic.id)
      .map(e => {
        const meta = e.metadata as Record<string, unknown>;
        const cf   = meta?._customFields as Record<string, unknown> | undefined;
        const items = (cf?.items as ShoppingItem[]) || [];
        const completed = items.length > 0 && items.every(i => i.checked);
        return { entry: e, completed };
      })
      .sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());
  }, [entries, shoppingListTopic]);

  const visible = useMemo(
    () => lists.filter(l => tab === 'completed' ? l.completed : !l.completed),
    [lists, tab]
  );

  if (needsUnlock) {
    return (
      <>
        <ContentTemplate><EmptyState message="Unlock your journal to view shopping lists" /></ContentTemplate>
        <UnlockDialog onUnlock={handleUnlock} />
      </>
    );
  }

  if (isLoading || !isReady) {
    return (
      <ContentTemplate>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Spinner size={40} />
        </div>
      </ContentTemplate>
    );
  }

  return (
    <ContentTemplate>
      <ViewHeader title="Shopping Lists" titleTo="/goals" />

      <TabsRow>
        <FilterTabs options={TABS} active={tab} onChange={v => setTab(v as Tab)} />
      </TabsRow>

      <ListArea>
        {visible.length === 0 ? (
          <EmptyState
            message={tab === 'completed' ? 'No completed lists yet.' : 'No current shopping lists.'}
            submessage={tab === 'current' ? 'Create a new entry with the Shopping List topic to get started.' : undefined}
          />
        ) : (
          visible.map(({ entry }) => (
            <EditableEntryCard
              key={entry.id}
              entry={entry}
              topic={shoppingListTopic}
              accentColor={accentColor}
              isEditing={editingId === entry.id}
              onSelect={() => setEditingId(editingId === entry.id ? null : entry.id)}
              onClose={() => setEditingId(null)}
              onDeleted={() => setEditingId(null)}
              hideDate
              hideTopic
              autoExpandFields
            />
          ))
        )}
      </ListArea>
    </ContentTemplate>
  );
}
