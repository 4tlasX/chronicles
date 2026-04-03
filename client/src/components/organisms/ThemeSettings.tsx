import styled from 'styled-components';
import { ColorPicker } from '../molecules/ColorPicker.js';
import { BackgroundPicker } from '../molecules/BackgroundPicker.js';
import { useUIStore } from '../../stores/uiStore.js';
import { settings as settingsApi } from '../../services/api.js';
import { HEADER_COLORS } from '@shared/theme/accentColors';

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.h3.fontFamily};
  font-size: ${({ theme }) => theme.typography.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.h3.fontWeight};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ThemeModeToggle = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  font-weight: ${({ $active, theme }) => $active ? theme.fontWeight.semibold : theme.fontWeight.normal};
  color: ${({ $active, theme }) => $active ? theme.colors.textInverse : theme.colors.text};
  background: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.surfaceHover};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export function ThemeSettings() {
  const themeMode = useUIStore(s => s.themeMode);
  const setThemeMode = useUIStore(s => s.setThemeMode);
  const headerColor = useUIStore(s => s.headerColor);
  const setHeaderColor = useUIStore(s => s.setHeaderColor);
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const setBackgroundImage = useUIStore(s => s.setBackgroundImage);
  const backgroundOpacity = useUIStore(s => s.backgroundOpacity);
  const setBackgroundOpacity = useUIStore(s => s.setBackgroundOpacity);

  const handleThemeModeChange = async (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    await settingsApi.upsert('themeMode', mode).catch(() => {});
  };

  const handleColorChange = async (color: string) => {
    setHeaderColor(color);
    await settingsApi.upsert('headerColor', color).catch(() => {});
  };

  const handleImageChange = async (image: string) => {
    setBackgroundImage(image);
    await settingsApi.upsert('backgroundImage', image).catch(() => {});
  };

  const handleOpacityChange = async (opacity: number) => {
    setBackgroundOpacity(opacity);
    await settingsApi.upsert('backgroundOpacity', String(opacity)).catch(() => {});
  };

  return (
    <>
      <Section>
        <SectionTitle>Theme</SectionTitle>
        <ThemeModeToggle>
          <ModeButton $active={themeMode === 'light'} onClick={() => handleThemeModeChange('light')}>
            Light
          </ModeButton>
          <ModeButton $active={themeMode === 'dark'} onClick={() => handleThemeModeChange('dark')}>
            Dark
          </ModeButton>
        </ThemeModeToggle>
      </Section>

      <Section>
        <SectionTitle>Header Color</SectionTitle>
        <ColorPicker
          colors={HEADER_COLORS}
          selected={headerColor}
          onChange={handleColorChange}
        />
      </Section>

      <Section>
        <SectionTitle>Background</SectionTitle>
        <BackgroundPicker
          selected={backgroundImage}
          onImageChange={handleImageChange}
        />
      </Section>
    </>
  );
}
