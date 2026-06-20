import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { entries as entriesApi, topics as topicsApi, settings as settingsApi } from '../services/api.js';
import type { EncryptedPost } from '@shared/crypto/types';

/**
 * Shared hook that ensures entries, topics, settings, and encryption are loaded.
 * Safe to call from any protected view — only loads once (checks isInitialized).
 * Returns { isReady, isLoading, needsUnlock, handleUnlock }.
 */
export function useInitializeData() {
  const { encryptionData } = useAuth();
  const { isUnlocked, unlock, decryptPosts } = useEncryption();
  const {
    setDecryptedEntries, setRawEntries, setTopics, setFeatureFlags,
    isInitialized, setLoading, isLoading,
  } = useEntriesStore();
  const setHeaderColor = useUIStore(s => s.setHeaderColor);
  const setAccentColor = useUIStore(s => s.setAccentColor);
  const setThemeMode = useUIStore(s => s.setThemeMode);
  const setBackgroundImage = useUIStore(s => s.setBackgroundImage);
  const setBackgroundOpacity = useUIStore(s => s.setBackgroundOpacity);
  const setDisplayName = useUIStore(s => s.setDisplayName);
  const setWeatherEnabled = useUIStore(s => s.setWeatherEnabled);
  const setWeatherCity = useUIStore(s => s.setWeatherCity);
  const setWeatherUnit = useUIStore(s => s.setWeatherUnit);
  const setTopicCustomFields = useUIStore(s => s.setTopicCustomFields);
  const setCycleTrackingEnabled = useUIStore(s => s.setCycleTrackingEnabled);

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

        // Apply theme settings
        const settingsMap: Record<string, unknown> = {};
        for (const s of settingsData) settingsMap[s.key] = s.value;
        if (typeof settingsMap.headerColor === 'string') setHeaderColor(settingsMap.headerColor);
        if (typeof settingsMap.accentColor === 'string') {
          setAccentColor(settingsMap.accentColor);
          document.documentElement.style.setProperty('--color-accent', settingsMap.accentColor);
        }
        if (settingsMap.themeMode === 'light' || settingsMap.themeMode === 'dark') setThemeMode(settingsMap.themeMode);
        if (typeof settingsMap.backgroundImage === 'string') setBackgroundImage(settingsMap.backgroundImage);
        if (typeof settingsMap.backgroundOpacity === 'string') setBackgroundOpacity(parseFloat(settingsMap.backgroundOpacity));
        if (typeof settingsMap.displayName === 'string') setDisplayName(settingsMap.displayName);
        if (settingsMap.topicCustomFields && typeof settingsMap.topicCustomFields === 'object' && !Array.isArray(settingsMap.topicCustomFields)) {
          setTopicCustomFields(settingsMap.topicCustomFields as import('../types/userFields.js').TopicCustomFields);
        }
        if (typeof settingsMap.weatherEnabled === 'boolean') setWeatherEnabled(settingsMap.weatherEnabled);
        if (typeof settingsMap.weatherCity === 'string') setWeatherCity(settingsMap.weatherCity);
        if (settingsMap.weatherUnit === 'f' || settingsMap.weatherUnit === 'c') setWeatherUnit(settingsMap.weatherUnit);
        if (typeof settingsMap.cycleTrackingEnabled === 'boolean') setCycleTrackingEnabled(settingsMap.cycleTrackingEnabled);

        // Feature flags — default to true (enabled) when not explicitly saved
        const KNOWN_FLAGS = [
          'foodEnabled', 'medicationEnabled', 'goalsEnabled', 'milestonesEnabled',
          'exerciseEnabled', 'allergiesEnabled', 'entertainmentEnabled', 'inspirationEnabled',
        ];
        const flags: Record<string, boolean> = {};
        for (const key of KNOWN_FLAGS) {
          flags[key] = typeof settingsMap[key] === 'boolean' ? (settingsMap[key] as boolean) : true;
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
        setDecryptedEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isUnlocked, isInitialized]);

  const needsUnlock = !!encryptionData?.encryptionEnabled && !isUnlocked;

  return { isReady: isUnlocked && isInitialized, isLoading, needsUnlock, handleUnlock };
}
