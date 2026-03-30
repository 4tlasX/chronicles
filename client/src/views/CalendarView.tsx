import { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { AppTemplate } from '../components/templates/AppTemplate.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { getTopicIcon } from '../utils/topicIcons.js';
import { useNavigate } from 'react-router-dom';

/* ── Helpers ── */

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { date: Date; isOutside: boolean }[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevMonthDays - i), isOutside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), isOutside: false });
  }
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), isOutside: true });
    }
  }
  return days;
}

/* ── Styled ── */

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.9);
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
`;

const NavBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  &:hover { background: rgba(0, 0, 0, 0.05); }
`;

const MonthLabel = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  min-width: 160px;
  text-align: center;
`;

const GridWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
`;

const WeekdayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px 0;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DayCell = styled.div<{ $isOutside?: boolean; $isSelected?: boolean }>`
  aspect-ratio: 1;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-width: 0 1px 1px 0;
  cursor: pointer;
  background: ${({ $isSelected }) => $isSelected ? 'rgba(0,0,0,0.03)' : 'transparent'};
  outline: ${({ $isSelected }) => $isSelected ? '2px solid #e5e6ea' : 'none'};
  outline-offset: -2px;
  opacity: ${({ $isOutside }) => $isOutside ? 0.4 : 1};
  transition: background 0.1s;
  overflow: hidden;
  &:hover { background: rgba(0, 0, 0, 0.02); }

  @media (max-width: 768px) {
    aspect-ratio: auto;
    min-height: 44px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    border-width: 0 0 1px 0;
  }
`;

const DayNumber = styled.div<{ $isToday?: boolean; $accentColor: string }>`
  font-size: 13px;
  font-weight: ${({ $isToday }) => $isToday ? 700 : 400};
  color: ${({ $isToday }) => $isToday ? 'white' : 'inherit'};
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ $isToday, $accentColor }) => $isToday ? $accentColor : 'transparent'};
  margin-bottom: 2px;
  flex-shrink: 0;
`;

const MobileDayLabel = styled.span<{ $isOutside?: boolean }>`
  display: none;
  width: 28px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme, $isOutside }) => $isOutside ? theme.colors.border : theme.colors.textMuted};
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: block;
  }
`;

const DayItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
`;

const DayItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 1px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    padding: 2px 0;
  }
`;

const MoreLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 1px 4px;
`;

/* ── Day Detail Panel ── */

const DetailPanel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  max-height: 300px;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DetailTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const DetailCount = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: 8px;
`;

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  &:hover { background: rgba(0, 0, 0, 0.05); }
`;

const DetailList = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const DetailRow = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(0, 0, 0, 0.02); }
  &:last-child { border-bottom: none; }
`;

const DetailColorBar = styled.div<{ $color: string }>`
  width: 3px;
  min-height: 24px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
  align-self: stretch;
`;

const DetailContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const DetailEntryTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DetailEntryMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: capitalize;
`;

const EmptyDetail = styled.div`
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ── Component ── */

export function CalendarView() {
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#2d2c2a';
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = useMemo(() => new Date(), []);

  // Group entries by date string
  const entriesByDate = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const entry of entries) {
      const d = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
      const key = toDateStr(d);
      const arr = map.get(key) || [];
      arr.push(entry);
      map.set(key, arr);
    }
    return map;
  }, [entries]);

  const days = useMemo(
    () => getCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPrev = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNext = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handleDayClick = useCallback((dateStr: string) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  }, []);

  const handleEntryClick = useCallback((entryId: number) => {
    setSelectedEntryId(entryId);
    navigate('/');
  }, [setSelectedEntryId, navigate]);

  const selectedEntries = selectedDate ? (entriesByDate.get(selectedDate) || []) : [];

  const getTopicForEntry = (entry: typeof entries[number]) => {
    const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
    return taxId ? allTopics.find(t => t.id === taxId) : undefined;
  };

  return (
    <AppTemplate hideSidebar transparentContent>
      <PageWrapper>
        <CalendarHeader>
          <NavBtn onClick={goToPrev}><FontAwesomeIcon icon={faChevronLeft} /></NavBtn>
          <MonthLabel>{monthLabel}</MonthLabel>
          <NavBtn onClick={goToNext}><FontAwesomeIcon icon={faChevronRight} /></NavBtn>
        </CalendarHeader>

        <GridWrapper>
          <WeekdayRow>
            {WEEKDAYS.map(d => <WeekdayLabel key={d}>{d}</WeekdayLabel>)}
          </WeekdayRow>

          <DaysGrid>
            {days.map(({ date, isOutside }, i) => {
              const dateStr = toDateStr(date);
              const dayEntries = entriesByDate.get(dateStr) || [];
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate === dateStr;
              const dow = SHORT_DAYS[date.getDay()];

              return (
                <DayCell key={i} $isOutside={isOutside} $isSelected={isSelected} onClick={() => handleDayClick(dateStr)}>
                  <MobileDayLabel $isOutside={isOutside}>{dow}</MobileDayLabel>
                  <DayNumber $isToday={isToday} $accentColor={headerColor}>
                    {date.getDate()}
                  </DayNumber>
                  <DayItems>
                    {dayEntries.slice(0, 3).map(entry => {
                      const topic = getTopicForEntry(entry);
                      const preview = stripHtml(entry.content).slice(0, 40) || 'Entry';
                      return (
                        <DayItem key={entry.id} onClick={e => { e.stopPropagation(); handleEntryClick(entry.id); }}>
                          {topic ? `${topic.name}: ` : ''}{preview}
                        </DayItem>
                      );
                    })}
                    {dayEntries.length > 3 && (
                      <MoreLabel>+{dayEntries.length - 3} more</MoreLabel>
                    )}
                  </DayItems>
                </DayCell>
              );
            })}
          </DaysGrid>
        </GridWrapper>

        {/* Day Detail Panel */}
        {selectedDate && (
          <DetailPanel>
            <DetailHeader>
              <div>
                <DetailTitle>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </DetailTitle>
                <DetailCount>
                  {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
                </DetailCount>
              </div>
              <CloseBtn onClick={() => setSelectedDate(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </CloseBtn>
            </DetailHeader>

            <DetailList>
              {selectedEntries.length === 0 ? (
                <EmptyDetail>No entries for this day.</EmptyDetail>
              ) : (
                selectedEntries.map(entry => {
                  const topic = getTopicForEntry(entry);
                  const preview = stripHtml(entry.content).slice(0, 100) || 'Empty entry';
                  return (
                    <DetailRow key={entry.id} onClick={() => handleEntryClick(entry.id)}>
                      <DetailColorBar $color={headerColor} />
                      <DetailContent>
                        <DetailEntryTitle>{preview}</DetailEntryTitle>
                        {topic && (
                          <DetailEntryMeta>
                            <FontAwesomeIcon icon={getTopicIcon(topic.icon)} style={{ marginRight: 4, fontSize: 11 }} />
                            {topic.name}
                          </DetailEntryMeta>
                        )}
                      </DetailContent>
                    </DetailRow>
                  );
                })
              )}
            </DetailList>
          </DetailPanel>
        )}
      </PageWrapper>
    </AppTemplate>
  );
}
