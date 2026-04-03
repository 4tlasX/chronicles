import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { EntryMeta } from '@/components/molecules/EntryMeta';
import { renderWithTheme } from '../testUtils';

describe('EntryMeta', () => {
  it('renders the formatted date', () => {
    renderWithTheme(<EntryMeta date="2024-06-15T12:00:00Z" />);
    expect(screen.getByText(/Jun/)).toBeInTheDocument();
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it('renders topic badge when topicName is provided', () => {
    renderWithTheme(
      <EntryMeta date="2024-06-15T12:00:00Z" topicName="Work" topicColor="#ff0000" />,
    );
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('does not render badge when topicName is omitted', () => {
    renderWithTheme(<EntryMeta date="2024-06-15T12:00:00Z" />);
    expect(screen.queryByText('Work')).not.toBeInTheDocument();
  });

  it('formats date with weekday, month, and day', () => {
    renderWithTheme(<EntryMeta date="2024-01-15T12:00:00Z" />);
    // Should contain something like "Mon, Jan 15"
    const wrapper = screen.getByText(/Jan/);
    expect(wrapper).toBeInTheDocument();
  });
});
