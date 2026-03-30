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

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.9);
`;

interface ContentTemplateProps {
  children: ReactNode;
}

/** Full-height template with Header + blurred content area. No sidebar. */
export function ContentTemplate({ children }: ContentTemplateProps) {
  return (
    <>
      <Background />
      <Layout>
        <Header />
        <Body>
          <MainContent>{children}</MainContent>
        </Body>
      </Layout>
    </>
  );
}
