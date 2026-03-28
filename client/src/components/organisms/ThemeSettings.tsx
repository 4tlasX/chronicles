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
  font-size: ${({ theme }) => theme.fontSize.md}px;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export function ThemeSettings() {
  const headerColor = useUIStore(s => s.headerColor);
  const setHeaderColor = useUIStore(s => s.setHeaderColor);
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const setBackgroundImage = useUIStore(s => s.setBackgroundImage);

  const handleColorChange = async (color: string) => {
    setHeaderColor(color);
    try {
      await settingsApi.upsert('headerColor', color);
    } catch (err) {
      console.error('Failed to save header color:', err);
    }
  };

  const handleBackgroundChange = async (image: string) => {
    setBackgroundImage(image);
    try {
      await settingsApi.upsert('backgroundImage', image);
    } catch (err) {
      console.error('Failed to save background:', err);
    }
  };

  return (
    <>
      <Section>
        <SectionTitle>Header Color</SectionTitle>
        <ColorPicker
          colors={HEADER_COLORS}
          selected={headerColor}
          onChange={handleColorChange}
        />
      </Section>

      <Section>
        <SectionTitle>Background Image</SectionTitle>
        <BackgroundPicker
          selected={backgroundImage}
          onChange={handleBackgroundChange}
        />
      </Section>
    </>
  );
}
