import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface IconProps {
  icon: IconDefinition;
  size?: 'xs' | 'sm' | 'lg' | '1x' | '2x';
  color?: string;
  className?: string;
}

export function Icon({ icon, size = '1x', color, className }: IconProps) {
  return <FontAwesomeIcon icon={icon} size={size} color={color} className={className} />;
}
