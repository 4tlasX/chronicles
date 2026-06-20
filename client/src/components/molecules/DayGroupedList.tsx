import { useMemo, type ReactNode } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 16px 24px;
  @media (max-width: 480px) { padding: 12px 8px 20px; }
`;

const DayGroup = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 20px;
  align-items: start;
  @media (max-width: 480px) {
    grid-template-columns: 72px 1fr;
    gap: 10px;
  }
`;

const DayLabel = styled.div`
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 300;
  color: #453f38;
  text-align: right;
  padding-top: 10px;
  letter-spacing: 0.05rem;
`;

const DayDate = styled.span`
  display: block;
  font-family: var(--font-sans);
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textFaint};
  margin-top: 3px;
`;

const DayItems = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

function startOfDay(d: Date) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function relativeDay(date: Date): string {
  const today = startOfDay(new Date());
  const d = startOfDay(date);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

function monoDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface DayGroupedListProps<T> {
  items: T[];
  getDate: (item: T) => Date;
  getKey: (item: T) => string | number;
  renderItem: (item: T) => ReactNode;
}

export function DayGroupedList<T>({ items, getDate, getKey, renderItem }: DayGroupedListProps<T>) {
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; mono: string; items: T[] }>();
    const sorted = [...items].sort((a, b) => getDate(b).getTime() - getDate(a).getTime());
    for (const item of sorted) {
      const d = getDate(item);
      const key = startOfDay(d).toISOString();
      if (!map.has(key)) map.set(key, { label: relativeDay(d), mono: monoDate(d), items: [] });
      map.get(key)!.items.push(item);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v }));
  }, [items, getDate]);

  if (groups.length === 0) return null;

  return (
    <Wrapper>
      {groups.map(group => (
        <DayGroup key={group.key}>
          <DayLabel>
            {group.label}
            <DayDate>{group.mono}</DayDate>
          </DayLabel>
          <DayItems>
            {group.items.map(item => (
              <div key={getKey(item)}>{renderItem(item)}</div>
            ))}
          </DayItems>
        </DayGroup>
      ))}
    </Wrapper>
  );
}
