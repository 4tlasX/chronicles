import { useState } from 'react';
import styled from 'styled-components';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { TopicSelectorDropdown } from './TopicSelectorDropdown.js';

interface QuickEntryProps {
  onCreateEntry: (content: string, topicId: number | null) => void;
}

const Container = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.1);
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
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const TopicDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
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
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.text};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.1);
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.borderFocus};
  }
`;

const SubmitButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 12px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textInverse};
  background: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.border : theme.colors.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme, $disabled }) =>
      $disabled ? theme.colors.border : theme.colors.accentHover};
  }
`;

export function QuickEntry({ onCreateEntry }: QuickEntryProps) {
  const topics = useEntriesStore((s) => s.topics);

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
              <TopicDot $color={selectedTopic.color || '#999'} />
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
