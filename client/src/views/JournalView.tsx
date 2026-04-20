import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { AppTemplate } from '../components/templates/AppTemplate.js';
import { JournalTemplate, SidePanel, EditorPanel } from '../components/templates/JournalTemplate.js';
import { LoadingCenter } from '../components/atoms/LoadingCenter.js';
import { EmptyEditor } from '../components/atoms/EmptyEditor.js';
import { SidePadding } from '../components/atoms/SidePadding.js';
import { QuickEntryCard } from '../components/atoms/QuickEntryCard.js';
import { TopicQuickFilter } from '../components/molecules/TopicQuickFilter.js';
import { ViewTabs } from '../components/organisms/ViewTabs.js';
import { QuickEntry } from '../components/organisms/QuickEntry.js';
import { EntryList } from '../components/organisms/EntryList.js';
import { EntryForm } from '../components/organisms/EntryForm.js';
import { SearchPanel } from '../components/organisms/SearchPanel.js';
import { MiniCalendar } from '../components/organisms/MiniCalendar.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { ShareModal } from '../components/organisms/ShareModal.js';
import { ConfirmDialog } from '../components/molecules/ConfirmDialog.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { entries as entriesApi, topics as topicsApi, settings as settingsApi } from '../services/api.js';
import { getOrCreateJournalTopic } from '../utils/getOrCreateJournalTopic.js';
import { stripHtml, summarizeUserFields } from '../utils/stripHtml.js';
import type { EncryptedPost } from '@shared/crypto/types';

const DateFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 16px 4px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.text};
`;

const DateFilterClear = styled.button`
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
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

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
  const setViewMode = useUIStore(s => s.setViewMode);
  const selectedTopicId = useUIStore(s => s.selectedTopicId);
  const setSelectedTopicId = useUIStore(s => s.setSelectedTopicId);
  const headerColor = useUIStore(s => s.headerColor) || '#6A9B9B';
  const topicCustomFields = useUIStore(s => s.topicCustomFields);
  const setHeaderColor = useUIStore(s => s.setHeaderColor);
  const setThemeMode = useUIStore(s => s.setThemeMode);
  const setBackgroundImage = useUIStore(s => s.setBackgroundImage);
  const setBackgroundOpacity = useUIStore(s => s.setBackgroundOpacity);
  const filterTopic = topics.find(t => t.id === selectedTopicId);

  const entryCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const entry of decryptedEntries) {
      const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
      if (taxId) counts.set(taxId, (counts.get(taxId) || 0) + 1);
    }
    return counts;
  }, [decryptedEntries]);

  const selectedDate = useUIStore(s => s.selectedDate);
  const setSelectedDate = useUIStore(s => s.setSelectedDate);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [editorTopicId, setEditorTopicId] = useState<number | null>(null);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [widgetType, setWidgetType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const isWellnessEntry = useMemo(() => {
    if (!editorTopicId) return false;
    return topics.find(t => t.id === editorTopicId)?.name?.toLowerCase() === 'wellness';
  }, [editorTopicId, topics]);

  // Wellness auto-save: saves without closing the editor
  const wellnessAutoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wellnessAutoSaveDoRef = useRef<() => Promise<void>>(async () => {});
  wellnessAutoSaveDoRef.current = async () => {
    if (!editorTopicId) return;
    const metadata: Record<string, unknown> = { _taxonomyId: editorTopicId };
    if (widgetType) metadata._widgetType = widgetType;
    if (Object.keys(customFields).length > 0) metadata._customFields = customFields;
    const hasText = !!stripHtml(editorContent).trim();
    let finalContent = editorContent;
    if (!hasText) {
      const w = (customFields.waterGlasses as number) || 0;
      const g = (customFields.waterGoal as number) || 8;
      const m = (customFields.moodScore as number) || 0;
      const s = (customFields.sleepHours as number) || 0;
      const parts = [w > 0 ? `${w}/${g} glasses` : '', m > 0 ? `Mood ${m}/5` : '', s > 0 ? `${s}h sleep` : ''].filter(Boolean);
      finalContent = `<p>${parts.join(' · ') || 'Wellness check-in'}</p>`;
    }
    try {
      const encrypted = await encryptPost(finalContent, metadata);
      if (selectedEntryId) {
        await entriesApi.update(selectedEntryId, {
          contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
          taxonomyIds: [editorTopicId],
        });
        updateDecryptedEntry(selectedEntryId, { content: finalContent, metadata });
      } else {
        const result = await entriesApi.create({
          contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
          isEncrypted: true, taxonomyIds: [editorTopicId],
        });
        addDecryptedEntry({ id: result.id as number, content: finalContent, metadata, isEncrypted: true,
          createdAt: new Date(result.createdAt as string), updatedAt: new Date((result.updatedAt || result.createdAt) as string) });
        setSelectedEntryId(result.id as number);
      }
    } catch (err) { console.error('Wellness auto-save failed:', err); }
  };

  const scheduleWellnessAutoSave = useCallback(() => {
    if (wellnessAutoDebounceRef.current) clearTimeout(wellnessAutoDebounceRef.current);
    wellnessAutoDebounceRef.current = setTimeout(() => { wellnessAutoSaveDoRef.current(); }, 600);
  }, []);

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
        setWidgetType(meta?._widgetType as string | null ?? null);
        setShowMobileEditor(true);
      }
    } else {
      setEditorContent('');
      setEditorTopicId(null);
      setCustomFields({});
      setWidgetType(null);
    }
  }, [selectedEntryId, decryptedEntries]);

  const handleSave = useCallback(async () => {
    const hasDrawing = editorContent.includes('data-type="drawing"');
    const hasText = !!stripHtml(editorContent).trim();
    const userFieldDefs = editorTopicId != null ? (topicCustomFields[editorTopicId] ?? []) : [];
    const userFieldValues = (customFields._userFields as Record<string, unknown>) ?? {};
    const fieldSummary = !hasText && !hasDrawing ? summarizeUserFields(userFieldDefs, userFieldValues) : '';
    if (!hasText && !hasDrawing && !fieldSummary) return;
    const finalContent = hasText || hasDrawing ? editorContent : `<p>${fieldSummary}</p>`;
    setIsSaving(true); setSaveStatus('');

    // Resolve effective topic — fall back to "Journal" if none selected
    let effectiveTopicId = editorTopicId;
    if (!effectiveTopicId) {
      effectiveTopicId = await getOrCreateJournalTopic();
      setEditorTopicId(effectiveTopicId);
    }

    try {
      const metadata: Record<string, unknown> = {};
      if (effectiveTopicId) metadata._taxonomyId = effectiveTopicId;
      if (widgetType) metadata._widgetType = widgetType;
      if (Object.keys(customFields).length > 0) metadata._customFields = customFields;
      const encrypted = await encryptPost(finalContent, metadata);

      if (selectedEntryId) {
        await entriesApi.update(selectedEntryId, {
          contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
          taxonomyIds: effectiveTopicId ? [effectiveTopicId] : [],
        });
        updateDecryptedEntry(selectedEntryId, { content: finalContent, metadata });
        setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({}); setWidgetType(null);
        setShowMobileEditor(false);
      } else {
        const result = await entriesApi.create({
          contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
          isEncrypted: true, taxonomyIds: effectiveTopicId ? [effectiveTopicId] : [],
        });
        addDecryptedEntry({ id: result.id as number, content: finalContent, metadata, isEncrypted: true,
          createdAt: new Date(result.createdAt as string), updatedAt: new Date((result.updatedAt || result.createdAt) as string) });
        setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({}); setWidgetType(null);
        setShowMobileEditor(false);
      }
    } catch (err) { console.error('Save failed:', err); setSaveStatus('Save failed'); }
    finally { setIsSaving(false); }
  }, [editorContent, selectedEntryId, editorTopicId, widgetType, customFields, topicCustomFields, encryptPost, setSelectedEntryId, setShowMobileEditor]);

  const handleDelete = useCallback(async () => {
    if (!selectedEntryId) return;
    try {
      await entriesApi.delete(selectedEntryId);
      removeEntry(selectedEntryId);
      setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({}); setWidgetType(null);
      setShowMobileEditor(false);
    } catch (err) { console.error('Delete failed:', err); }
  }, [selectedEntryId]);

  const handleNew = () => {
    setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({}); setWidgetType(null);
    setShowMobileEditor(false);
  };

  const handleMobileBack = () => {
    setShowMobileEditor(false);
  };

  // Keep a fresh ref to handleSave so the global keydown listener never captures a stale version
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  // Global keyboard shortcuts — read store directly to avoid stale refs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S → save current entry
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSaveRef.current();
        return;
      }
      // Ctrl+N or Cmd+N → new entry
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({}); setWidgetType(null);
        setShowMobileEditor(true);
        return;
      }
      // Shift+N (when not in editable) → new entry
      if (e.key === 'N' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        const editable = (e.target as HTMLElement)?.isContentEditable;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || editable) return;
        e.preventDefault();
        setSelectedEntryId(null); setEditorContent(''); setEditorTopicId(null); setCustomFields({}); setWidgetType(null);
        setShowMobileEditor(true);
        return;
      }
      // Ctrl+D / Cmd+D → delete selected entry with confirmation
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        const currentId = useUIStore.getState().selectedEntryId;
        if (!currentId) return;
        e.preventDefault();
        setPendingDeleteId(currentId);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

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
            <ViewTabs
              onDateTabClick={() => setCalendarExpanded(prev => !prev)}
              onTodayClick={() => setCalendarExpanded(false)}
            />
            <TopicQuickFilter
              topics={topics}
              selectedTopicId={selectedTopicId}
              headerColor={headerColor}
              entryCounts={entryCounts}
              onSelect={setSelectedTopicId}
            />
            {viewMode === 'date' && (
              <DateFilterBar>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                <DateFilterClear onClick={() => { setViewMode('all'); setCalendarExpanded(false); }}>
                  <FontAwesomeIcon icon={faXmark} size="xs" /> Clear
                </DateFilterClear>
              </DateFilterBar>
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
              onAutoSave={isWellnessEntry ? scheduleWellnessAutoSave : undefined}
              onDelete={selectedEntryId ? handleDelete : undefined}
              onNew={handleNew}
              onBookmark={handleBookmark}
              onShare={() => setShareOpen(true)}
              onBack={handleMobileBack}
              isEditing={selectedEntryId !== null}
              isSaving={isSaving}
              saveStatus={saveStatus}
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

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (pendingDeleteId) {
            entriesApi.delete(pendingDeleteId).then(() => {
              useEntriesStore.getState().removeEntry(pendingDeleteId);
              useUIStore.getState().setSelectedEntryId(null);
              useUIStore.getState().setShowMobileEditor(false);
              setEditorContent(''); setEditorTopicId(null); setCustomFields({});
            }).catch(err => console.error('Delete failed:', err));
          }
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </AppTemplate>
  );
}
