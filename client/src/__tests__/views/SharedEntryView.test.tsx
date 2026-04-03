import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { SharedEntryView } from '@/views/SharedEntryView';
import { useParams } from 'react-router-dom';

// SharedEntryView provides its own ThemeProvider, so we use plain render

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({ token: 'abc123' })),
}));

vi.mock('@/services/api', () => ({
  shares: {
    get: vi.fn().mockResolvedValue({
      contentEncrypted: 'encrypted',
      contentIv: 'iv',
      createdAt: '2024-01-01T00:00:00Z',
    }),
  },
}));

vi.mock('@/components/templates/SharedTemplate', () => ({
  SharedTemplate: ({ children }: any) => <div data-testid="shared-template">{children}</div>,
}));

vi.mock('@/components/molecules/SharedEntryCard', () => ({
  SharedEntryCard: ({ status, errorMsg, content, createdAt }: any) => (
    <div data-testid="shared-entry-card">
      <span data-testid="status">{status}</span>
      {errorMsg && <span data-testid="error">{errorMsg}</span>}
      {content && <span data-testid="content">{content}</span>}
    </div>
  ),
}));

vi.mock('@/styles/GlobalStyle', () => ({
  GlobalStyle: () => null,
}));

describe('SharedEntryView', () => {
  it('renders without crashing', () => {
    render(<SharedEntryView />);
    expect(screen.getByTestId('shared-template')).toBeInTheDocument();
  });

  it('renders the shared entry card', () => {
    render(<SharedEntryView />);
    expect(screen.getByTestId('shared-entry-card')).toBeInTheDocument();
  });

  it('shows error when share key is missing from URL hash', () => {
    // window.location.hash is empty by default in jsdom
    render(<SharedEntryView />);
    expect(screen.getByTestId('error')).toHaveTextContent('missing its decryption key');
  });
});

describe('SharedEntryView (no token)', () => {
  beforeEach(() => {
    vi.mocked(useParams).mockReturnValue({});
  });

  it('shows error for invalid share link', () => {
    render(<SharedEntryView />);
    expect(screen.getByTestId('error')).toHaveTextContent('Invalid share link');
  });
});
