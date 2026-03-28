import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { auth as authApi, ApiError } from '../services/api.js';

interface User {
  email: string;
  username: string;
}

interface EncryptionData {
  encryptionEnabled: boolean;
  kekSalt: string | null;
  encryptedMasterKey: string | null;
  kekWrapIv: string | null;
  kekIterations: number;
  recoveryWrappedMK: string | null;
  recoveryWrapIv: string | null;
}

interface AuthContextValue {
  user: User | null;
  encryptionData: EncryptionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<EncryptionData>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    encryptedMasterKey: string;
    kekSalt: string;
    kekWrapIv: string;
    recoveryWrappedMK: string;
    recoveryWrapIv: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [encryptionData, setEncryptionData] = useState<EncryptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if we have a valid session on mount
  useEffect(() => {
    fetch('/api/auth/me', {
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        setEncryptionData(data.encryption);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<EncryptionData> => {
    const result = await authApi.login({ email, password });
    setUser(result.user);
    setEncryptionData(result.encryption);
    return result.encryption;
  }, []);

  const register = useCallback(async (data: Parameters<typeof authApi.register>[0]) => {
    const result = await authApi.register(data);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if server logout fails, clear client state
    }
    setUser(null);
    setEncryptionData(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      encryptionData,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export { ApiError };
