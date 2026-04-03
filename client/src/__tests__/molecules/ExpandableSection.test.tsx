import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ExpandableSection } from '@/components/molecules/ExpandableSection';
import { renderWithTheme } from '../testUtils';

describe('ExpandableSection', () => {
  it('renders the label', () => {
    renderWithTheme(
      <ExpandableSection label="Details">
        <p>Content here</p>
      </ExpandableSection>,
    );
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('does not show children by default', () => {
    renderWithTheme(
      <ExpandableSection label="Details">
        <p>Hidden content</p>
      </ExpandableSection>,
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('shows children when defaultExpanded is true', () => {
    renderWithTheme(
      <ExpandableSection label="Details" defaultExpanded>
        <p>Visible content</p>
      </ExpandableSection>,
    );
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('toggles content visibility when header is clicked', () => {
    renderWithTheme(
      <ExpandableSection label="Details">
        <p>Toggle content</p>
      </ExpandableSection>,
    );
    expect(screen.queryByText('Toggle content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Details'));
    expect(screen.getByText('Toggle content')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Details'));
    expect(screen.queryByText('Toggle content')).not.toBeInTheDocument();
  });
});
