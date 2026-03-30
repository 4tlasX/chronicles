import styled from 'styled-components';
import type { ReactNode } from 'react';

const Row = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TabButton = styled.button<{ $active?: boolean; $color: string }>`
  flex: 1;
  padding: 10px;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active, $color }) => $active ? $color : 'transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

interface Tab<T extends string> {
  value: T;
  label: ReactNode;
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (value: T) => void;
  accentColor: string;
}

export function TabBar<T extends string>({ tabs, active, onChange, accentColor }: TabBarProps<T>) {
  return (
    <Row>
      {tabs.map(tab => (
        <TabButton key={tab.value} $active={active === tab.value} $color={accentColor} onClick={() => onChange(tab.value)}>
          {tab.label}
        </TabButton>
      ))}
    </Row>
  );
}
