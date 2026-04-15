import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { getTopicIcon } from '../../utils/topicIcons.js';
import type { Topic } from '../../types/topics.js';

const Wrap = styled.div`
  position: relative;
`;

const InputRow = styled.div<{ $hasSelection: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: ${({ $hasSelection, $color }) =>
    $hasSelection ? `${$color}12` : 'transparent'};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: text;
  transition: background 150ms;
`;

const SearchIcon = styled.span<{ $color: string; $hasSelection: boolean }>`
  color: ${({ $color, $hasSelection, theme }) => $hasSelection ? $color : theme.colors.textMuted};
  font-size: 11px;
  flex-shrink: 0;
`;

const TopicIconWrap = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 12px;
  flex-shrink: 0;
`;

const Input = styled.input`
  flex: 1;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  outline: none;
  min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
`;

const ClearBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 11px;
  flex-shrink: 0;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 12px rgba(0,0,0,0.10);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
`;

const DropdownItem = styled.button<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  &:hover { background: rgba(0,0,0,0.04); }
`;

const ItemIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 12px;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
`;

const ItemCount = styled.span`
  margin-left: auto;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const NoMatch = styled.div`
  padding: 10px 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fontFamily.ui};
`;

interface TopicQuickFilterProps {
  topics: Topic[];
  selectedTopicId: number | null;
  headerColor: string;
  entryCounts: Map<number, number>;
  onSelect: (topicId: number | null) => void;
}

export function TopicQuickFilter({ topics, selectedTopicId, headerColor, entryCounts, onSelect }: TopicQuickFilterProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTopic = topics.find(t => t.id === selectedTopicId) ?? null;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : topics;

  const handleSelect = (topicId: number) => {
    onSelect(topicId);
    setQuery('');
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (!selectedTopic) setOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const displayValue = selectedTopic && !open ? selectedTopic.name : query;

  return (
    <Wrap ref={wrapRef}>
      <InputRow
        $hasSelection={selectedTopic !== null}
        $color={headerColor}
        onClick={() => { if (!selectedTopic) { setOpen(true); inputRef.current?.focus(); } }}
      >
        {selectedTopic ? (
          <TopicIconWrap $color={headerColor}>
            <FontAwesomeIcon icon={getTopicIcon(selectedTopic.icon)} />
          </TopicIconWrap>
        ) : (
          <SearchIcon $color={headerColor} $hasSelection={false}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </SearchIcon>
        )}
        <Input
          ref={inputRef}
          value={displayValue}
          placeholder="Filter by topic…"
          readOnly={selectedTopic !== null && !open}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'Escape') { setOpen(false); setQuery(''); }
            if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0].id);
          }}
        />
        {selectedTopic && (
          <ClearBtn onMouseDown={handleClear} title="Clear topic filter">
            <FontAwesomeIcon icon={faXmark} />
          </ClearBtn>
        )}
      </InputRow>

      {open && (
        <Dropdown>
          {filtered.map(topic => (
            <DropdownItem
              key={topic.id}
              $color={headerColor}
              onMouseDown={() => handleSelect(topic.id)}
            >
              <ItemIcon $color={headerColor}>
                <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
              </ItemIcon>
              {topic.name}
              <ItemCount>{entryCounts.get(topic.id) ?? 0}</ItemCount>
            </DropdownItem>
          ))}
          {filtered.length === 0 && <NoMatch>No topics match "{query}"</NoMatch>}
        </Dropdown>
      )}
    </Wrap>
  );
}
