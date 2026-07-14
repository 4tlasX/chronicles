import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';

const Bar = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-subtle);
`;

const TabBtn = styled.button<{ $active?: boolean }>`
  padding: 5px 12px;
  font-family: var(--sans, 'Lato', sans-serif);
  font-size: 11px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $active }) => $active ? 'var(--ink, #2b2824)' : 'var(--ink-3, #6b645a)'};
  background: ${({ $active }) => $active ? 'var(--paper-surface, #f7f4ee)' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? 'var(--rule, #d4cfc5)' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 120ms ease, color 120ms ease;

  &:hover:not([aria-selected="true"]) {
    color: var(--ink, #2b2824);
    font-weight: 600;
  }
`;

const TABS: { label: string; path: string }[] = [
  { label: 'Menu', path: '/menu' },
  { label: 'Shopping Lists', path: '/shopping' },
  { label: 'Meals', path: '/menu/meals' },
];

export function MealsTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Bar>
      {TABS.map((t) => {
        const isActive = location.pathname === t.path;
        return (
          <TabBtn
            key={t.path}
            $active={isActive}
            aria-selected={isActive}
            onClick={() => navigate(t.path)}
          >
            {t.label}
          </TabBtn>
        );
      })}
    </Bar>
  );
}
