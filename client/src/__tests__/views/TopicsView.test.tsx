import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { TopicsView } from '@/views/TopicsView';
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

vi.mock('@/stores/entriesStore', () => ({
  useEntriesStore: vi.fn((selector: (s: any) => any) =>
    selector({
      allTopics: [
        { id: 1, name: 'Journal', icon: 'book', color: null },
        { id: 2, name: 'Goal', icon: 'bullseye', color: null },
      ],
      topics: [
        { id: 1, name: 'Journal', icon: 'book', color: null },
        { id: 2, name: 'Goal', icon: 'bullseye', color: null },
      ],
      decryptedEntries: [],
      setTopics: vi.fn(),
    })
  ),
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: vi.fn((selector: (s: any) => any) =>
    selector({ headerColor: '#4A5568' })
  ),
}));

vi.mock('@/services/api', () => ({
  topics: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), reorder: vi.fn() },
}));

vi.mock('@/components/templates/TwoPanelTemplate', () => ({
  TwoPanelTemplate: ({ children }: any) => <div data-testid="two-panel-template">{children}</div>,
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

vi.mock('@/components/organisms/TopicSidebarPanel', () => ({
  TopicSidebarPanel: () => <div data-testid="topic-sidebar-panel">Topics Sidebar</div>,
}));

vi.mock('@/components/organisms/TopicEntryList', () => ({
  TopicEntryList: ({ title }: any) => <div data-testid="topic-entry-list">{title}</div>,
}));

vi.mock('@/components/organisms/UnlockDialog', () => ({
  UnlockDialog: () => <div data-testid="unlock-dialog" />,
}));

describe('TopicsView', () => {
  it('renders without crashing', () => {
    renderWithTheme(<TopicsView />);
    expect(screen.getByTestId('two-panel-template')).toBeInTheDocument();
  });

  it('renders the topic sidebar panel', () => {
    renderWithTheme(<TopicsView />);
    expect(screen.getByTestId('topic-sidebar-panel')).toBeInTheDocument();
  });

  it('renders the topic entry list with default title', () => {
    renderWithTheme(<TopicsView />);
    expect(screen.getByTestId('topic-entry-list')).toHaveTextContent('All Entries');
  });
});

describe('TopicsView (needs unlock)', () => {
  beforeEach(() => {
    vi.mocked(useInitializeData).mockReturnValue({
      isReady: false,
      isLoading: false,
      needsUnlock: true,
      handleUnlock: vi.fn(),
    });
  });

  it('shows unlock dialog', () => {
    renderWithTheme(<TopicsView />);
    expect(screen.getByTestId('unlock-dialog')).toBeInTheDocument();
  });
});

describe('TopicsView (loading)', () => {
  beforeEach(() => {
    vi.mocked(useInitializeData).mockReturnValue({
      isReady: false,
      isLoading: true,
      needsUnlock: false,
      handleUnlock: vi.fn(),
    });
  });

  it('shows loading spinner', () => {
    renderWithTheme(<TopicsView />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
