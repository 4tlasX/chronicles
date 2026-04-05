import { useState } from 'react';
import styled from 'styled-components';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { useUIStore } from '../../stores/uiStore.js';
import { getTopicIcon } from '../../utils/topicIcons.js';
import { TopicSelectorDropdown } from './TopicSelectorDropdown.js';

interface QuickEntryProps {
  onCreateEntry: (content: string, topicId: number | null) => void;
}

const Container = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
`;

const TopicTrigger = styled.button<{ $hasColor?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const TopicIconSmall = styled.span<{ $color: string }>`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const PlaceholderText = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ChevronIcon = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: 2px;
`;

const BodyRow = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 8px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0;
  font-size: 15px;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    font-style: italic;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.text};
  }
`;

const SubmitButton = styled.button<{ $disabled?: boolean }>`
  padding: 0;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.textMuted : theme.colors.text};
  background: transparent;
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: color 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: ${({ theme, $disabled }) =>
      $disabled ? theme.colors.border : theme.colors.text};
  }
`;

export function QuickEntry({ onCreateEntry }: QuickEntryProps) {
  const topics = useEntriesStore((s) => s.topics);
  const headerColor = useUIStore(s => s.headerColor) || '#4E6E7E';

  const [text, setText] = useState('');
  const [quickTopicId, setQuickTopicId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedTopic = topics.find((t) => t.id === quickTopicId);
  const isEmpty = text.trim().length === 0;

  function handleSubmit() {
    if (isEmpty) return;
    onCreateEntry(text.trim(), quickTopicId);
    setText('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !isEmpty) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <Container>
      <HeaderRow>
        <TopicTrigger onClick={() => setDropdownOpen(!dropdownOpen)}>
          {selectedTopic ? (
            <>
              <TopicIconSmall $color={headerColor}>
                <FontAwesomeIcon icon={getTopicIcon(selectedTopic.icon)} />
              </TopicIconSmall>
              {selectedTopic.name}
            </>
          ) : (
            <PlaceholderText>No topic</PlaceholderText>
          )}
          <ChevronIcon><FontAwesomeIcon icon={faChevronDown} /></ChevronIcon>
        </TopicTrigger>
        <TopicSelectorDropdown
          isOpen={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          selectedTopicId={quickTopicId}
          onSelect={setQuickTopicId}
          topics={topics}
        />
      </HeaderRow>
      <BodyRow>
        <Input
          type="text"
          placeholder="Quick entry..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <SubmitButton $disabled={isEmpty} onClick={handleSubmit} disabled={isEmpty}>
          Add
        </SubmitButton>
      </BodyRow>
    </Container>
  );
}
