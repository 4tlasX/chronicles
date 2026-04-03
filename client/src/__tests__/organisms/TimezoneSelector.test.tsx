import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { TimezoneSelector } from '@/components/organisms/TimezoneSelector';

vi.mock('@/services/api', () => ({
  settings: {
    getAll: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue(undefined),
  },
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('TimezoneSelector', () => {
  it('renders preferences title', () => {
    renderWithTheme(<TimezoneSelector />);
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('renders timezone label', () => {
    renderWithTheme(<TimezoneSelector />);
    expect(screen.getByText('Timezone')).toBeInTheDocument();
  });

  it('renders timezone select with default option', async () => {
    renderWithTheme(<TimezoneSelector />);
    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  it('includes timezone options', () => {
    renderWithTheme(<TimezoneSelector />);
    expect(screen.getByText('America/New_York')).toBeInTheDocument();
    expect(screen.getByText('Europe/London')).toBeInTheDocument();
    expect(screen.getByText('Asia/Tokyo')).toBeInTheDocument();
  });
});
