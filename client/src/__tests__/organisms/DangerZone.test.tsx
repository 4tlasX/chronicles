import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import { lightTheme } from '@shared/theme/tokens';
import { DangerZone } from '@/components/organisms/DangerZone';

const mockLogout = vi.fn().mockResolvedValue(undefined);
const mockLock = vi.fn();
const mockClearAll = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ logout: mockLogout }),
}));

vi.mock('@/contexts/EncryptionContext', () => ({
  useEncryption: () => ({ lock: mockLock }),
}));

vi.mock('@/stores/entriesStore', () => ({
  useEntriesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ clearAll: mockClearAll }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  );
}

describe('DangerZone', () => {
  it('renders danger zone title', () => {
    renderWithProviders(<DangerZone />);
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  it('renders description about signing out', () => {
    renderWithProviders(<DangerZone />);
    expect(screen.getByText(/Signing out will clear your encryption key/)).toBeInTheDocument();
  });

  it('renders sign out button', () => {
    renderWithProviders(<DangerZone />);
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
  });

  it('calls lock, clearAll, logout, and navigate on sign out', async () => {
    renderWithProviders(<DangerZone />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));

    await waitFor(() => {
      expect(mockLock).toHaveBeenCalled();
      expect(mockClearAll).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
