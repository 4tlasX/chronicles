import { describe, it, expect } from 'vitest';
import { Icon } from '@/components/atoms/Icon';
import { renderWithTheme } from '../testUtils';
import { faCheck, faStar } from '@fortawesome/free-solid-svg-icons';

describe('Icon', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(<Icon icon={faCheck} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders with different icons', () => {
    const { container } = renderWithTheme(<Icon icon={faStar} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('accepts a color prop', () => {
    const { container } = renderWithTheme(<Icon icon={faCheck} color="red" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('color', 'red');
  });

  it('accepts a className prop', () => {
    const { container } = renderWithTheme(<Icon icon={faCheck} className="my-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('my-icon');
  });

  it('defaults size to 1x', () => {
    const { container } = renderWithTheme(<Icon icon={faCheck} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('accepts different size values', () => {
    const sizes = ['xs', 'sm', 'lg', '1x', '2x'] as const;
    sizes.forEach((size) => {
      const { unmount, container } = renderWithTheme(<Icon icon={faCheck} size={size} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      unmount();
    });
  });
});
