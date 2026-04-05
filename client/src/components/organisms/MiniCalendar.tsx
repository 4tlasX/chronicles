import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '../../stores/uiStore.js';

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
  padding: 4px 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textMuted};
  background: transparent;
  border: none;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const CalendarContainer = styled.div`
  padding: 8px 12px 12px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const MonthLabel = styled.span`
  font-size: 11px;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const WeekdayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
`;

const WeekdayLabel = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  line-height: 20px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const DayButton = styled.button<{
  $isToday?: boolean;
  $isSelected?: boolean;
  $isOutside?: boolean;
  $hasEntry?: boolean;
  $accentColor?: string;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0 auto;
  font-size: ${({ $isToday }) => $isToday ? '14px' : '12px'};
  font-weight: ${({ $isToday, theme }) => $isToday ? theme.fontWeight.bold : theme.fontWeight.normal};
  color: ${({ $isToday, $isOutside, $accentColor, theme }) => $isToday ? ($accentColor || theme.colors.text) : $isOutside ? theme.colors.border : theme.colors.text};
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  line-height: 1;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  ${({ $isOutside }) => $isOutside && 'visibility: hidden;'}
`;

const EntryDot = styled.span`
  position: absolute;
  bottom: 1px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
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
  const headerColor = useUIStore(s => s.headerColor) || '#4E6E7E';

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
              const isSelected = isSameDay(date, selectedDate);
              const hasEntry = entryDates?.has(toISODateString(date)) ?? false;
              return (
                <DayButton
                  key={i}
                  $isToday={isToday}
                  $isSelected={isSelected}
                  $isOutside={isOutside}
                  $hasEntry={hasEntry}
                  $accentColor={headerColor}
                  onClick={() => onSelectDate(date)}
                >
                  {date.getDate()}
                  {hasEntry && !isSelected && <EntryDot />}
                </DayButton>
              );
            })}
          </DaysGrid>
      </CalendarContainer>
      )}
    </Wrapper>
  );
}
