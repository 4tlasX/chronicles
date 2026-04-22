import styled from 'styled-components';

interface WatermarkProps {
  src?: string;
  dark?: boolean;
}

const WatermarkLayer = styled.div<{ $src?: string; $dark: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: ${({ $src }) => $src ? `url('${$src}')` : 'none'};
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: cover;
  opacity: ${({ $dark }) => $dark ? 0.06 : 0.08};
  mix-blend-mode: ${({ $dark }) => $dark ? 'soft-light' : 'multiply'};
`;

export function Watermark({ src, dark = false }: WatermarkProps) {
  if (!src) return null;
  return <WatermarkLayer $src={src} $dark={dark} />;
}
