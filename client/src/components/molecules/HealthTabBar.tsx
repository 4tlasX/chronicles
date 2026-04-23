import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEntriesStore } from '../../stores/entriesStore.js';

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

export function HealthTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const ff = useEntriesStore(s => s.featureFlags);

  const tabs: { label: string; path: string }[] = [];
  if (ff.medicationEnabled) {
    tabs.push({ label: 'Schedule', path: '/health/schedule' });
    tabs.push({ label: 'Meds', path: '/health/meds' });
  }
  if (ff.foodEnabled) tabs.push({ label: 'Meals', path: '/health/food' });
  tabs.push({ label: 'Symptoms', path: '/health/symptoms' });
  if (ff.exerciseEnabled) tabs.push({ label: 'Exercise', path: '/health/exercise' });
  if (ff.allergiesEnabled) tabs.push({ label: 'Allergies', path: '/health/allergies' });
  tabs.push({ label: 'Reports', path: '/health/reporting' });

  return (
    <Bar>
      {tabs.map((t) => {
        const isActive = location.pathname === t.path || (t.path === '/health/meds' && location.pathname.startsWith('/health/meds'));
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
