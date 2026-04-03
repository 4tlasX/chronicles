import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { IconButton } from '@/components/atoms/IconButton';
import { renderWithTheme } from '../testUtils';

describe('IconButton', () => {
  it('renders without crashing', () => {
    renderWithTheme(<IconButton aria-label="close">X</IconButton>);
    expect(screen.getByRole('button', { name: 'close' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    renderWithTheme(<IconButton aria-label="edit" onClick={onClick}>E</IconButton>);
    fireEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('defaults to type="button"', () => {
    renderWithTheme(<IconButton aria-label="btn">B</IconButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('supports disabled state', () => {
    const onClick = vi.fn();
    renderWithTheme(<IconButton aria-label="disabled" disabled onClick={onClick}>D</IconButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders children', () => {
    renderWithTheme(<IconButton>Icon</IconButton>);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('forwards HTML button attributes', () => {
    renderWithTheme(<IconButton aria-label="test" title="Edit entry">E</IconButton>);
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Edit entry');
  });
});
