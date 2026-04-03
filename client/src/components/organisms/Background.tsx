import styled from 'styled-components';
import { useUIStore } from '../../stores/uiStore.js';
import { useTheme } from 'styled-components';

const BackgroundWrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ImageOverlay = styled.div<{ $image: string; $opacity: number }>`
  position: absolute;
  inset: 0;
  background-image: ${({ $image }) => `url(${$image})`};
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
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
  const opacity = isDarkTheme(theme.colors.background) ? 0.3 : 0.6;

  return (
    <BackgroundWrapper>
      {backgroundImage && (
        <ImageOverlay $image={backgroundImage} $opacity={opacity} />
      )}
    </BackgroundWrapper>
  );
}
