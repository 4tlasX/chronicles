import styled from 'styled-components';
import { Spinner } from '../atoms/Spinner.js';

const Panel = styled.div<{ $hasFields?: boolean }>`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  padding-top: ${({ $hasFields }) => $hasFields ? 16 : 8}px;
  padding-bottom: 16px;
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
    font-size: 14px;
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
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(0,0,0,0.04); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Status = styled.span<{ $error?: boolean }>`
  font-size: 12px;
  color: ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.success};
`;

const EditTitle = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
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
        <ActionBtn onClick={onSave} disabled={saving}>
          {saving ? <Spinner size={14} /> : 'Save'}
        </ActionBtn>
        <ActionBtn onClick={onCancel}>Cancel</ActionBtn>
        {status && <Status $error={status.toLowerCase().includes('fail')}>{status}</Status>}
      </Actions>
    </Panel>
  );
}
