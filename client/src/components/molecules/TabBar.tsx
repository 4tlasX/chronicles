import styled from 'styled-components';
import type { ReactNode } from 'react';

const Row = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;

const TabButton = styled.button<{ $active?: boolean; $color: string }>`
  flex: 1;
  padding: 10px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  background: none;
  border: none;
  border-bottom: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  @media (max-width: 480px) {
    flex: none;
    padding: 10px 14px;
    font-size: 10px;
    gap: 4px;
  }
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
