import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { MaterialIcon } from '../components/atoms/MaterialIcon.js';
import { EditableEntryCard } from '../components/organisms/EditableEntryCard.js';
import { NewEntryCard } from '../components/organisms/NewEntryCard.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { stripHtml } from '../utils/stripHtml.js';
import type { DecryptedPost } from '@shared/crypto/types';

/* ── Layout (mirrors TopicsView) ── */

const Page = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
  padding: 0 24px 64px;
  @media (max-width: 768px) { padding: 0 16px 48px; }
`;

const Head = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 53px 0 20px;
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: -6px;
  background: transparent;
  border: none;
  border-radius: var(--r-md, 4px);
  color: var(--text-tertiary);
  cursor: pointer;
  &:hover { background: var(--bg-hover); color: var(--text-primary); }
`;

const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 200;
  line-height: 1;
  color: var(--text-primary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 480px) { font-size: 34px; }
`;

const NewBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 9px 4px;
  font-family: var(--font-label);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 120ms ease;
  &:hover { opacity: 0.7; }
`;

/* ── Rows ── */

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 18px 4px;
  border-top: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background 120ms ease;
  &:hover { background: var(--bg-hover); }
`;

const RowText = styled.div`
  min-width: 0;
`;

const RowTitle = styled.div`
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowTime = styled.div`
  font-family: var(--font-label);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  white-space: nowrap;
`;

const EditWrap = styled.div`
  border-top: 1px solid var(--border-subtle);
  padding: 8px 0;
`;

const AddWrap = styled.div`
  padding: 8px 0 0;
`;

/* ── Helpers ── */

function entryTitle(html: string): string {
  const headingMatch = html.match(/<h[1-4][^>]*>(.*?)<\/h[1-4]>/i);
  if (headingMatch) {
    const tmp = document.createElement('div');
    tmp.innerHTML = headingMatch[1];
    const text = (tmp.textContent || tmp.innerText || '').trim();
    if (text) return text;
  }
  return stripHtml(html).trim().slice(0, 80) || 'Untitled entry';
}

function entryDate(date: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (date.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return date.toLocaleDateString('en-US', opts);
}

/* ── View ── */

export function TopicDetailView() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const allTopics = useEntriesStore(s => s.allTopics);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const accentColor = useUIStore(s => s.accentColor) || '#4A5568';

  const topic = allTopics.find(t => String(t.id) === String(topicId));

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const topicEntries = useMemo(() => {
    if (!topic) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === topic.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, topic]);

  if (needsUnlock) return (
    <>
      <ContentTemplate><EmptyState message="Unlock your journal to view this topic" /></ContentTemplate>
      <UnlockDialog onUnlock={handleUnlock} />
    </>
  );

  if (isLoading || !isReady) return (
    <ContentTemplate>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Spinner size={40} />
      </div>
    </ContentTemplate>
  );

  if (!topic) return (
    <ContentTemplate>
      <EmptyState message="Topic not found." submessage="It may have been deleted." />
    </ContentTemplate>
  );

  return (
    <ContentTemplate>
      <Page>
        <Inner>
          <Head>
            <TitleBlock>
              <BackBtn onClick={() => navigate('/topics')} aria-label="Back to topics">
                <MaterialIcon $size={22} aria-hidden="true">chevron_left</MaterialIcon>
              </BackBtn>
              <Title>{topic.name}</Title>
            </TitleBlock>
            <NewBtn onClick={() => setIsAddOpen(true)}>
              <MaterialIcon $size={16} aria-hidden="true">add</MaterialIcon>
              New entry
            </NewBtn>
          </Head>

          {isAddOpen && (
            <AddWrap>
              <NewEntryCard
                topic={topic}
                accentColor={accentColor}
                hideButton
                isOpen={isAddOpen}
                onOpenChange={setIsAddOpen}
              />
            </AddWrap>
          )}

          {topicEntries.length === 0 ? (
            <EmptyState message={`No ${topic.name.toLowerCase()} entries yet.`} />
          ) : (
            <List>
              {topicEntries.map((entry: DecryptedPost) => {
                const created = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
                const title = entryTitle(entry.content);
                const isEditing = editingId === entry.id;
                return (
                  <div key={entry.id}>
                    {isEditing ? (
                      <EditWrap>
                        <EditableEntryCard
                          entry={entry}
                          topic={topic}
                          accentColor={accentColor}
                          isEditing
                          hidePreview
                          onSelect={() => setEditingId(null)}
                          onClose={() => setEditingId(null)}
                          onDeleted={() => setEditingId(null)}
                        />
                      </EditWrap>
                    ) : (
                      <Row onClick={() => setEditingId(entry.id)}>
                        <RowText>
                          <RowTitle>{title}</RowTitle>
                        </RowText>
                        <RowTime>{entryDate(created)}</RowTime>
                      </Row>
                    )}
                  </div>
                );
              })}
            </List>
          )}
        </Inner>
      </Page>
    </ContentTemplate>
  );
}
