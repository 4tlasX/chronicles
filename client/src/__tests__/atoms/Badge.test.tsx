import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Badge } from '@/components/atoms/Badge';
import { renderWithTheme } from '../testUtils';

describe('Badge', () => {
  it('renders without crashing', () => {
    renderWithTheme(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders children text', () => {
    renderWithTheme(<Badge>Health</Badge>);
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('accepts variant prop', () => {
    renderWithTheme(<Badge variant="accent">Alert</Badge>);
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });

  it('renders without variant prop (default styling)', () => {
    renderWithTheme(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('accepts ink variant', () => {
    renderWithTheme(<Badge variant="ink">topic name</Badge>);
    expect(screen.getByText('topic name')).toBeInTheDocument();
  });

  it('renders as a span element', () => {
    const { container } = renderWithTheme(<Badge>Test</Badge>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('renders complex children', () => {
    renderWithTheme(
      <Badge variant="success">
        <span>Icon</span> Label
      </Badge>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText(/Label/)).toBeInTheDocument();
  });
});
