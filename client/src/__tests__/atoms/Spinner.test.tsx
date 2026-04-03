import { describe, it, expect } from 'vitest';
import { Spinner } from '@/components/atoms/Spinner';
import { renderWithTheme } from '../testUtils';

describe('Spinner', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(<Spinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('uses default size of 24', () => {
    const { container } = renderWithTheme(<Spinner />);
    const div = container.firstChild as HTMLElement;
    expect(div).toBeInTheDocument();
  });

  it('accepts a custom size', () => {
    const { container } = renderWithTheme(<Spinner size={48} />);
    const div = container.firstChild as HTMLElement;
    expect(div).toBeInTheDocument();
  });

  it('renders as a div element', () => {
    const { container } = renderWithTheme(<Spinner />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
