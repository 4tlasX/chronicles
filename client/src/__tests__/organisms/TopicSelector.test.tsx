import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { TopicSelector } from '@/components/organisms/TopicSelector';

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ headerColor: '#4A5568' }),
}));

vi.mock('@/utils/topicIcons', () => ({
  getTopicIcon: () => ({ prefix: 'fas', iconName: 'book' }),
}));

vi.mock('@/components/molecules/SearchInput', () => ({
  SearchInput: ({ placeholder, onChange }: { placeholder: string; onChange: (v: string) => void }) => (
    <input placeholder={placeholder} onChange={e => onChange(e.target.value)} data-testid="search-input" />
  ),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

const topics = [
  { id: 1, name: 'Work', icon: 'briefcase', color: '#3B82F6' },
  { id: 2, name: 'Personal', icon: null, color: '#10B981' },
];

describe('TopicSelector', () => {
  it('renders no topic placeholder when nothing selected', () => {
    renderWithTheme(
      <TopicSelector selectedId={null} onSelect={vi.fn()} topics={topics} />
    );
    expect(screen.getByText('No topic')).toBeInTheDocument();
  });

  it('renders selected topic name', () => {
    renderWithTheme(
      <TopicSelector selectedId={1} onSelect={vi.fn()} topics={topics} />
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('opens dropdown when trigger is clicked', () => {
    renderWithTheme(
      <TopicSelector selectedId={null} onSelect={vi.fn()} topics={topics} />
    );
    fireEvent.click(screen.getByText('No topic'));
    // Dropdown should now be visible with topics
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('calls onSelect when a topic is chosen', () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <TopicSelector selectedId={null} onSelect={onSelect} topics={topics} />
    );
    fireEvent.click(screen.getByText('No topic'));
    fireEvent.click(screen.getByText('Work'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('calls onSelect with null when No topic is chosen', () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <TopicSelector selectedId={1} onSelect={onSelect} topics={topics} />
    );
    // Open dropdown
    fireEvent.click(screen.getByText('Work'));
    // Click "No topic" in the dropdown
    const noTopicItems = screen.getAllByText('No topic');
    fireEvent.click(noTopicItems[noTopicItems.length - 1]);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('shows "No topics found" when search has no matches', () => {
    renderWithTheme(
      <TopicSelector selectedId={null} onSelect={vi.fn()} topics={topics} />
    );
    fireEvent.click(screen.getByText('No topic'));
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'zzzzz' },
    });
    expect(screen.getByText('No topics found')).toBeInTheDocument();
  });
});
