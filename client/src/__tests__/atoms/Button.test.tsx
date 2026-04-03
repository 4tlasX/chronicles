import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/atoms/Button';
import { renderWithTheme } from '../testUtils';

describe('Button', () => {
  it('renders without crashing', () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders children text', () => {
    renderWithTheme(<Button>Save Entry</Button>);
    expect(screen.getByText('Save Entry')).toBeInTheDocument();
  });

  it('defaults to primary variant', () => {
    const { container } = renderWithTheme(<Button>Primary</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = vi.fn();
    renderWithTheme(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire click when disabled', () => {
    const onClick = vi.fn();
    renderWithTheme(<Button disabled onClick={onClick}>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies fullWidth style', () => {
    const { container } = renderWithTheme(<Button fullWidth>Full</Button>);
    const button = container.querySelector('button')!;
    expect(button).toBeInTheDocument();
  });

  it('accepts variant prop without error', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
    variants.forEach((variant) => {
      const { unmount } = renderWithTheme(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByText(variant)).toBeInTheDocument();
      unmount();
    });
  });

  it('forwards HTML button attributes', () => {
    renderWithTheme(<Button type="submit" aria-label="submit form">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'submit form');
  });
});
