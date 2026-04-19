import { useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { faPlus, faXmark, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { ViewHeader } from '../components/molecules/ViewHeader.js';
import { FilterTabs } from '../components/molecules/FilterTabs.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { stripHtml } from '../utils/stripHtml.js';
import { useNavigate } from 'react-router-dom';
import { entries as entriesApi } from '../services/api.js';
import type { ShoppingItem, ShoppingCategory } from '../types/fields.js';

/* ── Constants ── */

const CATEGORIES: { value: ShoppingCategory; label: string }[] = [
  { value: 'produce',      label: 'Produce' },
  { value: 'meat',         label: 'Meat' },
  { value: 'dairy',        label: 'Dairy' },
  { value: 'bakery',       label: 'Bakery' },
  { value: 'frozen',       label: 'Frozen' },
  { value: 'beverages',    label: 'Beverages' },
  { value: 'sundries',     label: 'Sundries' },
  { value: 'personal_care',label: 'Personal Care' },
  { value: 'household',    label: 'Household' },
  { value: 'other',        label: 'Other' },
];
const CATEGORY_ORDER = CATEGORIES.map(c => c.value);

/* ── Styled ── */

const ListArea = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 480px) { padding: 12px 16px; }
`;

const TabsRow = styled.div`
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 480px) { padding: 0 16px; }
`;

/* Panel */
const Panel = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

const PanelHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  text-align: left;
  gap: 12px;
  &:hover { background: ${({ theme }) => theme.colors.surfaceHover}; }
`;

const PanelTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PanelMeta = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  flex-shrink: 0;
`;

const PanelChevron = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
`;

const PanelBody = styled.div`
  padding: 0;
`;

/* Category group */
const CategoryHeader = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 10px 16px 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

/* Item row */
const ItemRow = styled.div<{ $checked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $checked, theme }) => $checked ? theme.colors.surfaceHover : 'transparent'};
  &:last-child { border-bottom: none; }
`;

const ItemCheckbox = styled.input`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: #22C55E;
`;

const ItemName = styled.input<{ $checked?: boolean }>`
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-family: inherit;
  color: ${({ $checked, theme }) => $checked ? theme.colors.textSecondary : theme.colors.text};
  text-decoration: ${({ $checked }) => $checked ? 'line-through' : 'none'};
  background: none;
  border: none;
  outline: none;
  padding: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

const CategorySelect = styled.select`
  font-size: 13px;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 2px 4px;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { border-color: ${({ theme }) => theme.colors.border}; }
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const RemoveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: 4px;
  &:hover { color: ${({ theme }) => theme.colors.danger}; background: ${({ theme }) => theme.colors.surfaceHover}; }
`;

const PanelFooter = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const AddBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  padding: 5px 10px;
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text}; border-color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const SaveBtn = styled.button<{ $dirty?: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 5px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border: 1px solid ${({ $dirty, theme }) => $dirty ? 'transparent' : theme.colors.border};
  background: ${({ $dirty, theme }) => $dirty ? theme.colors.text : 'transparent'};
  color: ${({ $dirty, theme }) => $dirty ? theme.colors.textInverse : theme.colors.textSecondary};
  cursor: ${({ $dirty }) => $dirty ? 'pointer' : 'default'};
  &:hover:enabled { opacity: 0.85; }
  &:disabled { opacity: 0.4; }
`;

/* ── ShoppingListPanel (defined at module level, not inside render) ── */

interface PanelProps {
  id: number;
  title: string;
  initialItems: ShoppingItem[];
  initialNotes: string;
  createdAt: Date;
  topicId: number;
  content: string;
  metadata: Record<string, unknown>;
  encryptPost: (content: string, metadata: Record<string, unknown>) => Promise<{ contentEncrypted: string; contentIv: string; metadataEncrypted: string; metadataIv: string }>;
  updateDecryptedEntry: (id: number, patch: Partial<{ content: string; metadata: Record<string, unknown> }>) => void;
}

function ShoppingListPanel({ id, title, initialItems, initialNotes, createdAt, topicId, content, metadata, encryptPost, updateDecryptedEntry }: PanelProps) {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [notes, setNotes] = useState(initialNotes);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(true);

  const checked = items.filter(i => i.checked).length;

  const updateItem = (index: number, patch: Partial<ShoppingItem>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
    setDirty(true);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), name: '', category: 'other', checked: false }]);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newCustomFields = { ...(metadata._customFields as Record<string, unknown> || {}), items, notes };
      const newMetadata = { ...metadata, _customFields: newCustomFields };
      const encrypted = await encryptPost(content, newMetadata);
      await entriesApi.update(id, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: [topicId],
      });
      updateDecryptedEntry(id, { metadata: newMetadata });
      setDirty(false);
    } catch (err) {
      console.error('Failed to save shopping list:', err);
    } finally {
      setSaving(false);
    }
  };

  const groups = useMemo(() => {
    const map = new Map<ShoppingCategory, { item: ShoppingItem; index: number }[]>();
    items.forEach((item, index) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push({ item, index });
    });
    return CATEGORY_ORDER
      .map(cat => ({
        cat,
        label: CATEGORIES.find(c => c.value === cat)!.label,
        entries: map.get(cat as ShoppingCategory) || [],
      }))
      .filter(g => g.entries.length > 0);
  }, [items]);

  const dateLabel = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Panel>
      <PanelHeader onClick={() => setOpen(o => !o)}>
        <PanelTitle>{title}</PanelTitle>
        <PanelMeta>{checked}/{items.length} · {dateLabel}</PanelMeta>
        <PanelChevron>
          <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} />
        </PanelChevron>
      </PanelHeader>

      {open && (
        <PanelBody>
          {items.length === 0 && (
            <div style={{ padding: '12px 16px', fontSize: 13, color: 'inherit', opacity: 0.5 }}>
              No items yet.
            </div>
          )}

          {groups.map(({ cat, label, entries }) => (
            <div key={cat}>
              <CategoryHeader>{label}</CategoryHeader>
              {entries.map(({ item, index }) => (
                <ItemRow key={item.id} $checked={item.checked}>
                  <ItemCheckbox
                    type="checkbox"
                    checked={item.checked}
                    onChange={e => updateItem(index, { checked: e.target.checked })}
                  />
                  <ItemName
                    $checked={item.checked}
                    value={item.name}
                    onChange={e => updateItem(index, { name: e.target.value })}
                    placeholder="Item name"
                  />
                  <CategorySelect
                    value={item.category}
                    onChange={e => updateItem(index, { category: e.target.value as ShoppingCategory })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </CategorySelect>
                  <RemoveBtn type="button" onClick={() => removeItem(index)} aria-label="Remove">
                    <FontAwesomeIcon icon={faXmark} size="xs" />
                  </RemoveBtn>
                </ItemRow>
              ))}
            </div>
          ))}

          <PanelFooter>
            <AddBtn type="button" onClick={addItem}>
              <FontAwesomeIcon icon={faPlus} size="xs" />
              Add Item
            </AddBtn>
            <SaveBtn
              $dirty={dirty}
              disabled={!dirty || saving}
              onClick={handleSave}
            >
              {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
            </SaveBtn>
          </PanelFooter>
        </PanelBody>
      )}
    </Panel>
  );
}

/* ── Tabs ── */

const TABS = [
  { value: 'current' as const, label: 'Current' },
  { value: 'completed' as const, label: 'Completed' },
];
type Tab = 'current' | 'completed';

/* ── ShoppingListsView ── */

export function ShoppingListsView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries              = useEntriesStore(s => s.decryptedEntries);
  const allTopics            = useEntriesStore(s => s.allTopics);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const { encryptPost }      = useEncryption();
  const navigate             = useNavigate();
  const [tab, setTab]        = useState<Tab>('current');

  const shoppingListTopicId = useMemo(
    () => allTopics.find(t => t.name.toLowerCase() === 'shopping list')?.id,
    [allTopics]
  );

  const lists = useMemo(() => {
    if (!shoppingListTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === shoppingListTopicId)
      .map(e => {
        const meta = e.metadata as Record<string, unknown>;
        const cf   = meta?._customFields as Record<string, unknown> | undefined;
        const items = (cf?.items as ShoppingItem[]) || [];
        const completed = items.length > 0 && items.every(i => i.checked);
        return {
          id: e.id,
          title: stripHtml(e.content).trim() || `Shopping List #${e.id}`,
          items,
          notes: (cf?.notes as string) || '',
          completed,
          createdAt: e.createdAt,
          content: e.content,
          metadata: meta,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, shoppingListTopicId]);

  const visible = useMemo(
    () => lists.filter(l => tab === 'completed' ? l.completed : !l.completed),
    [lists, tab]
  );

  const stableEncryptPost = useCallback(encryptPost, []); // eslint-disable-line react-hooks/exhaustive-deps
  const stableUpdate = useCallback(updateDecryptedEntry, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <ViewHeader title="Shopping Lists" onBack={() => navigate('/')} />

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
          visible.map(list => (
            <ShoppingListPanel
              key={list.id}
              id={list.id}
              title={list.title}
              initialItems={list.items}
              initialNotes={list.notes}
              createdAt={list.createdAt}
              topicId={shoppingListTopicId!}
              content={list.content}
              metadata={list.metadata}
              encryptPost={stableEncryptPost}
              updateDecryptedEntry={stableUpdate}
            />
          ))
        )}
      </ListArea>
    </ContentTemplate>
  );
}
