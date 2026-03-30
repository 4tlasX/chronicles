import styled from 'styled-components';
import { Spinner } from '../atoms/Spinner.js';

const Panel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface || '#fafafa'};
`;

const EditorWrap = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  /* Compact the TipTap editor for inline use */
  & > div { min-height: unset; }
  .tiptap {
    min-height: 60px;
    max-height: 120px;
    overflow-y: auto;
    padding: 8px 12px;
  }
`;

const FieldsWrap = styled.div`
  padding: 12px 14px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg}px ${({ theme }) => theme.borderRadius.lg}px;
`;

const SaveBtn = styled.button<{ $color: string }>`
  padding: 6px 20px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  background: ${({ $color }) => $color};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  &:hover { opacity: 0.9; }
`;

const CancelBtn = styled.button`
  padding: 6px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  &:hover { background: rgba(0,0,0,0.04); }
`;

const DeleteBtn = styled.button`
  padding: 6px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
  background: none;
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  margin-left: auto;
  &:hover { background: rgba(239,68,68,0.05); }
`;

const Status = styled.span<{ $error?: boolean }>`
  font-size: 12px;
  color: ${({ $error }) => $error ? '#ef4444' : '#22c55e'};
`;

interface InlineEditPanelProps {
  editor: React.ReactNode;
  fields: React.ReactNode;
  accentColor: string;
  saving: boolean;
  status: string;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function InlineEditPanel({ editor, fields, accentColor, saving, status, onSave, onCancel, onDelete }: InlineEditPanelProps) {
  return (
    <Panel>
      <EditorWrap>{editor}</EditorWrap>
      <FieldsWrap>{fields}</FieldsWrap>
      <Actions>
        <SaveBtn $color={accentColor} onClick={onSave} disabled={saving}>
          {saving ? <Spinner size={14} /> : 'Save'}
        </SaveBtn>
        <CancelBtn onClick={onCancel}>Cancel</CancelBtn>
        {status && <Status $error={status.toLowerCase().includes('fail')}>{status}</Status>}
        <DeleteBtn onClick={onDelete}>Delete</DeleteBtn>
      </Actions>
    </Panel>
  );
}
