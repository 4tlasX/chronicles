import styled from 'styled-components';
import type { ReactNode } from 'react';
import { Header } from '../organisms/Header.js';
import { Background } from '../organisms/Background.js';

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

interface TwoPanelTemplateProps {
  children: ReactNode;
  topBar?: ReactNode;
}

/** Full-height template with Header + optional full-width topBar + two-panel content area (sidebar + main). */
export function TwoPanelTemplate({ children, topBar }: TwoPanelTemplateProps) {
  return (
    <>
      <Background />
      <Layout>
        <Header />
        {topBar}
        <Body>{children}</Body>
      </Layout>
    </>
  );
}
