import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Textarea } from '@/components/atoms/Textarea';
import { renderWithTheme } from '../testUtils';

describe('Textarea', () => {
  it('renders without crashing', () => {
    renderWithTheme(<Textarea aria-label="notes" />);
    expect(screen.getByLabelText('notes')).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    renderWithTheme(<Textarea placeholder="Write something..." />);
    expect(screen.getByPlaceholderText('Write something...')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const onChange = vi.fn();
    renderWithTheme(<Textarea aria-label="notes" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('notes'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('displays the current value', () => {
    renderWithTheme(<Textarea aria-label="notes" value="existing text" readOnly />);
    expect(screen.getByLabelText('notes')).toHaveValue('existing text');
  });

  it('accepts error prop without crashing', () => {
    renderWithTheme(<Textarea aria-label="notes" error />);
    expect(screen.getByLabelText('notes')).toBeInTheDocument();
  });

  it('accepts error=false without crashing', () => {
    renderWithTheme(<Textarea aria-label="notes" error={false} />);
    expect(screen.getByLabelText('notes')).toBeInTheDocument();
  });

  it('renders as a textarea element', () => {
    const { container } = renderWithTheme(<Textarea />);
    expect(container.querySelector('textarea')).toBeInTheDocument();
  });

  it('forwards HTML textarea attributes', () => {
    renderWithTheme(<Textarea aria-label="notes" rows={5} maxLength={500} />);
    const textarea = screen.getByLabelText('notes');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('maxLength', '500');
  });
});
