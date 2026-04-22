import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /** Set of ISO date strings (YYYY-MM-DD) that have entries */
  entryDates?: Set<string>;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ToggleBar = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  font-family: var(--serif, ${({ theme }) => theme.fontFamily.serif});
  font-style: italic;
  font-size: 15px;
  color: var(--ink-3, ${({ theme }) => theme.colors.textMuted});
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    color: var(--ink-2, ${({ theme }) => theme.colors.textSecondary});
  }
`;

const CalendarContainer = styled.div`
  padding: 20px 6px 6px;
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const MonthLabel = styled.span`
  font-family: var(--serif, ${({ theme }) => theme.fontFamily.serif});
  font-style: italic;
  font-size: 18px;
  color: var(--ink, ${({ theme }) => theme.colors.text});
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--r-sm, ${({ theme }) => theme.borderRadius.sm}px);
  cursor: pointer;
  color: var(--ink-3, ${({ theme }) => theme.colors.textMuted});

  &:hover {
    background: var(--paper-hover, ${({ theme }) => theme.colors.surfaceHover});
  }
`;

const WeekdayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const WeekdayLabel = styled.span`
  font-family: var(--mono, ${({ theme }) => theme.fontFamily.mono});
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
  text-align: center;
  padding: 0 0 4px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const DayButton = styled.button<{
  $isToday?: boolean;
  $isOutside?: boolean;
  $hasEntry?: boolean;
}>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: ${({ $isToday }) => $isToday ? 700 : 400};
  color: ${({ $isToday, $isOutside }) =>
    $isToday ? 'var(--ink, #2b2824)' :
    $isOutside ? 'var(--ink-4)' :
    'var(--ink-2)'};
  background: transparent;
  border: none;
  border-radius: var(--r-sm, 2px);
  cursor: pointer;
  position: relative;

  ${({ $isToday }) => $isToday && `
    &::before {
      content: '';
      position: absolute;
      width: 26px;
      height: 26px;
      background: var(--paper-surface);
      border-radius: 2px;
      z-index: 0;
    }
    span { position: relative; z-index: 1; }
  `}

  ${({ $isToday }) => !$isToday && `
    &:hover {
      background: var(--paper-hover);
    }
  `}

  ${({ $hasEntry }) => $hasEntry && `
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      width: 4px;
      height: 4px;
      background: var(--accent);
      border-radius: 1px;
    }
  `}

  ${({ $isOutside }) => $isOutside && 'color: var(--ink-4); opacity: 0.5;'}
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

export function MiniCalendar({ selectedDate, onSelectDate, entryDates, expanded = false }: MiniCalendarProps & { expanded?: boolean }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [collapsed, setCollapsed] = useState(!expanded);
  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: { date: Date; isOutside: boolean }[] = [];

    // Days from previous month
    const prevMonth = new Date(year, month, 0);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      result.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isOutside: true,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: new Date(year, month, d), isOutside: false });
    }

    // Fill remaining row
    const remaining = 7 - (result.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        result.push({ date: new Date(year, month + 1, d), isOutside: true });
      }
    }

    return result;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  function goToPrevMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  return (
    <Wrapper>
      {collapsed ? (
        <ToggleBar onClick={() => setCollapsed(false)}>
          <FontAwesomeIcon icon={faChevronDown} size="xs" />
          <span>{monthLabel}</span>
        </ToggleBar>
      ) : (
      <CalendarContainer>
          <Header>
            <NavButton onClick={goToPrevMonth}>
              <FontAwesomeIcon icon={faChevronLeft} size="xs" />
            </NavButton>
            <MonthLabel onClick={() => setCollapsed(true)} style={{ cursor: 'pointer' }}>{monthLabel}</MonthLabel>
            <NavButton onClick={goToNextMonth}>
              <FontAwesomeIcon icon={faChevronRight} size="xs" />
            </NavButton>
          </Header>
          <WeekdayRow>
            {WEEKDAYS.map((day, i) => (
              <WeekdayLabel key={i}>{day}</WeekdayLabel>
            ))}
          </WeekdayRow>
          <DaysGrid>
            {days.map(({ date, isOutside }, i) => {
              const isToday = isSameDay(date, today);
              const hasEntry = entryDates?.has(toISODateString(date)) ?? false;
              return (
                <DayButton
                  key={i}
                  $isToday={isToday}
                  $isOutside={isOutside}
                  $hasEntry={hasEntry}
                  onClick={() => onSelectDate(date)}
                >
                  <span>{date.getDate()}</span>
                </DayButton>
              );
            })}
          </DaysGrid>
      </CalendarContainer>
      )}
    </Wrapper>
  );
}
