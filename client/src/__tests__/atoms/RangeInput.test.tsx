import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { RangeInput } from '@/components/atoms/RangeInput';
import { renderWithTheme } from '../testUtils';

describe('RangeInput', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(<RangeInput value={50} onChange={() => {}} />);
    expect(container.querySelector('input[type="range"]')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    renderWithTheme(<RangeInput label="Volume" value={50} onChange={() => {}} />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('renders display value when provided', () => {
    renderWithTheme(<RangeInput displayValue="75%" value={75} onChange={() => {}} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders value when no displayValue provided', () => {
    renderWithTheme(<RangeInput label="Size" value={42} onChange={() => {}} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('does not render header row when no label or displayValue', () => {
    const { container } = renderWithTheme(<RangeInput value={50} onChange={() => {}} />);
    // Only the range input, no label/value spans
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(0);
  });

  it('handles onChange events', () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(<RangeInput value={50} onChange={onChange} />);
    const input = container.querySelector('input[type="range"]')!;
    fireEvent.change(input, { target: { value: '75' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards HTML input attributes', () => {
    const { container } = renderWithTheme(
      <RangeInput value={50} onChange={() => {}} min={0} max={100} step={5} />
    );
    const input = container.querySelector('input[type="range"]')!;
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
    expect(input).toHaveAttribute('step', '5');
  });
});
