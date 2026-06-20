import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from '../../../../design-system/components/core/Icon.jsx';
import { getTopicIcon } from '../../utils/topicIcons.js';
import type { Topic } from '../../types/topics.js';

const Wrap = styled.div``;

const SearchBar = styled.div`
  padding: 0;
  position: relative;
`;

const SearchIcon = styled.i`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-4, #8a857c);
  font-size: 12px;
  pointer-events: none;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 32px 12px 32px;
  background: transparent;
  border: none;
  border-top: 1px solid var(--rule, #d4cfc5);
  border-bottom: 1px solid var(--rule, #d4cfc5);
  border-radius: 0;
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 14px;
  color: var(--ink, #2b2824);
  outline: none;
  box-sizing: border-box;

  &:focus { outline: none; }
  &::placeholder { color: var(--ink-4, #8a857c); font-style: italic; }
`;

const ClearBtn = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  color: var(--ink-4, #8a857c);
  background: none; border: 0;
  cursor: pointer;
  font-size: 11px;
  &:hover { color: var(--ink, #2b2824); }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: var(--paper-surface, #f7f4ee);
  border: 1px solid var(--rule, #d4cfc5);
  border-top: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
`;

const DropdownItem = styled.button<{ $highlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  font-family: var(--sans, 'Lato', sans-serif);
  font-size: 14px;
  color: var(--ink, #2b2824);
  background: ${({ $highlighted }) => $highlighted ? 'var(--paper-hover, #f0eeea)' : 'transparent'};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 100ms;

  &:hover {
    background: var(--paper-hover, #f0eeea);
  }
`;

const DropdownIcon = styled.span`
  width: 16px;
  font-size: 12px;
  color: var(--ink-3, #6b645a);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DropdownCount = styled.span`
  margin-left: auto;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: var(--ink-4, #8a857c);
`;

const NewEntryRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1px 50px;
  align-items: stretch;
  border-bottom: 1px solid var(--rule-2, #e5dfd2);

  & > .divider {
    background: var(--rule, #d4cfc5);
    width: 1px;
  }
`;

const NewEntryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 12px;
  font-family: var(--ui, ${({ theme }) => theme.fontFamily.sans});
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink, #2b2824);
  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: background 150ms, color 150ms;

  &:hover {
    background: var(--paper-hover, #f0eeea);
    color: var(--ink, #2b2824);
  }
`;

const MicBtn = styled(NewEntryBtn)``;

interface TopicQuickFilterProps {
  topics: Topic[];
  selectedTopicId: number | null;
  accentColor: string;
  entryCounts: Map<number, number>;
  onSelect: (topicId: number | null) => void;
  totalCount?: number;
  onNewEntry?: () => void;
  onDictate?: () => void;
}

export function TopicQuickFilter({ topics, selectedTopicId, entryCounts, onSelect, totalCount = 0, onNewEntry, onDictate }: TopicQuickFilterProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  const filtered = query.trim()
    ? topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : topics;

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (topicId: number | null) => {
    onSelect(topicId);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex(i => Math.min(i + 1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex === 0) {
        handleSelect(null);
      } else if (filtered[highlightIndex - 1]) {
        handleSelect(filtered[highlightIndex - 1].id);
      }
    }
  };

  const displayValue = isOpen ? query : (selectedTopic?.name || 'All Topics');

  return (
    <Wrap ref={wrapRef}>
      {onNewEntry && (
        <NewEntryRow>
          <NewEntryBtn onClick={onNewEntry}>
            <Icon name="plus" size={11} strokeWidth={2} /> New entry
          </NewEntryBtn>
          <span className="divider" aria-hidden="true" />
          <MicBtn title="Dictate" aria-label="Dictate" onClick={onDictate ?? onNewEntry}>
            <Icon name="mic" size={13} strokeWidth={2} />
          </MicBtn>
        </NewEntryRow>
      )}

      <SearchBar>
        <SearchIcon>
          <Icon name="search" size={12} strokeWidth={2} />
        </SearchIcon>
        <SearchInput
          ref={inputRef}
          value={isOpen ? query : ''}
          placeholder={displayValue}
          onChange={e => { setQuery(e.target.value); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {selectedTopicId !== null && !isOpen && (
          <ClearBtn onClick={() => { handleSelect(null); }}>
            <Icon name="x" size={11} strokeWidth={2} />
          </ClearBtn>
        )}
        {isOpen && query && (
          <ClearBtn onMouseDown={() => { setQuery(''); inputRef.current?.focus(); }}>
            <Icon name="x" size={11} strokeWidth={2} />
          </ClearBtn>
        )}
        {isOpen && (
          <Dropdown>
            <DropdownItem
              $highlighted={highlightIndex === 0}
              onMouseEnter={() => setHighlightIndex(0)}
              onClick={() => handleSelect(null)}
            >
              <DropdownIcon />
              <span style={{ fontStyle: 'italic' }}>All Topics</span>
              <DropdownCount>{totalCount}</DropdownCount>
            </DropdownItem>
            {filtered.map((topic, i) => (
              <DropdownItem
                key={topic.id}
                $highlighted={highlightIndex === i + 1}
                onMouseEnter={() => setHighlightIndex(i + 1)}
                onClick={() => handleSelect(topic.id)}
              >
                <DropdownIcon>
                  <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
                </DropdownIcon>
                {topic.name}
                <DropdownCount>{entryCounts.get(topic.id) ?? 0}</DropdownCount>
              </DropdownItem>
            ))}
            {filtered.length === 0 && query && (
              <DropdownItem as="div" style={{ color: 'var(--ink-4)', cursor: 'default' }}>
                No topics match "{query}"
              </DropdownItem>
            )}
          </Dropdown>
        )}
      </SearchBar>
    </Wrap>
  );
}
