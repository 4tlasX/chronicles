import styled from 'styled-components';
import { Icon } from '../../../../design-system/components/core/Icon.jsx';
import { stripHtml } from '../../utils/stripHtml.js';

interface EntryListCardProps {
  content: string;
  createdAt: Date;
  topicName?: string;
  topicColor?: string;
  completed?: boolean;
  onClick?: () => void;
}

/* Mobile-style list row: big day number + weekday on the left, a colored topic
   dot + uppercase topic label, the title, a preview line, and a right chevron.
   Hairline divider between rows. Used by Tasks, Todos, and Topics lists. */

function extractTitle(html: string): string {
  const headingMatch = html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
  if (headingMatch) {
    const tmp = document.createElement('div');
    tmp.innerHTML = headingMatch[1];
    const text = (tmp.textContent || tmp.innerText || '').trim();
    if (text) return text;
  }
  return stripHtml(html).trim().slice(0, 70) || 'Untitled';
}

const Row = styled.div`
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 18px 4px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-subtle);
  transition: background 120ms ease;
  &:hover { background: var(--bg-hover); }
`;

const DateCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1;
`;

const DayNum = styled.span`
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 200;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.01em;
`;

const Weekday = styled.span`
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-top: 6px;
`;

const ContentArea = styled.div`
  min-width: 0;
`;

const TopicRow = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
`;

const TopicLabel = styled.span`
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-tertiary);
`;

const Title = styled.div<{ $completed?: boolean }>`
  font-family: var(--font-sans);
  font-size: 17px;
  font-weight: 400;
  color: ${({ $completed }) => $completed ? 'var(--text-tertiary)' : 'var(--text-primary)'};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: ${({ $completed }) => $completed ? 'line-through' : 'none'};
`;

const Chevron = styled.span`
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  flex-shrink: 0;
`;

export function EntryListCard({ content, createdAt, topicName, completed, onClick }: EntryListCardProps) {
  const dayNum = createdAt.getDate();
  const weekday = createdAt.toLocaleDateString('en-US', { weekday: 'short' });
  const title = extractTitle(content);

  return (
    <Row onClick={onClick}>
      <DateCol>
        <DayNum>{dayNum}</DayNum>
        <Weekday>{weekday}</Weekday>
      </DateCol>
      <ContentArea>
        {topicName && (
          <TopicRow>
            <TopicLabel>{topicName}</TopicLabel>
          </TopicRow>
        )}
        <Title $completed={completed}>{title}</Title>
      </ContentArea>
      <Chevron>
        <Icon name="chevron-right" size={20} strokeWidth={2} />
      </Chevron>
    </Row>
  );
}
