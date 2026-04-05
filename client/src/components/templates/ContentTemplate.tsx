import styled from 'styled-components';
import type { ReactNode } from 'react';
import { Header } from '../organisms/Header.js';
import { Background } from '../organisms/Background.js';
import { useUIStore } from '../../stores/uiStore.js';

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Main = styled.main<{ $hasBackground?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: ${({ $hasBackground, theme }) => $hasBackground ? theme.colors.surfaceOverlay : theme.colors.surfaceOverlay};
`;

interface ContentTemplateProps {
  children: ReactNode;
}

/** Full-height template with Header + scrollable content area. No sidebar. */
export function ContentTemplate({ children }: ContentTemplateProps) {
  const hasBackground = !!useUIStore(s => s.backgroundImage);
  return (
    <>
      <Background />
      <Layout>
        <Header />
        <Main $hasBackground={hasBackground}>{children}</Main>
      </Layout>
    </>
  );
}
