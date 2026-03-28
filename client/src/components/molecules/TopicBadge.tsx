import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Chip = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ $color }) => $color};
`;

const IconCircle = styled.span<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  color: white;
  font-size: 8px;
`;

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

interface TopicBadgeProps {
  name: string;
  color: string;
  icon?: IconDefinition;
  showDot?: boolean;
}

export function TopicBadge({ name, color, icon, showDot = false }: TopicBadgeProps) {
  return (
    <Chip $color={color}>
      {icon ? (
        <IconCircle $color={color}>
          <FontAwesomeIcon icon={icon} />
        </IconCircle>
      ) : showDot ? (
        <Dot $color={color} />
      ) : null}
      {name}
    </Chip>
  );
}
