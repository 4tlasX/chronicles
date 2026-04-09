import { useRef, useEffect, useLayoutEffect, useState, useCallback, type ReactNode, type KeyboardEvent } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '../../stores/uiStore.js';
import type { ViewMode } from '../../types/ui.js';

type TabEntry =
  | { value: ViewMode; label: ReactNode; flex?: number; special?: false }
  | { value: 'today'; label: ReactNode; flex?: number; special: true };

const SrOnly = styled.span`
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
`;

const BookmarkIcon = () => (
  <>
    <FontAwesomeIcon icon={faBookmark} aria-hidden="true" />
    <SrOnly>Bookmarks</SrOnly>
  </>
);

const tabs: TabEntry[] = [
  { value: 'today', label: 'Today', special: true },
  { value: 'date', label: 'Date' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'all', label: 'All', flex: 0.5 },
  { value: 'favorites', label: <BookmarkIcon />, flex: 0.5 },
  { value: 'search', label: 'Search' },
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: transparent;
  min-height: 46px;
  max-height: 46px;
  padding: 0 8px;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Slider = styled.div<{ $left: number; $width: number }>`
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) => $width}px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  transition: left 300ms ease-out, width 300ms ease-out;
  pointer-events: none;
  z-index: 0;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 8px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  font-weight: ${({ theme, $active }) => $active ? theme.fontWeight.semibold : theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 200ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

interface ViewTabsProps {
  onDateTabClick?: () => void;
  onTodayClick?: () => void;
}

export function ViewTabs({ onDateTabClick, onTodayClick }: ViewTabsProps = {}) {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const selectedDate = useUIStore((s) => s.selectedDate);
  const setSelectedDate = useUIStore((s) => s.setSelectedDate);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  const isTabActive = useCallback((tab: TabEntry) => {
    if (tab.special) return viewMode === 'date' && isSameDay(selectedDate, new Date());
    return viewMode === tab.value;
  }, [viewMode, selectedDate]);

  const updateSlider = useCallback(() => {
    const activeIndex = tabs.findIndex((t) => isTabActive(t));
    const activeTab = tabRefs.current[activeIndex];
    if (activeTab && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setSliderStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [viewMode]);

  useLayoutEffect(() => {
    updateSlider();
  }, [updateSlider]);

  useEffect(() => {
    window.addEventListener('resize', updateSlider);
    return () => window.removeEventListener('resize', updateSlider);
  }, [updateSlider]);

  const handleTabClick = useCallback((tab: TabEntry) => {
    if (tab.special) {
      setSelectedDate(new Date());
      setViewMode('date');
      onTodayClick?.();
      return;
    }
    if (tab.value === 'search' && viewMode === 'search') {
      setViewMode('all');
    } else if (tab.value === 'date' && viewMode === 'date' && onDateTabClick) {
      onDateTabClick();
    } else {
      setViewMode(tab.value);
      if (tab.value === 'date' && onDateTabClick) onDateTabClick();
    }
  }, [viewMode, setViewMode, setSelectedDate, onDateTabClick]);

  const handleKeyDown = useCallback((e: KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      tabRefs.current[nextIndex]?.focus();
      handleTabClick(tabs[nextIndex]);
    }
  }, [handleTabClick]);

  return (
    <Container ref={containerRef} role="tablist">
      <Slider $left={sliderStyle.left} $width={sliderStyle.width} />
      {tabs.map((tab, i) => (
        <TabButton
          key={tab.value}
          ref={(el) => { tabRefs.current[i] = el; }}
          role="tab"
          aria-selected={isTabActive(tab)}
          tabIndex={isTabActive(tab) ? 0 : -1}
          $active={isTabActive(tab)}
          style={tab.flex ? { flex: tab.flex } : undefined}
          onClick={() => handleTabClick(tab)}
          onKeyDown={e => handleKeyDown(e, i)}
        >
          {tab.label}
        </TabButton>
      ))}
    </Container>
  );
}
