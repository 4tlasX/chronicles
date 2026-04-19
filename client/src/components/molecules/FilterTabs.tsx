import styled from 'styled-components';
import { useRef, useCallback, type KeyboardEvent } from 'react';

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 24px;
  @media (max-width: 768px) { padding: 8px 16px; justify-content: flex-start; }
  @media (max-width: 480px) { padding: 8px 12px; justify-content: flex-start; }
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const Label = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.5;
  white-space: nowrap;
  margin-right: 4px;
  flex-shrink: 0;
`;

const Btn = styled.button<{ $active?: boolean }>`
  padding: 6px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 700 : 600};
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textSecondary};
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
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
      {label && <Label>{label}:</Label>}
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
