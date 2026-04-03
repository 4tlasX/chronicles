import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { TopicForm } from '@/components/organisms/TopicForm';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('TopicForm', () => {
  it('renders with default submit label', () => {
    renderWithTheme(<TopicForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Create Topic' })).toBeInTheDocument();
  });

  it('renders with custom submit label', () => {
    renderWithTheme(<TopicForm onSubmit={vi.fn()} submitLabel="Update Topic" />);
    expect(screen.getByRole('button', { name: 'Update Topic' })).toBeInTheDocument();
  });

  it('renders initial name value', () => {
    renderWithTheme(<TopicForm onSubmit={vi.fn()} initialName="Work" />);
    expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
  });

  it('renders cancel button when onCancel is provided', () => {
    const onCancel = vi.fn();
    renderWithTheme(<TopicForm onSubmit={vi.fn()} onCancel={onCancel} />);
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows error when name is empty', async () => {
    const onSubmit = vi.fn();
    renderWithTheme(<TopicForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Create Topic' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with name and color', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithTheme(<TopicForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('e.g. Work, Personal, Ideas'), {
      target: { value: 'Personal' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Topic' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Personal', color: expect.any(String) })
      );
    });
  });

  it('renders color dots', () => {
    renderWithTheme(<TopicForm onSubmit={vi.fn()} />);
    // There should be 10 color dots (buttons of type "button")
    const colorButtons = screen.getAllByRole('button').filter(
      btn => btn.getAttribute('type') === 'button' && btn.textContent === ''
    );
    expect(colorButtons.length).toBeGreaterThanOrEqual(10);
  });
});
