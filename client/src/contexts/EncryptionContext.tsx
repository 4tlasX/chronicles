import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { encryptionService } from '@shared/crypto/encryptionService.js';
import type { EncryptedPostData, DecryptedPost, EncryptedPost, SetupEncryptionResult } from '@shared/crypto/types.js';

interface EncryptionContextValue {
  isUnlocked: boolean;
  unlock: (password: string, kekSalt: string, encryptedMasterKey: string, kekWrapIv: string, kekIterations: number) => Promise<void>;
  lock: () => void;
  setupEncryption: (password: string) => Promise<SetupEncryptionResult>;
  encryptPost: (content: string, metadata: Record<string, unknown>) => Promise<EncryptedPostData>;
  decryptPost: (post: EncryptedPost) => Promise<DecryptedPost>;
  decryptPosts: (posts: EncryptedPost[]) => Promise<DecryptedPost[]>;
  unlockWithRecoveryKey: (recoveryKey: string, recoveryWrappedMK: string, recoveryWrapIv: string) => Promise<void>;
  rewrapMasterKey: (newPassword: string) => Promise<{ salt: string; wrappedMK: string; wrapIv: string }>;
}

const EncryptionContext = createContext<EncryptionContextValue | null>(null);

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  // CryptoKey stored in ref — non-extractable, lives only in memory
  const masterKeyRef = useRef<CryptoKey | null>(null);

  const unlock = useCallback(async (
    password: string,
    kekSalt: string,
    encryptedMasterKey: string,
    kekWrapIv: string,
    kekIterations: number
  ) => {
    const key = await encryptionService.unwrapMasterKey(password, kekSalt, encryptedMasterKey, kekWrapIv, kekIterations);
    masterKeyRef.current = key;
    setIsUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    masterKeyRef.current = null;
    setIsUnlocked(false);
  }, []);

  const setupEncryption = useCallback(async (password: string): Promise<SetupEncryptionResult> => {
    const result = await encryptionService.setupEncryption(password);
    masterKeyRef.current = result.masterKey;
    setIsUnlocked(true);
    return result;
  }, []);

  const getKey = () => {
    if (!masterKeyRef.current) throw new Error('Encryption not unlocked');
    return masterKeyRef.current;
  };

  const encryptPost = useCallback(async (content: string, metadata: Record<string, unknown>) => {
    return encryptionService.encryptPost(getKey(), content, metadata);
  }, []);

  const decryptPost = useCallback(async (post: EncryptedPost) => {
    return encryptionService.decryptPost(getKey(), post);
  }, []);

  const decryptPosts = useCallback(async (posts: EncryptedPost[]) => {
    return encryptionService.decryptPosts(getKey(), posts);
  }, []);

  const unlockWithRecoveryKey = useCallback(async (
    recoveryKey: string,
    recoveryWrappedMK: string,
    recoveryWrapIv: string
  ) => {
    const key = await encryptionService.unwrapWithRecoveryKey(recoveryKey, recoveryWrappedMK, recoveryWrapIv);
    masterKeyRef.current = key;
    setIsUnlocked(true);
  }, []);

  const rewrapMasterKey = useCallback(async (newPassword: string) => {
    return encryptionService.rewrapMasterKey(getKey(), newPassword);
  }, []);

  return (
    <EncryptionContext.Provider value={{
      isUnlocked,
      unlock,
      lock,
      setupEncryption,
      encryptPost,
      decryptPost,
      decryptPosts,
      unlockWithRecoveryKey,
      rewrapMasterKey,
    }}>
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption(): EncryptionContextValue {
  const context = useContext(EncryptionContext);
  if (!context) throw new Error('useEncryption must be used within EncryptionProvider');
  return context;
}
