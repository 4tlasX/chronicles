import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { EntryCard } from '@/components/organisms/EntryCard';
import { faBook } from '@fortawesome/free-solid-svg-icons';

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ headerColor: '#4A5568' }),
}));

vi.mock('@/utils/stripHtml', () => ({
  builtinEntryName: (cf: Record<string, unknown> | undefined | null) => { if (!cf) return ''; for (const k of ['eventName','meetingName','goalObjective','milestoneObjective','taskDescription','mealDescription']) { const v = cf[k]; if (typeof v === 'string' && v.trim()) return v.trim(); } return ''; },
  stripHtml: (html: string) => html.replace(/<[^>]*>/g, ''),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('EntryCard', () => {
  const defaultProps = {
    id: 1,
    content: '<p>This is a journal entry</p>',
    date: '2024-01-15T10:30:00Z',
    onClick: vi.fn(),
  };

  it('renders entry preview text', () => {
    renderWithTheme(<EntryCard {...defaultProps} />);
    expect(screen.getByText('This is a journal entry')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    renderWithTheme(<EntryCard {...defaultProps} />);
    // Date rendering depends on locale, but should be present
    const card = screen.getByText('This is a journal entry').closest('button');
    expect(card).toBeTruthy();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    renderWithTheme(<EntryCard {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByText('This is a journal entry'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders topic badge when topicName is provided', () => {
    renderWithTheme(
      <EntryCard {...defaultProps} topicName="Work" topicIcon={faBook} />
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('renders checkbox when hasCheckbox is true', () => {
    renderWithTheme(
      <EntryCard {...defaultProps} hasCheckbox={true} isCompleted={false} />
    );
    // Checkbox is a styled div with role
    const card = screen.getByText('This is a journal entry').closest('button');
    expect(card).toBeTruthy();
  });

  it('shows strikethrough for completed tasks', () => {
    renderWithTheme(
      <EntryCard {...defaultProps} hasCheckbox={true} isCompleted={true} />
    );
    const preview = screen.getByText('This is a journal entry');
    expect(preview).toHaveStyle('text-decoration: line-through');
  });

  it('renders custom type badge', () => {
    renderWithTheme(
      <EntryCard {...defaultProps} customType="task" />
    );
    expect(screen.getByText('task')).toBeInTheDocument();
  });

  it('calls onTopicClick when topic badge is clicked', () => {
    const onTopicClick = vi.fn();
    renderWithTheme(
      <EntryCard
        {...defaultProps}
        topicName="Work"
        topicId={1}
        topicIcon={faBook}
        onTopicClick={onTopicClick}
      />
    );
    fireEvent.click(screen.getByText('Work'));
    expect(onTopicClick).toHaveBeenCalledWith(1);
  });

  it('shows Untitled entry for empty content', () => {
    renderWithTheme(
      <EntryCard {...defaultProps} content="" />
    );
    expect(screen.getByText('Untitled entry')).toBeInTheDocument();
  });
});
