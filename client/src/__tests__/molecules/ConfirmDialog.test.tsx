import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { renderWithTheme } from '../testUtils';

describe('ConfirmDialog', () => {
  const baseProps = {
    open: true,
    title: 'Delete Entry',
    message: 'Are you sure you want to delete this entry?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders title and message when open', () => {
    renderWithTheme(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText('Delete Entry')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this entry?')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    renderWithTheme(<ConfirmDialog {...baseProps} open={false} />);
    expect(screen.queryByText('Delete Entry')).not.toBeInTheDocument();
  });

  it('uses default button labels', () => {
    renderWithTheme(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('uses custom button labels', () => {
    renderWithTheme(
      <ConfirmDialog {...baseProps} confirmLabel="Yes, delete" cancelLabel="No, keep" />,
    );
    expect(screen.getByText('Yes, delete')).toBeInTheDocument();
    expect(screen.getByText('No, keep')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    renderWithTheme(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    renderWithTheme(<ConfirmDialog {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
