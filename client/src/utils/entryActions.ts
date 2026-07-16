import { entries as entriesApi } from '../services/api.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { collectImageKeys, bestEffortDeleteImages } from '../services/imageStorage.js';

/**
 * Delete an entry everywhere: server row, store, and best-effort cleanup of
 * its encrypted image objects in the user's R2 bucket. Throws if the server
 * delete fails; image cleanup never blocks.
 */
export async function deleteEntryWithImages(entryId: number): Promise<void> {
  const entry = useEntriesStore.getState().decryptedEntries.find(e => e.id === entryId);
  const imageKeys = entry ? collectImageKeys([entry]) : [];
  await entriesApi.delete(entryId);
  useEntriesStore.getState().removeEntry(entryId);
  if (imageKeys.length > 0) void bestEffortDeleteImages(imageKeys);
}
