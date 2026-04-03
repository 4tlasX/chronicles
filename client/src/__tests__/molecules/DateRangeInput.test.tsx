import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { DateRangeInput } from '@/components/molecules/DateRangeInput';
import { renderWithTheme } from '../testUtils';

describe('DateRangeInput', () => {
  it('renders From and To labels', () => {
    renderWithTheme(
      <DateRangeInput fromValue="" toValue="" onFromChange={() => {}} onToChange={() => {}} />,
    );
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
  });

  it('renders two date inputs', () => {
    renderWithTheme(
      <DateRangeInput fromValue="2024-01-01" toValue="2024-01-31" onFromChange={() => {}} onToChange={() => {}} />,
    );
    const inputs = screen.getAllByDisplayValue(/2024/);
    expect(inputs).toHaveLength(2);
  });

  it('calls onFromChange when from date changes', () => {
    const onFromChange = vi.fn();
    renderWithTheme(
      <DateRangeInput fromValue="2024-01-01" toValue="2024-01-31" onFromChange={onFromChange} onToChange={() => {}} />,
    );
    const inputs = screen.getAllByDisplayValue(/2024/);
    fireEvent.change(inputs[0], { target: { value: '2024-02-01' } });
    expect(onFromChange).toHaveBeenCalledWith('2024-02-01');
  });

  it('calls onToChange when to date changes', () => {
    const onToChange = vi.fn();
    renderWithTheme(
      <DateRangeInput fromValue="2024-01-01" toValue="2024-01-31" onFromChange={() => {}} onToChange={onToChange} />,
    );
    const inputs = screen.getAllByDisplayValue(/2024/);
    fireEvent.change(inputs[1], { target: { value: '2024-02-28' } });
    expect(onToChange).toHaveBeenCalledWith('2024-02-28');
  });
});
