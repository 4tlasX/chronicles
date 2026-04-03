import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { FilterTabs } from '@/components/molecules/FilterTabs';
import { renderWithTheme } from '../testUtils';

const options = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

describe('FilterTabs', () => {
  it('renders all tab options', () => {
    renderWithTheme(
      <FilterTabs options={options} active="all" onChange={() => {}} />,
    );
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls onChange with the tab value when clicked', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <FilterTabs options={options} active="all" onChange={onChange} />,
    );
    fireEvent.click(screen.getByText('Active'));
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('renders with empty options without crashing', () => {
    renderWithTheme(
      <FilterTabs options={[]} active="" onChange={() => {}} />,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
