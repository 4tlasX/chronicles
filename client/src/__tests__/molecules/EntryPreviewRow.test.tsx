import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { EntryPreviewRow } from '@/components/molecules/EntryPreviewRow';
import { renderWithTheme } from '../testUtils';
import { faBook } from '@fortawesome/free-solid-svg-icons';

describe('EntryPreviewRow', () => {
  it('renders preview text', () => {
    renderWithTheme(
      <EntryPreviewRow preview="Today was a good day" onClick={() => {}} />,
    );
    expect(screen.getByText('Today was a good day')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    renderWithTheme(
      <EntryPreviewRow preview="Click me" onClick={onClick} />,
    );
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders icon when provided', () => {
    const { container } = renderWithTheme(
      <EntryPreviewRow preview="With icon" icon={faBook} iconColor="#ff0000" onClick={() => {}} />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('does not render icon when not provided', () => {
    const { container } = renderWithTheme(
      <EntryPreviewRow preview="No icon" onClick={() => {}} />,
    );
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders meta labels when provided', () => {
    const meta = [
      { label: 'Topic', value: 'Work' },
      { label: 'Date', value: 'June 15' },
    ];
    renderWithTheme(
      <EntryPreviewRow preview="With meta" meta={meta} onClick={() => {}} />,
    );
    expect(screen.getByText(/Topic.*Work/)).toBeInTheDocument();
    expect(screen.getByText(/Date.*June 15/)).toBeInTheDocument();
  });

  it('does not render meta section when meta is empty', () => {
    renderWithTheme(
      <EntryPreviewRow preview="No meta" meta={[]} onClick={() => {}} />,
    );
    // The meta container should not be present
    expect(screen.queryByText(/Topic/)).not.toBeInTheDocument();
  });
});
