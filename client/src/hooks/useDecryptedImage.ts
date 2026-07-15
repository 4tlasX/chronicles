import { useState, useEffect } from 'react';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { getImageObjectUrl } from '../services/imageStorage.js';

/**
 * Resolve an encrypted R2 object to a displayable object URL.
 * URLs are cached at module level in imageStorage — no revocation on unmount;
 * the cache is cleared wholesale when the journal locks. Re-runs on unlock so
 * images re-resolve after a tab-hide auto-lock.
 */
export function useDecryptedImage(
  key: string | null,
  iv: string | null,
  mimeType: string | null
): { url: string | null; loading: boolean; error: string | null } {
  const { decryptBytes, isUnlocked } = useEncryption();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!key || !iv || !mimeType || !isUnlocked) {
      setUrl(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getImageObjectUrl(key, iv, mimeType, decryptBytes)
      .then(u => { if (!cancelled) setUrl(u); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load image'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [key, iv, mimeType, isUnlocked, decryptBytes]);

  return { url, loading, error };
}
