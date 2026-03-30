import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
`;

const Btn = styled.button<{ $active?: boolean }>`
  padding: 4px 12px;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textMuted};
  background: ${({ $active }) => $active ? 'rgba(0,0,0,0.06)' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

interface FilterTabsProps<T extends string> {
  options: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({ options, active, onChange }: FilterTabsProps<T>) {
  return (
    <Row>
      {options.map(opt => (
        <Btn key={opt.value} $active={active === opt.value} onClick={() => onChange(opt.value)}>
          {opt.label}
        </Btn>
      ))}
    </Row>
  );
}
