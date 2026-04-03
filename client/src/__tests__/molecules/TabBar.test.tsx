import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { TabBar } from '@/components/molecules/TabBar';
import { renderWithTheme } from '../testUtils';

const tabs = [
  { value: 'entries', label: 'Entries' },
  { value: 'goals', label: 'Goals' },
  { value: 'health', label: 'Health' },
];

describe('TabBar', () => {
  it('renders all tabs', () => {
    renderWithTheme(
      <TabBar tabs={tabs} active="entries" onChange={() => {}} accentColor="#4281a4" />,
    );
    expect(screen.getByText('Entries')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('calls onChange when a tab is clicked', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TabBar tabs={tabs} active="entries" onChange={onChange} accentColor="#4281a4" />,
    );
    fireEvent.click(screen.getByText('Goals'));
    expect(onChange).toHaveBeenCalledWith('goals');
  });

  it('renders with ReactNode labels', () => {
    const richTabs = [
      { value: 'a', label: <span data-testid="icon-tab">Tab A</span> },
    ];
    renderWithTheme(
      <TabBar tabs={richTabs} active="a" onChange={() => {}} accentColor="#000" />,
    );
    expect(screen.getByTestId('icon-tab')).toBeInTheDocument();
  });
});
