import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 44px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-app);
  flex-shrink: 0;
`;

const ViewLabel = styled.span`
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-tertiary);
`;

const LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/journal': 'Journal',
  '/calendar': 'Calendar',
  '/topics': 'Topics',
  '/goals': 'Goals',
  '/goals/milestones': 'Milestones',
  '/goals/tasks': 'Tasks',
  '/goals/todos': 'Todos',
  '/goals/filter': 'Filters',
  '/menu': 'Menu Planner',
  '/shopping': 'Shopping Lists',
  '/settings': 'Settings',
  '/health/schedule': 'Med Schedule',
  '/health/meds': 'Medications',
  '/health/food': 'Meals',
  '/health/symptoms': 'Symptoms',
  '/health/exercise': 'Exercise',
  '/health/allergies': 'Allergies',
  '/health/reporting': 'Reports',
  '/inspiration/quotes': 'Quotes',
  '/inspiration/ideas': 'Ideas',
  '/entertainment/music': 'Music',
  '/entertainment/books': 'Books',
  '/entertainment/tv': 'TV/Movies',
};

export function Header() {
  const location = useLocation();

  // Find the best matching label for the current route
  let label = LABELS[location.pathname];
  if (!label) {
    // Try to match prefix routes
    for (const [path, text] of Object.entries(LABELS)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        label = text;
        break;
      }
    }
  }
  if (!label) label = 'Dashboard';

  return (
    <TopBar>
      <ViewLabel>{label}</ViewLabel>
    </TopBar>
  );
}
