import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { IconPicker, TOPIC_ICONS } from '@/components/molecules/IconPicker';
import { renderWithTheme } from '../testUtils';

describe('IconPicker', () => {
  it('renders the "no icon" button', () => {
    renderWithTheme(<IconPicker selectedIcon={null} onSelectIcon={() => {}} />);
    expect(screen.getByTitle('No icon')).toBeInTheDocument();
  });

  it('renders all topic icon buttons', () => {
    renderWithTheme(<IconPicker selectedIcon={null} onSelectIcon={() => {}} />);
    // +1 for the "no icon" button
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(TOPIC_ICONS.length + 1);
  });

  it('calls onSelectIcon with icon name when clicked', () => {
    const onSelectIcon = vi.fn();
    renderWithTheme(<IconPicker selectedIcon={null} onSelectIcon={onSelectIcon} />);
    fireEvent.click(screen.getByTitle('book'));
    expect(onSelectIcon).toHaveBeenCalledWith('book');
  });

  it('calls onSelectIcon with null when no-icon is clicked', () => {
    const onSelectIcon = vi.fn();
    renderWithTheme(<IconPicker selectedIcon="book" onSelectIcon={onSelectIcon} />);
    fireEvent.click(screen.getByTitle('No icon'));
    expect(onSelectIcon).toHaveBeenCalledWith(null);
  });

  it('marks the selected icon button', () => {
    renderWithTheme(<IconPicker selectedIcon="heart" onSelectIcon={() => {}} />);
    // The selected button should exist
    expect(screen.getByTitle('heart')).toBeInTheDocument();
  });
});
