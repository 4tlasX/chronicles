import { useState, useMemo, useRef, useEffect } from 'react';
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

/* Each week fills the full width of the container, so only one shows at a time. */
const Week = styled.div`
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const WeekdayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-family: var(--font-label);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-tertiary);
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayButton = styled.button<{
  $isToday?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  border: none;
  border-radius: var(--r-md, 2px);
  cursor: pointer;
  background: ${({ $isToday }) => $isToday ? 'var(--color-accent)' : 'transparent'};
  color: ${({ $isToday }) => $isToday ? 'white' : 'var(--text-primary)'};

  &:hover {
    background: ${({ $isToday }) => $isToday ? 'var(--color-accent)' : 'var(--bg-hover)'};
  }
`;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function MiniCalendar({ selectedDate, onSelectDate, entryDates }: MiniCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate 52 weeks before and 52 weeks after today
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();

    // Start from beginning of today's week
    const startOfWeek = new Date(todayDate);
    startOfWeek.setDate(todayDate.getDate() - dayOfWeek);

    // Go back 52 weeks
    const startDate = new Date(startOfWeek);
    startDate.setDate(startDate.getDate() - 52 * 7);

    let currentDate = new Date(startDate);

    // Generate 104 weeks
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

  // Scroll to today's week on mount (each week is exactly one container-width)
  useEffect(() => {
    if (scrollContainerRef.current) {
      const todayWeekIndex = 52;
      scrollContainerRef.current.scrollLeft = todayWeekIndex * scrollContainerRef.current.offsetWidth;
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
              <WeekdayRow>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <WeekdayLabel key={i}>{day}</WeekdayLabel>
                ))}
              </WeekdayRow>
              <DaysGrid>
                {weekDays.map((date, i) => {
                  const isToday = isSameDay(date, today);
                  return (
                    <DayButton
                      key={i}
                      $isToday={isToday}
                      onClick={() => onSelectDate(date)}
                      title={date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    >
                      {date.getDate()}
                    </DayButton>
                  );
                })}
              </DaysGrid>
            </Week>
          ))}
        </WeeksContainer>
      </ScrollContainer>
    </Wrapper>
  );
}
