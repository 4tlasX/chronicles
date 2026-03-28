import { useState } from 'react';
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
    });

    // Show recovery key — user must save it
    setRecoveryKey(result.recoveryKey);
  };

  if (recoveryKey) {
    return (
      <AuthTemplate title="Save Your Recovery Key">
        <RecoveryKeyDisplay
          recoveryKey={recoveryKey}
          onConfirm={() => navigate('/')}
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
