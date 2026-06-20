import styled from 'styled-components';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: var(--s-2, 8px);
  margin: var(--s-2, 8px) var(--s-4, 16px) var(--s-1, 4px);
  padding: var(--s-2, 8px) var(--s-3, 12px);
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  border-radius: var(--r-md, 1px);
`;

const IconWrap = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 16px;
`;

const Text = styled.span`
  font-size: var(--text-sm, 15px);
  color: var(--text-primary);
`;

const Bold = styled.strong`
  font-weight: 600;
`;

const ClearBtn = styled.button`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--s-1, 4px);
  padding: var(--s-1, 4px) var(--s-3, 12px);
  font-size: var(--text-xs, 13px);
  color: var(--text-primary);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--r-md, 1px);
  cursor: pointer;

  &:hover {
    background: var(--bg-hover);
  }
`;

interface TopicFilterBarProps {
  icon: IconDefinition;
  iconColor: string;
  topicName: string;
  onClear: () => void;
}

/** Displays an active topic filter with icon, label, and clear button. */
export function TopicFilterBar({ icon, iconColor, topicName, onClear }: TopicFilterBarProps) {
  return (
    <Bar>
      <IconWrap $color={iconColor}>
        <FontAwesomeIcon icon={icon} />
      </IconWrap>
      <Text>Filtering by: <Bold>{topicName}</Bold></Text>
      <ClearBtn onClick={onClear}>
        <FontAwesomeIcon icon={faXmark} size="xs" /> Clear
      </ClearBtn>
    </Bar>
  );
}
