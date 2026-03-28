import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { AuthTemplate } from '../components/templates/AuthTemplate.js';
import { LoginForm } from '../components/organisms/LoginForm.js';

export function LoginView() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { unlock } = useEncryption();

  const handleLogin = async (email: string, password: string) => {
    const encryptionData = await login(email, password);

    // Unlock encryption if enabled
    if (
      encryptionData.encryptionEnabled &&
      encryptionData.kekSalt &&
      encryptionData.encryptedMasterKey &&
      encryptionData.kekWrapIv
    ) {
      await unlock(
        password,
        encryptionData.kekSalt,
        encryptionData.encryptedMasterKey,
        encryptionData.kekWrapIv,
        encryptionData.kekIterations
      );
    }

    navigate('/');
  };

  return (
    <AuthTemplate
      title="Chronicles"
      footer={<>New here? <Link to="/register">Create an account</Link></>}
    >
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={() => navigate('/recover')}
      />
    </AuthTemplate>
  );
}
