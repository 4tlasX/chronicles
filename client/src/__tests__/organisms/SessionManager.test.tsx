import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { SessionManager } from '@/components/organisms/SessionManager';

const mockSessions = [
  { id: 1, deviceInfo: 'Chrome on Mac', ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0', lastActiveAt: '2024-01-01T00:00:00Z', createdAt: '2024-01-01T00:00:00Z', isCurrent: true },
  { id: 2, deviceInfo: 'Firefox on Windows', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', lastActiveAt: '2024-01-02T00:00:00Z', createdAt: '2024-01-02T00:00:00Z', isCurrent: false },
];

vi.mock('@/services/api', () => ({
  sessions: {
    getAll: vi.fn().mockResolvedValue([
      { id: 1, deviceInfo: 'Chrome on Mac', ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0', lastActiveAt: '2024-01-01T00:00:00Z', createdAt: '2024-01-01T00:00:00Z', isCurrent: true },
      { id: 2, deviceInfo: 'Firefox on Windows', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', lastActiveAt: '2024-01-02T00:00:00Z', createdAt: '2024-01-02T00:00:00Z', isCurrent: false },
    ]),
    revoke: vi.fn().mockResolvedValue(undefined),
    revokeAll: vi.fn().mockResolvedValue(undefined),
  },
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('SessionManager', () => {
  it('renders active sessions title', () => {
    renderWithTheme(<SessionManager />);
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
  });

  it('displays sessions after loading', async () => {
    renderWithTheme(<SessionManager />);
    await waitFor(() => {
      expect(screen.getByText('Chrome on Mac')).toBeInTheDocument();
      expect(screen.getByText('Firefox on Windows')).toBeInTheDocument();
    });
  });

  it('marks current session', async () => {
    renderWithTheme(<SessionManager />);
    await waitFor(() => {
      expect(screen.getByText('(Current)')).toBeInTheDocument();
    });
  });

  it('shows revoke button for non-current sessions', async () => {
    renderWithTheme(<SessionManager />);
    await waitFor(() => {
      const revokeButtons = screen.getAllByRole('button', { name: 'Revoke' });
      expect(revokeButtons).toHaveLength(1); // Only non-current session
    });
  });

  it('shows revoke all button when multiple sessions exist', async () => {
    renderWithTheme(<SessionManager />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Revoke all other sessions' })).toBeInTheDocument();
    });
  });
});
