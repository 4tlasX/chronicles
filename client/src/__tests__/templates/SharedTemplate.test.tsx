import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { SharedTemplate } from '@/components/templates/SharedTemplate';
import { renderWithTheme } from '../testUtils';

describe('SharedTemplate', () => {
  it('renders children', () => {
    renderWithTheme(
      <SharedTemplate>
        <p data-testid="shared-content">Shared entry</p>
      </SharedTemplate>
    );
    expect(screen.getByTestId('shared-content')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    renderWithTheme(
      <SharedTemplate>
        <h1>Title</h1>
        <p>Body text</p>
        <footer>Footer</footer>
      </SharedTemplate>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('does not render header or navigation (public template)', () => {
    renderWithTheme(
      <SharedTemplate>
        <div>public content</div>
      </SharedTemplate>
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('renders as a centered flex column layout', () => {
    const { container } = renderWithTheme(
      <SharedTemplate>
        <div>content</div>
      </SharedTemplate>
    );
    const wrapper = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(wrapper);
    expect(styles.display).toBe('flex');
    expect(styles.flexDirection).toBe('column');
    expect(styles.alignItems).toBe('center');
  });
});
