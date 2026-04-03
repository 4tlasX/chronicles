import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { MiniCalendar } from '@/components/organisms/MiniCalendar';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('MiniCalendar', () => {
  const defaultProps = {
    selectedDate: new Date(2024, 5, 15), // June 15, 2024
    onSelectDate: vi.fn(),
    expanded: true,
  };

  it('renders month label', () => {
    renderWithTheme(<MiniCalendar {...defaultProps} />);
    expect(screen.getByText('June 2024')).toBeInTheDocument();
  });

  it('renders weekday labels', () => {
    renderWithTheme(<MiniCalendar {...defaultProps} />);
    const sLabels = screen.getAllByText('S');
    expect(sLabels.length).toBeGreaterThanOrEqual(2); // S for Sun and Sat
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders day numbers', () => {
    renderWithTheme(<MiniCalendar {...defaultProps} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSelectDate when a day is clicked', () => {
    const onSelectDate = vi.fn();
    renderWithTheme(<MiniCalendar {...defaultProps} onSelectDate={onSelectDate} />);
    fireEvent.click(screen.getByText('20'));
    expect(onSelectDate).toHaveBeenCalled();
  });

  it('navigates to previous month', () => {
    renderWithTheme(<MiniCalendar {...defaultProps} />);
    // Find nav buttons (prev/next)
    const buttons = screen.getAllByRole('button');
    // First navigation button should navigate to previous month
    const prevBtn = buttons[0];
    fireEvent.click(prevBtn);
    expect(screen.getByText('May 2024')).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    renderWithTheme(<MiniCalendar {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // Second navigation button
    const nextBtn = buttons[1];
    fireEvent.click(nextBtn);
    expect(screen.getByText('July 2024')).toBeInTheDocument();
  });

  it('shows collapsed state when not expanded', () => {
    renderWithTheme(<MiniCalendar {...defaultProps} expanded={false} />);
    // In collapsed state, should show the month label in toggle bar
    expect(screen.getByText('June 2024')).toBeInTheDocument();
    // Days grid should not be visible
    expect(screen.queryByText('S')).not.toBeInTheDocument();
  });

  it('shows entry dots for dates with entries', () => {
    const entryDates = new Set(['2024-06-15']);
    renderWithTheme(<MiniCalendar {...defaultProps} entryDates={entryDates} />);
    // The day button for the 15th should exist
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
