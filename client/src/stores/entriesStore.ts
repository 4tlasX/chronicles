import { create } from 'zustand';
import type { DecryptedPost, EncryptedPost } from '@shared/crypto/types';

interface EntriesState {
  // Raw encrypted entries from server
  rawEntries: EncryptedPost[];
  // Decrypted entries (in memory only)
  decryptedEntries: DecryptedPost[];
  // Topics
  topics: { id: number; name: string; icon: string | null; color: string | null }[];
  // Loading state
  isInitialized: boolean;
  isLoading: boolean;

  // Actions
  setRawEntries: (entries: EncryptedPost[]) => void;
  setDecryptedEntries: (entries: DecryptedPost[]) => void;
  setTopics: (topics: EntriesState['topics']) => void;
  addDecryptedEntry: (entry: DecryptedPost) => void;
  updateDecryptedEntry: (id: number, updates: Partial<DecryptedPost>) => void;
  removeEntry: (id: number) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useEntriesStore = create<EntriesState>((set) => ({
  rawEntries: [],
  decryptedEntries: [],
  topics: [],
  isInitialized: false,
  isLoading: false,

  setRawEntries: (entries) => set({ rawEntries: entries }),
  setDecryptedEntries: (entries) => set({ decryptedEntries: entries, isInitialized: true }),
  setTopics: (topics) => set({ topics }),
  addDecryptedEntry: (entry) => set(s => ({
    decryptedEntries: [entry, ...s.decryptedEntries],
  })),
  updateDecryptedEntry: (id, updates) => set(s => ({
    decryptedEntries: s.decryptedEntries.map(e => e.id === id ? { ...e, ...updates } : e),
  })),
  removeEntry: (id) => set(s => ({
    decryptedEntries: s.decryptedEntries.filter(e => e.id !== id),
    rawEntries: s.rawEntries.filter(e => e.id !== id),
  })),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearAll: () => set({
    rawEntries: [],
    decryptedEntries: [],
    topics: [],
    isInitialized: false,
    isLoading: false,
  }),
}));
