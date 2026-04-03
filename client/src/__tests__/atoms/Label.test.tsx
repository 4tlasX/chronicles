import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Label } from '@/components/atoms/Label';
import { renderWithTheme } from '../testUtils';

describe('Label', () => {
  it('renders without crashing', () => {
    renderWithTheme(<Label>Username</Label>);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders children text', () => {
    renderWithTheme(<Label>Email Address</Label>);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('forwards htmlFor attribute', () => {
    renderWithTheme(<Label htmlFor="email-input">Email</Label>);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('renders as a label element', () => {
    const { container } = renderWithTheme(<Label>Test</Label>);
    expect(container.querySelector('label')).toBeInTheDocument();
  });

  it('forwards additional HTML attributes', () => {
    renderWithTheme(<Label id="my-label" className="custom">Labeled</Label>);
    const label = screen.getByText('Labeled');
    expect(label).toHaveAttribute('id', 'my-label');
  });
});
