import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { lightTheme } from '@shared/theme/tokens';
import { Header } from '@/components/organisms/Header';

vi.mock('@/stores/uiStore', () => {
  const store = {
    headerColor: '#2d2c2a',
    getState: () => ({
      setSelectedEntryId: vi.fn(),
      setShowMobileEditor: vi.fn(),
    }),
  };
  return {
    useUIStore: Object.assign(
      (selector: (s: Record<string, unknown>) => unknown) => selector(store),
      { getState: store.getState }
    ),
  };
});

vi.mock('@/stores/entriesStore', () => ({
  useEntriesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      featureFlags: {
        goalsEnabled: false,
        milestonesEnabled: false,
        medicationEnabled: false,
        foodEnabled: false,
        exerciseEnabled: false,
        entertainmentEnabled: false,
        inspirationEnabled: false,
      },
    }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ logout: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock('@/contexts/EncryptionContext', () => ({
  useEncryption: () => ({ lock: vi.fn() }),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
}

describe('Header', () => {
  it('renders Chronicles logo', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Chronicles')).toBeInTheDocument();
  });

  it('renders New Entry button', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('New Entry')).toBeInTheDocument();
  });

  it('renders Journal nav link', () => {
    renderWithProviders(<Header />);
    const links = screen.getAllByText('Journal');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Calendar nav link', () => {
    renderWithProviders(<Header />);
    const links = screen.getAllByText('Calendar');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Topics nav link', () => {
    renderWithProviders(<Header />);
    const links = screen.getAllByText('Topics');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render Goals dropdown when goalsEnabled is false', () => {
    renderWithProviders(<Header />);
    expect(screen.queryByText('Goals')).not.toBeInTheDocument();
  });

  it('does not render Health dropdown when medicationEnabled is false', () => {
    renderWithProviders(<Header />);
    expect(screen.queryByText('Health')).not.toBeInTheDocument();
  });
});
