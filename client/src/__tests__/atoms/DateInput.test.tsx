import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { DateInput } from '@/components/atoms/DateInput';
import { renderWithTheme } from '../testUtils';

describe('DateInput', () => {
  it('renders without crashing', () => {
    renderWithTheme(<DateInput aria-label="date" />);
    expect(screen.getByLabelText('date')).toBeInTheDocument();
  });

  it('renders as a date input type', () => {
    renderWithTheme(<DateInput aria-label="date" />);
    expect(screen.getByLabelText('date')).toHaveAttribute('type', 'date');
  });

  it('handles onChange events', () => {
    const onChange = vi.fn();
    renderWithTheme(<DateInput aria-label="date" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('date'), { target: { value: '2024-01-15' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('displays the current value', () => {
    renderWithTheme(<DateInput aria-label="date" value="2024-06-01" readOnly />);
    expect(screen.getByLabelText('date')).toHaveValue('2024-06-01');
  });

  it('forwards HTML input attributes', () => {
    renderWithTheme(<DateInput aria-label="date" name="start-date" min="2024-01-01" />);
    const input = screen.getByLabelText('date');
    expect(input).toHaveAttribute('name', 'start-date');
    expect(input).toHaveAttribute('min', '2024-01-01');
  });
});
