import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MedicationScheduleView } from '@/views/MedicationScheduleView';
import { renderWithTheme } from '../testUtils';
import { useInitializeData } from '@/hooks/useInitializeData';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => mockNavigate),
}));

vi.mock('@/hooks/useInitializeData', () => ({
  useInitializeData: vi.fn(() => ({
    isReady: true,
    isLoading: false,
    needsUnlock: false,
    handleUnlock: vi.fn(),
  })),
}));

vi.mock('@/components/templates/ContentTemplate', () => ({
  ContentTemplate: ({ children }: any) => <div data-testid="content-template">{children}</div>,
}));

vi.mock('@/components/atoms/EmptyState', () => ({
  EmptyState: ({ message }: any) => <div data-testid="empty-state">{message}</div>,
}));

vi.mock('@/components/atoms/Spinner', () => ({
  Spinner: () => <span data-testid="spinner">Loading...</span>,
}));

vi.mock('@/components/molecules/ViewHeader', () => ({
  ViewHeader: ({ title, onBack }: any) => (
    <div data-testid="view-header">
      <h2>{title}</h2>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

vi.mock('@/components/organisms/MedicationSchedule', () => ({
  MedicationSchedule: ({ isReady }: any) => (
    <div data-testid="medication-schedule">Schedule (ready: {String(isReady)})</div>
  ),
}));

vi.mock('@/components/organisms/UnlockDialog', () => ({
  UnlockDialog: () => <div data-testid="unlock-dialog" />,
}));

describe('MedicationScheduleView', () => {
  it('renders without crashing', () => {
    renderWithTheme(<MedicationScheduleView />);
    expect(screen.getByTestId('content-template')).toBeInTheDocument();
  });

  it('displays the view header with title', () => {
    renderWithTheme(<MedicationScheduleView />);
    expect(screen.getByText('Medication Schedule')).toBeInTheDocument();
  });

  it('renders the medication schedule component', () => {
    renderWithTheme(<MedicationScheduleView />);
    expect(screen.getByTestId('medication-schedule')).toBeInTheDocument();
  });

  it('passes isReady to MedicationSchedule', () => {
    renderWithTheme(<MedicationScheduleView />);
    expect(screen.getByTestId('medication-schedule')).toHaveTextContent('ready: true');
  });

  it('navigates back when back button is clicked', () => {
    renderWithTheme(<MedicationScheduleView />);
    screen.getByText('Back').click();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

describe('MedicationScheduleView (needs unlock)', () => {
  beforeEach(() => {
    vi.mocked(useInitializeData).mockReturnValue({
      isReady: false,
      isLoading: false,
      needsUnlock: true,
      handleUnlock: vi.fn(),
    });
  });

  it('shows unlock dialog', () => {
    renderWithTheme(<MedicationScheduleView />);
    expect(screen.getByTestId('unlock-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toHaveTextContent('Unlock your journal to view schedule');
  });
});

describe('MedicationScheduleView (loading)', () => {
  beforeEach(() => {
    vi.mocked(useInitializeData).mockReturnValue({
      isReady: false,
      isLoading: true,
      needsUnlock: false,
      handleUnlock: vi.fn(),
    });
  });

  it('shows loading spinner', () => {
    renderWithTheme(<MedicationScheduleView />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
