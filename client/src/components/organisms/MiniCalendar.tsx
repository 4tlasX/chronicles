import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Icon } from '../../../../design-system/components/core/Icon.jsx';

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /** Set of ISO date strings (YYYY-MM-DD) that have entries */
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
  display: flex;
  gap: 12px;
  padding: 0;
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

const Week = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
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
  margin-bottom: 2px;
  width: 32px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const DayButton = styled.button<{
  $isToday?: boolean;
  $isSelected?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
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

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  // Generate weeks: 52 weeks back + 52 weeks forward = 104 weeks total
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

  return (
    <Wrapper>
      <Header>
        <IconSpan>
          <Icon name="calendar" size={12} strokeWidth={2} />
        </IconSpan>
        MINI CALENDAR
      </Header>
      <ScrollContainer>
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
                  >
                    {date.getDate()}
                  </DayButton>
                );
              })}
            </DaysGrid>
          </Week>
        ))}
      </ScrollContainer>
    </Wrapper>
  );
}
