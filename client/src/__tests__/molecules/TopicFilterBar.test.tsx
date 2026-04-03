import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { TopicFilterBar } from '@/components/molecules/TopicFilterBar';
import { renderWithTheme } from '../testUtils';
import { faBook } from '@fortawesome/free-solid-svg-icons';

describe('TopicFilterBar', () => {
  const baseProps = {
    icon: faBook,
    iconColor: '#4281a4',
    topicName: 'Work',
    onClear: vi.fn(),
  };

  it('renders the topic name', () => {
    renderWithTheme(<TopicFilterBar {...baseProps} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('renders "Filtering by:" label', () => {
    renderWithTheme(<TopicFilterBar {...baseProps} />);
    expect(screen.getByText(/Filtering by:/)).toBeInTheDocument();
  });

  it('renders Clear button', () => {
    renderWithTheme(<TopicFilterBar {...baseProps} />);
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('calls onClear when Clear is clicked', () => {
    const onClear = vi.fn();
    renderWithTheme(<TopicFilterBar {...baseProps} onClear={onClear} />);
    fireEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('renders the icon', () => {
    const { container } = renderWithTheme(<TopicFilterBar {...baseProps} />);
    // Should have svg icons (topic icon + xmark)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });
});
