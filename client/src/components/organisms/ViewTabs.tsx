import { useRef, useEffect, useState, type ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '../../stores/uiStore.js';

type ViewMode = 'date' | 'all' | 'tasks' | 'favorites' | 'search';

const tabs: { value: ViewMode; label: ReactNode }[] = [
  { value: 'date', label: 'Date' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'all', label: 'All' },
  { value: 'favorites', label: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><FontAwesomeIcon icon={faBookmark} size="xs" /> Bookmarks</span> },
  { value: 'search', label: 'Search' },
];

const Container = styled.div`
  position: relative;
  display: flex;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.3);
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Slider = styled.div<{ $left: number; $width: number }>`
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) => $width}px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.5);
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
  padding: 6px 2px;
  font-size: 13px;
  font-weight: ${({ theme, $active }) => $active ? theme.fontWeight.medium : theme.fontWeight.normal};
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
}

export function ViewTabs({ onDateTabClick }: ViewTabsProps = {}) {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.value === viewMode);
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

  return (
    <Container ref={containerRef}>
      <Slider $left={sliderStyle.left} $width={sliderStyle.width} />
      {tabs.map((tab, i) => (
        <TabButton
          key={tab.value}
          ref={(el) => { tabRefs.current[i] = el; }}
          $active={viewMode === tab.value}
          onClick={() => {
            if (tab.value === 'date' && viewMode === 'date' && onDateTabClick) {
              onDateTabClick();
            } else {
              setViewMode(tab.value);
              if (tab.value === 'date' && onDateTabClick) onDateTabClick();
            }
          }}
        >
          {tab.label}
        </TabButton>
      ))}
    </Container>
  );
}
