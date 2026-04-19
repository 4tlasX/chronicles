import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Select } from '@/components/atoms/Select';
import { renderWithTheme } from '../testUtils';

describe('Select', () => {
  it('renders without crashing', () => {
    renderWithTheme(
      <Select aria-label="color">
        <option value="red">Red</option>
        <option value="blue">Blue</option>
      </Select>
    );
    expect(screen.getByLabelText('color')).toBeInTheDocument();
  });

  it('renders options', () => {
    renderWithTheme(
      <Select aria-label="color">
        <option value="red">Red</option>
        <option value="blue">Blue</option>
      </Select>
    );
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Select aria-label="color" onChange={onChange}>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
      </Select>
    );
    fireEvent.change(screen.getByLabelText('color'), { target: { value: 'blue' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('reflects the selected value', () => {
    renderWithTheme(
      <Select aria-label="color" value="blue" onChange={() => {}}>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
      </Select>
    );
    expect(screen.getByLabelText('color')).toHaveValue('blue');
  });

  it('renders as a select element', () => {
    const { container } = renderWithTheme(
      <Select>
        <option value="a">A</option>
      </Select>
    );
    expect(container.querySelector('select')).toBeInTheDocument();
  });

  it('forwards HTML select attributes', () => {
    renderWithTheme(
      <Select aria-label="test" name="my-select" id="sel-1">
        <option value="a">A</option>
      </Select>
    );
    const select = screen.getByLabelText('test');
    expect(select).toHaveAttribute('name', 'my-select');
    expect(select).toHaveAttribute('id', 'sel-1');
  });
});
