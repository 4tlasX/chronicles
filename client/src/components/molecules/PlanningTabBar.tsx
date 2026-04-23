import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';

const Bar = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  padding: 8px 24px;
  border-bottom: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  @media (max-width: 768px) { padding: 8px 16px; }
  @media (max-width: 480px) { padding: 8px 12px; }
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

const TABS = [
  { label: 'Goals', path: '/goals' },
  { label: 'Milestones', path: '/goals/milestones' },
  { label: 'Tasks', path: '/goals/tasks' },
  { label: 'Todos', path: '/goals/todos' },
  { label: 'Filters', path: '/goals/filter' },
];

export function PlanningTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Bar>
      {TABS.map((t) => {
        const isActive = t.path === '/goals'
          ? location.pathname === '/goals'
          : location.pathname.startsWith(t.path);
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
