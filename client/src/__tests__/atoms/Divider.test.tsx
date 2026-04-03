import { describe, it, expect } from 'vitest';
import { Divider } from '@/components/atoms/Divider';
import { renderWithTheme } from '../testUtils';

describe('Divider', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(<Divider />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders as an hr element', () => {
    const { container } = renderWithTheme(<Divider />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('renders a separator role', () => {
    const { container } = renderWithTheme(<Divider />);
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
    expect(hr!.tagName).toBe('HR');
  });
});
