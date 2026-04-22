import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faBookOpen, faCalendar, faTag, faGear, faPlus,
  faFlag, faCheck, faCircleCheck,
  faPills, faChartLine,
  faMusic, faBook, faTv, faLightbulb, faQuoteLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { getTopicIcon } from '../../utils/topicIcons.js';

const SidebarRoot = styled.aside`
  width: 280px;
  min-width: 280px;
  height: 100%;
  overflow-y: auto;
  background: var(--paper-surface);
  border-right: 1px solid var(--rule);
  padding: 16px 16px 24px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItemLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: var(--r-sm, 2px);
  color: ${({ $active }) => $active ? 'var(--ink)' : 'var(--ink-2)'};
  font-family: 'Lato', sans-serif;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  text-decoration: none;
  border-left: 3px solid ${({ $active }) => $active ? 'var(--ink)' : 'transparent'};
  margin-left: -3px;
  background: ${({ $active }) => $active ? 'var(--paper-hover)' : 'transparent'};
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: var(--paper-hover);
    color: var(--ink);
  }
`;

const NavItemButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--r-sm, 2px);
  color: ${({ $active }) => $active ? 'var(--ink)' : 'var(--ink-2)'};
  font-family: 'Lato', sans-serif;
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  background: ${({ $active }) => $active ? 'var(--paper-hover)' : 'transparent'};
  border: none;
  border-left: 3px solid ${({ $active }) => $active ? 'var(--ink)' : 'transparent'};
  margin-left: -3px;
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: var(--paper-hover);
    color: var(--ink);
  }
`;

const NavIcon = styled.span<{ $active?: boolean }>`
  width: 16px;
  font-size: 13px;
  color: ${({ $active }) => $active ? 'var(--ink)' : 'var(--ink-4)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavSection = styled.div`
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-4);
  padding: 12px 10px 8px;
  border-top: 1px dashed var(--rule);
  margin-top: 12px;
`;

const TopicCount = styled.span`
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--ink-4);
  letter-spacing: 0.1em;
`;

function NavLink({ to, icon, label, active }: { to: string; icon: IconDefinition; label: string; active: boolean }) {
  return (
    <NavItemLink to={to} $active={active}>
      <NavIcon $active={active}><FontAwesomeIcon icon={icon} /></NavIcon>
      {label}
    </NavItemLink>
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const topics = useEntriesStore(s => s.topics);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const ff = useEntriesStore(s => s.featureFlags);
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const setViewMode = useUIStore(s => s.setViewMode);

  const at = (path: string) => location.pathname === path;
  const startsWith = (prefix: string) => location.pathname.startsWith(prefix);

  const countForTopic = (topicId: number) =>
    entries.filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === topicId).length;

  const handleTopicClick = (topicId: number) => {
    setSelectedTopicId(topicId);
    setViewMode('all');
    navigate('/journal');
  };

  const hasHealth = ff.medicationEnabled || ff.foodEnabled || ff.exerciseEnabled || ff.allergiesEnabled;
  const hasInspiration = ff.entertainmentEnabled || ff.inspirationEnabled;

  return (
    <SidebarRoot>
      {/* Core */}
      <NavLink to="/" icon={faHome} label="Dashboard" active={at('/')} />
      <NavLink to="/journal" icon={faBookOpen} label="Journal" active={at('/journal')} />
      <NavLink to="/calendar" icon={faCalendar} label="Calendar" active={at('/calendar')} />
      <NavLink to="/topics" icon={faTag} label="Topics" active={at('/topics')} />

      {/* Planning */}
      <NavSection>Planning</NavSection>
      {ff.goalsEnabled && <NavLink to="/goals" icon={faFlag} label="Goals" active={at('/goals')} />}
      <NavLink to="/goals/tasks" icon={faCheck} label="Tasks" active={at('/goals/tasks')} />
      <NavLink to="/goals/todos" icon={faCircleCheck} label="Todos" active={at('/goals/todos')} />

      {/* Health */}
      {hasHealth && (
        <>
          <NavSection>Health</NavSection>
          {ff.medicationEnabled && <NavLink to="/health/meds" icon={faPills} label="Medications" active={startsWith('/health/meds') || at('/health/schedule')} />}
          <NavLink to="/health/reporting" icon={faChartLine} label="Reports" active={startsWith('/health/reporting')} />
        </>
      )}

      {/* Inspiration */}
      {hasInspiration && (
        <>
          <NavSection>Inspiration</NavSection>
          {ff.inspirationEnabled && <NavLink to="/inspiration/quotes" icon={faQuoteLeft} label="Quotes" active={at('/inspiration/quotes')} />}
          {ff.inspirationEnabled && <NavLink to="/inspiration/ideas" icon={faLightbulb} label="Ideas" active={at('/inspiration/ideas')} />}
          {ff.entertainmentEnabled && <NavLink to="/entertainment/music" icon={faMusic} label="Music" active={at('/entertainment/music')} />}
          {ff.entertainmentEnabled && <NavLink to="/entertainment/books" icon={faBook} label="Books" active={at('/entertainment/books')} />}
          {ff.entertainmentEnabled && <NavLink to="/entertainment/tv" icon={faTv} label="TV / Movies" active={at('/entertainment/tv')} />}
        </>
      )}

      {/* Your Topics */}
      {topics.length > 0 && (
        <>
          <NavSection>Your Topics</NavSection>
          {topics.map(topic => {
            const isTopicActive = at('/journal') && selectedTopicId === topic.id;
            const count = countForTopic(topic.id);
            return (
              <NavItemButton
                key={topic.id}
                $active={isTopicActive}
                onClick={() => handleTopicClick(topic.id)}
              >
                <NavIcon $active={isTopicActive}>
                  <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
                </NavIcon>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {topic.name}
                </span>
                {count > 0 && <TopicCount>{count.toLocaleString()}</TopicCount>}
              </NavItemButton>
            );
          })}
          <NavItemButton onClick={() => navigate('/topics')}>
            <NavIcon><FontAwesomeIcon icon={faPlus} /></NavIcon>
            Add topic…
          </NavItemButton>
        </>
      )}

      {/* Settings */}
      <NavSection>Settings</NavSection>
      <NavLink to="/settings" icon={faGear} label="Preferences" active={at('/settings')} />
    </SidebarRoot>
  );
}
