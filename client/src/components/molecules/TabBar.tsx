import styled from 'styled-components';
import { useRef, useCallback, type ReactNode, type KeyboardEvent } from 'react';

const Row = styled.div`
  display: flex;
  border-bottom: 1px solid var(--accent-stroke, ${({ theme }) => theme.colors.accentStroke});
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
`;

const TabButton = styled.button<{ $active?: boolean }>`
  flex: none;
  padding: 10px 16px;
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${({ $active }) =>
    $active ? 'var(--ink, #2b2824)' : 'var(--ink-3, #6b645a)'};
  background: none;
  border: none;
  border-bottom: 2px solid ${({ $active }) =>
    $active ? 'var(--ink, #2b2824)' : 'transparent'};
  margin-bottom: -1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  transition: color 120ms ease, border-color 120ms ease;

  &:hover {
    color: var(--ink, ${({ theme }) => theme.colors.text});
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 13px;
    gap: 4px;
  }
`;

interface Tab<T extends string> {
  value: T;
  label: ReactNode;
}

interface TabBarProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (value: T) => void;
  accentColor?: string;
}

export function TabBar<T extends string>({ tabs, active, onChange }: TabBarProps<T>) {
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
          onClick={() => onChange(tab.value)}
          onKeyDown={e => handleKeyDown(e, i)}
        >
          {tab.label}
        </TabButton>
      ))}
    </Row>
  );
}
