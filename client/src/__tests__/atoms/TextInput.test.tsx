import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { TextInput } from '@/components/atoms/TextInput';
import { renderWithTheme } from '../testUtils';

describe('TextInput', () => {
  it('renders without crashing', () => {
    renderWithTheme(<TextInput aria-label="test input" />);
    expect(screen.getByLabelText('test input')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    renderWithTheme(<TextInput placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const onChange = vi.fn();
    renderWithTheme(<TextInput aria-label="input" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('input'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('displays the current value', () => {
    renderWithTheme(<TextInput aria-label="input" value="test value" readOnly />);
    expect(screen.getByLabelText('input')).toHaveValue('test value');
  });

  it('supports disabled state', () => {
    renderWithTheme(<TextInput aria-label="input" disabled />);
    expect(screen.getByLabelText('input')).toBeDisabled();
  });

  it('accepts error prop without crashing', () => {
    renderWithTheme(<TextInput aria-label="input" error />);
    expect(screen.getByLabelText('input')).toBeInTheDocument();
  });

  it('accepts error=false without crashing', () => {
    renderWithTheme(<TextInput aria-label="input" error={false} />);
    expect(screen.getByLabelText('input')).toBeInTheDocument();
  });

  it('forwards HTML input attributes', () => {
    renderWithTheme(<TextInput aria-label="input" maxLength={50} name="username" />);
    const input = screen.getByLabelText('input');
    expect(input).toHaveAttribute('maxLength', '50');
    expect(input).toHaveAttribute('name', 'username');
  });
});
