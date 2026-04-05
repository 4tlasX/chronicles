import { useState, useMemo } from 'react';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { ScrollList } from '../components/atoms/ScrollList.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { DateGroup, DateGroupLabel } from '../components/atoms/DateGroupLabel.js';
import styled from 'styled-components';
import { Badge } from '../components/atoms/Badge.js';
import { PrintButton } from '../components/atoms/PrintButton.js';

const SummaryBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 12px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 768px) { padding: 12px 16px; gap: 16px; }
  @media (max-width: 480px) { padding: 10px 12px; gap: 12px; flex-wrap: wrap; }
`;

const SumItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const SumLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SumValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;
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

interface SummaryField {
  key: string;
  label: string;
  format?: (total: number) => string;
}

interface TopicEntriesViewProps {
  title: string;
  topicNames: string[];
  metaFields?: { key: string; label: string }[];
  showDateFilter?: boolean;
  printable?: boolean;
  summaryFields?: SummaryField[];
}

export function TopicEntriesView({ title, topicNames, metaFields = [], showDateFilter = true, printable = false, summaryFields = [] }: TopicEntriesViewProps) {
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

  const summaries = useMemo(() => {
    if (summaryFields.length === 0) return [];
    return summaryFields.map(sf => {
      let total = 0;
      for (const entry of filtered) {
        const cf = ((entry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown>) || {};
        const v = cf[sf.key];
        if (v != null) total += parseFloat(String(v)) || 0;
      }
      return { label: sf.label, value: sf.format ? sf.format(total) : String(total) };
    });
  }, [filtered, summaryFields]);

  if (needsUnlock) return (<><ContentTemplate><EmptyState message="Unlock your journal to continue" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  if (isLoading || !isReady) return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);

  return (
    <ContentTemplate>
      <ViewHeader
        title={title}
        onBack={() => navigate('/')}
        right={<><Badge>({filtered.length})</Badge>{printable && <PrintButton />}</>}
      />

      {showDateFilter && <div data-print-hide><FilterTabs options={DATE_FILTERS} active={dateFilter} onChange={setDateFilter} /></div>}

      {summaries.length > 0 && (dateFilter === 'today' || dateFilter === 'week') && (
        <SummaryBar>
          {summaries.map(s => (
            <SumItem key={s.label}>
              <SumLabel>{s.label}</SumLabel>
              <SumValue>{s.value}</SumValue>
            </SumItem>
          ))}
        </SummaryBar>
      )}

      <ScrollList $padding="0" $gap="0">
        {topicNames.length === 1 && (() => {
          const t = allTopics.find(tp => tp.name.toLowerCase() === topicNames[0].toLowerCase());
          return t ? <div data-print-hide><NewEntryCard topic={t} headerColor={headerColor} /></div> : null;
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
