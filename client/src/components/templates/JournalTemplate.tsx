import styled from 'styled-components';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '../../stores/uiStore.js';
const ContentArea = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const StyledSidePanel = styled.div<{ $hiddenMobile?: boolean; $isDark?: boolean }>`
  width: 380px;
  min-width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: ${({ $isDark }) => $isDark ? 'rgba(26, 24, 21, 0.90)' : 'rgba(240, 235, 223, 0.90)'};
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 1024px) {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    display: ${({ $hiddenMobile }) => $hiddenMobile ? 'none' : 'flex'};
  }
`;

const StyledEditorPanel = styled.div<{ $visibleMobile?: boolean; $isDark?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ $isDark }) => $isDark ? 'rgba(26, 24, 21, 0.90)' : 'rgba(240, 235, 223, 0.90)'};

  @media (max-width: 1024px) {
    display: ${({ $visibleMobile }) => $visibleMobile ? 'flex' : 'none'};
    width: 100%;
  }
`;

const StyledMobileBackButton = styled.button`
  display: none;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text}; }

  @media (max-width: 1024px) {
    display: flex;
  }
`;

/* ── Exported sub-components ── */

interface SidePanelProps {
  hiddenMobile?: boolean;
  children: ReactNode;
}

export function SidePanel({ hiddenMobile, children }: SidePanelProps) {
  const isDark = useUIStore(s => s.themeMode) === 'dark';
  return <StyledSidePanel $hiddenMobile={hiddenMobile} $isDark={isDark}>{children}</StyledSidePanel>;
}

interface EditorPanelProps {
  visibleMobile?: boolean;
  children: ReactNode;
}

export function EditorPanel({ visibleMobile, children }: EditorPanelProps) {
  const isDark = useUIStore(s => s.themeMode) === 'dark';
  return <StyledEditorPanel $visibleMobile={visibleMobile} $isDark={isDark}>{children}</StyledEditorPanel>;
}

interface MobileBackButtonProps {
  onClick: () => void;
}

export function MobileBackButton({ onClick }: MobileBackButtonProps) {
  return (
    <StyledMobileBackButton onClick={onClick}>
      <FontAwesomeIcon icon={faChevronLeft} size="xs" />
      Back to entries
    </StyledMobileBackButton>
  );
}

/* ── Main template ── */

interface JournalTemplateProps {
  sidePanel: ReactNode;
  editorPanel: ReactNode;
}

/** Two-panel journal layout: side panel (list) + editor panel. */
export function JournalTemplate({ sidePanel, editorPanel }: JournalTemplateProps) {
  return (
    <ContentArea>
      {sidePanel}
      {editorPanel}
    </ContentArea>
  );
}
