import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '@/components/atoms/PasswordInput';
import { renderWithTheme } from '../testUtils';

describe('PasswordInput', () => {
  it('renders without crashing', () => {
    renderWithTheme(<PasswordInput aria-label="password" />);
    expect(screen.getByLabelText('password')).toBeInTheDocument();
  });

  it('renders as password type by default', () => {
    renderWithTheme(<PasswordInput aria-label="password" />);
    expect(screen.getByLabelText('password')).toHaveAttribute('type', 'password');
  });

  it('toggles visibility when Show button is clicked', () => {
    renderWithTheme(<PasswordInput aria-label="password" />);
    const input = screen.getByLabelText('password');
    const toggleBtn = screen.getByText('Show');

    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByText('Hide')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide'));
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByText('Show')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const onChange = vi.fn();
    renderWithTheme(<PasswordInput aria-label="password" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('displays placeholder text', () => {
    renderWithTheme(<PasswordInput placeholder="Enter password" />);
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('accepts error prop without crashing', () => {
    renderWithTheme(<PasswordInput aria-label="password" error />);
    expect(screen.getByLabelText('password')).toBeInTheDocument();
  });

  it('forwards HTML input attributes', () => {
    renderWithTheme(<PasswordInput aria-label="password" name="pwd" autoComplete="current-password" />);
    const input = screen.getByLabelText('password');
    expect(input).toHaveAttribute('name', 'pwd');
    expect(input).toHaveAttribute('autoComplete', 'current-password');
  });

  it('renders the toggle button as type="button"', () => {
    renderWithTheme(<PasswordInput aria-label="password" />);
    const toggleBtn = screen.getByText('Show');
    expect(toggleBtn).toHaveAttribute('type', 'button');
  });
});
