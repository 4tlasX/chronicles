import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SearchInput } from '../molecules/SearchInput.js';
import { getTopicIcon } from '../../utils/topicIcons.js';
import { useUIStore } from '../../stores/uiStore.js';

const dropdownSlide = keyframes`
  from { opacity: 0; transform: translateY(-8px) scaleY(0.95); }
  to { opacity: 1; transform: translateY(0) scaleY(1); }
`;

const Wrapper = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const TopicIcon = styled.span<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 18px;
  flex-shrink: 0;
`;

const Placeholder = styled.span`
  color: ${({ theme }) => theme.colors.text};
`;

const ChevronIcon = styled.span<{ $open: boolean }>`
  margin-left: auto;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: transform 0.15s;
  transform: ${({ $open }) => $open ? 'rotate(180deg)' : 'rotate(0)'};
`;

const Dropdown = styled.div`
  position: absolute;
  z-index: 40;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 260px;
  max-height: 320px;
  overflow-y: auto;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  animation: ${dropdownSlide} 0.15s ease-out;
  transform-origin: top center;
`;

const SearchWrapper = styled.div`
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  backdrop-filter: blur(20px);
`;

const ItemList = styled.div`
  padding: 4px 0;
`;

const Item = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  text-align: left;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ $active }) => $active ? 'rgba(0,0,0,0.04)' : 'transparent'};
  border: none;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const EmptyMessage = styled.div`
  padding: 16px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

interface TopicSelectorProps {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  topics: { id: number; name: string; icon: string | null; color: string | null }[];
}

export function TopicSelector({ selectedId, onSelect, topics }: TopicSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerColor = useUIStore(s => s.headerColor) || '#6A9B9B';

  const selected = topics.find(t => t.id === selectedId);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const filtered = search
    ? topics.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : topics;

  return (
    <Wrapper ref={wrapperRef}>
      <Trigger onClick={() => setOpen(!open)}>
        {selected ? (
          <>
            <TopicIcon $color={headerColor}><FontAwesomeIcon icon={getTopicIcon(selected.icon)} /></TopicIcon>
            {selected.name}
          </>
        ) : (
          <Placeholder>No topic</Placeholder>
        )}
        <ChevronIcon $open={open}>
          <FontAwesomeIcon icon={faChevronDown} />
        </ChevronIcon>
      </Trigger>

      {open && (
        <Dropdown>
          <SearchWrapper>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Type to search topics..."
              debounceMs={0}
            />
          </SearchWrapper>
          <ItemList>
            <Item
              $active={selectedId === null}
              onClick={() => { onSelect(null); setOpen(false); setSearch(''); }}
            >
              No topic
            </Item>
            {filtered.length === 0 ? (
              <EmptyMessage>No topics found</EmptyMessage>
            ) : (
              filtered.map(t => (
                <Item
                  key={t.id}
                  $active={selectedId === t.id}
                  onClick={() => { onSelect(t.id); setOpen(false); setSearch(''); }}
                >
                  <TopicIcon $color={headerColor}><FontAwesomeIcon icon={getTopicIcon(t.icon)} /></TopicIcon>
                  {t.name}
                </Item>
              ))
            )}
          </ItemList>
        </Dropdown>
      )}
    </Wrapper>
  );
}
