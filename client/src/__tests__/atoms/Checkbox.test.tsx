import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Checkbox } from '@/components/atoms/Checkbox';
import { renderWithTheme } from '../testUtils';

describe('Checkbox', () => {
  it('renders without crashing', () => {
    renderWithTheme(<Checkbox checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    renderWithTheme(<Checkbox checked={false} onChange={() => {}} label="Remember me" />);
    expect(screen.getByText('Remember me')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const { container } = renderWithTheme(<Checkbox checked={false} onChange={() => {}} />);
    // Only the checkbox box div, no label span
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(0);
  });

  it('shows check mark when checked', () => {
    renderWithTheme(<Checkbox checked={true} onChange={() => {}} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('does not show check mark when unchecked', () => {
    renderWithTheme(<Checkbox checked={false} onChange={() => {}} />);
    expect(screen.queryByText('✓')).not.toBeInTheDocument();
  });

  it('reflects checked state on the hidden input', () => {
    renderWithTheme(<Checkbox checked={true} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange with true when clicking unchecked', () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when clicking checked', () => {
    const onChange = vi.fn();
    renderWithTheme(<Checkbox checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});
