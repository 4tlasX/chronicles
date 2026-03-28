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
  flex: 1;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
`;

const Content = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSize.xl}px;
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

interface SettingsTemplateProps {
  title: string;
  children: ReactNode;
}

export function SettingsTemplate({ title, children }: SettingsTemplateProps) {
  return (
    <>
      <Background />
      <Layout>
        <Header />
        <Body>
          <Content>
            {title && <PageTitle>{title}</PageTitle>}
            {children}
          </Content>
        </Body>
      </Layout>
    </>
  );
}
