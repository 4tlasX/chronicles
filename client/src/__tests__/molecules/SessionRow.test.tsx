import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { SessionRow } from '@/components/molecules/SessionRow';
import { renderWithTheme } from '../testUtils';

describe('SessionRow', () => {
  const baseProps = {
    deviceInfo: 'Chrome on macOS',
    ipAddress: '192.168.1.1',
    lastActiveAt: '2024-06-15T12:00:00Z',
    isCurrent: false,
  };

  it('renders device info', () => {
    renderWithTheme(<SessionRow {...baseProps} />);
    expect(screen.getByText('Chrome on macOS')).toBeInTheDocument();
  });

  it('renders IP address', () => {
    renderWithTheme(<SessionRow {...baseProps} />);
    expect(screen.getByText(/192\.168\.1\.1/)).toBeInTheDocument();
  });

  it('shows "Unknown device" when deviceInfo is null', () => {
    renderWithTheme(<SessionRow {...baseProps} deviceInfo={null} />);
    expect(screen.getByText('Unknown device')).toBeInTheDocument();
  });

  it('shows "Unknown IP" when ipAddress is null', () => {
    renderWithTheme(<SessionRow {...baseProps} ipAddress={null} />);
    expect(screen.getByText(/Unknown IP/)).toBeInTheDocument();
  });

  it('shows (Current) badge for current session', () => {
    renderWithTheme(<SessionRow {...baseProps} isCurrent />);
    expect(screen.getByText('(Current)')).toBeInTheDocument();
  });

  it('does not show (Current) badge for non-current session', () => {
    renderWithTheme(<SessionRow {...baseProps} isCurrent={false} />);
    expect(screen.queryByText('(Current)')).not.toBeInTheDocument();
  });

  it('shows Revoke button for non-current session with onRevoke', () => {
    const onRevoke = vi.fn();
    renderWithTheme(<SessionRow {...baseProps} onRevoke={onRevoke} />);
    const revokeBtn = screen.getByText('Revoke');
    expect(revokeBtn).toBeInTheDocument();
    fireEvent.click(revokeBtn);
    expect(onRevoke).toHaveBeenCalledOnce();
  });

  it('does not show Revoke button for current session', () => {
    renderWithTheme(<SessionRow {...baseProps} isCurrent onRevoke={() => {}} />);
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
  });

  it('does not show Revoke button when onRevoke is not provided', () => {
    renderWithTheme(<SessionRow {...baseProps} />);
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
  });
});
