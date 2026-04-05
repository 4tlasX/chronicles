import styled from 'styled-components';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TextInput } from '../atoms/TextInput.js';
import { DateInput } from '../atoms/DateInput.js';
import { Icon } from '../atoms/Icon.js';
import { FormField } from '../molecules/FormField.js';
import { useUIStore } from '../../stores/uiStore.js';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.xl}px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
`;

const DateRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm}px;

  & > * {
    flex: 1;
    min-width: 0;
    margin-top: 0 !important;
  }
`;

const SearchRow = styled.div`
  position: relative;
`;

const ClearBtn = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px;
  min-width: 28px;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

export function SearchPanel() {
  const searchKeyword = useUIStore(s => s.searchKeyword);
  const searchDateFrom = useUIStore(s => s.searchDateFrom);
  const searchDateTo = useUIStore(s => s.searchDateTo);
  const setSearchKeyword = useUIStore(s => s.setSearchKeyword);
  const setSearchDateFrom = useUIStore(s => s.setSearchDateFrom);
  const setSearchDateTo = useUIStore(s => s.setSearchDateTo);
  const clearSearch = useUIStore(s => s.clearSearch);

  const hasFilters = searchKeyword || searchDateFrom || searchDateTo;

  return (
    <Panel>
      <div style={{ marginBottom: 8 }}>
        <FormField label="Search">
          <SearchRow>
            <TextInput
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder="Search entries..."
              style={{ paddingRight: hasFilters ? 32 : undefined }}
            />
            {hasFilters && (
              <ClearBtn onClick={clearSearch} aria-label="Clear search">
                <Icon icon={faXmark} size="sm" />
              </ClearBtn>
            )}
          </SearchRow>
        </FormField>
      </div>
      <DateRow>
        <FormField label="From">
          <DateInput
            value={searchDateFrom}
            onChange={e => setSearchDateFrom(e.target.value)}
          />
        </FormField>
        <FormField label="To">
          <DateInput
            value={searchDateTo}
            onChange={e => setSearchDateTo(e.target.value)}
          />
        </FormField>
      </DateRow>
    </Panel>
  );
}
