import styled from 'styled-components';
import { Badge } from '../atoms/Badge.js';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

interface EntryMetaProps {
  date: string;
  topicName?: string;
  topicColor?: string;
}

export function EntryMeta({ date, topicName, topicColor }: EntryMetaProps) {
  const formatted = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Wrapper>
      <span>{formatted}</span>
      {topicName && <Badge>{topicName}</Badge>}
    </Wrapper>
  );
}
