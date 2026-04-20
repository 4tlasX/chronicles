import styled from 'styled-components';
import { Spinner } from '../atoms/Spinner.js';

function isDark(bg: string): boolean {
  const c = bg.replace('#', '');
  if (c.length !== 6) return false;
  return (0.299 * parseInt(c.slice(0,2),16) + 0.587 * parseInt(c.slice(2,4),16) + 0.114 * parseInt(c.slice(4,6),16)) / 255 < 0.5;
}

const overlay = (theme: { colors: { background: string } }, alpha: number) =>
  isDark(theme.colors.background)
    ? `rgba(255,255,255,${alpha})`
    : `rgba(0,0,0,${alpha})`;

const Panel = styled.div<{ $hasFields?: boolean }>`
  background: transparent;
  border-radius: 10px;
  margin: 8px 8px 16px;
  padding-top: ${({ $hasFields }) => $hasFields ? 28 : 20}px;
  padding-bottom: 20px;

  & input, & select, & textarea {
    border-color: ${({ theme }) => theme.colors.border};
  }
`;

const EditorWrap = styled.div<{ $bordered?: boolean }>`
  margin: 8px 24px 0 50px;
  border: ${({ $bordered, theme }) => $bordered ? `1px solid ${theme.colors.border}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  overflow: hidden;
  @media (max-width: 768px) { margin: 0 16px 0 40px; }
  @media (max-width: 480px) { margin: 0 12px; }

  /* Compact the TipTap editor for inline use */
  & > div { min-height: unset; }
  && .tiptap {
    min-height: 60px;
    padding: 8px 12px;
    font-size: 16px;
    line-height: 1.6;
  }
`;

const FieldsWrap = styled.div`
  padding: 12px 24px 20px 50px;
  @media (max-width: 768px) { padding: 12px 16px 18px 40px; }
  @media (max-width: 480px) { padding: 10px 12px 16px; }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px 8px 50px;
  border-radius: 0;
  flex-wrap: wrap;
  @media (max-width: 768px) { padding: 16px 16px 8px 40px; }
  @media (max-width: 480px) { padding: 12px 12px 8px; gap: 8px; }
`;

const ActionBtn = styled.button`
  padding: 6px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => overlay(theme, 0.08)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => overlay(theme, 0.14)}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SaveBtn = styled.button<{ $error?: boolean }>`
  padding: 6px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.text};
  background: ${({ theme }) => overlay(theme, 0.08)};
  border: 1px solid ${({ $error, theme }) => $error ? 'rgba(220,50,50,0.6)' : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  min-width: 60px;
  &:hover:not(:disabled) { background: ${({ theme }) => overlay(theme, 0.14)}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EditTitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 24px 8px 50px;
  @media (max-width: 768px) { padding: 0 16px 8px 40px; }
  @media (max-width: 480px) { padding: 0 12px 8px; }
`;

interface InlineEditPanelProps {
  editor: React.ReactNode;
  fields: React.ReactNode;
  accentColor: string;
  saving: boolean;
  status: string;
  onSave: () => void;
  onCancel: () => void;
  title?: string;
  topicSelector?: React.ReactNode;
}

export function InlineEditPanel({ editor, fields, accentColor, saving, status, onSave, onCancel, title, topicSelector }: InlineEditPanelProps) {
  return (
    <Panel $hasFields={!!fields}>
      {title && <EditTitle>{title}</EditTitle>}
      {topicSelector && <FieldsWrap>{topicSelector}</FieldsWrap>}
      <EditorWrap $bordered={!!fields}>{editor}</EditorWrap>
      {fields && <FieldsWrap>{fields}</FieldsWrap>}
      <Actions>
        <SaveBtn
          onClick={onSave}
          disabled={saving}
          $error={status.toLowerCase().includes('fail')}
        >
          {saving ? <Spinner size={14} /> : status.toLowerCase().includes('fail') ? 'Failed' : 'Save'}
        </SaveBtn>
        <ActionBtn onClick={onCancel}>Cancel</ActionBtn>
      </Actions>
    </Panel>
  );
}
