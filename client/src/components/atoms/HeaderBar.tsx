import styled from 'styled-components';
import type { ReactNode, CSSProperties } from 'react';

interface HeaderBarProps {
  children?: ReactNode;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  accentColor?: string;
  dark?: boolean;
  height?: number;
  style?: CSSProperties;
  className?: string;
}

export const HeaderBarShell = styled.header<{ $accent: string; $height: number }>`
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: ${({ $height }) => $height}px;
  background: ${({ $accent }) => $accent};
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
`;

const Zone = styled.div<{ $flex?: number; $justify?: string }>`
  display: flex;
  align-items: center;
  flex: ${({ $flex }) => $flex ?? 1};
  justify-content: ${({ $justify }) => $justify ?? 'flex-start'};
`;

export function HeaderBar({ children, left, center, right, accentColor = '#2d2c2a', dark = false, height = 52, style, className }: HeaderBarProps) {
  if (children) {
    return <HeaderBarShell $accent={accentColor} $height={height} style={style} className={className}>{children}</HeaderBarShell>;
  }
  return (
    <HeaderBarShell $accent={accentColor} $height={height} style={style} className={className}>
      <Zone $flex={1} $justify="flex-start">{left}</Zone>
      {center && <Zone $flex={0} $justify="center">{center}</Zone>}
      <Zone $flex={1} $justify="flex-end">{right}</Zone>
    </HeaderBarShell>
  );
}
