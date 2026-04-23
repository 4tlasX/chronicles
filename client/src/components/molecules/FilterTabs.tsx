import styled from 'styled-components';
import { useRef, useCallback, type KeyboardEvent } from 'react';

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  flex-wrap: wrap;
  padding: 8px 24px;
  border-bottom: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  @media (max-width: 768px) { padding: 8px 16px; }
  @media (max-width: 480px) { padding: 8px 12px; }
`;

const Label = styled.span`
  font-family: var(--mono, ${({ theme }) => theme.fontFamily.mono});
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-4, ${({ theme }) => theme.colors.textFaint});
  white-space: nowrap;
  margin-right: 4px;
  flex-shrink: 0;
`;

const Btn = styled.button<{ $active?: boolean }>`
  padding: 5px 12px;
  font-family: var(--ui, 'Montserrat', ${({ theme }) => theme.fontFamily.ui});
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active }) =>
    $active ? 'var(--ink, #2b2824)' : 'var(--ink-3, #6b645a)'};
  background: ${({ $active }) => $active ? 'var(--paper-surface, #f7f4ee)' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? 'var(--rule, #d4cfc5)' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms ease, color 120ms ease;

  &:hover:not([aria-selected="true"]) {
    background: var(--paper-hover, #f0eeea);
    color: var(--ink, #2b2824);
  }
`;

interface FilterTabsProps<T extends string> {
  options: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  label?: string;
}

export function FilterTabs<T extends string>({ options, active, onChange, label }: FilterTabsProps<T>) {
  const safeOptions = options ?? [];
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % safeOptions.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + safeOptions.length) % safeOptions.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = safeOptions.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      btnRefs.current[nextIndex]?.focus();
      onChange(safeOptions[nextIndex].value);
    }
  }, [safeOptions, onChange]);

  return (
    <Row role="tablist">
      {label && <Label>{label}</Label>}
      {safeOptions.map((opt, i) => (
        <Btn
          key={opt.value}
          ref={el => { btnRefs.current[i] = el; }}
          role="tab"
          aria-selected={active === opt.value}
          tabIndex={active === opt.value ? 0 : -1}
          $active={active === opt.value}
          onClick={() => onChange(opt.value)}
          onKeyDown={e => handleKeyDown(e, i)}
        >
          {opt.label}
        </Btn>
      ))}
    </Row>
  );
}
