import styled from 'styled-components';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { TextInput } from '../atoms/TextInput.js';
import { DateInput } from '../atoms/DateInput.js';
import { Button } from '../atoms/Button.js';
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

const ClearRow = styled.div`
  display: flex;
  justify-content: flex-end;
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
          <TextInput
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            placeholder="Search entries..."
          />
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
      {hasFilters && (
        <ClearRow>
          <Button variant="ghost" onClick={clearSearch}>
            <Icon icon={faXmark} size="sm" /> Clear
          </Button>
        </ClearRow>
      )}
    </Panel>
  );
}
