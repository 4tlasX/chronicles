import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Chip = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.03rem;
`;

interface TopicBadgeProps {
  name: string;
  color: string;
  icon?: IconDefinition;
  showDot?: boolean;
}

export function TopicBadge({ name, color, icon }: TopicBadgeProps) {
  return (
    <Chip $color={color}>
      {icon && <FontAwesomeIcon icon={icon} style={{ fontSize: 11 }} />}
      {name}
    </Chip>
  );
}
