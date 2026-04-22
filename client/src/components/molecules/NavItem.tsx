import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Item = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 10px;
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  color: ${({ $active }) =>
    $active ? 'var(--ink, #2b2824)' : 'var(--ink-2, #453f38)'};
  background: ${({ $active }) =>
    $active ? 'var(--paper-hover, #f0eeea)' : 'transparent'};
  border: none;
  border-left: 3px solid ${({ $active }) =>
    $active ? 'var(--ink, #2b2824)' : 'transparent'};
  border-radius: var(--r-sm, ${({ theme }) => theme.borderRadius.sm}px);
  margin-left: -3px;
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: var(--paper-hover, ${({ theme }) => theme.colors.surfaceHover});
    color: var(--ink, ${({ theme }) => theme.colors.text});
  }
`;

const IconWrapper = styled.span<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  font-size: 13px;
  color: ${({ $active }) =>
    $active ? 'var(--ink, #2b2824)' : 'var(--ink-4, #8a857c)'};
  flex-shrink: 0;
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
      {icon && (
        <IconWrapper $active={active}>
          <FontAwesomeIcon icon={icon} />
        </IconWrapper>
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {trailing}
    </Item>
  );
}
