import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from '@/components/molecules/ColorPicker';
import { renderWithTheme } from '../testUtils';

const mockColors = [
  { value: '#ff0000', label: 'Red' },
  { value: '#00ff00', label: 'Green' },
  { value: '#0000ff', label: 'Blue' },
];

describe('ColorPicker', () => {
  it('renders all color swatches', () => {
    renderWithTheme(
      <ColorPicker colors={mockColors} selected="#ff0000" onChange={() => {}} />,
    );
    // Each swatch is a button
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('calls onChange when a swatch is clicked', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ColorPicker colors={mockColors} selected="#ff0000" onChange={onChange} />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });

  it('renders with no colors without crashing', () => {
    renderWithTheme(
      <ColorPicker colors={[]} selected="" onChange={() => {}} />,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
