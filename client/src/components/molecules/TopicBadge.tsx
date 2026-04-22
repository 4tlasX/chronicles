import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/* Topic marks are monotone — plain icon in ink-2, label in ink. No colored fills. */
const Mark = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 13.5px;
  color: var(--ink, ${({ theme }) => theme.colors.text});
  padding: 4px 2px;
`;

const MarkIcon = styled.span`
  font-size: 13px;
  color: var(--ink-3, ${({ theme }) => theme.colors.textMuted});
  flex-shrink: 0;
`;

interface TopicBadgeProps {
  name: string;
  color?: string;
  icon?: IconDefinition;
  showDot?: boolean;
}

export function TopicBadge({ name, icon }: TopicBadgeProps) {
  return (
    <Mark>
      {icon && <MarkIcon><FontAwesomeIcon icon={icon} /></MarkIcon>}
      {name}
    </Mark>
  );
}
