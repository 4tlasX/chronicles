import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Icon } from '../../../../design-system/components/core/Icon.jsx';
import { getTopicIcon } from '../../utils/topicIcons.js';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';

const SidebarRoot = styled.aside<{ $mobileOpen?: boolean }>`
  width: 228px;
  min-width: 228px;
  height: 100%;
  background: var(--bg-sunken);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 56px;
    bottom: 0;
    width: 280px;
    max-width: 85%;
    z-index: 51;
    transform: translateX(${({ $mobileOpen }) => ($mobileOpen ? '0' : '-100%')});
    transition: transform 200ms ease-out;
    box-shadow: ${({ $mobileOpen }) => ($mobileOpen ? '2px 0 16px rgba(0,0,0,0.25)' : 'none')};
  }
`;

const LogoBlock = styled.div`
  height: 44px;
  padding: 0 var(--s-4, 16px);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: var(--s-2, 8px);
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoDiamond = styled.svg`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  stroke: var(--color-accent);
`;

const LogoText = styled.span`
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 300;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-primary);
`;

const NavScroll = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding-top: 4px;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-subtle);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--border-default);
  }
`;

const NavRow = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  border: none;
  cursor: pointer;
  text-align: left;
  background: ${({ $active }) => $active ? 'var(--color-accent)' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-secondary)'};
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 300;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: ${({ $active }) => $active ? 'var(--color-accent)' : 'var(--bg-hover)'};
    color: ${({ $active }) => $active ? 'white' : 'var(--text-primary)'};
  }
`;

const NavRowIcon = styled.span<{ $active?: boolean }>`
  width: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 15px;
  color: ${({ $active }) => $active ? 'white' : 'var(--text-secondary)'};
`;

const NavRowText = styled.span`
  flex: 1;
`;

const NavRowCount = styled.span`
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 700;
  color: inherit;
  opacity: 0.65;
  flex-shrink: 0;
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const NavSectionHeader = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 15px;
  border: none;
  background: transparent;
  border-top: 1px solid var(--border-subtle);
  margin-top: 2px;
  cursor: pointer;
  font-family: var(--font-label);
  font-size: 11.5px;
  font-weight: 300;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  transition: color 120ms ease;

  &:hover {
    color: var(--text-secondary);
  }
`;

const SectionChevron = styled.span`
  font-size: 9px;
  width: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SectionContent = styled.div<{ $open?: boolean }>`
  display: ${({ $open }) => $open ? 'flex' : 'none'};
  flex-direction: column;
`;

const UserRow = styled.div`
  padding: 10px 14px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserStreak = styled.div`
  font-family: var(--font-label);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-top: 2px;
`;

interface SectionState {
  planning: boolean;
  health: boolean;
  inspiration: boolean;
  topics: boolean;
  settings: boolean;
}

const STORAGE_KEY = 'sidebar-collapsed-sections';

export function Sidebar() {
  const location = useLocation();
  const rawNavigate = useNavigate();
  const topics = useEntriesStore(s => s.topics);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const ff = useEntriesStore(s => s.featureFlags);
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const displayName = useUIStore(s => s.displayName);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const setViewMode = useUIStore(s => s.setViewMode);
  const mobileNavOpen = useUIStore(s => s.mobileNavOpen);
  const setMobileNavOpen = useUIStore(s => s.setMobileNavOpen);

  // Wrap navigation so tapping any nav row also closes the mobile drawer.
  const navigate = (path: string) => {
    setMobileNavOpen(false);
    rawNavigate(path);
  };

  const [openSections, setOpenSections] = useState<SectionState>(() => {
    const defaults: SectionState = {
      planning: false,
      health: false,
      inspiration: false,
      topics: false,
      settings: false,
    };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openSections));
  }, [openSections]);

  const toggleSection = (key: keyof SectionState) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  const userInitial = (displayName || 'J')[0].toUpperCase();

  return (
    <SidebarRoot $mobileOpen={mobileNavOpen}>
      {/* Logo block */}
      <LogoBlock>
        <LogoDiamond xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Petal 1 (top) */}
          <g>
            <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
            <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
            <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
            <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
            <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
            <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
          </g>
          {/* Petal 2 */}
          <g transform="rotate(72,50,50)">
            <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
            <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
            <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
            <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
            <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
            <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
          </g>
          {/* Petal 3 */}
          <g transform="rotate(144,50,50)">
            <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
            <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
            <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
            <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
            <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
            <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
          </g>
          {/* Petal 4 */}
          <g transform="rotate(216,50,50)">
            <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
            <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
            <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
            <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
            <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
            <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
          </g>
          {/* Petal 5 */}
          <g transform="rotate(288,50,50)">
            <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
            <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
            <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
            <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
            <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
            <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
          </g>
          {/* Seed pod center */}
          <circle cx="50" cy="50" r="9" strokeWidth="1.1"/>
          {/* Stamen ring */}
          <g strokeWidth="1">
            <line x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(36,50,50)"  x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(72,50,50)"  x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(108,50,50)" x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(144,50,50)" x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(180,50,50)" x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(216,50,50)" x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(252,50,50)" x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(288,50,50)" x1="50" y1="39" x2="50" y2="36"/>
            <line transform="rotate(324,50,50)" x1="50" y1="39" x2="50" y2="36"/>
          </g>
          {/* Center dot */}
          <circle cx="50" cy="50" r="2.5" fill="var(--color-accent, #5b53d6)" stroke="none"/>
        </LogoDiamond>
        <LogoText>Chronicles</LogoText>
      </LogoBlock>

      {/* Nav scroll */}
      <NavScroll>
        {/* Core nav */}
        <NavRow $active={at('/')} onClick={() => navigate('/')}>
          <NavRowIcon $active={at('/')}>
            <Icon name="layout-grid" size={16} strokeWidth={1.8} />
          </NavRowIcon>
          <NavRowText>Dashboard</NavRowText>
        </NavRow>

        <NavRow $active={at('/journal')} onClick={() => navigate('/journal')}>
          <NavRowIcon $active={at('/journal')}>
            <Icon name="book" size={16} strokeWidth={1.8} />
          </NavRowIcon>
          <NavRowText>Journal</NavRowText>
        </NavRow>

        <NavRow $active={at('/calendar')} onClick={() => navigate('/calendar')}>
          <NavRowIcon $active={at('/calendar')}>
            <Icon name="calendar" size={16} strokeWidth={1.8} />
          </NavRowIcon>
          <NavRowText>Calendar</NavRowText>
        </NavRow>

        <NavRow $active={at('/topics')} onClick={() => navigate('/topics')}>
          <NavRowIcon $active={at('/topics')}>
            <Icon name="tag" size={16} strokeWidth={1.8} />
          </NavRowIcon>
          <NavRowText>Topics</NavRowText>
        </NavRow>

        {/* Planning section */}
        <NavSection>
          <NavSectionHeader onClick={() => toggleSection('planning')}>
            <SectionChevron>
              <Icon name={openSections.planning ? 'chevron-down' : 'chevron-right'} size={13} strokeWidth={2} />
            </SectionChevron>
            Planning
          </NavSectionHeader>
          <SectionContent $open={openSections.planning}>
            {ff.goalsEnabled && (
              <NavRow $active={at('/goals')} onClick={() => navigate('/goals')}>
                <NavRowIcon $active={at('/goals')}>
                  <Icon name="flag" size={16} strokeWidth={1.8} />
                </NavRowIcon>
                <NavRowText>Goals</NavRowText>
              </NavRow>
            )}
            {ff.goalsEnabled && (
              <NavRow $active={at('/goals/milestones')} onClick={() => navigate('/goals/milestones')}>
                <NavRowIcon $active={at('/goals/milestones')}>
                  <Icon name="target" size={16} strokeWidth={1.8} />
                </NavRowIcon>
                <NavRowText>Milestones</NavRowText>
              </NavRow>
            )}
            <NavRow $active={at('/goals/tasks')} onClick={() => navigate('/goals/tasks')}>
              <NavRowIcon $active={at('/goals/tasks')}>
                <Icon name="check" size={16} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Tasks</NavRowText>
            </NavRow>
            <NavRow $active={at('/goals/todos')} onClick={() => navigate('/goals/todos')}>
              <NavRowIcon $active={at('/goals/todos')}>
                <Icon name="check-circle" size={16} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Todos</NavRowText>
            </NavRow>
            <NavRow $active={startsWith('/goals/filter')} onClick={() => navigate('/goals/filter')}>
              <NavRowIcon $active={startsWith('/goals/filter')}>
                <Icon name="filter" size={16} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Filters</NavRowText>
            </NavRow>
            <NavRow $active={at('/menu')} onClick={() => navigate('/menu')}>
              <NavRowIcon $active={at('/menu')}>
                <Icon name="utensils" size={16} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Menu Planner</NavRowText>
            </NavRow>
            <NavRow $active={at('/shopping')} onClick={() => navigate('/shopping')}>
              <NavRowIcon $active={at('/shopping')}>
                <Icon name="shopping-bag" size={16} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Shopping Lists</NavRowText>
            </NavRow>
          </SectionContent>
        </NavSection>

        {/* Health section */}
        {hasHealth && (
          <NavSection>
            <NavSectionHeader onClick={() => toggleSection('health')}>
              <SectionChevron>
                <Icon name={openSections.health ? 'chevron-down' : 'chevron-right'} size={13} strokeWidth={2} />
              </SectionChevron>
              Health
            </NavSectionHeader>
            <SectionContent $open={openSections.health}>
              {ff.medicationEnabled && (
                <NavRow $active={at('/health/schedule')} onClick={() => navigate('/health/schedule')}>
                  <NavRowIcon $active={at('/health/schedule')}>
                    <Icon name="calendar" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Schedule</NavRowText>
                </NavRow>
              )}
              {ff.medicationEnabled && (
                <NavRow $active={startsWith('/health/meds')} onClick={() => navigate('/health/meds')}>
                  <NavRowIcon $active={startsWith('/health/meds')}>
                    <Icon name="pill" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Medications</NavRowText>
                </NavRow>
              )}
              {ff.foodEnabled && (
                <NavRow $active={at('/health/food')} onClick={() => navigate('/health/food')}>
                  <NavRowIcon $active={at('/health/food')}>
                    <Icon name="utensils" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Meals</NavRowText>
                </NavRow>
              )}
              <NavRow $active={at('/health/symptoms')} onClick={() => navigate('/health/symptoms')}>
                <NavRowIcon $active={at('/health/symptoms')}>
                  <Icon name="activity" size={16} strokeWidth={1.8} />
                </NavRowIcon>
                <NavRowText>Symptoms</NavRowText>
              </NavRow>
              {ff.exerciseEnabled && (
                <NavRow $active={at('/health/exercise')} onClick={() => navigate('/health/exercise')}>
                  <NavRowIcon $active={at('/health/exercise')}>
                    <Icon name="activity" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Exercise</NavRowText>
                </NavRow>
              )}
              {ff.allergiesEnabled && (
                <NavRow $active={at('/health/allergies')} onClick={() => navigate('/health/allergies')}>
                  <NavRowIcon $active={at('/health/allergies')}>
                    <Icon name="alert-circle" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Allergies</NavRowText>
                </NavRow>
              )}
              <NavRow $active={at('/health/reporting')} onClick={() => navigate('/health/reporting')}>
                <NavRowIcon $active={at('/health/reporting')}>
                  <Icon name="activity" size={16} strokeWidth={1.8} />
                </NavRowIcon>
                <NavRowText>Reports</NavRowText>
              </NavRow>
            </SectionContent>
          </NavSection>
        )}

        {/* Inspiration section */}
        {hasInspiration && (
          <NavSection>
            <NavSectionHeader onClick={() => toggleSection('inspiration')}>
              <SectionChevron>
                <Icon name={openSections.inspiration ? 'chevron-down' : 'chevron-right'} size={13} strokeWidth={2} />
              </SectionChevron>
              Inspiration
            </NavSectionHeader>
            <SectionContent $open={openSections.inspiration}>
              {ff.inspirationEnabled && (
                <NavRow $active={at('/inspiration/quotes')} onClick={() => navigate('/inspiration/quotes')}>
                  <NavRowIcon $active={at('/inspiration/quotes')}>
                    <Icon name="quote" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Quotes</NavRowText>
                </NavRow>
              )}
              {ff.inspirationEnabled && (
                <NavRow $active={at('/inspiration/ideas')} onClick={() => navigate('/inspiration/ideas')}>
                  <NavRowIcon $active={at('/inspiration/ideas')}>
                    <Icon name="sparkles" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Ideas</NavRowText>
                </NavRow>
              )}
              {ff.entertainmentEnabled && (
                <NavRow $active={at('/entertainment/music')} onClick={() => navigate('/entertainment/music')}>
                  <NavRowIcon $active={at('/entertainment/music')}>
                    <Icon name="music" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Music</NavRowText>
                </NavRow>
              )}
              {ff.entertainmentEnabled && (
                <NavRow $active={at('/entertainment/books')} onClick={() => navigate('/entertainment/books')}>
                  <NavRowIcon $active={at('/entertainment/books')}>
                    <Icon name="book" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Books</NavRowText>
                </NavRow>
              )}
              {ff.entertainmentEnabled && (
                <NavRow $active={at('/entertainment/tv')} onClick={() => navigate('/entertainment/tv')}>
                  <NavRowIcon $active={at('/entertainment/tv')}>
                    <Icon name="tv" size={16} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>TV / Movies</NavRowText>
                </NavRow>
              )}
            </SectionContent>
          </NavSection>
        )}

        {/* Your Topics section */}
        {topics.length > 0 && (
          <NavSection>
            <NavSectionHeader onClick={() => toggleSection('topics')}>
              <SectionChevron>
                <Icon name={openSections.topics ? 'chevron-down' : 'chevron-right'} size={13} strokeWidth={2} />
              </SectionChevron>
              Your Topics
            </NavSectionHeader>
            <SectionContent $open={openSections.topics}>
              {topics.map(topic => {
                const isTopicActive = at('/journal') && selectedTopicId === topic.id;
                const count = countForTopic(topic.id);
                return (
                  <NavRow key={topic.id} $active={isTopicActive} onClick={() => handleTopicClick(topic.id)}>
                    <NavRowIcon $active={isTopicActive}>
                      <FontAwesomeIcon icon={getTopicIcon(topic.icon)} strokeWidth={1.8} />
                    </NavRowIcon>
                    <NavRowText>{topic.name}</NavRowText>
                    {count > 0 && <NavRowCount>{count.toLocaleString()}</NavRowCount>}
                  </NavRow>
                );
              })}
              <NavRow onClick={() => navigate('/topics')}>
                <NavRowIcon>
                  <Icon name="plus" size={15} strokeWidth={2} />
                </NavRowIcon>
                <NavRowText>Add topic…</NavRowText>
              </NavRow>
            </SectionContent>
          </NavSection>
        )}

        {/* Settings section */}
        <NavSection>
          <NavSectionHeader onClick={() => toggleSection('settings')}>
            <SectionChevron>
              <Icon name={openSections.settings ? 'chevron-down' : 'chevron-right'} size={13} strokeWidth={2} />
            </SectionChevron>
            Settings
          </NavSectionHeader>
          <SectionContent $open={openSections.settings}>
            <NavRow $active={at('/settings')} onClick={() => navigate('/settings')}>
              <NavRowIcon $active={at('/settings')}>
                <Icon name="settings" size={16} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Preferences</NavRowText>
            </NavRow>
          </SectionContent>
        </NavSection>
      </NavScroll>

      {/* User row */}
      <UserRow>
        <UserAvatar>{userInitial}</UserAvatar>
        <UserInfo>
          <UserName>{displayName || 'Chronicles'}</UserName>
          <UserStreak>0-day streak</UserStreak>
        </UserInfo>
      </UserRow>
    </SidebarRoot>
  );
}
