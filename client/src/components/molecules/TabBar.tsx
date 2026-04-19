import styled from 'styled-components';
import { useRef, useCallback, type ReactNode, type KeyboardEvent } from 'react';

const Row = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;

const TabButton = styled.button<{ $active?: boolean; $color: string }>`
  flex: none;
  padding: 10px 16px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 700 : 600};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textSecondary};
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
    font-size: 13px;
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
  const tabElRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      tabElRefs.current[nextIndex]?.focus();
      onChange(tabs[nextIndex].value);
    }
  }, [tabs, onChange]);

  return (
    <Row role="tablist">
      {tabs.map((tab, i) => (
        <TabButton
          key={tab.value}
          ref={el => { tabElRefs.current[i] = el; }}
          role="tab"
          aria-selected={active === tab.value}
          tabIndex={active === tab.value ? 0 : -1}
          $active={active === tab.value}
          $color={accentColor}
          onClick={() => onChange(tab.value)}
          onKeyDown={e => handleKeyDown(e, i)}
        >
          {tab.label}
        </TabButton>
      ))}
    </Row>
  );
}
