import styled from 'styled-components';
import { useUIStore } from '../../stores/uiStore.js';
import { useTheme } from 'styled-components';
import { BACKGROUND_IMAGES } from '@shared/theme/backgrounds';

const BackgroundWrapper = styled.div`
  position: fixed;
  top: -100px;
  left: -100px;
  right: -100px;
  bottom: 0;
  z-index: -1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ImageOverlay = styled.div<{ $image: string; $opacity: number }>`
  position: absolute;
  inset: 0;
  background-image: ${({ $image }) => `url(${$image})`};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center bottom;
  opacity: ${({ $opacity }) => $opacity};
  pointer-events: none;
`;

function isDarkTheme(bg: string): boolean {
  const c = bg.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export function Background() {
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const theme = useTheme();
  const isBW = BACKGROUND_IMAGES.find(b => b.value === backgroundImage)?.bw ?? false;
  const opacity = isDarkTheme(theme.colors.background)
    ? (isBW ? 0.15 : 0.2)
    : (isBW ? 0.45 : 0.8);

  return (
    <BackgroundWrapper>
      {backgroundImage && (
        <ImageOverlay $image={backgroundImage} $opacity={opacity} />
      )}
    </BackgroundWrapper>
  );
}
