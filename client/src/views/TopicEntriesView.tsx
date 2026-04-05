import { useState, useMemo } from 'react';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { ScrollList } from '../components/atoms/ScrollList.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { DateGroup, DateGroupLabel } from '../components/atoms/DateGroupLabel.js';
import { Badge } from '../components/atoms/Badge.js';
import { ViewHeader } from '../components/molecules/ViewHeader.js';
import { FilterTabs } from '../components/molecules/FilterTabs.js';
import { EditableEntryCard } from '../components/organisms/EditableEntryCard.js';
import { NewEntryCard } from '../components/organisms/NewEntryCard.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { useUIStore } from '../stores/uiStore.js';
import { useNavigate } from 'react-router-dom';
import { toDateStr, startOfWeek, startOfMonth } from '../utils/dateUtils.js';
import type { DateFilter } from '../types/health.js';

const DATE_FILTERS = [
  { value: 'all' as const, label: 'All' },
  { value: 'today' as const, label: 'Today' },
  { value: 'week' as const, label: 'This Week' },
  { value: 'month' as const, label: 'This Month' },
];

/* ── View ── */

interface TopicEntriesViewProps {
  title: string;
  topicNames: string[];
  metaFields?: { key: string; label: string }[];
  showDateFilter?: boolean;
}

export function TopicEntriesView({ title, topicNames, metaFields = [], showDateFilter = true }: TopicEntriesViewProps) {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#4E6E7E';
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [editingId, setEditingId] = useState<number | null>(null);

  const topicIds = useMemo(() => {
    const lowerNames = new Set(topicNames.map(n => n.toLowerCase()));
    return new Set(allTopics.filter(t => lowerNames.has(t.name.toLowerCase())).map(t => t.id));
  }, [allTopics, topicNames]);

  const filtered = useMemo(() => {
    const now = new Date();
    const todayStr = toDateStr(now);
    const weekStart = toDateStr(startOfWeek(now));
    const monthStart = toDateStr(startOfMonth(now));

    return entries.filter(entry => {
      const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
      if (!taxId || !topicIds.has(taxId)) return false;
      if (dateFilter === 'all') return true;
      const entryDate = toDateStr(entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt));
      if (dateFilter === 'today') return entryDate === todayStr;
      if (dateFilter === 'week') return entryDate >= weekStart;
      if (dateFilter === 'month') return entryDate >= monthStart;
      return true;
    });
  }, [entries, topicIds, dateFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    for (const entry of sorted) {
      const key = toDateStr(entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt));
      const arr = map.get(key) || [];
      arr.push(entry);
      map.set(key, arr);
    }
    return map;
  }, [filtered]);

  const getTopicForEntry = (entry: typeof entries[number]) => {
    const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
    return taxId ? allTopics.find(t => t.id === taxId) : undefined;
  };

  if (needsUnlock) return (<><ContentTemplate><EmptyState message="Unlock your journal to continue" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  if (isLoading || !isReady) return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);

  return (
    <ContentTemplate>
      <ViewHeader
        title={title}
        onBack={() => navigate('/')}
        right={<Badge>({filtered.length})</Badge>}
      />

      {showDateFilter && <FilterTabs options={DATE_FILTERS} active={dateFilter} onChange={setDateFilter} />}

      <ScrollList $padding="0" $gap="0">
        {topicNames.length === 1 && (() => {
          const t = allTopics.find(tp => tp.name.toLowerCase() === topicNames[0].toLowerCase());
          return t ? <NewEntryCard topic={t} headerColor={headerColor} /> : null;
        })()}
        {filtered.length === 0 ? (
          <EmptyState message={`No ${title.toLowerCase()} entries yet.`} />
        ) : (
          [...grouped.entries()].map(([dateStr, dayEntries]) => (
            dayEntries.map(entry => (
              <EditableEntryCard
                key={entry.id}
                entry={entry}
                topic={getTopicForEntry(entry)}
                headerColor={headerColor}
                isEditing={editingId === entry.id}
                onSelect={() => setEditingId(editingId === entry.id ? null : entry.id)}
                onClose={() => setEditingId(null)}
                onDeleted={() => setEditingId(null)}
                metaFields={metaFields}
              />
            ))
          ))
        )}
      </ScrollList>
    </ContentTemplate>
  );
}
