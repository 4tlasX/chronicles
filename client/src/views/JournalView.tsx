import { useEffect, useState, useCallback } from 'react';
import { getTopicIcon } from '../utils/topicIcons.js';
import { AppTemplate } from '../components/templates/AppTemplate.js';
import { JournalTemplate, SidePanel, EditorPanel } from '../components/templates/JournalTemplate.js';
import { LoadingCenter } from '../components/atoms/LoadingCenter.js';
import { EmptyEditor } from '../components/atoms/EmptyEditor.js';
import { SidePadding } from '../components/atoms/SidePadding.js';
import { QuickEntryCard } from '../components/atoms/QuickEntryCard.js';
import { TopicFilterBar } from '../components/molecules/TopicFilterBar.js';
import { ViewTabs } from '../components/organisms/ViewTabs.js';
import { QuickEntry } from '../components/organisms/QuickEntry.js';
import { EntryList } from '../components/organisms/EntryList.js';
import { EntryForm } from '../components/organisms/EntryForm.js';
import { SearchPanel } from '../components/organisms/SearchPanel.js';
import { MiniCalendar } from '../components/organisms/MiniCalendar.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { ShareModal } from '../components/organisms/ShareModal.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { entries as entriesApi, topics as topicsApi, settings as settingsApi } from '../services/api.js';
import { stripHtml } from '../utils/stripHtml.js';
import type { EncryptedPost } from '@shared/crypto/types';

export function JournalView() {
  const { encryptionData } = useAuth();
  const { isUnlocked, unlock, decryptPosts, encryptPost } = useEncryption();
  const {
    decryptedEntries, setDecryptedEntries, setRawEntries,
    topics, setTopics, setFeatureFlags, isInitialized, setLoading, isLoading,
    addDecryptedEntry, updateDecryptedEntry, removeEntry,
  } = useEntriesStore();
  const selectedEntryId = useUIStore(s => s.selectedEntryId);
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const showMobileEditor = useUIStore(s => s.showMobileEditor);
  const setShowMobileEditor = useUIStore(s => s.setShowMobileEditor);
  const viewMode = useUIStore(s => s.viewMode);
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const headerColor = useUIStore(s => s.headerColor) || '#4E6E7E';
  const setHeaderColor = useUIStore(s => s.setHeaderColor);
  const setThemeMode = useUIStore(s => s.setThemeMode);
  const setBackgroundImage = useUIStore(s => s.setBackgroundImage);
  const setBackgroundOpacity = useUIStore(s => s.setBackgroundOpacity);
  const filterTopic = topics.find(t => t.id === selectedTopicId);

  const selectedDate = useUIStore(s => s.selectedDate);
  const setSelectedDate = useUIStore(s => s.setSelectedDate);
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
        // Apply saved theme settings
        const settingsMap: Record<string, unknown> = {};
        for (const s of settingsData) settingsMap[s.key] = s.value;
        if (typeof settingsMap.headerColor === 'string') setHeaderColor(settingsMap.headerColor);
        if (settingsMap.themeMode === 'light' || settingsMap.themeMode === 'dark') setThemeMode(settingsMap.themeMode);
        if (typeof settingsMap.backgroundImage === 'string') setBackgroundImage(settingsMap.backgroundImage);
        if (typeof settingsMap.backgroundOpacity === 'string') setBackgroundOpacity(parseFloat(settingsMap.backgroundOpacity as string));
        // Extract feature flags and store them (must be set before setTopics so filtering works)
        const flags: Record<string, boolean> = {};
        for (const key of Object.keys(settingsMap)) {
          if (key.endsWith('Enabled') && typeof settingsMap[key] === 'boolean') {
            flags[key] = settingsMap[key] as boolean;
          }
        }
        setFeatureFlags(flags);
        setTopics(topicsData);
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
        if (stripHtml(entry.content).length > 200) {
          setEntryExpanded(true);
        }
        setShowMobileEditor(true);
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
      setShowMobileEditor(false);
    } catch (err) { console.error('Delete failed:', err); }
  }, [selectedEntryId]);

  const handleNew = () => {
    setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({});
    setShowMobileEditor(false);
  };

  const handleMobileBack = () => {
    setShowMobileEditor(false);
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
      <JournalTemplate
        sidePanel={
          <SidePanel hiddenMobile={showMobileEditor}>
            <ViewTabs onDateTabClick={() => setCalendarExpanded(prev => !prev)} />
            {filterTopic && (
              <TopicFilterBar
                icon={getTopicIcon(filterTopic.icon)}
                iconColor={headerColor}
                topicName={filterTopic.name}
                onClear={() => setSelectedTopicId(null)}
              />
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
        }
        editorPanel={
          <EditorPanel visibleMobile={showMobileEditor}>
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
              onBack={handleMobileBack}
              isEditing={selectedEntryId !== null}
              isSaving={isSaving}
              saveStatus={saveStatus}
              expanded={entryExpanded}
              onExpandChange={setEntryExpanded}
            />
          </EditorPanel>
        }
      />

      {shareOpen && selectedEntryId && (
        <ShareModal
          entryContent={editorContent}
          onClose={() => setShareOpen(false)}
        />
      )}
    </AppTemplate>
  );
}
