import styled from 'styled-components';
import { useRef, useCallback, type KeyboardEvent } from 'react';

const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px 24px;
  @media (max-width: 768px) { padding: 8px 16px; justify-content: flex-start; }
  @media (max-width: 480px) { padding: 8px 12px; justify-content: flex-start; }
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const Btn = styled.button<{ $active?: boolean }>`
  padding: 6px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
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
}

export function FilterTabs<T extends string>({ options, active, onChange }: FilterTabsProps<T>) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % options.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + options.length) % options.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = options.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      btnRefs.current[nextIndex]?.focus();
      onChange(options[nextIndex].value);
    }
  }, [options, onChange]);

  return (
    <Row role="tablist">
      {options.map((opt, i) => (
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
