import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { AppTemplate } from '../components/templates/AppTemplate.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { getTopicIcon } from '../utils/topicIcons.js';
import { useNavigate } from 'react-router-dom';

/* ── Helpers ── */

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

type DateFilter = 'all' | 'today' | 'week' | 'month';

/* ── Styled ── */

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.9);
`;

const HeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const EntryCountBadge = styled.span<{ $color: string }>`
  font-size: 13px;
  color: ${({ $color }) => $color};
  font-weight: 500;
`;

const BackLink = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.accent};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const FilterBtn = styled.button<{ $active?: boolean }>`
  padding: 4px 12px;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  background: ${({ $active }) => $active ? 'rgba(0,0,0,0.06)' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

const ListArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const DateGroup = styled.div`
  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const DateLabel = styled.div`
  padding: 8px 20px 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const EntryRow = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 20px;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(0, 0, 0, 0.02); }
  &:last-child { border-bottom: none; }
`;

const EntryIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 14px;
  margin-top: 2px;
  flex-shrink: 0;
`;

const EntryContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const EntryPreview = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EntryMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

/* ── Component ── */

interface TopicEntriesViewProps {
  title: string;
  /** Topic names to filter by (matches any) */
  topicNames: string[];
  /** Optional custom field keys to display as metadata */
  metaFields?: { key: string; label: string }[];
  /** Show date filter tabs (default true) */
  showDateFilter?: boolean;
}

export function TopicEntriesView({ title, topicNames, metaFields = [], showDateFilter = true }: TopicEntriesViewProps) {
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#2d2c2a';
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const navigate = useNavigate();

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  // Find matching topic IDs
  const topicIds = useMemo(() => {
    const lowerNames = new Set(topicNames.map(n => n.toLowerCase()));
    return new Set(allTopics.filter(t => lowerNames.has(t.name.toLowerCase())).map(t => t.id));
  }, [allTopics, topicNames]);

  // Filter entries by topic and date
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

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    const sorted = [...filtered].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    for (const entry of sorted) {
      const d = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
      const key = toDateStr(d);
      const arr = map.get(key) || [];
      arr.push(entry);
      map.set(key, arr);
    }
    return map;
  }, [filtered]);

  const handleEntryClick = useCallback((entryId: number) => {
    setSelectedEntryId(entryId);
    navigate('/');
  }, [setSelectedEntryId, navigate]);

  const getTopicForEntry = (entry: typeof entries[number]) => {
    const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
    return taxId ? allTopics.find(t => t.id === taxId) : undefined;
  };

  const getMetaValue = (entry: typeof entries[number], key: string): string | null => {
    const cf = (entry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> | undefined;
    if (!cf || cf[key] == null) return null;
    const v = cf[key];
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
  };

  return (
    <AppTemplate hideSidebar transparentContent>
      <PageWrapper>
        <HeaderBar>
          <TitleRow>
            <Title>{title}</Title>
            <EntryCountBadge $color={headerColor}>({filtered.length})</EntryCountBadge>
          </TitleRow>
          <BackLink onClick={() => navigate('/')}>Back to Journal</BackLink>
        </HeaderBar>

        {showDateFilter && (
          <FilterRow>
            {(['all', 'today', 'week', 'month'] as DateFilter[]).map(f => (
              <FilterBtn key={f} $active={dateFilter === f} onClick={() => setDateFilter(f)}>
                {f === 'all' ? 'All' : f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'This Month'}
              </FilterBtn>
            ))}
          </FilterRow>
        )}

        <ListArea>
          {filtered.length === 0 ? (
            <EmptyState>No {title.toLowerCase()} entries yet.</EmptyState>
          ) : (
            [...grouped.entries()].map(([dateStr, dayEntries]) => (
              <DateGroup key={dateStr}>
                <DateLabel>
                  {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })}
                </DateLabel>
                {dayEntries.map(entry => {
                  const topic = getTopicForEntry(entry);
                  const preview = stripHtml(entry.content).slice(0, 120) || 'Empty entry';
                  const metaValues = metaFields
                    .map(f => ({ label: f.label, value: getMetaValue(entry, f.key) }))
                    .filter(m => m.value != null);

                  return (
                    <EntryRow key={entry.id} onClick={() => handleEntryClick(entry.id)}>
                      {topic && (
                        <EntryIcon $color={headerColor}>
                          <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
                        </EntryIcon>
                      )}
                      <EntryContent>
                        <EntryPreview>{preview}</EntryPreview>
                        {metaValues.length > 0 && (
                          <EntryMeta>
                            {metaValues.map(m => (
                              <span key={m.label}>{m.label}: {m.value}</span>
                            ))}
                          </EntryMeta>
                        )}
                      </EntryContent>
                    </EntryRow>
                  );
                })}
              </DateGroup>
            ))
          )}
        </ListArea>
      </PageWrapper>
    </AppTemplate>
  );
}
