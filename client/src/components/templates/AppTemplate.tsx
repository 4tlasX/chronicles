import styled from 'styled-components';
import type { ReactNode } from 'react';
import { Header } from '../organisms/Header.js';
import { Sidebar } from '../organisms/Sidebar.js';
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

const MainContent = styled.main<{ $transparent?: boolean; $hasBackground?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: ${({ $transparent }) => $transparent ? 'hidden' : 'auto'};
  background: ${({ $transparent, $hasBackground, theme }) =>
    $transparent ? 'transparent' : $hasBackground ? theme.colors.surfaceOverlay : theme.colors.surfaceOverlay};
`;

interface AppTemplateProps {
  children: ReactNode;
  hideSidebar?: boolean;
  transparentContent?: boolean;
}

export function AppTemplate({ children, hideSidebar, transparentContent }: AppTemplateProps) {
  return (
    <>
      <Background />
      <Layout>
        <Header />
        <Body>
          {!hideSidebar && <Sidebar />}
          <MainContent $transparent={transparentContent}>{children}</MainContent>
        </Body>
      </Layout>
    </>
  );
}
