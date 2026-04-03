import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { RecoveryKeyDisplay } from '@/components/molecules/RecoveryKeyDisplay';
import { renderWithTheme } from '../testUtils';

// Mock navigator.clipboard
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

describe('RecoveryKeyDisplay', () => {
  const recoveryKey = 'abcd1234efgh5678';

  beforeEach(() => {
    mockWriteText.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the warning message', () => {
    renderWithTheme(<RecoveryKeyDisplay recoveryKey={recoveryKey} onConfirm={() => {}} />);
    expect(screen.getByText(/Save this recovery key/)).toBeInTheDocument();
  });

  it('renders the formatted recovery key', () => {
    renderWithTheme(<RecoveryKeyDisplay recoveryKey={recoveryKey} onConfirm={() => {}} />);
    // Key formatted as groups of 4 with dashes
    expect(screen.getByText('abcd-1234-efgh-5678')).toBeInTheDocument();
  });

  it('renders copy and confirm buttons', () => {
    renderWithTheme(<RecoveryKeyDisplay recoveryKey={recoveryKey} onConfirm={() => {}} />);
    expect(screen.getByText('Copy to clipboard')).toBeInTheDocument();
    expect(screen.getByText('I have saved my recovery key')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    renderWithTheme(<RecoveryKeyDisplay recoveryKey={recoveryKey} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('I have saved my recovery key'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('copies key to clipboard and shows "Copied" text', async () => {
    renderWithTheme(<RecoveryKeyDisplay recoveryKey={recoveryKey} onConfirm={() => {}} />);
    fireEvent.click(screen.getByText('Copy to clipboard'));
    expect(mockWriteText).toHaveBeenCalledWith(recoveryKey);
  });
});
