import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { CalendarDayDetail } from '@/components/organisms/CalendarDayDetail';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const makeEntry = (id: number, text: string) => ({
  id,
  content: `<p>${text}</p>`,
  metadata: {},
  isEncrypted: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('CalendarDayDetail', () => {
  const defaultProps = {
    dateStr: '2024-06-15',
    entries: [] as ReturnType<typeof makeEntry>[],
    allTopics: [],
    eventTopicIds: new Set<number>(),
    accentColor: '#4281a4',
    onClose: vi.fn(),
  };

  it('renders the date label', () => {
    renderWithTheme(<CalendarDayDetail {...defaultProps} />);
    expect(screen.getByText(/June 15, 2024/)).toBeInTheDocument();
  });

  it('renders entry count for zero entries', () => {
    renderWithTheme(<CalendarDayDetail {...defaultProps} />);
    expect(screen.getByText('0 entries')).toBeInTheDocument();
  });

  it('renders entry count singular for one entry', () => {
    renderWithTheme(
      <CalendarDayDetail
        {...defaultProps}
        entries={[makeEntry(1, 'Test entry')]}
      />
    );
    expect(screen.getByText(/1 Entry/i)).toBeInTheDocument();
  });

  it('renders multiple entries without crashing', () => {
    renderWithTheme(
      <CalendarDayDetail
        {...defaultProps}
        entries={[makeEntry(1, 'First entry'), makeEntry(2, 'Second entry')]}
      />
    );
    expect(document.body).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithTheme(<CalendarDayDetail {...defaultProps} onClose={onClose} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty state when no entries', () => {
    renderWithTheme(<CalendarDayDetail {...defaultProps} entries={[]} />);
    expect(screen.getByText('No entries for this day.')).toBeInTheDocument();
  });
});
