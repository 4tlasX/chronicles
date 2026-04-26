import styled from 'styled-components';
import type { ReactNode } from 'react';
import { Header } from '../organisms/Header.js';
import { Sidebar } from '../organisms/Sidebar.js';
import { Background } from '../organisms/Background.js';
import { useUIStore } from '../../stores/uiStore.js';
import { BACKGROUND_IMAGES } from '@chronicles/shared';

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

const Main = styled.main<{ $lightBg?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
  background: ${({ $lightBg, theme }) => $lightBg ? theme.colors.surfaceOverlayLight : theme.colors.surfaceOverlay};
`;

interface ContentTemplateProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

/** Full-height template with Header + optional left sidebar + scrollable content area. */
export function ContentTemplate({ children, hideSidebar }: ContentTemplateProps) {
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const isLightBg = BACKGROUND_IMAGES.find(bg => bg.value === backgroundImage)?.light ?? false;
  return (
    <>
      <div data-print-hide><Background /></div>
      <Layout>
        <div data-print-hide><Header /></div>
        <Body>
          {!hideSidebar && <div data-print-hide><Sidebar /></div>}
          <Main $lightBg={isLightBg}>{children}</Main>
        </Body>
      </Layout>
    </>
  );
}
