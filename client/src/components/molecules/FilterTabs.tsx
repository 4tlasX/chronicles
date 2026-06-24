import styled from 'styled-components';
import { useRef, useCallback, type KeyboardEvent } from 'react';

const Row = styled.div<{ $flush?: boolean; $bordered?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  flex-wrap: wrap;
  padding: ${({ $flush }) => ($flush ? '8px 0' : '8px 24px')};
  ${({ $bordered, theme }) => $bordered !== false && `border-bottom: 1px solid var(--rule, ${theme.colors.border});`}
  @media (max-width: 768px) { padding: ${({ $flush }) => ($flush ? '8px 0' : '8px 16px')}; }
  @media (max-width: 480px) { padding: ${({ $flush }) => ($flush ? '8px 0' : '8px 12px')}; }
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

const Btn = styled.button<{ $active?: boolean; $flush?: boolean }>`
  padding: 5px 12px;
  font-family: var(--ui, 'Montserrat', ${({ theme }) => theme.fontFamily.ui});
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active }) =>
    $active ? 'var(--color-accent)' : 'var(--ink-3, #6b645a)'};
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 120ms ease;

  /* Align the first tab's text with the column's left edge when flush. */
  ${({ $flush }) => $flush && `&:first-of-type { padding-left: 0; }`}

  &:hover:not([aria-selected="true"]) {
    color: var(--ink, #2b2824);
  }
`;

interface FilterTabsProps<T extends string> {
  options: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  label?: string;
  /** Align the first tab's text with the container's left edge (no row padding). */
  flush?: boolean;
  /** Show the bottom divider rule. Defaults to true. */
  bordered?: boolean;
}

export function FilterTabs<T extends string>({ options, active, onChange, label, flush, bordered = true }: FilterTabsProps<T>) {
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
    <Row role="tablist" $flush={flush} $bordered={bordered}>
      {label && <Label>{label}</Label>}
      {safeOptions.map((opt, i) => (
        <Btn
          key={opt.value}
          ref={el => { btnRefs.current[i] = el; }}
          role="tab"
          aria-selected={active === opt.value}
          tabIndex={active === opt.value ? 0 : -1}
          $active={active === opt.value}
          $flush={flush}
          onClick={() => onChange(opt.value)}
          onKeyDown={e => handleKeyDown(e, i)}
        >
          {opt.label}
        </Btn>
      ))}
    </Row>
  );
}
