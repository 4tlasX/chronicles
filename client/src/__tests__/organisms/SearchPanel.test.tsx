import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { SearchPanel } from '@/components/organisms/SearchPanel';

const mockSetSearchKeyword = vi.fn();
const mockSetSearchDateFrom = vi.fn();
const mockSetSearchDateTo = vi.fn();
const mockClearSearch = vi.fn();

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      searchKeyword: '',
      searchDateFrom: '',
      searchDateTo: '',
      setSearchKeyword: mockSetSearchKeyword,
      setSearchDateFrom: mockSetSearchDateFrom,
      setSearchDateTo: mockSetSearchDateTo,
      clearSearch: mockClearSearch,
    }),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('SearchPanel', () => {
  it('renders search label', () => {
    renderWithTheme(<SearchPanel />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithTheme(<SearchPanel />);
    expect(screen.getByPlaceholderText('Search entries...')).toBeInTheDocument();
  });

  it('renders date range inputs', () => {
    renderWithTheme(<SearchPanel />);
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('does not render clear button when no filters active', () => {
    renderWithTheme(<SearchPanel />);
    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });
});
