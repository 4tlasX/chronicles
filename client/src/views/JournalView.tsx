import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { getTopicIcon } from '../utils/topicIcons.js';
import { AppTemplate } from '../components/templates/AppTemplate.js';
import { ViewTabs } from '../components/organisms/ViewTabs.js';
import { QuickEntry } from '../components/organisms/QuickEntry.js';
import { EntryList } from '../components/organisms/EntryList.js';
import { EntryForm } from '../components/organisms/EntryForm.js';
import { SearchPanel } from '../components/organisms/SearchPanel.js';
import { MiniCalendar } from '../components/organisms/MiniCalendar.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { entries as entriesApi, topics as topicsApi, settings as settingsApi } from '../services/api.js';
import { ShareModal } from '../components/organisms/ShareModal.js';
import type { EncryptedPost } from '@shared/crypto/types';

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const SidePanel = styled.div`
  width: 33%;
  min-width: 320px;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.8);
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`;

const SidePadding = styled.div`
  padding: 12px 16px;
`;

const QuickEntryCard = styled.div`
  margin: 0 12px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  position: relative;
  z-index: 2;
  overflow: visible;

  /* Remove QuickEntry's own border/padding since the card provides it */
  & > div {
    border: none;
    border-bottom: none;
  }
`;

const EditorPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.9);

  @media (max-width: 768px) {
    display: none;
  }
`;

const LoadingCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const EmptyEditor = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const FilterIcon = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 14px;
`;

const FilterText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.text};
`;

const FilterBold = styled.strong`
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

const ClearButton = styled.button`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function JournalView() {
  const { encryptionData } = useAuth();
  const { isUnlocked, unlock, decryptPosts, encryptPost } = useEncryption();
  const {
    decryptedEntries, setDecryptedEntries, setRawEntries,
    topics, setTopics, isInitialized, setLoading, isLoading,
    addDecryptedEntry, updateDecryptedEntry, removeEntry,
  } = useEntriesStore();
  const selectedEntryId = useUIStore(s => s.selectedEntryId);
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const viewMode = useUIStore(s => s.viewMode);
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const headerColor = useUIStore(s => s.headerColor) || '#0F4C5C';
  const setHeaderColor = useUIStore(s => s.setHeaderColor);
  const setBackgroundImage = useUIStore(s => s.setBackgroundImage);
  const filterTopic = topics.find(t => t.id === selectedTopicId);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editorTopicId, setEditorTopicId] = useState<number | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [entryExpanded, setEntryExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleUnlock = useCallback(async (password: string) => {
    if (!encryptionData?.kekSalt || !encryptionData?.encryptedMasterKey || !encryptionData?.kekWrapIv) {
      throw new Error('Missing encryption data');
    }
    await unlock(password, encryptionData.kekSalt, encryptionData.encryptedMasterKey, encryptionData.kekWrapIv, encryptionData.kekIterations);
  }, [encryptionData, unlock]);

  useEffect(() => {
    if (!isUnlocked || isInitialized) return;
    const load = async () => {
      setLoading(true);
      try {
        const [rawEntries, topicsData, settingsData] = await Promise.all([
          entriesApi.getAll(), topicsApi.getAll(), settingsApi.getAll(),
        ]);
        setTopics(topicsData);
        // Apply saved theme settings
        const settingsMap: Record<string, unknown> = {};
        for (const s of settingsData) settingsMap[s.key] = s.value;
        if (typeof settingsMap.headerColor === 'string') setHeaderColor(settingsMap.headerColor);
        if (typeof settingsMap.backgroundImage === 'string') setBackgroundImage(settingsMap.backgroundImage);
        const encrypted: EncryptedPost[] = rawEntries.map(e => ({
          id: e.id as number,
          contentEncrypted: (e.contentEncrypted as string) || null,
          contentIv: (e.contentIv as string) || null,
          metadataEncrypted: (e.metadataEncrypted as string) || null,
          metadataIv: (e.metadataIv as string) || null,
          isEncrypted: e.isEncrypted as boolean,
          content: e.content as string | undefined,
          metadata: e.metadata as Record<string, unknown> | undefined,
          createdAt: new Date(e.createdAt as string),
          updatedAt: new Date((e.updatedAt || e.createdAt) as string),
        }));
        setRawEntries(encrypted);

        // Decrypt entries individually — skip ones that fail
        const decrypted: import('@shared/crypto/types').DecryptedPost[] = [];
        for (const entry of encrypted) {
          try {
            const d = await decryptPosts([entry]);
            decrypted.push(...d);
          } catch (err) {
            console.warn(`Skipping entry ${entry.id} — decryption failed:`, err);
            // Add a placeholder so we don't lose it
            decrypted.push({
              id: entry.id,
              content: '[Decryption failed]',
              metadata: {},
              isEncrypted: entry.isEncrypted,
              createdAt: entry.createdAt,
              updatedAt: entry.updatedAt,
            });
          }
        }
        setDecryptedEntries(decrypted);
      } catch (err) {
        console.error('Failed to load:', err);
        // Still mark as initialized so we don't loop
        setDecryptedEntries([]);
      }
      finally { setLoading(false); }
    };
    load();
  }, [isUnlocked, isInitialized]);

  useEffect(() => {
    if (selectedEntryId) {
      const entry = decryptedEntries.find(e => e.id === selectedEntryId);
      if (entry) {
        setEditorContent(entry.content);
        const meta = entry.metadata as Record<string, unknown>;
        setEditorTopicId(meta?._taxonomyId as number | null ?? null);
        setCustomFields(meta?._customFields as Record<string, unknown> ?? {});
        // Auto-expand if entry exceeds 200 char limit
        if (stripHtml(entry.content).length > 200) {
          setEntryExpanded(true);
        }
      }
    } else {
      setEditorContent('');
      setEditorTopicId(null);
      setCustomFields({});
      setEntryExpanded(false);
    }
  }, [selectedEntryId, decryptedEntries]);

  const handleSave = useCallback(async () => {
    if (!stripHtml(editorContent).trim()) return;
    setIsSaving(true); setSaveStatus('');
    try {
      const metadata: Record<string, unknown> = {};
      if (editorTopicId) metadata._taxonomyId = editorTopicId;
      if (Object.keys(customFields).length > 0) metadata._customFields = customFields;
      const encrypted = await encryptPost(editorContent, metadata);

      if (selectedEntryId) {
        await entriesApi.update(selectedEntryId, {
          contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
          taxonomyIds: editorTopicId ? [editorTopicId] : [],
        });
        updateDecryptedEntry(selectedEntryId, { content: editorContent, metadata });
        setSaveStatus('Saved');
      } else {
        const result = await entriesApi.create({
          contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
          isEncrypted: true, taxonomyIds: editorTopicId ? [editorTopicId] : [],
        });
        addDecryptedEntry({ id: result.id as number, content: editorContent, metadata, isEncrypted: true,
          createdAt: new Date(result.createdAt as string), updatedAt: new Date((result.updatedAt || result.createdAt) as string) });
        setSelectedEntryId(result.id as number);
        setSaveStatus('Created');
      }
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) { console.error('Save failed:', err); setSaveStatus('Save failed'); }
    finally { setIsSaving(false); }
  }, [editorContent, selectedEntryId, editorTopicId, customFields, encryptPost]);

  const handleDelete = useCallback(async () => {
    if (!selectedEntryId) return;
    try {
      await entriesApi.delete(selectedEntryId);
      removeEntry(selectedEntryId);
      setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({});
    } catch (err) { console.error('Delete failed:', err); }
  }, [selectedEntryId]);

  const handleNew = () => {
    setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({});
  };

  /** Toggle bookmark on the currently open entry (from EntryForm toolbar) */
  const handleBookmark = useCallback(async () => {
    if (!selectedEntryId) return;
    const entry = decryptedEntries.find(e => e.id === selectedEntryId);
    if (!entry) return;

    const newFavorite = !((entry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown>)?._isFavorite;
    const updatedCustomFields = { ...customFields, _isFavorite: newFavorite };

    // Optimistic update in store + form state
    setCustomFields(updatedCustomFields);
    const updatedMeta: Record<string, unknown> = {};
    if (editorTopicId) updatedMeta._taxonomyId = editorTopicId;
    updatedMeta._customFields = updatedCustomFields;
    updateDecryptedEntry(selectedEntryId, { metadata: updatedMeta });

    // Persist to server
    try {
      const encrypted = await encryptPost(editorContent, updatedMeta);
      await entriesApi.update(selectedEntryId, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        taxonomyIds: editorTopicId ? [editorTopicId] : [],
      });
    } catch (err) { console.error('Bookmark save failed:', err); }
  }, [selectedEntryId, decryptedEntries, customFields, editorContent, editorTopicId, encryptPost]);

  /** Toggle bookmark on a card in the list (persist immediately) */
  const handleBookmarkFromCard = useCallback(async (entryId: number, isFavorite: boolean) => {
    const entry = decryptedEntries.find(e => e.id === entryId);
    if (!entry) return;

    const meta = entry.metadata as Record<string, unknown>;
    const existingFields = (meta?._customFields as Record<string, unknown>) || {};
    const updatedFields = { ...existingFields, _isFavorite: isFavorite };
    const updatedMeta = { ...meta, _customFields: updatedFields };

    // Persist to server
    try {
      const encrypted = await encryptPost(entry.content, updatedMeta);
      await entriesApi.update(entryId, {
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
      });
    } catch (err) { console.error('Bookmark save failed:', err); }
    // Store is already updated optimistically by EntryList
  }, [decryptedEntries, encryptPost]);

  const handleQuickCreate = useCallback(async (content: string, topicId: number | null) => {
    try {
      const metadata: Record<string, unknown> = {};
      if (topicId) metadata._taxonomyId = topicId;
      const encrypted = await encryptPost(content, metadata);
      const result = await entriesApi.create({
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        isEncrypted: true, taxonomyIds: topicId ? [topicId] : [],
      });
      addDecryptedEntry({ id: result.id as number, content, metadata, isEncrypted: true,
        createdAt: new Date(result.createdAt as string), updatedAt: new Date((result.updatedAt || result.createdAt) as string) });
    } catch (err) { console.error('Quick create failed:', err); }
  }, [encryptPost]);

  if (encryptionData?.encryptionEnabled && !isUnlocked) {
    return (<><AppTemplate hideSidebar><EmptyEditor>Unlock your journal to view entries</EmptyEditor></AppTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  }

  if (isLoading) {
    return (<AppTemplate hideSidebar><LoadingCenter><Spinner size={40} /></LoadingCenter></AppTemplate>);
  }

  return (
    <AppTemplate hideSidebar transparentContent>
      <ContentArea>
        {/* ── Left sidebar: tabs → quick entry → entries ── */}
        <SidePanel>
          <SidePadding>
            <ViewTabs onDateTabClick={() => setCalendarExpanded(prev => !prev)} />
          </SidePadding>
          {filterTopic && (
            <FilterBar>
              <FilterIcon $color={headerColor}>
                <FontAwesomeIcon icon={getTopicIcon(filterTopic.icon)} />
              </FilterIcon>
              <FilterText>Filtering by: <FilterBold>{filterTopic.name}</FilterBold></FilterText>
              <ClearButton onClick={() => setSelectedTopicId(null)}>
                <FontAwesomeIcon icon={faXmark} size="xs" /> Clear
              </ClearButton>
            </FilterBar>
          )}
          {viewMode === 'date' && calendarExpanded && (
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={(date) => { setSelectedDate(date); setCalendarExpanded(false); }}
              expanded={true}
            />
          )}
          {viewMode === 'search' && <SearchPanel />}
          <QuickEntryCard>
            <QuickEntry onCreateEntry={handleQuickCreate} />
          </QuickEntryCard>
          <EntryList onToggleBookmark={handleBookmarkFromCard} />
        </SidePanel>

        {/* ── Right: editor with topic selector, custom fields, toolbar, content, save ── */}
        <EditorPanel>
          <EntryForm
            entryId={selectedEntryId}
            content={editorContent}
            onContentChange={setEditorContent}
            topicId={editorTopicId}
            onTopicChange={setEditorTopicId}
            topics={topics}
            customFields={customFields}
            onCustomFieldsChange={setCustomFields}
            onSave={handleSave}
            onDelete={selectedEntryId ? handleDelete : undefined}
            onNew={handleNew}
            onBookmark={handleBookmark}
            onShare={() => setShareOpen(true)}
            isEditing={selectedEntryId !== null}
            isSaving={isSaving}
            saveStatus={saveStatus}
            expanded={entryExpanded}
            onExpandChange={setEntryExpanded}
          />
        </EditorPanel>
      </ContentArea>

      {shareOpen && selectedEntryId && (
        <ShareModal
          entryContent={editorContent}
          onClose={() => setShareOpen(false)}
        />
      )}
    </AppTemplate>
  );
}
