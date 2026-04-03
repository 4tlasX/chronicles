import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { TopicSelectorDropdown } from '@/components/organisms/TopicSelectorDropdown';

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ headerColor: '#4A5568' }),
}));

vi.mock('@/utils/topicIcons', () => ({
  getTopicIcon: () => ({ prefix: 'fas', iconName: 'book' }),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const topics = [
  { id: 1, name: 'Work', icon: 'briefcase', color: '#3B82F6' },
  { id: 2, name: 'Personal', icon: null, color: '#10B981' },
];

describe('TopicSelectorDropdown', () => {
  it('returns null when not open', () => {
    const { container } = renderWithTheme(
      <TopicSelectorDropdown
        isOpen={false}
        onClose={vi.fn()}
        selectedTopicId={null}
        onSelect={vi.fn()}
        topics={topics}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dropdown when open', () => {
    renderWithTheme(
      <TopicSelectorDropdown
        isOpen={true}
        onClose={vi.fn()}
        selectedTopicId={null}
        onSelect={vi.fn()}
        topics={topics}
      />
    );
    expect(screen.getByPlaceholderText('Search topics...')).toBeInTheDocument();
    expect(screen.getByText('No topic')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('renders manage topics link', () => {
    renderWithTheme(
      <TopicSelectorDropdown
        isOpen={true}
        onClose={vi.fn()}
        selectedTopicId={null}
        onSelect={vi.fn()}
        topics={topics}
      />
    );
    expect(screen.getByText('Manage Topics...')).toBeInTheDocument();
  });

  it('calls onSelect and onClose when topic is clicked', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    renderWithTheme(
      <TopicSelectorDropdown
        isOpen={true}
        onClose={onClose}
        selectedTopicId={null}
        onSelect={onSelect}
        topics={topics}
      />
    );
    fireEvent.click(screen.getByText('Work'));
    expect(onSelect).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSelect with null when no topic is clicked', () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <TopicSelectorDropdown
        isOpen={true}
        onClose={vi.fn()}
        selectedTopicId={1}
        onSelect={onSelect}
        topics={topics}
      />
    );
    fireEvent.click(screen.getByText('No topic'));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('filters topics by search query', () => {
    renderWithTheme(
      <TopicSelectorDropdown
        isOpen={true}
        onClose={vi.fn()}
        selectedTopicId={null}
        onSelect={vi.fn()}
        topics={topics}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('Search topics...'), {
      target: { value: 'work' },
    });
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.queryByText('Personal')).not.toBeInTheDocument();
  });
});
