import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { TopicBadge } from '@/components/molecules/TopicBadge';
import { renderWithTheme } from '../testUtils';
import { faStar } from '@fortawesome/free-solid-svg-icons';

describe('TopicBadge', () => {
  it('renders the topic name', () => {
    renderWithTheme(<TopicBadge name="Work" color="#ff0000" />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('renders with an icon', () => {
    const { container } = renderWithTheme(
      <TopicBadge name="Favorites" color="#ffd700" icon={faStar} />,
    );
    expect(container.querySelector('svg')).toBeTruthy();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('renders without an icon when icon is omitted', () => {
    const { container } = renderWithTheme(
      <TopicBadge name="General" color="#333" />,
    );
    expect(container.querySelector('svg')).toBeNull();
  });
});
