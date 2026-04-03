import styled from 'styled-components';
import type { ReactNode } from 'react';
import { Header } from '../organisms/Header.js';
import { Background } from '../organisms/Background.js';
import { useUIStore } from '../../stores/uiStore.js';

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

const MainContent = styled.main<{ $hasBackground?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: ${({ $hasBackground, theme }) => $hasBackground ? theme.colors.surfaceOverlay : theme.colors.surfaceOverlay};
`;

interface ContentTemplateProps {
  children: ReactNode;
}

/** Full-height template with Header + blurred content area. No sidebar. */
export function ContentTemplate({ children }: ContentTemplateProps) {
  const hasBackground = !!useUIStore(s => s.backgroundImage);
  return (
    <>
      <Background />
      <Layout>
        <Header />
        <Body>
          <MainContent $hasBackground={hasBackground}>{children}</MainContent>
        </Body>
      </Layout>
    </>
  );
}
