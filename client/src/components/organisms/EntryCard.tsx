import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { SwipeActions } from '../molecules/SwipeActions.js';
import { useUIStore } from '../../stores/uiStore.js';
import { stripHtml } from '../../utils/stripHtml.js';

interface EntryCardProps {
  id: number;
  content: string;
  date: string;
  topicName?: string;
  topicColor?: string;
  topicIcon?: IconDefinition;
  topicId?: number;
  active?: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onTopicClick?: (topicId: number) => void;
  onToggleComplete?: (id: number, completed: boolean) => void;
  onToggleBookmark?: (id: number, isFavorite: boolean) => void;
  hasCheckbox?: boolean;
  isCompleted?: boolean;
  isFavorite?: boolean;
  customType?: string;
  previewText?: string;
}

function extractTitle(html: string, fallback?: string): string {
  const headingMatch = html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
  if (headingMatch) {
    const tmp = document.createElement('div');
    tmp.innerHTML = headingMatch[1];
    const text = (tmp.textContent || tmp.innerText || '').trim();
    if (text) return text;
  }
  const plain = stripHtml(html).trim();
  return plain.slice(0, 70) || fallback || 'Untitled entry';
}

function extractPreview(html: string): string {
  const headingMatch = html.match(/<h[1-4][^>]*>.*?<\/h[1-4]>/i);
  let remainder = html;
  if (headingMatch) {
    remainder = html.slice((headingMatch.index ?? 0) + headingMatch[0].length);
  } else {
    const plain = stripHtml(html).trim();
    if (plain.length <= 70) return '';
    remainder = plain.slice(70);
  }
  return stripHtml(remainder).trim();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readTimeLabel(words: number): string {
  return Math.max(1, Math.round(words / 200)) + ' min read';
}

const Row = styled.div<{ $active?: boolean }>`
  padding: 14px var(--s-4, 16px);
  border-bottom: 1px solid var(--rule-2, #e5dfd2);
  cursor: pointer;
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 10px;
  align-items: start;
  background: ${({ $active }) => $active ? 'var(--paper-surface, #f7f4ee)' : 'transparent'};
  border-left: 2px solid ${({ $active }) => $active ? 'var(--accent-stroke, #2b2824)' : 'transparent'};
  padding-left: ${({ $active }) => $active ? 'calc(var(--s-4, 16px) - 2px)' : 'var(--s-4, 16px)'};
  transition: background 120ms;

  &:hover {
    background: var(--paper-surface, #f7f4ee);
  }
`;

const DateStamp = styled.div`
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: var(--ink-4, #8a857c);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: right;
  line-height: 1.3;
  padding-right: 7px;
`;

const DayNum = styled.span`
  font-family: var(--serif, 'Playfair Display', Georgia, serif);
  font-style: italic;
  font-size: 26px;
  color: var(--ink, #2b2824);
  letter-spacing: 0;
  display: block;
  line-height: 1;
  margin-top: 0;
  margin-bottom: 7px;
  padding-bottom: 5px;
`;

const ContentArea = styled.div`
  min-width: 0;
`;

const TitleText = styled.div<{ $completed?: boolean }>`
  font-family: var(--serif, 'Playfair Display', Georgia, serif);
  font-style: italic;
  font-size: 15px;
  color: var(--ink, #2b2824);
  line-height: 1.35;
  text-decoration: ${({ $completed }) => $completed ? 'line-through' : 'none'};
  margin: 0 0 3px;
`;

const PreviewText = styled.div`
  font-family: var(--sans, 'Lato', sans-serif);
  font-size: 12.5px;
  color: var(--ink-3, #6b645a);
  line-height: 1.45;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const FooterMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-4, #8a857c);
`;

const TopicDot = styled.span<{ $color?: string }>`
  width: 6px;
  height: 6px;
  border-radius: 1px;
  background: ${({ $color }) => $color || 'var(--ink-3, #6b645a)'};
  flex-shrink: 0;
  display: inline-block;
  cursor: pointer;
`;

const BookmarkIcon = styled.span`
  margin-left: auto;
  color: var(--accent-stroke, #2b2824);
  font-size: 11px;
  line-height: 1;
  flex-shrink: 0;
  cursor: pointer;
  &:hover { opacity: 0.7; }
`;

export function EntryCard({
  id, content, date, topicName, topicColor, topicId,
  active, onClick, onDelete, onTopicClick, onToggleBookmark,
  isCompleted, isFavorite, previewText,
}: EntryCardProps) {
  const headerColor = useUIStore(s => s.headerColor) || '#6A9B9B';

  const d = new Date(date);
  const dayNum = d.getDate();
  const monthCode = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const title = extractTitle(content, previewText);
  const preview = extractPreview(content);
  const plainText = stripHtml(content);
  const wordCount = countWords(plainText);
  const readTime = wordCount >= 50 ? readTimeLabel(wordCount) : null;

  const inner = (
    <Row $active={active} onClick={onClick}>
      <DateStamp>
        <DayNum>{dayNum}</DayNum>
        {monthCode}<br />{timeStr}
      </DateStamp>

      <ContentArea>
        <TitleText $completed={isCompleted}>{title}</TitleText>
        {preview && <PreviewText>{preview}</PreviewText>}
        <FooterMeta>
          {topicName && (
            <>
              <TopicDot
                $color={topicColor || undefined}
                onClick={e => { e.stopPropagation(); if (topicId && onTopicClick) onTopicClick(topicId); }}
              />
              <span
                style={{ cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); if (topicId && onTopicClick) onTopicClick(topicId); }}
              >{topicName}</span>
            </>
          )}
          {readTime && <><span>·</span><span>{readTime}</span></>}
          {isFavorite && (
            <BookmarkIcon
              onClick={e => { e.stopPropagation(); onToggleBookmark?.(id, false); }}
              title="Remove bookmark"
            >
              <FontAwesomeIcon icon={faBookmark} />
            </BookmarkIcon>
          )}
        </FooterMeta>
      </ContentArea>
    </Row>
  );

  return onDelete ? (
    <SwipeActions onDelete={onDelete} accentColor={headerColor}>
      {inner}
    </SwipeActions>
  ) : inner;
}
