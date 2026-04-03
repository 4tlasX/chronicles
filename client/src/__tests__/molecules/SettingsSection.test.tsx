import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@shared/theme/tokens';
import {
  HeaderRow,
  Title,
  SectionTitle,
  SectionDescription,
  DangerTitle,
  CollapsibleHeader,
  CollapsibleTitle,
  CollapsibleDesc,
  CollapsibleBody,
  PrivacyCard,
  DangerCard,
  PasswordForm,
  SessionsList,
  SessionItem,
  ColorSection,
  ColorSectionTitle,
  ColorSectionDesc,
} from '@/components/molecules/SettingsSection';

function renderThemed(ui: React.ReactElement) {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
}

describe('SettingsSection styled components', () => {
  it('renders HeaderRow', () => {
    renderThemed(<HeaderRow data-testid="hr">content</HeaderRow>);
    expect(screen.getByTestId('hr')).toBeInTheDocument();
  });

  it('renders Title', () => {
    renderThemed(<Title>Settings</Title>);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders SectionTitle', () => {
    renderThemed(<SectionTitle>Appearance</SectionTitle>);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('renders SectionDescription', () => {
    renderThemed(<SectionDescription>Customize your theme</SectionDescription>);
    expect(screen.getByText('Customize your theme')).toBeInTheDocument();
  });

  it('renders DangerTitle with danger color', () => {
    renderThemed(<DangerTitle>Danger Zone</DangerTitle>);
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  it('renders CollapsibleHeader', () => {
    renderThemed(<CollapsibleHeader data-testid="ch">Header</CollapsibleHeader>);
    expect(screen.getByTestId('ch')).toBeInTheDocument();
  });

  it('renders CollapsibleTitle and CollapsibleDesc', () => {
    renderThemed(
      <>
        <CollapsibleTitle>Title</CollapsibleTitle>
        <CollapsibleDesc>Description</CollapsibleDesc>
      </>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders CollapsibleBody', () => {
    renderThemed(<CollapsibleBody>Body content</CollapsibleBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('renders PrivacyCard', () => {
    renderThemed(<PrivacyCard>Privacy info</PrivacyCard>);
    expect(screen.getByText('Privacy info')).toBeInTheDocument();
  });

  it('renders DangerCard', () => {
    renderThemed(<DangerCard data-testid="dc">Danger content</DangerCard>);
    expect(screen.getByTestId('dc')).toBeInTheDocument();
  });

  it('renders PasswordForm', () => {
    renderThemed(<PasswordForm data-testid="pf">Form</PasswordForm>);
    expect(screen.getByTestId('pf')).toBeInTheDocument();
  });

  it('renders SessionsList and SessionItem', () => {
    renderThemed(
      <SessionsList>
        <SessionItem data-testid="si">Session 1</SessionItem>
      </SessionsList>,
    );
    expect(screen.getByTestId('si')).toBeInTheDocument();
  });

  it('renders ColorSection components', () => {
    renderThemed(
      <ColorSection>
        <ColorSectionTitle>Header Color</ColorSectionTitle>
        <ColorSectionDesc>Choose your color</ColorSectionDesc>
      </ColorSection>,
    );
    expect(screen.getByText('Header Color')).toBeInTheDocument();
    expect(screen.getByText('Choose your color')).toBeInTheDocument();
  });
});
