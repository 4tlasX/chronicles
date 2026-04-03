import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { EmptyState } from '@/components/atoms/EmptyState';
import { renderWithTheme } from '../testUtils';

describe('EmptyState', () => {
  it('renders without crashing', () => {
    renderWithTheme(<EmptyState message="No entries yet" />);
    expect(screen.getByText('No entries yet')).toBeInTheDocument();
  });

  it('renders message text', () => {
    renderWithTheme(<EmptyState message="Nothing to show" />);
    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('renders submessage when provided', () => {
    renderWithTheme(<EmptyState message="Empty" submessage="Try adding something" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByText('Try adding something')).toBeInTheDocument();
  });

  it('does not render submessage when not provided', () => {
    renderWithTheme(<EmptyState message="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
    // Only one text element rendered
    const texts = screen.getAllByText(/./);
    expect(texts.length).toBe(1);
  });
});
