import { useState, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark, faChevronDown, faPenNib, faMicrophone } from '@fortawesome/free-solid-svg-icons';
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
  background: var(--paper-surface, #f7f4ee);
  border: none;
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

const ChipStrip = styled.div`
  display: flex;
  gap: 6px;
  padding: 10px var(--s-4, 16px) 10px;
  overflow-x: auto;
  border-bottom: 1px solid var(--rule-2, #e5dfd2);
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Chip = styled.button<{ $active?: boolean; $muted?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-family: var(--ui, ${({ theme }) => theme.fontFamily.sans});
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ $active, $muted }) => $active ? 'var(--accent-fill-ink, #f0ebdf)' : $muted ? 'var(--ink-4, #8a857c)' : 'var(--ink-2, #453f38)'};
  background: ${({ $active }) => $active ? 'var(--accent-fill, #2b2824)' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? 'var(--accent-fill, #2b2824)' : 'var(--rule, #d4cfc5)'};
  border-radius: var(--r-sm, 2px);
  cursor: pointer;
  white-space: nowrap;
  transition: background 150ms, color 150ms, border-color 150ms;

  &:hover {
    ${({ $active }) => !$active && 'background: var(--paper-hover, #f0eeea); color: var(--ink, #2b2824);'}
  }
`;

const ChipCount = styled.span`
  font-family: var(--mono, ${({ theme }) => theme.fontFamily.mono});
  font-size: 9.5px;
  opacity: 0.7;
  letter-spacing: 0;
`;

const NewEntryRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: var(--s-3, 12px) var(--s-4, 16px);
  border-bottom: 1px solid var(--rule-2, #e5dfd2);
`;

const NewEntryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 5px 12px;
  font-family: var(--ui, ${({ theme }) => theme.fontFamily.sans});
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink, #2b2824);
  background: transparent;
  border: 1px solid var(--rule, #d4cfc5);
  border-radius: var(--r-sm, 2px);
  cursor: pointer;
  transition: background 150ms, color 150ms;

  &:hover {
    background: var(--ink, #2b2824);
    color: var(--paper, #f0ebe3);
  }
`;

const MicBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--rule, #d4cfc5);
  border-radius: var(--r-sm, 2px);
  background: transparent;
  color: var(--ink-2, #453f38);
  cursor: pointer;
  font-size: 13px;
  transition: background 150ms, color 150ms;
  flex-shrink: 0;

  &:hover {
    background: var(--paper-hover, #f0eeea);
    color: var(--ink, #2b2824);
  }
`;

const VISIBLE_COUNT = 3;

interface TopicQuickFilterProps {
  topics: Topic[];
  selectedTopicId: number | null;
  headerColor: string;
  entryCounts: Map<number, number>;
  onSelect: (topicId: number | null) => void;
  totalCount?: number;
  onNewEntry?: () => void;
  onDictate?: () => void;
}

export function TopicQuickFilter({ topics, selectedTopicId, entryCounts, onSelect, totalCount = 0, onNewEntry, onDictate }: TopicQuickFilterProps) {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? topics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    : topics;

  const hasQuery = !!query.trim();
  const visible = (hasQuery || showAll) ? filtered : filtered.slice(0, VISIBLE_COUNT);
  const hiddenCount = (!hasQuery && !showAll) ? Math.max(0, filtered.length - VISIBLE_COUNT) : 0;

  const handleSelect = (topicId: number | null) => {
    onSelect(topicId);
    setQuery('');
  };

  return (
    <Wrap>
      <SearchBar>
        <SearchIcon>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </SearchIcon>
        <SearchInput
          ref={inputRef}
          value={query}
          placeholder="Filter by topic…"
          onChange={e => { setQuery(e.target.value); if (e.target.value) setShowAll(false); }}
          onKeyDown={e => {
            if (e.key === 'Escape') setQuery('');
            if (e.key === 'Enter' && filtered.length === 1) handleSelect(filtered[0].id);
          }}
        />
        {query && (
          <ClearBtn onMouseDown={() => { setQuery(''); inputRef.current?.focus(); }}>
            <FontAwesomeIcon icon={faXmark} />
          </ClearBtn>
        )}
      </SearchBar>

      <ChipStrip>
        {!hasQuery && (
          <Chip $active={selectedTopicId === null} onClick={() => handleSelect(null)}>
            All <ChipCount>{totalCount}</ChipCount>
          </Chip>
        )}
        {visible.map(topic => (
          <Chip key={topic.id} $active={selectedTopicId === topic.id} onClick={() => handleSelect(topic.id)}>
            {topic.name}
            <ChipCount>{entryCounts.get(topic.id) ?? 0}</ChipCount>
          </Chip>
        ))}
        {hiddenCount > 0 && (
          <Chip $muted onClick={() => setShowAll(true)}>
            <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 9 }} /> {hiddenCount} more
          </Chip>
        )}
      </ChipStrip>

      {onNewEntry && (
        <NewEntryRow>
          <NewEntryBtn onClick={onNewEntry}>
            <FontAwesomeIcon icon={faPenNib} style={{ fontSize: 11 }} /> New entry
          </NewEntryBtn>
          <MicBtn title="Dictate" onClick={onDictate ?? onNewEntry}>
            <FontAwesomeIcon icon={faMicrophone} />
          </MicBtn>
        </NewEntryRow>
      )}
    </Wrap>
  );
}
