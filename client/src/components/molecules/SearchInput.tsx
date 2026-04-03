import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  padding-left: 32px;
  padding-right: 32px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  padding: 2px 4px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', debounceMs = 200 }: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (val: string) => {
    setLocal(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(val), debounceMs);
  };

  return (
    <Wrapper>
      <SearchIcon><FontAwesomeIcon icon={faSearch} /></SearchIcon>
      <Input
        type="text"
        value={local}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
      />
      {local && (
        <ClearButton onClick={() => { setLocal(''); onChange(''); }}>
          <FontAwesomeIcon icon={faXmark} />
        </ClearButton>
      )}
    </Wrapper>
  );
}
