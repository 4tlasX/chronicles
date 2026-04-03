import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { AuthTemplate } from '../components/templates/AuthTemplate.js';
import { RegisterForm } from '../components/organisms/RegisterForm.js';
import { RecoveryKeyDisplay } from '../components/molecules/RecoveryKeyDisplay.js';

export function RegisterView() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { setupEncryption } = useEncryption();
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);

  const handleRegister = async ({ email, username, password }: { email: string; username: string; password: string }) => {
    // Setup encryption — generates master key, wraps with password + recovery key
    const result = await setupEncryption(password);

    // Hash the recovery key with PBKDF2 (salted + iterated) for server-side verification
    const recoveryKeySaltBytes = crypto.getRandomValues(new Uint8Array(16));
    const recoveryKeySalt = Array.from(recoveryKeySaltBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(result.recoveryKey),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: recoveryKeySaltBytes, iterations: 600000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const recoveryKeyHash = Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Register with server
    await register({
      email,
      username,
      password,
      encryptedMasterKey: result.wrappedMK,
      kekSalt: result.salt,
      kekWrapIv: result.wrapIv,
      recoveryWrappedMK: result.recoveryWrappedMK,
      recoveryWrapIv: result.recoveryWrapIv,
      recoveryKeyHash,
      recoveryKeySalt,
    });

    // Show recovery key — user must save it
    setRecoveryKey(result.recoveryKey);
  };

  const handleConfirm = useCallback(() => {
    // Clear recovery key from memory before navigating
    setRecoveryKey(null);
    navigate('/');
  }, [navigate]);

  if (recoveryKey) {
    return (
      <AuthTemplate title="Save Your Recovery Key">
        <RecoveryKeyDisplay
          recoveryKey={recoveryKey}
          onConfirm={handleConfirm}
        />
      </AuthTemplate>
    );
  }

  return (
    <AuthTemplate
      title="Create Account"
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <RegisterForm onSubmit={handleRegister} />
    </AuthTemplate>
  );
}
