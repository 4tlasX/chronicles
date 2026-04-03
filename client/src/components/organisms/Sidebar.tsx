import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '../atoms/Icon.js';
import { Button } from '../atoms/Button.js';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { getTopicIcon } from '../../utils/topicIcons.js';

const SidebarContainer = styled.aside`
  width: 280px;
  min-width: 280px;
  height: 100%;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
  }
`;

const TopicList = styled.div`
  padding: ${({ theme }) => theme.spacing.sm}px;
  flex: 1;
`;

const TopicItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme, $active }) => $active ? theme.colors.accent : theme.colors.text};
  font-weight: ${({ $active, theme }) => $active ? theme.fontWeight.semibold : theme.fontWeight.normal};
  background: ${({ $active, theme }) => $active ? theme.colors.surfaceHover : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const TopicIconWrapper = styled.span<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  font-size: 12px;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const TopicCount = styled.span`
  margin-left: auto;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SidebarTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export function Sidebar() {
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const headerColor = useUIStore(s => s.headerColor) || '#4A5568';
  const topics = useEntriesStore(s => s.topics);
  const entries = useEntriesStore(s => s.decryptedEntries);

  const countForTopic = (topicId: number) =>
    entries.filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === topicId).length;

  return (
    <SidebarContainer>
      <SidebarHeader>
        <SidebarTitle>Topics</SidebarTitle>
        <Button variant="ghost" style={{ padding: '4px 8px' }}>
          <Icon icon={faPlus} size="sm" />
        </Button>
      </SidebarHeader>

      <TopicList>
        <TopicItem
          $active={selectedTopicId === null}
          onClick={() => setSelectedTopicId(null)}
        >
          All Entries
          <TopicCount>{entries.length}</TopicCount>
        </TopicItem>

        {topics.map(topic => (
          <TopicItem
            key={topic.id}
            $active={selectedTopicId === topic.id}
            onClick={() => setSelectedTopicId(topic.id)}
          >
            <TopicIconWrapper $color={headerColor}>
              <FontAwesomeIcon icon={getTopicIcon(topic.icon)} />
            </TopicIconWrapper>
            {topic.name}
            <TopicCount>{countForTopic(topic.id)}</TopicCount>
          </TopicItem>
        ))}
      </TopicList>
    </SidebarContainer>
  );
}
