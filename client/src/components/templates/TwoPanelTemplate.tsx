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
}

/** Full-height template with Header + two-panel content area (sidebar + main). */
export function TwoPanelTemplate({ children }: TwoPanelTemplateProps) {
  return (
    <>
      <Background />
      <Layout>
        <Header />
        <Body>{children}</Body>
      </Layout>
    </>
  );
}
