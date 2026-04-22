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

const BodyRow = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const Body = styled.div<{ $hasBackground?: boolean }>`
  flex: 1;
  overflow-y: auto;
  background: ${({ $hasBackground, theme }) => $hasBackground ? theme.colors.surfaceOverlay : 'var(--paper)'};
`;

const Content = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.h1.fontFamily};
  font-size: ${({ theme }) => theme.typography.h1.fontSize};
  font-weight: ${({ theme }) => theme.typography.h1.fontWeight};
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

interface SettingsTemplateProps {
  title: string;
  children: ReactNode;
}

export function SettingsTemplate({ title, children }: SettingsTemplateProps) {
  const backgroundImage = useUIStore(s => s.backgroundImage);
  return (
    <>
      <Background />
      <Layout>
        <Header />
        <BodyRow>
          <div data-print-hide><Sidebar /></div>
          <Body $hasBackground={!!backgroundImage}>
            <Content>
              {title && <PageTitle>{title}</PageTitle>}
              {children}
            </Content>
          </Body>
        </BodyRow>
      </Layout>
    </>
  );
}
