import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { AccountSection } from '@/components/organisms/AccountSection';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('AccountSection', () => {
  it('renders account title', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'user@test.com', username: 'testuser' },
    } as ReturnType<typeof useAuth>);

    renderWithTheme(<AccountSection />);
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('displays user email', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'user@test.com', username: 'testuser' },
    } as ReturnType<typeof useAuth>);

    renderWithTheme(<AccountSection />);
    expect(screen.getByText('user@test.com')).toBeInTheDocument();
  });

  it('displays username when available', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'user@test.com', username: 'testuser' },
    } as ReturnType<typeof useAuth>);

    renderWithTheme(<AccountSection />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('shows Unknown when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
    } as ReturnType<typeof useAuth>);

    renderWithTheme(<AccountSection />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('does not show username row when username is missing', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'user@test.com', username: '' },
    } as ReturnType<typeof useAuth>);

    renderWithTheme(<AccountSection />);
    expect(screen.queryByText('Username:')).not.toBeInTheDocument();
  });
});
