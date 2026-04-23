import styled from 'styled-components';
import { useUIStore } from '../../stores/uiStore.js';
import { StackedLinesIcon } from './StackedLinesIcon.js';

const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  color: var(--ink-3, ${({ theme }) => theme.colors.textMuted});
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: color 120ms ease;
  &:hover { color: var(--ink); }

  @media (max-width: 1366px) { display: none; }
`;

export function SidebarToggle() {
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore(s => s.setSidebarCollapsed);
  return (
    <Btn
      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
      aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
    >
      <StackedLinesIcon />
    </Btn>
  );
}
