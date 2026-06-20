import { useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from '../../../../design-system/components/core/Icon.jsx';

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  entryDates?: Set<string>;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 0 4px;
  font-family: var(--font-label);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-tertiary);
`;

const IconSpan = styled.span`
  display: flex;
  align-items: center;
`;

/* Clips to its own width; each week inside is exactly this wide, so one shows at a time. */
const ScrollContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: var(--border-subtle) transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-subtle);
    border-radius: 2px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--border-default);
  }
`;

const WeeksContainer = styled.div`
  display: flex;
`;

/* Each week fills the full container width so only one is visible at a time. */
const Week = styled.div`
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: start;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const Day = styled.button<{ $isToday?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 6px 0 10px;
  border: none;
  background: ${({ $isToday }) => $isToday ? 'var(--color-accent)' : 'transparent'};
  border-radius: var(--r-md, 2px);
  cursor: pointer;
  position: relative;

  &:hover {
    background: ${({ $isToday }) => $isToday ? 'var(--color-accent)' : 'var(--bg-hover)'};
  }
`;

const DowLabel = styled.span<{ $isToday?: boolean }>`
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ $isToday }) => $isToday ? 'var(--on-accent, #fff)' : 'var(--text-tertiary)'};
`;

const DayNum = styled.span<{ $isToday?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: ${({ $isToday }) => $isToday ? 'var(--on-accent, #fff)' : 'var(--text-primary)'};
`;

const EntryDot = styled.span<{ $isToday?: boolean }>`
  position: absolute;
  bottom: 3px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ $isToday }) => $isToday ? 'var(--on-accent, #fff)' : 'var(--color-accent)'};
`;

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toISODateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function MiniCalendar({ selectedDate, onSelectDate, entryDates }: MiniCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 52 weeks back + 52 weeks forward, Monday-start weeks.
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    const todayDate = new Date();
    // Days since Monday (Mon=0 … Sun=6)
    const mondayOffset = (todayDate.getDay() + 6) % 7;

    const startOfWeek = new Date(todayDate);
    startOfWeek.setDate(todayDate.getDate() - mondayOffset);

    const startDate = new Date(startOfWeek);
    startDate.setDate(startDate.getDate() - 52 * 7);

    const currentDate = new Date(startDate);
    for (let w = 0; w < 104; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeksArray.push(week);
    }
    return weeksArray;
  }, []);

  // Open on the current week (each week is exactly one container width).
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 52 * scrollContainerRef.current.offsetWidth;
    }
  }, []);

  return (
    <Wrapper>
      <Header>
        <IconSpan>
          <Icon name="calendar" size={12} strokeWidth={2} />
        </IconSpan>
        MINI CALENDAR
      </Header>
      <ScrollContainer ref={scrollContainerRef}>
        <WeeksContainer>
          {weeks.map((weekDays, weekIdx) => (
            <Week key={weekIdx}>
              {weekDays.map((date, i) => {
                const isToday = isSameDay(date, today);
                const hasEntry = entryDates?.has(toISODateString(date)) ?? false;
                return (
                  <Day
                    key={i}
                    $isToday={isToday}
                    onClick={() => onSelectDate(date)}
                    title={date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  >
                    <DowLabel $isToday={isToday}>{DOW[i]}</DowLabel>
                    <DayNum $isToday={isToday}>{date.getDate()}</DayNum>
                    {hasEntry && <EntryDot $isToday={isToday} />}
                  </Day>
                );
              })}
            </Week>
          ))}
        </WeeksContainer>
      </ScrollContainer>
    </Wrapper>
  );
}
