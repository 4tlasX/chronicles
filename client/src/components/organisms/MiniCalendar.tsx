import { useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';

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

/* The viewport. Clips horizontally; one week (= 100% width) shows at a time. */
const ScrollContainer = styled.div`
  display: flex;
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

/* Each week is a flex item that takes the full viewport width and never shrinks,
   so exactly one is visible; the rest sit off-screen and are reached by scrolling. */
const Week = styled.div`
  flex: 0 0 100%;
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
  background: transparent;
  border: none;
  border-radius: var(--r-md, 2px);
  cursor: pointer;
  position: relative;

  &:hover {
    background: ${({ $isToday }) => $isToday ? 'transparent' : 'var(--bg-hover)'};
  }
`;

const DowLabel = styled.span<{ $isToday?: boolean }>`
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ $isToday }) => $isToday ? 'var(--color-accent)' : 'var(--text-tertiary)'};
`;

const DayNum = styled.span<{ $isToday?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: ${({ $isToday }) => $isToday ? 'var(--color-accent)' : 'var(--text-primary)'};
`;

const EntryDot = styled.span`
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-accent);
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

// Index of the current week within the generated range.
const CURRENT_WEEK_INDEX = 52;

export function MiniCalendar({ selectedDate, onSelectDate, entryDates }: MiniCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 52 weeks back + 52 weeks forward, Monday-start weeks.
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    const todayDate = new Date();
    const mondayOffset = (todayDate.getDay() + 6) % 7; // days since Monday

    const startOfWeek = new Date(todayDate);
    startOfWeek.setDate(todayDate.getDate() - mondayOffset);

    const startDate = new Date(startOfWeek);
    startDate.setDate(startDate.getDate() - CURRENT_WEEK_INDEX * 7);

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

  // Jump to the current week after layout. Each week is exactly the viewport width.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const jump = () => { el.scrollLeft = CURRENT_WEEK_INDEX * el.clientWidth; };
    // Run after paint so clientWidth is final.
    const raf = requestAnimationFrame(jump);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Wrapper>
      <ScrollContainer ref={scrollRef}>
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
                  {hasEntry && <EntryDot />}
                </Day>
              );
            })}
          </Week>
        ))}
      </ScrollContainer>
    </Wrapper>
  );
}
