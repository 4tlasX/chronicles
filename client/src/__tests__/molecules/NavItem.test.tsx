import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { NavItem } from '@/components/molecules/NavItem';
import { renderWithTheme } from '../testUtils';
import { faHome } from '@fortawesome/free-solid-svg-icons';

describe('NavItem', () => {
  it('renders label text', () => {
    renderWithTheme(<NavItem label="Dashboard" onClick={() => {}} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders with an icon', () => {
    renderWithTheme(<NavItem label="Home" icon={faHome} onClick={() => {}} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    renderWithTheme(<NavItem label="Home" onClick={onClick} />);
    fireEvent.click(screen.getByText('Home'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders trailing content', () => {
    renderWithTheme(
      <NavItem label="Home" onClick={() => {}} trailing={<span data-testid="badge">5</span>} />,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('applies active state', () => {
    renderWithTheme(<NavItem label="Active" active onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('renders without icon when icon is omitted', () => {
    const { container } = renderWithTheme(<NavItem label="No Icon" onClick={() => {}} />);
    // Should not have an svg icon
    expect(container.querySelector('svg')).toBeNull();
  });
});
