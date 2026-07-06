import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { MealsTabBar } from '../components/molecules/MealsTabBar.js';
import { FilterTabs } from '../components/molecules/FilterTabs.js';
import { EntryListCard } from '../components/molecules/EntryListCard.js';
import { EditableEntryCard } from '../components/organisms/EditableEntryCard.js';
import { SwipeActions } from '../components/molecules/SwipeActions.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { entries as entriesApi } from '../services/api.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import type { ShoppingItem } from '../types/fields.js';

/* ── Layout (mirrors HealthView) ── */

const Page = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  padding: 0 24px 64px;
  @media (max-width: 768px) { padding: 0 16px 48px; }
`;

const Head = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 53px 0 16px;
`;

const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 200;
  line-height: 1;
  color: var(--text-primary);
  margin: 0;
  @media (max-width: 480px) { font-size: 34px; }
`;

const TabsRow = styled.div`
  margin: 0;
`;

const SubTabs = styled.div`
  padding: 10px 0 4px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const EditWrap = styled.div`
  border-top: 1px solid var(--border-subtle);
  padding: 8px 0;
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
  const removeEntry = useEntriesStore(s => s.removeEntry);
  const accentColor = useUIStore(s => s.accentColor) || '#4A5568';

  const [tab, setTab] = useState<Tab>('current');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await entriesApi.delete(id);
      removeEntry(id);
      if (editingId === id) setEditingId(null);
    } catch (err) { console.error('Failed to delete entry:', err); }
  }, [removeEntry, editingId]);

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

  if (needsUnlock) return (
    <>
      <ContentTemplate><EmptyState message="Unlock your journal to view shopping lists" /></ContentTemplate>
      <UnlockDialog onUnlock={handleUnlock} />
    </>
  );

  if (isLoading || !isReady) return (
    <ContentTemplate>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Spinner size={40} />
      </div>
    </ContentTemplate>
  );

  return (
    <ContentTemplate>
      <Page>
        <Inner>
          <Head>
            <Title>Meals</Title>
          </Head>

          <TabsRow><MealsTabBar /></TabsRow>

          <SubTabs>
            <FilterTabs options={TABS} active={tab} onChange={v => setTab(v as Tab)} flush bordered={false} />
          </SubTabs>

          {visible.length === 0 ? (
            <EmptyState
              message={tab === 'completed' ? 'No completed lists yet.' : 'No current shopping lists.'}
              submessage={tab === 'current' ? 'Create a new entry with the Shopping List topic to get started.' : undefined}
            />
          ) : (
            <List>
              {visible.map(({ entry, completed }) => {
                const created = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
                const isEditing = editingId === entry.id;
                return (
                  <div key={entry.id}>
                    <SwipeActions accentColor={accentColor} onDelete={() => handleDelete(entry.id)} disabled={isEditing}>
                      <EntryListCard
                        content={entry.content}
                        createdAt={created}
                        topicName={shoppingListTopic?.name}
                        completed={completed}
                        onClick={() => setEditingId(isEditing ? null : entry.id)}
                      />
                    </SwipeActions>
                    {isEditing && (
                      <EditWrap>
                        <EditableEntryCard
                          entry={entry}
                          topic={shoppingListTopic}
                          accentColor={accentColor}
                          isEditing
                          hidePreview
                          onSelect={() => setEditingId(null)}
                          onClose={() => setEditingId(null)}
                          onDeleted={() => setEditingId(null)}
                          autoExpandFields
                        />
                      </EditWrap>
                    )}
                  </div>
                );
              })}
            </List>
          )}
        </Inner>
      </Page>
    </ContentTemplate>
  );
}
