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

const Panel = styled.div`
  background: var(--bg-sunken);
  margin: 0 0 20px;
  padding: 16px 36px 32px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
`;

/* Section header: tracked uppercase label with a trailing hairline rule. */
const SectionHeader = styled.div<{ $noTopicPicker?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin: 32px 0 6px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #2e2f32;
  }
`;

const EditorWrap = styled.div`
  margin: 0 0 15px;
  overflow: hidden;
  background: transparent;
  border: none;
  border-radius: 0;

  /* Compact the TipTap editor for inline use */
  & > div { min-height: unset; }
  && .tiptap {
    min-height: 60px;
    padding: 12px 0;
    font-family: var(--sans, 'Lato', sans-serif);
    font-style: italic;
    font-size: 16px;
    line-height: 1.6;
  }
`;

const FieldsWrap = styled.div`
  padding: 0;
  width: 100%;
  margin-bottom: 10px;
`;

const FieldsSectionWrap = styled.div`
  margin-top: 50px;
`;

const FieldsContent = styled.div`
  padding: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 0;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  padding: 6px 16px;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  background: transparent;
  border: 1px solid var(--text-tertiary);
  border-radius: 999px;
  cursor: pointer;
  transition: opacity 0.15s;
  min-width: 80px;
  &:hover { opacity: 0.7; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SaveBtn = styled.button<{ $error?: boolean }>`
  padding: 6px 16px;
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $error }) => $error ? 'var(--color-danger, #dc3232)' : 'var(--color-accent)'};
  background: transparent;
  border: 1px solid ${({ $error }) => $error ? 'var(--color-danger, #dc3232)' : 'var(--color-accent)'};
  border-radius: 999px;
  cursor: pointer;
  transition: opacity 0.15s;
  min-width: 80px;
  &:hover:not(:disabled) { opacity: 0.7; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EditTitle = styled.div`
  font-family: var(--font-label);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 0 8px;
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
    <Panel>
      {title && <EditTitle>{title}</EditTitle>}
      {topicSelector && <FieldsWrap>{topicSelector}</FieldsWrap>}
      <EditorWrap>{editor}</EditorWrap>
      {fields && (
        <FieldsSectionWrap>
          <SectionHeader>Custom fields</SectionHeader>
          <FieldsContent>{fields}</FieldsContent>
        </FieldsSectionWrap>
      )}
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
