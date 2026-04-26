import styled from 'styled-components';
import type { ReactNode } from 'react';
import { Header } from '../organisms/Header.js';
import { Sidebar } from '../organisms/Sidebar.js';
import { Background } from '../organisms/Background.js';
import { useUIStore } from '../../stores/uiStore.js';
import { BACKGROUND_IMAGES } from '@chronicles/shared';

const SkipLink = styled.a`
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 9999;
  padding: 8px 16px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  text-decoration: none;
  border: 2px solid ${({ theme }) => theme.colors.borderFocus};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;

  &:focus {
    position: fixed;
    left: 8px;
    top: 8px;
    width: auto;
    height: auto;
  }
`;

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const MainContent = styled.main<{ $transparent?: boolean; $hasBackground?: boolean; $lightBg?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: ${({ $transparent }) => $transparent ? 'hidden' : 'auto'};
  background: ${({ $transparent, $hasBackground, $lightBg, theme }) =>
    $transparent ? 'transparent' : $hasBackground ? ($lightBg ? theme.colors.surfaceOverlayLight : theme.colors.surfaceOverlay) : 'var(--paper)'};
  padding-bottom: 0;
`;

interface AppTemplateProps {
  children: ReactNode;
  hideSidebar?: boolean;
  transparentContent?: boolean;
}

export function AppTemplate({ children, hideSidebar, transparentContent }: AppTemplateProps) {
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const isLightBg = BACKGROUND_IMAGES.find(bg => bg.value === backgroundImage)?.light ?? false;
  return (
    <>
      <Background />
      <Layout>
        <SkipLink href="#main-content">Skip to content</SkipLink>
        <Header />
        <Body>
          {!hideSidebar && <Sidebar />}
          <MainContent id="main-content" $transparent={transparentContent} $hasBackground={!!backgroundImage} $lightBg={isLightBg}>{children}</MainContent>
        </Body>
      </Layout>
    </>
  );
}
