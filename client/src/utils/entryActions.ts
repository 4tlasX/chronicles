import { entries as entriesApi } from '../services/api.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { collectImageKeys, bestEffortDeleteImages } from '../services/imageStorage.js';

/**
 * Images can be attached to more than one entry (added from the library), so
 * R2 objects may only be deleted when no OTHER entry still references them.
 * Returns the subset of keys not referenced by any entry outside excludeIds.
 */
export function filterDeletableImageKeys(keys: string[], excludeEntryIds: number[] = []): string[] {
  if (keys.length === 0) return keys;
  const exclude = new Set(excludeEntryIds);
  const others = useEntriesStore.getState().decryptedEntries.filter(e => !exclude.has(e.id));
  const referenced = new Set(collectImageKeys(others));
  return keys.filter(k => !referenced.has(k));
}

/**
 * Delete an entry everywhere: server row, store, and best-effort cleanup of
 * its encrypted image objects in the user's R2 bucket. Throws if the server
 * delete fails; image cleanup never blocks. Objects still referenced by other
 * entries are left in the bucket.
 */
export async function deleteEntryWithImages(entryId: number): Promise<void> {
  const entry = useEntriesStore.getState().decryptedEntries.find(e => e.id === entryId);
  const imageKeys = entry ? filterDeletableImageKeys(collectImageKeys([entry]), [entryId]) : [];
  await entriesApi.delete(entryId);
  useEntriesStore.getState().removeEntry(entryId);
  if (imageKeys.length > 0) void bestEffortDeleteImages(imageKeys);
}
