import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { SharedEntryCard } from '@/components/molecules/SharedEntryCard';
import { renderWithTheme } from '../testUtils';

describe('SharedEntryCard', () => {
  it('renders app name and shared badge', () => {
    renderWithTheme(<SharedEntryCard status="loading" />);
    expect(screen.getByText('Chronicles')).toBeInTheDocument();
    expect(screen.getByText('Shared entry')).toBeInTheDocument();
  });

  it('shows loading state with spinner text', () => {
    renderWithTheme(<SharedEntryCard status="loading" />);
    expect(screen.getByText(/Decrypting/)).toBeInTheDocument();
  });

  it('shows error state with error message', () => {
    renderWithTheme(<SharedEntryCard status="error" errorMsg="Link expired" />);
    expect(screen.getByText('Link expired')).toBeInTheDocument();
  });

  it('renders content when status is done', () => {
    renderWithTheme(
      <SharedEntryCard status="done" content="<p>Hello world</p>" createdAt="2024-06-15T12:00:00Z" />,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('sanitizes HTML content', () => {
    renderWithTheme(
      <SharedEntryCard
        status="done"
        content='<p>Safe</p><script>alert("xss")</script>'
        createdAt="2024-06-15T12:00:00Z"
      />,
    );
    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(screen.queryByText('alert')).not.toBeInTheDocument();
  });

  it('shows creation date in footer when done', () => {
    renderWithTheme(
      <SharedEntryCard status="done" content="<p>text</p>" createdAt="2024-06-15T12:00:00Z" />,
    );
    expect(screen.getByText(/Originally written/)).toBeInTheDocument();
    expect(screen.getByText(/June 15, 2024/)).toBeInTheDocument();
  });

  it('handles null content gracefully', () => {
    renderWithTheme(<SharedEntryCard status="done" content={null} />);
    // Should not render body content
    expect(screen.queryByText('Originally written')).not.toBeInTheDocument();
  });
});
