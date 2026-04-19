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

const StyledSidePanel = styled.div<{ $hiddenMobile?: boolean; $hasBackground?: boolean }>`
  width: 33%;
  min-width: 320px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 1024px) {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    display: ${({ $hiddenMobile }) => $hiddenMobile ? 'none' : 'flex'};
  }
`;

const StyledEditorPanel = styled.div<{ $visibleMobile?: boolean; $hasBackground?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${({ $hasBackground, theme }) => $hasBackground ? theme.colors.surfaceOverlay : theme.colors.surfaceOverlay};

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
  const hasBackground = !!useUIStore(s => s.backgroundImage);
  return <StyledSidePanel $hiddenMobile={hiddenMobile} $hasBackground={hasBackground}>{children}</StyledSidePanel>;
}

interface EditorPanelProps {
  visibleMobile?: boolean;
  children: ReactNode;
}

export function EditorPanel({ visibleMobile, children }: EditorPanelProps) {
  const hasBackground = !!useUIStore(s => s.backgroundImage);
  return <StyledEditorPanel $visibleMobile={visibleMobile} $hasBackground={hasBackground}>{children}</StyledEditorPanel>;
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
