import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Row = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 24px;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background 0.1s;
  &:hover { background: rgba(0, 0, 0, 0.02); }
  &:last-child { border-bottom: none; }
`;

const IconWrap = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Preview = styled.div`
  font-size: 17px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

interface EntryPreviewRowProps {
  icon?: IconDefinition;
  iconColor?: string;
  preview: string;
  meta?: { label: string; value: string }[];
  onClick: () => void;
}

export function EntryPreviewRow({ icon, iconColor, preview, meta, onClick }: EntryPreviewRowProps) {
  return (
    <Row onClick={onClick}>
      {icon && iconColor && <IconWrap $color={iconColor}><FontAwesomeIcon icon={icon} /></IconWrap>}
      <Content>
        <Preview>{preview}</Preview>
        {meta && meta.length > 0 && (
          <Meta>{meta.map(m => <span key={m.label}>{m.label}: {m.value}</span>)}</Meta>
        )}
      </Content>
    </Row>
  );
}
