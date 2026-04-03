import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { SettingsCard, SettingsRow } from '@/components/molecules/SettingsCard';
import { renderWithTheme } from '../testUtils';

describe('SettingsCard', () => {
  it('renders children', () => {
    renderWithTheme(
      <SettingsCard>
        <div data-testid="child">Card content</div>
      </SettingsCard>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('SettingsRow', () => {
  it('renders title', () => {
    renderWithTheme(
      <SettingsCard>
        <SettingsRow title="Dark Mode" />
      </SettingsCard>,
    );
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    renderWithTheme(
      <SettingsCard>
        <SettingsRow title="Theme" description="Choose light or dark" />
      </SettingsCard>,
    );
    expect(screen.getByText('Choose light or dark')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    renderWithTheme(
      <SettingsCard>
        <SettingsRow title="Theme" />
      </SettingsCard>,
    );
    expect(screen.queryByText('Choose')).not.toBeInTheDocument();
  });

  it('renders action slot', () => {
    renderWithTheme(
      <SettingsCard>
        <SettingsRow title="Toggle" action={<button>Switch</button>} />
      </SettingsCard>,
    );
    expect(screen.getByText('Switch')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderWithTheme(
      <SettingsCard>
        <SettingsRow title="Custom">
          <span data-testid="custom">Extra content</span>
        </SettingsRow>
      </SettingsCard>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });
});
