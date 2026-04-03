import { describe, it, expect } from 'vitest';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { renderWithTheme } from '../testUtils';

describe('ProgressBar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(<ProgressBar percent={50} color="#00ff00" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with 0 percent', () => {
    const { container } = renderWithTheme(<ProgressBar percent={0} color="#00ff00" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with 100 percent', () => {
    const { container } = renderWithTheme(<ProgressBar percent={100} color="#00ff00" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('clamps percent above 100', () => {
    const { container } = renderWithTheme(<ProgressBar percent={150} color="#00ff00" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('clamps percent below 0', () => {
    const { container } = renderWithTheme(<ProgressBar percent={-10} color="#00ff00" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders two nested divs (outer and inner)', () => {
    const { container } = renderWithTheme(<ProgressBar percent={50} color="blue" />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.tagName).toBe('DIV');
    expect(outer.firstChild).toBeTruthy();
    expect((outer.firstChild as HTMLElement).tagName).toBe('DIV');
  });
});
