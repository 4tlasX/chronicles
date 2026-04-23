import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { stripHtml } from '../../utils/stripHtml.js';
import type { DecryptedPost } from '@shared/crypto/types';

/* ── Helpers ── */

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { date: Date; isOutside: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) days.push({ date: new Date(year, month - 1, prevMonthDays - i), isOutside: true });
  for (let d = 1; d <= daysInMonth; d++) days.push({ date: new Date(year, month, d), isOutside: false });
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) for (let d = 1; d <= remaining; d++) days.push({ date: new Date(year, month + 1, d), isOutside: true });
  return days;
}

/* ── Styled ── */

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  position: relative;
`;

const HeaderLeft = styled.div`
  position: absolute;
  left: 16px;
  display: flex;
  align-items: center;
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
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 16px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
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
  @media (max-width: 768px) { display: none; }
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 0;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const DayCell = styled.div<{ $isOutside?: boolean; $isSelected?: boolean; $isToday?: boolean; $accentColor?: string }>`
  aspect-ratio: 1;
  padding: 6px 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-width: 0 1px 1px 0;
  &:nth-child(7n) { border-right: none; }
  cursor: pointer;
  background: ${({ $isSelected, $isToday, $accentColor }) =>
    $isToday ? `${$accentColor}10` : $isSelected ? 'rgba(0,0,0,0.03)' : 'transparent'};
  outline: ${({ $isSelected }) => $isSelected ? '2px solid #e5e6ea' : 'none'};
  outline-offset: -2px;
  opacity: ${({ $isOutside }) => $isOutside ? 0.4 : 1};
  transition: background 0.1s;
  overflow: hidden;
  &:hover { background: rgba(0, 0, 0, 0.02); }
  @media (max-width: 768px) {
    aspect-ratio: auto;
    min-height: 44px;
    display: ${({ $isOutside }) => $isOutside ? 'none' : 'flex'};
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    border-width: 0 0 1px 0;
  }
`;

const DayNumber = styled.div<{ $isToday?: boolean; $accentColor: string }>`
  font-size: ${({ $isToday }) => $isToday ? '15px' : '13px'};
  font-weight: ${({ $isToday }) => $isToday ? 700 : 400};
  color: ${({ $isToday, $accentColor }) => $isToday ? $accentColor : 'inherit'};
  margin-bottom: 2px;
  flex-shrink: 0;
`;

const MobileDayLabel = styled.span<{ $isOutside?: boolean }>`
  display: none;
  width: 28px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme, $isOutside }) => $isOutside ? theme.colors.border : theme.colors.textMuted};
  flex-shrink: 0;
  @media (max-width: 768px) { display: block; }
`;

const DayItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  @media (max-width: 768px) { display: none; }
`;

const DayItem = styled.div<{ $accent?: string }>`
  font-size: 14px;
  color: ${({ $accent, theme }) => $accent || theme.colors.textSecondary};
  background: ${({ $accent }) => $accent ? `${$accent}18` : 'transparent'};
  padding: 1px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 2px;
  font-weight: ${({ $accent }) => $accent ? 500 : 400};
  @media (max-width: 768px) { padding: 2px 0; }
`;

const MoreLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 1px 4px;
`;

const MobileEntryCount = styled.span`
  display: none;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: auto;
  @media (max-width: 768px) { display: inline; }
`;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ── Component ── */

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: string | null;
  entriesByDate: Map<string, DecryptedPost[]>;
  accentColor: string;
  eventTopicIds: Set<number>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
  onEntryClick: (entryId: number) => void;
  getTopicName: (entry: DecryptedPost) => string | undefined;
}

export function CalendarGrid({
  currentMonth, selectedDate, entriesByDate, accentColor, eventTopicIds,
  onPrevMonth, onNextMonth, onDayClick, onEntryClick, getTopicName,
}: CalendarGridProps) {
  const today = new Date();
  const days = getCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth());
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <>
      <Header>
        <NavBtn onClick={onPrevMonth}><FontAwesomeIcon icon={faChevronLeft} /></NavBtn>
        <MonthLabel>{monthLabel}</MonthLabel>
        <NavBtn onClick={onNextMonth}><FontAwesomeIcon icon={faChevronRight} /></NavBtn>
      </Header>

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
            const dow = WEEKDAYS[date.getDay()];

            return (
              <DayCell key={i} $isOutside={isOutside} $isSelected={!isOutside && isSelected} $isToday={!isOutside && isToday} $accentColor={accentColor} onClick={() => !isOutside && onDayClick(dateStr)}>
                {!isOutside && (
                  <>
                    <MobileDayLabel>{dow}</MobileDayLabel>
                    <DayNumber $isToday={isToday} $accentColor={accentColor}>{date.getDate()}</DayNumber>
                    {dayEntries.length > 0 && <MobileEntryCount>{dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}</MobileEntryCount>}
                    <DayItems>
                      {dayEntries.slice(0, 3).map(entry => {
                        const topicName = getTopicName(entry);
                        const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
                        const isEvent = taxId !== undefined && eventTopicIds.has(taxId);
                        const preview = stripHtml(entry.content).slice(0, 40) || 'Entry';
                        return (
                          <DayItem key={entry.id} $accent={isEvent ? accentColor : undefined} onClick={e => { e.stopPropagation(); onEntryClick(entry.id); }}>
                            {topicName ? `${topicName}: ` : ''}{preview}
                          </DayItem>
                        );
                      })}
                      {dayEntries.length > 3 && <MoreLabel>+{dayEntries.length - 3} more</MoreLabel>}
                    </DayItems>
                  </>
                )}
              </DayCell>
            );
          })}
        </DaysGrid>
      </GridWrapper>
    </>
  );
}
