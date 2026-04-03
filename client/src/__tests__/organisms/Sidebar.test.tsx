import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { Sidebar } from '@/components/organisms/Sidebar';

const mockSetSelectedTopicId = vi.fn();

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      selectedTopicId: null,
      setSelectedTopicId: mockSetSelectedTopicId,
      headerColor: '#4A5568',
    }),
}));

vi.mock('@/stores/entriesStore', () => ({
  useEntriesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      topics: [
        { id: 1, name: 'Work', icon: 'briefcase', color: '#3B82F6' },
        { id: 2, name: 'Personal', icon: null, color: '#10B981' },
      ],
      decryptedEntries: [
        { id: 1, content: 'Entry 1', metadata: { _taxonomyId: 1 }, createdAt: new Date(), updatedAt: new Date(), isEncrypted: true },
        { id: 2, content: 'Entry 2', metadata: { _taxonomyId: 1 }, createdAt: new Date(), updatedAt: new Date(), isEncrypted: true },
        { id: 3, content: 'Entry 3', metadata: { _taxonomyId: 2 }, createdAt: new Date(), updatedAt: new Date(), isEncrypted: true },
      ],
    }),
}));

vi.mock('@/utils/topicIcons', () => ({
  getTopicIcon: () => ({ prefix: 'fas', iconName: 'book' }),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('Sidebar', () => {
  it('renders topics title', () => {
    renderWithTheme(<Sidebar />);
    expect(screen.getByText('Topics')).toBeInTheDocument();
  });

  it('renders all entries item', () => {
    renderWithTheme(<Sidebar />);
    expect(screen.getByText('All Entries')).toBeInTheDocument();
  });

  it('renders total entry count', () => {
    renderWithTheme(<Sidebar />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders topic names', () => {
    renderWithTheme(<Sidebar />);
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('shows entry count per topic', () => {
    renderWithTheme(<Sidebar />);
    expect(screen.getByText('2')).toBeInTheDocument(); // Work: 2
    expect(screen.getByText('1')).toBeInTheDocument(); // Personal: 1
  });

  it('calls setSelectedTopicId when topic is clicked', () => {
    renderWithTheme(<Sidebar />);
    fireEvent.click(screen.getByText('Work'));
    expect(mockSetSelectedTopicId).toHaveBeenCalledWith(1);
  });

  it('calls setSelectedTopicId with null when All Entries is clicked', () => {
    renderWithTheme(<Sidebar />);
    fireEvent.click(screen.getByText('All Entries'));
    expect(mockSetSelectedTopicId).toHaveBeenCalledWith(null);
  });
});
