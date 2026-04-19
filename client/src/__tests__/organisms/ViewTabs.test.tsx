import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { ViewTabs } from '@/components/organisms/ViewTabs';

const mockSetViewMode = vi.fn();

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      viewMode: 'all',
      setViewMode: mockSetViewMode,
    }),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('ViewTabs', () => {
  beforeEach(() => {
    mockSetViewMode.mockClear();
  });

  it('renders all tab labels', () => {
    renderWithTheme(<ViewTabs />);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Bookmarks')).toBeInTheDocument();
  });

  it('calls setViewMode when tab is clicked', () => {
    renderWithTheme(<ViewTabs />);
    fireEvent.click(screen.getByText('Tasks'));
    expect(mockSetViewMode).toHaveBeenCalledWith('tasks');
  });

  it('calls setViewMode with date when Date tab is clicked', () => {
    renderWithTheme(<ViewTabs />);
    fireEvent.click(screen.getByText('Date'));
    expect(mockSetViewMode).toHaveBeenCalledWith('date');
  });

  it('calls onDateTabClick when Date tab is clicked', () => {
    const onDateTabClick = vi.fn();
    renderWithTheme(<ViewTabs onDateTabClick={onDateTabClick} />);
    fireEvent.click(screen.getByText('Date'));
    expect(onDateTabClick).toHaveBeenCalled();
  });
});
