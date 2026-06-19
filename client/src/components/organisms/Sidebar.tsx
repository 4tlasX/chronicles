import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faBookOpen, faCalendar, faTag, faGear, faPlus,
  faFlag, faLayerGroup, faCheck, faCircleCheck, faSlidersH, faCartShopping, faCalendarDays,
  faPills, faCalendarCheck, faUtensils, faThermometerHalf, faPersonRunning, faTriangleExclamation, faChartLine,
  faMusic, faBook, faTv, faLightbulb, faQuoteLeft, faMagnifyingGlass, faChevronDown, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { getTopicIcon } from '../../utils/topicIcons.js';

const SidebarRoot = styled.aside`
  width: 228px;
  min-width: 228px;
  height: 100%;
  background: var(--bg-sunken);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: 900px) {
    display: none;
  }
`;

const LogoBlock = styled.div`
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const LogoDiamond = styled.span`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
`;

const LogoText = styled.span`
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 300;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-primary);
`;

const SearchBlock = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-subtle);
  padding: 5px 10px;
  background: var(--bg-sunken);
  border-radius: 0;
`;

const SearchIcon = styled.span`
  font-size: 13px;
  color: var(--text-tertiary);
  flex-shrink: 0;
`;

const SearchText = styled.span`
  font-size: 12.5px;
  color: var(--text-tertiary);
  font-family: var(--font-sans);
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
  padding: 8px 14px;
  border: none;
  cursor: pointer;
  text-align: left;
  background: ${({ $active }) => $active ? 'var(--color-accent)' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-secondary)'};
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
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
  padding: 7px 14px 5px;
  border: none;
  background: transparent;
  border-top: 1px solid var(--border-subtle);
  margin-top: 2px;
  cursor: pointer;
  font-family: var(--font-label);
  font-size: 9.5px;
  font-weight: 700;
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
  const navigate = useNavigate();
  const topics = useEntriesStore(s => s.topics);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const ff = useEntriesStore(s => s.featureFlags);
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const displayName = useUIStore(s => s.displayName);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const setViewMode = useUIStore(s => s.setViewMode);

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
    <SidebarRoot>
      {/* Logo block */}
      <LogoBlock>
        <LogoDiamond>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 6L26 16L16 26L6 16Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="16" cy="16" r="3.6" fill="currentColor" />
          </svg>
        </LogoDiamond>
        <LogoText>Chronicles</LogoText>
      </LogoBlock>

      {/* Search block */}
      <SearchBlock>
        <SearchInput>
          <SearchIcon>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </SearchIcon>
          <SearchText>Search ⌘K</SearchText>
        </SearchInput>
      </SearchBlock>

      {/* Nav scroll */}
      <NavScroll>
        {/* Core nav */}
        <NavRow $active={at('/')} onClick={() => navigate('/')}>
          <NavRowIcon $active={at('/')}>
            <FontAwesomeIcon icon={faHome} strokeWidth={1.8} />
          </NavRowIcon>
          <NavRowText>Dashboard</NavRowText>
        </NavRow>

        <NavRow $active={at('/journal')} onClick={() => navigate('/journal')}>
          <NavRowIcon $active={at('/journal')}>
            <FontAwesomeIcon icon={faBookOpen} strokeWidth={1.8} />
          </NavRowIcon>
          <NavRowText>Journal</NavRowText>
        </NavRow>

        <NavRow $active={at('/calendar')} onClick={() => navigate('/calendar')}>
          <NavRowIcon $active={at('/calendar')}>
            <FontAwesomeIcon icon={faCalendar} strokeWidth={1.8} />
          </NavRowIcon>
          <NavRowText>Calendar</NavRowText>
        </NavRow>

        <NavRow $active={at('/topics')} onClick={() => navigate('/topics')}>
          <NavRowIcon $active={at('/topics')}>
            <FontAwesomeIcon icon={faTag} strokeWidth={1.8} />
          </NavRowIcon>
          <NavRowText>Topics</NavRowText>
        </NavRow>

        {/* Planning section */}
        <NavSection>
          <NavSectionHeader onClick={() => toggleSection('planning')}>
            <SectionChevron>
              <FontAwesomeIcon icon={openSections.planning ? faChevronDown : faChevronRight} size="xs" />
            </SectionChevron>
            Planning
          </NavSectionHeader>
          <SectionContent $open={openSections.planning}>
            {ff.goalsEnabled && (
              <NavRow $active={at('/goals')} onClick={() => navigate('/goals')}>
                <NavRowIcon $active={at('/goals')}>
                  <FontAwesomeIcon icon={faFlag} strokeWidth={1.8} />
                </NavRowIcon>
                <NavRowText>Goals</NavRowText>
              </NavRow>
            )}
            {ff.goalsEnabled && (
              <NavRow $active={at('/goals/milestones')} onClick={() => navigate('/goals/milestones')}>
                <NavRowIcon $active={at('/goals/milestones')}>
                  <FontAwesomeIcon icon={faLayerGroup} strokeWidth={1.8} />
                </NavRowIcon>
                <NavRowText>Milestones</NavRowText>
              </NavRow>
            )}
            <NavRow $active={at('/goals/tasks')} onClick={() => navigate('/goals/tasks')}>
              <NavRowIcon $active={at('/goals/tasks')}>
                <FontAwesomeIcon icon={faCheck} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Tasks</NavRowText>
            </NavRow>
            <NavRow $active={at('/goals/todos')} onClick={() => navigate('/goals/todos')}>
              <NavRowIcon $active={at('/goals/todos')}>
                <FontAwesomeIcon icon={faCircleCheck} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Todos</NavRowText>
            </NavRow>
            <NavRow $active={startsWith('/goals/filter')} onClick={() => navigate('/goals/filter')}>
              <NavRowIcon $active={startsWith('/goals/filter')}>
                <FontAwesomeIcon icon={faSlidersH} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Filters</NavRowText>
            </NavRow>
            <NavRow $active={at('/menu')} onClick={() => navigate('/menu')}>
              <NavRowIcon $active={at('/menu')}>
                <FontAwesomeIcon icon={faCalendarDays} strokeWidth={1.8} />
              </NavRowIcon>
              <NavRowText>Menu Planner</NavRowText>
            </NavRow>
            <NavRow $active={at('/shopping')} onClick={() => navigate('/shopping')}>
              <NavRowIcon $active={at('/shopping')}>
                <FontAwesomeIcon icon={faCartShopping} strokeWidth={1.8} />
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
                <FontAwesomeIcon icon={openSections.health ? faChevronDown : faChevronRight} size="xs" />
              </SectionChevron>
              Health
            </NavSectionHeader>
            <SectionContent $open={openSections.health}>
              {ff.medicationEnabled && (
                <NavRow $active={at('/health/schedule')} onClick={() => navigate('/health/schedule')}>
                  <NavRowIcon $active={at('/health/schedule')}>
                    <FontAwesomeIcon icon={faCalendarCheck} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Schedule</NavRowText>
                </NavRow>
              )}
              {ff.medicationEnabled && (
                <NavRow $active={startsWith('/health/meds')} onClick={() => navigate('/health/meds')}>
                  <NavRowIcon $active={startsWith('/health/meds')}>
                    <FontAwesomeIcon icon={faPills} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Medications</NavRowText>
                </NavRow>
              )}
              {ff.foodEnabled && (
                <NavRow $active={at('/health/food')} onClick={() => navigate('/health/food')}>
                  <NavRowIcon $active={at('/health/food')}>
                    <FontAwesomeIcon icon={faUtensils} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Meals</NavRowText>
                </NavRow>
              )}
              <NavRow $active={at('/health/symptoms')} onClick={() => navigate('/health/symptoms')}>
                <NavRowIcon $active={at('/health/symptoms')}>
                  <FontAwesomeIcon icon={faThermometerHalf} strokeWidth={1.8} />
                </NavRowIcon>
                <NavRowText>Symptoms</NavRowText>
              </NavRow>
              {ff.exerciseEnabled && (
                <NavRow $active={at('/health/exercise')} onClick={() => navigate('/health/exercise')}>
                  <NavRowIcon $active={at('/health/exercise')}>
                    <FontAwesomeIcon icon={faPersonRunning} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Exercise</NavRowText>
                </NavRow>
              )}
              {ff.allergiesEnabled && (
                <NavRow $active={at('/health/allergies')} onClick={() => navigate('/health/allergies')}>
                  <NavRowIcon $active={at('/health/allergies')}>
                    <FontAwesomeIcon icon={faTriangleExclamation} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Allergies</NavRowText>
                </NavRow>
              )}
              <NavRow $active={at('/health/reporting')} onClick={() => navigate('/health/reporting')}>
                <NavRowIcon $active={at('/health/reporting')}>
                  <FontAwesomeIcon icon={faChartLine} strokeWidth={1.8} />
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
                <FontAwesomeIcon icon={openSections.inspiration ? faChevronDown : faChevronRight} size="xs" />
              </SectionChevron>
              Inspiration
            </NavSectionHeader>
            <SectionContent $open={openSections.inspiration}>
              {ff.inspirationEnabled && (
                <NavRow $active={at('/inspiration/quotes')} onClick={() => navigate('/inspiration/quotes')}>
                  <NavRowIcon $active={at('/inspiration/quotes')}>
                    <FontAwesomeIcon icon={faQuoteLeft} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Quotes</NavRowText>
                </NavRow>
              )}
              {ff.inspirationEnabled && (
                <NavRow $active={at('/inspiration/ideas')} onClick={() => navigate('/inspiration/ideas')}>
                  <NavRowIcon $active={at('/inspiration/ideas')}>
                    <FontAwesomeIcon icon={faLightbulb} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Ideas</NavRowText>
                </NavRow>
              )}
              {ff.entertainmentEnabled && (
                <NavRow $active={at('/entertainment/music')} onClick={() => navigate('/entertainment/music')}>
                  <NavRowIcon $active={at('/entertainment/music')}>
                    <FontAwesomeIcon icon={faMusic} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Music</NavRowText>
                </NavRow>
              )}
              {ff.entertainmentEnabled && (
                <NavRow $active={at('/entertainment/books')} onClick={() => navigate('/entertainment/books')}>
                  <NavRowIcon $active={at('/entertainment/books')}>
                    <FontAwesomeIcon icon={faBook} strokeWidth={1.8} />
                  </NavRowIcon>
                  <NavRowText>Books</NavRowText>
                </NavRow>
              )}
              {ff.entertainmentEnabled && (
                <NavRow $active={at('/entertainment/tv')} onClick={() => navigate('/entertainment/tv')}>
                  <NavRowIcon $active={at('/entertainment/tv')}>
                    <FontAwesomeIcon icon={faTv} strokeWidth={1.8} />
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
                <FontAwesomeIcon icon={openSections.topics ? faChevronDown : faChevronRight} size="xs" />
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
                  <FontAwesomeIcon icon={faPlus} strokeWidth={1.8} />
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
              <FontAwesomeIcon icon={openSections.settings ? faChevronDown : faChevronRight} size="xs" />
            </SectionChevron>
            Settings
          </NavSectionHeader>
          <SectionContent $open={openSections.settings}>
            <NavRow $active={at('/settings')} onClick={() => navigate('/settings')}>
              <NavRowIcon $active={at('/settings')}>
                <FontAwesomeIcon icon={faGear} strokeWidth={1.8} />
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
