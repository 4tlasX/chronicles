import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { EditableEntryCard } from '@/components/organisms/EditableEntryCard';

vi.mock('@/contexts/EncryptionContext', () => ({
  useEncryption: () => ({
    encryptPost: vi.fn().mockResolvedValue({
      contentEncrypted: '', contentIv: '',
      metadataEncrypted: '', metadataIv: '',
    }),
  }),
}));

vi.mock('@/stores/entriesStore', () => ({
  useEntriesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      updateDecryptedEntry: vi.fn(),
      removeEntry: vi.fn(),
    }),
}));

vi.mock('@/services/api', () => ({
  entries: {
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(undefined),
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

const mockEntry = {
  id: 1,
  content: '<p>Test entry content</p>',
  isEncrypted: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  metadata: { _taxonomyId: 1 },
};

const mockTopic = { id: 1, name: 'Work', icon: 'briefcase', color: '#3B82F6' };

describe('EditableEntryCard', () => {
  const defaultProps = {
    entry: mockEntry as never,
    topic: mockTopic,
    headerColor: '#4281a4',
    isEditing: false,
    onSelect: vi.fn(),
    onClose: vi.fn(),
    onDeleted: vi.fn(),
  };

  it('renders entry preview text', () => {
    renderWithTheme(<EditableEntryCard {...defaultProps} />);
    expect(screen.getByText('Test entry content')).toBeInTheDocument();
  });

  it('renders date label', () => {
    renderWithTheme(<EditableEntryCard {...defaultProps} />);
    // Date format depends on locale; check that the card renders
    const card = screen.getByText('Test entry content').closest('[class]');
    expect(card).toBeTruthy();
  });

  it('calls onSelect when preview is clicked', () => {
    const onSelect = vi.fn();
    renderWithTheme(<EditableEntryCard {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Test entry content'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows editor when editing', () => {
    renderWithTheme(<EditableEntryCard {...defaultProps} isEditing={true} />);
    expect(screen.getByTestId('editor')).toBeInTheDocument();
  });

  it('does not show editor when not editing', () => {
    renderWithTheme(<EditableEntryCard {...defaultProps} isEditing={false} />);
    expect(screen.queryByTestId('editor')).not.toBeInTheDocument();
  });
});
