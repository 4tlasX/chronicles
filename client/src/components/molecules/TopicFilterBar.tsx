import styled from 'styled-components';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const IconWrap = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 14px;
`;

const Text = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.text};
`;

const Bold = styled.strong`
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

const ClearBtn = styled.button`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
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
