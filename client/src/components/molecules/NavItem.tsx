import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Item = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  font-weight: ${({ $active, theme }) => $active ? theme.fontWeight.semibold : theme.fontWeight.normal};
  color: ${({ $active, theme }) => $active ? theme.colors.accent : theme.colors.text};
  background: ${({ $active }) => $active ? 'rgba(0, 180, 216, 0.08)' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(0, 180, 216, 0.12)' : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const IconWrapper = styled.span`
  width: 20px;
  text-align: center;
`;

interface NavItemProps {
  icon?: IconDefinition;
  label: string;
  active?: boolean;
  onClick: () => void;
  trailing?: React.ReactNode;
}

export function NavItem({ icon, label, active, onClick, trailing }: NavItemProps) {
  return (
    <Item $active={active} onClick={onClick}>
      {icon && <IconWrapper><FontAwesomeIcon icon={icon} /></IconWrapper>}
      <span style={{ flex: 1 }}>{label}</span>
      {trailing}
    </Item>
  );
}
