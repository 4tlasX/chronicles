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
  margin-bottom: 6px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
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

  // Get the week containing today (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    const firstDayOfWeek = new Date(todayDate);
    firstDayOfWeek.setDate(todayDate.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDayOfWeek);
      day.setDate(firstDayOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, []);

  return (
    <Wrapper>
      <Header>
        <IconSpan>
          <Icon name="calendar" size={12} strokeWidth={2} />
        </IconSpan>
        MINI CALENDAR
      </Header>
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
    </Wrapper>
  );
}
