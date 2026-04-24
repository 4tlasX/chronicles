import { useCallback, type KeyboardEvent } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faSun, faCalendar, faMagnifyingGlass, faBookmark, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '../../stores/uiStore.js';
import type { ViewMode } from '../../types/ui.js';

type TabEntry = {
  value: ViewMode;
  icon: typeof faList;
  label: string;
  title: string;
  isToday?: boolean;
};

const tabs: TabEntry[] = [
  { value: 'all',       icon: faList,            label: 'All',       title: 'All entries' },
  { value: 'date',      icon: faSun,             label: 'Today',     title: 'Today',        isToday: true },
  { value: 'date',      icon: faCalendar,        label: 'Date',      title: 'Pick a date' },
  { value: 'favorites', icon: faBookmark,        label: 'Bookmarks', title: 'Bookmarked entries' },
  { value: 'search',    icon: faMagnifyingGlass, label: 'Search',    title: 'Search entries' },
  { value: 'orphaned',  icon: faQuestion,        label: 'Orphaned',  title: 'Entries with missing topics' },
];

const Container = styled.div`
  display: flex;
  border-bottom: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  padding: 0 var(--s-4, 16px);
`;

const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 12px 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--ui, ${({ theme }) => theme.fontFamily.sans});
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $active }) => $active ? 'var(--ink, #2b2824)' : 'var(--ink-3, #6b645a)'};
  background: none;
  border: 0;
  border-bottom: 2px solid ${({ $active }) => $active ? 'var(--accent-stroke, #2b2824)' : 'transparent'};
  margin-bottom: -1px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition: color 150ms ease, border-color 150ms ease;

  &:hover {
    color: var(--ink, #2b2824);
  }
`;

const TabIcon = styled.span`
  font-size: 14px;
  flex-shrink: 0;
  line-height: 1;
`;

const TabLabel = styled.span<{ $visible: boolean }>`
  display: ${({ $visible }) => $visible ? 'inline' : 'none'};
`;

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

interface ViewTabsProps {
  onDateTabClick?: () => void;
  onTodayClick?: () => void;
}

export function ViewTabs({ onDateTabClick, onTodayClick }: ViewTabsProps = {}) {
  const viewMode = useUIStore(s => s.viewMode);
  const setViewMode = useUIStore(s => s.setViewMode);
  const selectedDate = useUIStore(s => s.selectedDate);
  const setSelectedDate = useUIStore(s => s.setSelectedDate);

  const isTabActive = useCallback((tab: TabEntry) => {
    if (tab.isToday) return viewMode === 'date' && isSameDay(selectedDate, new Date());
    if (tab.label === 'Date') return viewMode === 'date' && !isSameDay(selectedDate, new Date());
    return viewMode === tab.value;
  }, [viewMode, selectedDate]);

  const handleTabClick = useCallback((tab: TabEntry) => {
    if (tab.isToday) {
      setSelectedDate(new Date());
      setViewMode('date');
      onTodayClick?.();
      return;
    }
    if (tab.label === 'Date') {
      if (viewMode === 'date' && onDateTabClick) {
        onDateTabClick();
      } else {
        setViewMode('date');
        if (onDateTabClick) onDateTabClick();
      }
      return;
    }
    if (tab.value === 'search' && viewMode === 'search') {
      setViewMode('all');
    } else {
      setViewMode(tab.value);
    }
  }, [viewMode, setViewMode, setSelectedDate, onDateTabClick, onTodayClick]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (nextIndex !== null) {
      e.preventDefault();
      handleTabClick(tabs[nextIndex]);
    }
  }, [handleTabClick]);

  return (
    <Container role="tablist">
      {tabs.map((tab, i) => {
        const active = isTabActive(tab);
        return (
          <TabButton
            key={`${tab.label}-${i}`}
            role="tab"
            aria-selected={active}
            $active={active}
            title={tab.title}
            onClick={() => handleTabClick(tab)}
            onKeyDown={e => handleKeyDown(e, i)}
          >
            <TabIcon><FontAwesomeIcon icon={tab.icon} /></TabIcon>
          </TabButton>
        );
      })}
    </Container>
  );
}
