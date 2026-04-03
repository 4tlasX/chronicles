import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ColorSwatch } from '@/components/atoms/ColorSwatch';
import { renderWithTheme } from '../testUtils';

describe('ColorSwatch', () => {
  it('renders without crashing', () => {
    renderWithTheme(<ColorSwatch color="#ff0000" selected={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    renderWithTheme(<ColorSwatch color="#00ff00" selected={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders with selected state', () => {
    renderWithTheme(<ColorSwatch color="#0000ff" selected={true} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with unselected state', () => {
    renderWithTheme(<ColorSwatch color="#0000ff" selected={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders transparent color', () => {
    renderWithTheme(<ColorSwatch color="transparent" selected={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    const { container } = renderWithTheme(
      <ColorSwatch color="#123456" selected={false} onClick={() => {}} />
    );
    expect(container.querySelector('button')).toBeInTheDocument();
  });
});
