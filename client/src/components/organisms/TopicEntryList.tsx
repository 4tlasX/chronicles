import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '../atoms/EmptyState.js';
import { EditableEntryCard } from './EditableEntryCard.js';
import type { DecryptedPost } from '@shared/crypto/types';
import type { Topic } from '../../types/topics.js';
import { stripHtml, summarizeUserFields } from '../../utils/stripHtml.js';
import { useUIStore } from '../../stores/uiStore.js';
import { BACKGROUND_IMAGES } from '@chronicles/shared';

type DateFilter = 'all' | 'today' | 'week' | 'month';

/* ── Layout ── */
const Panel = styled.div<{ $hidden?: boolean; $hasBackground?: boolean; $lightBg?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ $hasBackground, $lightBg, theme }) => $hasBackground ? ($lightBg ? theme.colors.surfaceOverlayLight : theme.colors.surfaceOverlay) : 'var(--paper)'};
  @media (max-width: 1024px) {
    display: ${({ $hidden }) => $hidden ? 'none' : 'flex'};
  }
`;

/* ── Header ── */
const Head = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-shrink: 0;
`;

const MobileBackBtn = styled.button`
  display: none;
  align-items: center;
  align-self: flex-end;
  margin-bottom: -6px;
  gap: 6px;
  padding: 6px 10px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

const TitleBlock = styled.div``;

const Kicker = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.mono};
  font-style: normal;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textFaint};
  display: block;
  margin-bottom: 6px;
  font-weight: 400;
`;

const TitleText = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 24px;
  font-style: italic;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1;
  margin: 0;
`;

const MetaText = styled.span`
  font-family: var(--font-sans);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.textFaint};
  white-space: nowrap;
  align-self: flex-end;
  padding-bottom: 4px;
`;

/* ── Date filter tabs ── */
const Filters = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft};
  align-items: center;
  flex-shrink: 0;
`;

const FilterBtn = styled.button<{ $active?: boolean }>`
  padding: 4px 12px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.border : 'transparent'};
  background: ${({ $active, theme }) => $active ? theme.colors.surface : 'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FiltersRight = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const PrintBtn = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.surface}; }
`;

/* ── Summary bar (Wellness topics) ── */
const Summary = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  padding: 12px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft};
  flex-shrink: 0;
`;

const SumItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`;

const SumLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.textFaint};
`;

const SumVal = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-style: italic;
  font-size: 22px;
  color: ${({ theme }) => theme.colors.text};
`;

const SumUnit = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.mono};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textFaint};
  font-style: normal;
  margin-left: 3px;
`;

/* ── Entry list ── */
const ListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

/* ── Entry card ── */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  border-left: 3px solid var(--accent, ${({ theme }) => theme.colors.accent});
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: 12px 16px;
  cursor: pointer;
`;

const EditorWrap = styled.div`
  margin: 4px 0 8px;
`;

const CardTitle = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.sans};
  font-style: italic;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 6px;
`;

const CardBody = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.sans};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.55;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.mono};
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textFaint};
  display: flex;
  gap: 16px;
`;

/* ── Day groups ── */
const DayGroup = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 20px;
  align-items: start;
`;

const DayLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 300;
  color: #453f38;
  text-align: right;
  padding-top: 10px;
  letter-spacing: 0.05rem;
`;

const DayDate = styled.span`
  display: block;
  font-family: var(--font-sans);
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textFaint};
  text-transform: uppercase;
  margin-top: 3px;
`;

const DayEntries = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* ── Helpers ── */
function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function relativeDay(date: Date): string {
  const today = startOfDay(new Date());
  const d = startOfDay(date);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

function monoDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function applyDateFilter(entries: DecryptedPost[], filter: DateFilter): DecryptedPost[] {
  if (filter === 'all') return entries;
  const todayStart = startOfDay(new Date());
  return entries.filter(e => {
    const d = new Date(e.createdAt);
    if (filter === 'today') return d >= todayStart;
    if (filter === 'week') return d >= new Date(todayStart.getTime() - 6 * 86400000);
    if (filter === 'month') return d >= new Date(todayStart.getTime() - 29 * 86400000);
    return true;
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function countFields(metadata: Record<string, unknown>): number {
  const cf = metadata._customFields as Record<string, unknown> | undefined;
  if (!cf) return 0;
  const uf = cf._userFields as Record<string, unknown> | undefined;
  const builtIn = Object.keys(cf).filter(k => k !== '_userFields' && cf[k] !== null && cf[k] !== undefined && cf[k] !== '').length;
  const user = uf ? Object.values(uf).filter(v => v !== null && v !== undefined && v !== '').length : 0;
  return builtIn + user;
}

function groupByDay(entries: DecryptedPost[]) {
  const map = new Map<string, { label: string; mono: string; entries: DecryptedPost[] }>();
  for (const e of entries) {
    const d = new Date(e.createdAt);
    const key = startOfDay(d).toISOString();
    if (!map.has(key)) map.set(key, { label: relativeDay(d), mono: monoDate(d), entries: [] });
    map.get(key)!.entries.push(e);
  }
  return Array.from(map.entries()).map(([dayKey, v]) => ({ dayKey, ...v }));
}

interface WellnessSummary { water: number; avgMood: number | null; sleep: number; count: number }

function computeWellnessSummary(entries: DecryptedPost[]): WellnessSummary | null {
  let water = 0, moodSum = 0, moodCount = 0, sleep = 0, count = 0;
  for (const e of entries) {
    const cf = e.metadata._customFields as Record<string, unknown> | undefined;
    if (!cf || !('water' in cf || 'mood' in cf || 'sleep' in cf)) continue;
    count++;
    water += Number(cf.water || 0);
    if (cf.mood) { moodSum += Number(cf.mood); moodCount++; }
    sleep += Number(cf.sleep || 0);
  }
  if (count === 0) return null;
  return { water, avgMood: moodCount > 0 ? Math.round((moodSum / moodCount) * 10) / 10 : null, sleep, count };
}

interface TopicEntryListProps {
  title: string;
  kicker?: string;
  entries: DecryptedPost[];
  allTopics: Topic[];
  accentColor: string;
  hiddenMobile?: boolean;
  onMobileBack: () => void;
  onBackToJournal: () => void;
  backLabel?: string;
  selectedTopic?: Topic;
  entryCount?: number;
  hideTitle?: boolean;
}

export function TopicEntryList({
  title, kicker, entries, allTopics, accentColor, hiddenMobile,
  onMobileBack, onBackToJournal, backLabel = 'Back', selectedTopic, entryCount, hideTitle,
}: TopicEntryListProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [editingId, setExpandedId] = useState<number | null>(null);
  const topicCustomFields = useUIStore(s => s.topicCustomFields);
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const isLightBg = BACKGROUND_IMAGES.find(bg => bg.value === backgroundImage)?.light ?? false;

  const filtered = useMemo(() => applyDateFilter(entries, dateFilter), [entries, dateFilter]);
  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  const wellnessSummary = useMemo(
    () => dateFilter !== 'all' ? computeWellnessSummary(filtered) : null,
    [filtered, dateFilter]
  );

  const total = entryCount ?? entries.length;
  const metaText = `${total} entr${total !== 1 ? 'ies' : 'y'} · last 30 days`;

  const getTopicForEntry = (entry: DecryptedPost) => {
    const taxId = entry.metadata._taxonomyId as number | undefined;
    return taxId ? allTopics.find(t => t.id === taxId) : undefined;
  };

  return (
    <Panel $hidden={hiddenMobile} $hasBackground={!!backgroundImage} $lightBg={isLightBg}>
      {!hideTitle && (
        <Head>
          <TitleBlock>
            {kicker && <Kicker>{kicker}</Kicker>}
            <TitleText>{title}</TitleText>
          </TitleBlock>
          <MobileBackBtn onClick={onMobileBack}>
            <FontAwesomeIcon icon={faChevronLeft} />
            All Topics
          </MobileBackBtn>
        </Head>
      )}

      <Filters>
        {(['all', 'today', 'week', 'month'] as DateFilter[]).map(f => (
          <FilterBtn key={f} $active={dateFilter === f} onClick={() => setDateFilter(f)}>
            {f === 'all' ? 'All' : f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'This Month'}
          </FilterBtn>
        ))}
      </Filters>

      {wellnessSummary && (
        <Summary>
          <SumItem>
            <SumLabel>Water</SumLabel>
            <SumVal>{wellnessSummary.water}<SumUnit>gl</SumUnit></SumVal>
          </SumItem>
          {wellnessSummary.avgMood !== null && (
            <SumItem>
              <SumLabel>Avg mood</SumLabel>
              <SumVal>{wellnessSummary.avgMood}</SumVal>
            </SumItem>
          )}
          <SumItem>
            <SumLabel>Sleep</SumLabel>
            <SumVal>{wellnessSummary.sleep}<SumUnit>hrs</SumUnit></SumVal>
          </SumItem>
          <SumItem>
            <SumLabel>Entries</SumLabel>
            <SumVal>{wellnessSummary.count}</SumVal>
          </SumItem>
        </Summary>
      )}

      <ListArea>
        {filtered.length === 0 && (
          <EmptyState message={dateFilter === 'all' ? 'No entries.' : 'No entries for this period.'} />
        )}

        {groups.map(group => (
          <DayGroup key={group.dayKey}>
            <DayLabel>
              {group.label}
              <DayDate>{group.mono}</DayDate>
            </DayLabel>
            <DayEntries>
              {group.entries.map(entry => {
                const bodyText = stripHtml(entry.content).trim();
                const titleText = entry.metadata._title as string | undefined;
                const meta = entry.metadata as Record<string, unknown>;
                const cf = meta._customFields as Record<string, unknown> | undefined;
                let fieldPreview: string | undefined;
                if (!bodyText && cf) {
                  if ((meta._widgetType as string) === 'wellness-checkin') {
                    const w = (cf.waterGlasses as number) || 0;
                    const g = (cf.waterGoal as number) || 8;
                    const m = (cf.moodScore as number) || 0;
                    const s = (cf.sleepHours as number) || 0;
                    const parts = [w > 0 ? `${w}/${g} glasses` : '', m > 0 ? `Mood ${m}/5` : '', s > 0 ? `${s}h sleep` : ''].filter(Boolean);
                    fieldPreview = parts.join(' · ') || 'Wellness check-in';
                  } else {
                    const topicId = meta._taxonomyId as number | undefined;
                    const defs = topicId ? (topicCustomFields[topicId] ?? []) : [];
                    const uf = (cf._userFields as Record<string, unknown>) ?? {};
                    fieldPreview = summarizeUserFields(defs, uf) || undefined;
                  }
                }
                const cardTitle = titleText || bodyText.slice(0, 80) || fieldPreview || 'Untitled';
                const cardBody = titleText ? bodyText : '';
                const fieldCount = countFields(entry.metadata);
                return (
                  <div key={entry.id}>
                    <Card onClick={() => setExpandedId(editingId === entry.id ? null : entry.id)}>
                      <CardTitle>{cardTitle}</CardTitle>
                      {cardBody && <CardBody>{cardBody}</CardBody>}
                      <CardMeta>
                        {getTopicForEntry(entry) && <span>{getTopicForEntry(entry)!.name}</span>}
                        {fieldCount > 0 && <span>{fieldCount} field{fieldCount !== 1 ? 's' : ''}</span>}
                      </CardMeta>
                    </Card>
                    {editingId === entry.id && (
                      <EditorWrap>
                        <EditableEntryCard
                          entry={entry}
                          topic={getTopicForEntry(entry)}
                          accentColor={accentColor}
                          isEditing
                          hidePreview
                          onSelect={() => setExpandedId(null)}
                          onClose={() => setExpandedId(null)}
                          onDeleted={() => setExpandedId(null)}
                          showAsPlain
                          compactMargin
                        />
                      </EditorWrap>
                    )}
                  </div>
                );
              })}
            </DayEntries>
          </DayGroup>
        ))}
      </ListArea>
    </Panel>
  );
}
