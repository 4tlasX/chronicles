import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { FormField } from '@/components/molecules/FormField';
import { renderWithTheme } from '../testUtils';

describe('FormField', () => {
  it('renders the label', () => {
    renderWithTheme(
      <FormField label="Username">
        <input />
      </FormField>,
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders children', () => {
    renderWithTheme(
      <FormField label="Email">
        <input data-testid="input" />
      </FormField>,
    );
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('renders error text when provided', () => {
    renderWithTheme(
      <FormField label="Password" error="Password is required">
        <input />
      </FormField>,
    );
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('does not render error text when not provided', () => {
    renderWithTheme(
      <FormField label="Password">
        <input />
      </FormField>,
    );
    expect(screen.queryByText('required')).not.toBeInTheDocument();
  });

  it('passes htmlFor to label', () => {
    renderWithTheme(
      <FormField label="Name" htmlFor="name-input">
        <input id="name-input" />
      </FormField>,
    );
    const label = screen.getByText('Name');
    expect(label.closest('label')).toHaveAttribute('for', 'name-input');
  });
});
