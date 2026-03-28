import styled from 'styled-components';
import { useUIStore } from '../../stores/uiStore.js';

const BackgroundWrapper = styled.div<{ $image: string }>`
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: ${({ theme }) => theme.colors.background};
  background-image: ${({ $image }) => $image ? `url(${$image})` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: opacity 0.2s;
`;

export function Background() {
  const backgroundImage = useUIStore(s => s.backgroundImage);
  return <BackgroundWrapper $image={backgroundImage} />;
}
