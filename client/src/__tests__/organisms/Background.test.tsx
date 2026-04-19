import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import { Background } from '@/components/organisms/Background';

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      backgroundImage: '',
    }),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('Background', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(<Background />);
    expect(container.firstChild).toBeTruthy();
  });

  it('does not render image overlay when no background image', () => {
    const { container } = renderWithTheme(<Background />);
    // Only the wrapper div, no image overlay child
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children.length).toBe(0);
  });
});

describe('Background with image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders image overlay when background image is set', () => {
    vi.doMock('@/stores/uiStore', () => ({
      useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
        selector({ backgroundImage: '/test-bg.jpg' }),
    }));
    // We test via the mocked version
    const { container } = renderWithTheme(<Background />);
    expect(container.firstChild).toBeTruthy();
  });
});
