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

/* 3px accent stripe pinned to the very top of the app chrome (DS signature). */
const AccentStripe = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-accent, ${({ theme }) => theme.colors.accent});
  z-index: 1000;
  pointer-events: none;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  overflow: hidden;
  padding-top: 3px;
`;

/* Main column: header bar + content, to the right of the sidebar. */
const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
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
      <AccentStripe />
      <Background />
      <Layout>
        <SkipLink href="#main-content">Skip to content</SkipLink>
        {!hideSidebar && <Sidebar />}
        <MainColumn>
          <Header />
          <MainContent id="main-content" $transparent={transparentContent} $hasBackground={!!backgroundImage} $lightBg={isLightBg}>{children}</MainContent>
        </MainColumn>
      </Layout>
    </>
  );
}
