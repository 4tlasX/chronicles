import { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
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
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  margin: 20px 0;
  padding: 24px 16px 8px;
  border: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  border-radius: var(--r-md, 4px);
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  & input, & select, & textarea {
    border-color: ${({ theme }) => theme.colors.border};
  }
`;

const SectionHeader = styled.div<{ $noTopicPicker?: boolean }>`
  font-family: var(--sans, 'Lato', sans-serif);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-4, ${({ theme }) => theme.colors.textMuted});
  margin: ${({ $noTopicPicker }) => $noTopicPicker ? '16px' : '0'} 16px 6px;
`;

const EditorWrap = styled.div`
  margin: 0 16px 15px;
  overflow: hidden;
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  border: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  border-radius: 4px;

  /* Compact the TipTap editor for inline use */
  & > div { min-height: unset; }
  && .tiptap {
    min-height: 60px;
    padding: 15px 40px 15px 15px;
    font-family: var(--sans, 'Lato', sans-serif);
    font-style: italic;
    font-size: 16px;
    line-height: 1.6;
  }
`;

const FieldsWrap = styled.div`
  padding: 12px 16px 24px;
  @media (max-width: 768px) { padding: 12px 16px 22px; }
  @media (max-width: 480px) { padding: 10px 12px 18px; }
`;

const FieldsSectionWrap = styled.div`
  margin: 10px 16px 0;
`;

const FieldsToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px 10px 0;
  font-family: var(--sans, 'Lato', sans-serif);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-3, ${({ theme }) => theme.colors.textMuted});
  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: background 120ms;
`;

const FieldsContent = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => $open ? 'block' : 'none'};
  padding: 14px 16px 20px;
  margin-top: 8px;
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  border: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  border-radius: var(--r-md, 4px);
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 16px 24px;
  border-radius: 0;
  flex-wrap: wrap;
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
  padding: 0 16px 8px;
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
  const [fieldsOpen, setFieldsOpen] = useState(false);

  return (
    <Panel>
      {title && <EditTitle>{title}</EditTitle>}
      {topicSelector && <FieldsWrap>{topicSelector}</FieldsWrap>}
      <SectionHeader $noTopicPicker={!topicSelector}>Main content</SectionHeader>
      <EditorWrap>{editor}</EditorWrap>
      {fields && (
        <FieldsSectionWrap>
          <FieldsToggle onClick={() => setFieldsOpen(o => !o)}>
            <FontAwesomeIcon icon={fieldsOpen ? faChevronDown : faChevronRight} style={{ fontSize: 11 }} />
            Custom fields
          </FieldsToggle>
          <FieldsContent $open={fieldsOpen}>{fields}</FieldsContent>
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
