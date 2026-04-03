import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ViewHeader } from '@/components/molecules/ViewHeader';
import { renderWithTheme } from '../testUtils';

describe('ViewHeader', () => {
  it('renders the title', () => {
    renderWithTheme(<ViewHeader title="Settings" onBack={() => {}} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders default back label', () => {
    renderWithTheme(<ViewHeader title="Settings" onBack={() => {}} />);
    expect(screen.getByText(/Back to Journal/)).toBeInTheDocument();
  });

  it('renders custom back label', () => {
    renderWithTheme(<ViewHeader title="Settings" backLabel="Go Back" onBack={() => {}} />);
    expect(screen.getByText(/Go Back/)).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    renderWithTheme(<ViewHeader title="Settings" onBack={onBack} />);
    fireEvent.click(screen.getByText(/Back to Journal/));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders right slot content', () => {
    renderWithTheme(
      <ViewHeader title="Settings" onBack={() => {}} right={<span data-testid="right">Action</span>} />,
    );
    expect(screen.getByTestId('right')).toBeInTheDocument();
  });
});
