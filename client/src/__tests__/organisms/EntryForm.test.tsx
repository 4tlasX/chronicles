import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { EntryForm } from '@/components/organisms/EntryForm';

vi.mock('@/stores/entriesStore', () => ({
  useEntriesStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      decryptedEntries: [],
      updateDecryptedEntry: vi.fn(),
    }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ headerColor: '#4A5568' }),
}));

vi.mock('@/utils/topicIcons', () => ({
  getTopicIcon: () => ({ prefix: 'fas', iconName: 'book' }),
}));

vi.mock('@/utils/stripHtml', () => ({
  stripHtml: (html: string) => html.replace(/<[^>]*>/g, ''),
}));

vi.mock('@/components/organisms/Editor', () => ({
  Editor: ({ content, onChange, placeholder }: { content: string; onChange: (c: string) => void; placeholder: string }) => (
    <textarea
      data-testid="editor"
      value={content}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/components/organisms/TopicSelector', () => ({
  TopicSelector: ({ selectedId, onSelect }: { selectedId: number | null; onSelect: (id: number | null) => void }) => (
    <select
      data-testid="topic-selector"
      value={selectedId ?? ''}
      onChange={e => onSelect(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">No topic</option>
    </select>
  ),
}));

vi.mock('@/components/molecules/SearchInput', () => ({
  SearchInput: () => <input data-testid="search-input" />,
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('EntryForm', () => {
  const defaultProps = {
    entryId: null,
    content: '',
    onContentChange: vi.fn(),
    topicId: null,
    onTopicChange: vi.fn(),
    topics: [],
    customFields: {},
    onCustomFieldsChange: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    onNew: vi.fn(),
    isEditing: false,
    isSaving: false,
    saveStatus: '',
  };

  it('renders editor', () => {
    renderWithTheme(<EntryForm {...defaultProps} />);
    expect(screen.getByTestId('editor')).toBeInTheDocument();
  });

  it('renders topic selector', () => {
    renderWithTheme(<EntryForm {...defaultProps} />);
    expect(screen.getByTestId('topic-selector')).toBeInTheDocument();
  });

  it('renders save button', () => {
    renderWithTheme(<EntryForm {...defaultProps} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('disables save button when content is empty', () => {
    renderWithTheme(<EntryForm {...defaultProps} content="" />);
    const saveBtn = screen.getByText('Save');
    expect(saveBtn).toBeDisabled();
  });

  it('enables save button when content is present', () => {
    renderWithTheme(<EntryForm {...defaultProps} content="Hello world" />);
    const saveBtn = screen.getByText('Save');
    expect(saveBtn).not.toBeDisabled();
  });

  it('shows delete button when editing', () => {
    renderWithTheme(
      <EntryForm
        {...defaultProps}
        isEditing={true}
        entryId={1}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows close button when editing', () => {
    renderWithTheme(
      <EntryForm {...defaultProps} isEditing={true} entryId={1} />
    );
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('displays save status', () => {
    renderWithTheme(
      <EntryForm {...defaultProps} saveStatus="Saved!" />
    );
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderWithTheme(
      <EntryForm {...defaultProps} content="Hello" onSave={onSave} />
    );
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
  });
});
