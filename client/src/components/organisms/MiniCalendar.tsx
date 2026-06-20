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
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8px 0;
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

const WeekColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-family: var(--font-label);
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-tertiary);
  width: 36px;
`;

const DayButton = styled.button<{
  $isToday?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  border: none;
  border-radius: var(--r-md, 2px);
  cursor: pointer;
  background: ${({ $isToday }) => $isToday ? 'var(--color-accent)' : 'transparent'};
  color: ${({ $isToday }) => $isToday ? 'white' : 'var(--text-primary)'};
  flex-shrink: 0;

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

  // Generate weeks covering a 6-month range (3 months before and after today)
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 3);
    startDate.setDate(1);

    // Align to start of week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 3);
    endDate.setDate(0); // Last day of month

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeksArray.push(week);
    }

    return weeksArray;
  }, [today]);

  return (
    <Wrapper>
      <Header>
        <IconSpan>
          <Icon name="calendar" size={12} strokeWidth={2} />
        </IconSpan>
        MINI CALENDAR
      </Header>
      <ScrollContainer>
        {weeks.map((week, weekIdx) => (
          <WeekColumn key={weekIdx}>
            {/* Day of week header */}
            <WeekdayLabel>{['S', 'M', 'T', 'W', 'T', 'F', 'S'][week[0].getDay()]}</WeekdayLabel>
            {/* Days in week */}
            {week.map((date, dayIdx) => {
              const isToday = isSameDay(date, today);
              return (
                <DayButton
                  key={`${weekIdx}-${dayIdx}`}
                  $isToday={isToday}
                  onClick={() => onSelectDate(date)}
                  title={date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                >
                  {date.getDate()}
                </DayButton>
              );
            })}
          </WeekColumn>
        ))}
      </ScrollContainer>
    </Wrapper>
  );
}
