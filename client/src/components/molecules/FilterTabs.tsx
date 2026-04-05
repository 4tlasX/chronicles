import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  padding: 8px 24px;
  @media (max-width: 768px) { padding: 8px 16px; justify-content: flex-start; }
  @media (max-width: 480px) { padding: 8px 12px; justify-content: flex-start; }
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const Btn = styled.button<{ $active?: boolean }>`
  padding: 4px 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  font-style: italic;
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
