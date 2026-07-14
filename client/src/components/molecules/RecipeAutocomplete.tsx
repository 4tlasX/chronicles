import { useMemo, useState } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  font-size: 12px;
  padding: 3px 0;
  border: none;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-label);
  &::placeholder { color: var(--text-tertiary); }
  &:focus { outline: none; border-bottom-color: var(--color-accent); }
`;

const Menu = styled.ul`
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px 0;
  list-style: none;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-md, 4px);
  box-shadow: var(--shadow-lg);
  max-height: 180px;
  overflow-y: auto;
  z-index: 30;
`;

const Option = styled.li<{ $active?: boolean }>`
  padding: 6px 10px;
  font-size: 12.5px;
  font-family: var(--font-sans);
  color: var(--text-primary);
  cursor: pointer;
  background: ${({ $active }) => $active ? 'var(--bg-hover)' : 'transparent'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoMatch = styled.li`
  padding: 6px 10px;
  font-size: 12px;
  font-style: italic;
  color: var(--text-tertiary);
`;

interface RecipeAutocompleteProps {
  recipes: { id: number; title: string }[];
  onSelect: (id: number) => void;
  placeholder?: string;
}

/** Type-to-search recipe picker: filters titles as you type, arrow keys + Enter or click to select. */
export function RecipeAutocomplete({ recipes, onSelect, placeholder = 'Link recipe…' }: RecipeAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? recipes.filter(r => r.title.toLowerCase().includes(q)) : recipes;
    return list.slice(0, 8);
  }, [recipes, query]);

  const select = (id: number) => {
    onSelect(id);
    setQuery('');
    setOpen(false);
  };

  return (
    <Wrap>
      <SearchInput
        value={query}
        placeholder={placeholder}
        onChange={e => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={e => {
          if (!open) return;
          if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, matches.length - 1)); }
          if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
          if (e.key === 'Enter')     { e.preventDefault(); if (matches[highlight]) select(matches[highlight].id); }
          if (e.key === 'Escape')    { setOpen(false); setQuery(''); }
        }}
      />
      {open && (
        <Menu>
          {matches.length === 0 ? (
            <NoMatch>No matching recipes</NoMatch>
          ) : (
            matches.map((r, i) => (
              <Option
                key={r.id}
                $active={i === highlight}
                onMouseDown={e => { e.preventDefault(); select(r.id); }}
                onMouseEnter={() => setHighlight(i)}
              >
                {r.title}
              </Option>
            ))
          )}
        </Menu>
      )}
    </Wrap>
  );
}
