import styled from 'styled-components';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const StyledSidePanel = styled.div<{ $hiddenMobile?: boolean }>`
  width: 33%;
  min-width: 320px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.8);
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    display: ${({ $hiddenMobile }) => $hiddenMobile ? 'none' : 'flex'};
  }
`;

const StyledEditorPanel = styled.div<{ $visibleMobile?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.9);

  @media (max-width: 768px) {
    display: ${({ $visibleMobile }) => $visibleMobile ? 'flex' : 'none'};
    width: 100%;
  }
`;

const StyledMobileBackButton = styled.button`
  display: none;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text}; }

  @media (max-width: 768px) {
    display: flex;
  }
`;

/* ── Exported sub-components ── */

interface SidePanelProps {
  hiddenMobile?: boolean;
  children: ReactNode;
}

export function SidePanel({ hiddenMobile, children }: SidePanelProps) {
  return <StyledSidePanel $hiddenMobile={hiddenMobile}>{children}</StyledSidePanel>;
}

interface EditorPanelProps {
  visibleMobile?: boolean;
  children: ReactNode;
}

export function EditorPanel({ visibleMobile, children }: EditorPanelProps) {
  return <StyledEditorPanel $visibleMobile={visibleMobile}>{children}</StyledEditorPanel>;
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
