import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { CalendarDayDetail } from '@/components/organisms/CalendarDayDetail';
import { faBook } from '@fortawesome/free-solid-svg-icons';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('CalendarDayDetail', () => {
  const defaultProps = {
    dateStr: '2024-06-15',
    entries: [],
    accentColor: '#4281a4',
    onClose: vi.fn(),
    onEntryClick: vi.fn(),
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
        entries={[{ id: 1, preview: 'Test entry' }]}
      />
    );
    expect(screen.getByText('1 entry')).toBeInTheDocument();
  });

  it('renders entry previews', () => {
    renderWithTheme(
      <CalendarDayDetail
        {...defaultProps}
        entries={[
          { id: 1, preview: 'First entry' },
          { id: 2, preview: 'Second entry' },
        ]}
      />
    );
    expect(screen.getByText('First entry')).toBeInTheDocument();
    expect(screen.getByText('Second entry')).toBeInTheDocument();
  });

  it('calls onEntryClick when entry is clicked', () => {
    const onEntryClick = vi.fn();
    renderWithTheme(
      <CalendarDayDetail
        {...defaultProps}
        entries={[{ id: 42, preview: 'Clickable' }]}
        onEntryClick={onEntryClick}
      />
    );
    fireEvent.click(screen.getByText('Clickable'));
    expect(onEntryClick).toHaveBeenCalledWith(42);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    renderWithTheme(<CalendarDayDetail {...defaultProps} onClose={onClose} />);
    // Close button has an icon
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Close button is the first button
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty state when no entries', () => {
    renderWithTheme(<CalendarDayDetail {...defaultProps} entries={[]} />);
    expect(screen.getByText('No entries for this day.')).toBeInTheDocument();
  });

  it('displays topic name and icon when available', () => {
    renderWithTheme(
      <CalendarDayDetail
        {...defaultProps}
        entries={[{ id: 1, preview: 'Entry', topicName: 'Work', topicIcon: faBook }]}
      />
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
  });
});
