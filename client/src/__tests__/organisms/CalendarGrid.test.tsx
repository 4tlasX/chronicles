import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { CalendarGrid } from '@/components/organisms/CalendarGrid';

vi.mock('@/utils/stripHtml', () => ({
  stripHtml: (html: string) => html.replace(/<[^>]*>/g, ''),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('CalendarGrid', () => {
  const defaultProps = {
    currentMonth: new Date(2024, 5, 1), // June 2024
    selectedDate: null,
    entriesByDate: new Map(),
    accentColor: '#4281a4',
    onPrevMonth: vi.fn(),
    onNextMonth: vi.fn(),
    onDayClick: vi.fn(),
    onEntryClick: vi.fn(),
    getTopicName: vi.fn(),
    eventTopicIds: new Set<number>(),
  };

  it('renders month label', () => {
    renderWithTheme(<CalendarGrid {...defaultProps} />);
    expect(screen.getByText('June 2024')).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    renderWithTheme(<CalendarGrid {...defaultProps} />);
    // Weekday headers may appear multiple times due to mobile + desktop
    const sunLabels = screen.getAllByText('Sun');
    expect(sunLabels.length).toBeGreaterThanOrEqual(1);
    const monLabels = screen.getAllByText('Mon');
    expect(monLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders day numbers for the month', () => {
    renderWithTheme(<CalendarGrid {...defaultProps} />);
    // Day numbers may appear multiple times (day cell + mobile label)
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
    const fifteens = screen.getAllByText('15');
    expect(fifteens.length).toBeGreaterThanOrEqual(1);
    const thirties = screen.getAllByText('30');
    expect(thirties.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onPrevMonth when prev button is clicked', () => {
    const onPrev = vi.fn();
    renderWithTheme(<CalendarGrid {...defaultProps} onPrevMonth={onPrev} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // prev button
    expect(onPrev).toHaveBeenCalled();
  });

  it('calls onNextMonth when next button is clicked', () => {
    const onNext = vi.fn();
    renderWithTheme(<CalendarGrid {...defaultProps} onNextMonth={onNext} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // next button
    expect(onNext).toHaveBeenCalled();
  });

  it('renders entry previews in day cells', () => {
    const entriesByDate = new Map([
      ['2024-06-15', [
        { id: 1, content: '<p>My journal entry</p>', createdAt: new Date(), updatedAt: new Date(), isEncrypted: true, metadata: {} },
      ]],
    ]);
    renderWithTheme(
      <CalendarGrid {...defaultProps} entriesByDate={entriesByDate as never} />
    );
    expect(screen.getByText(/My journal entry/)).toBeInTheDocument();
  });

  it('shows +N more label when more than 3 entries', () => {
    const entries = Array.from({ length: 5 }, (_, i) => ({
      id: i, content: `<p>Entry ${i}</p>`, createdAt: new Date(), updatedAt: new Date(), isEncrypted: true, metadata: {},
    }));
    const entriesByDate = new Map([['2024-06-15', entries]]);
    renderWithTheme(
      <CalendarGrid {...defaultProps} entriesByDate={entriesByDate as never} />
    );
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });
});
