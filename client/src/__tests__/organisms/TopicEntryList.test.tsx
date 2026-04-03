import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { TopicEntryList } from '@/components/organisms/TopicEntryList';

vi.mock('@/contexts/EncryptionContext', () => ({
  useEncryption: () => ({
    encryptPost: vi.fn(),
  }),
}));

vi.mock('@/stores/entriesStore', () => ({
  useEntriesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      updateDecryptedEntry: vi.fn(),
      removeEntry: vi.fn(),
      addDecryptedEntry: vi.fn(),
    }),
}));

vi.mock('@/services/api', () => ({
  entries: {
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue({ id: 1, createdAt: new Date().toISOString() }),
  },
}));

vi.mock('@/utils/topicIcons', () => ({
  getTopicIcon: () => ({ prefix: 'fas', iconName: 'book' }),
}));

vi.mock('@/utils/stripHtml', () => ({
  stripHtml: (html: string) => html.replace(/<[^>]*>/g, ''),
}));

vi.mock('@/components/organisms/Editor', () => ({
  Editor: () => <div data-testid="editor">Editor</div>,
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const mockTopic = { id: 1, name: 'Work', icon: 'briefcase', color: '#3B82F6' };

describe('TopicEntryList', () => {
  const defaultProps = {
    title: 'Work Entries',
    entries: [],
    allTopics: [mockTopic],
    headerColor: '#4281a4',
    onMobileBack: vi.fn(),
    onBackToJournal: vi.fn(),
  };

  it('renders title', () => {
    renderWithTheme(<TopicEntryList {...defaultProps} />);
    expect(screen.getByText('Work Entries')).toBeInTheDocument();
  });

  it('renders back to journal link', () => {
    renderWithTheme(<TopicEntryList {...defaultProps} />);
    expect(screen.getByText('Back to Journal')).toBeInTheDocument();
  });

  it('renders mobile back button', () => {
    renderWithTheme(<TopicEntryList {...defaultProps} />);
    expect(screen.getByText('Back to Topics')).toBeInTheDocument();
  });

  it('shows empty state when no entries', () => {
    renderWithTheme(<TopicEntryList {...defaultProps} />);
    expect(screen.getByText('No entries found.')).toBeInTheDocument();
  });

  it('renders entries when provided', () => {
    const entries = [
      {
        id: 1,
        content: '<p>Test content</p>',
        isEncrypted: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        metadata: { _taxonomyId: 1 },
      },
    ];
    renderWithTheme(<TopicEntryList {...defaultProps} entries={entries as never[]} />);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('calls onBackToJournal when back link is clicked', () => {
    const onBack = vi.fn();
    renderWithTheme(<TopicEntryList {...defaultProps} onBackToJournal={onBack} />);
    fireEvent.click(screen.getByText('Back to Journal'));
    expect(onBack).toHaveBeenCalled();
  });
});
