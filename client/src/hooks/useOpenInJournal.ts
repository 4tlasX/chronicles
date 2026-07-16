import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore.js';

/**
 * Open an entry in the journal editor — the single place entries are edited.
 * List views (Health, Planning, Topics, Entertainment, …) call this on row
 * click or swipe-edit; the editor's breadcrumb leads back to the origin view.
 */
export function useOpenInJournal() {
  const navigate = useNavigate();
  const setSelectedEntryId = useUIStore(s => s.setSelectedEntryId);
  const setShowMobileEditor = useUIStore(s => s.setShowMobileEditor);
  const setViewMode = useUIStore(s => s.setViewMode);

  return useCallback((entryId: number) => {
    setViewMode('all'); // ensure the entry is visible in the journal list
    setSelectedEntryId(entryId);
    setShowMobileEditor(true);
    navigate('/journal');
  }, [navigate, setSelectedEntryId, setShowMobileEditor, setViewMode]);
}
