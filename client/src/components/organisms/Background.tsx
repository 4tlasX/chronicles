import styled from 'styled-components';
import { useUIStore } from '../../stores/uiStore';

const BackgroundWrapper = styled.div<{ $image?: string; $opacity: number; $dark: boolean }>`
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: var(--paper, ${({ theme }) => theme.colors.background});

  ${({ $image, $opacity, $dark }) =>
    $image
      ? `
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url(${$image});
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: ${$opacity * ($dark ? 0.35 : 0.6)};
    }
  `
      : ''}
`;

export function Background() {
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const backgroundOpacity = useUIStore(s => s.backgroundOpacity);
  const themeMode = useUIStore(s => s.themeMode);

  return (
    <BackgroundWrapper
      $image={backgroundImage || undefined}
      $opacity={backgroundOpacity ?? 0.7}
      $dark={themeMode === 'dark'}
    />
  );
}
