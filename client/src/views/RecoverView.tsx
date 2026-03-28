import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { auth as authApi } from '../services/api.js';
import { AuthTemplate } from '../components/templates/AuthTemplate.js';
import { TextInput } from '../components/atoms/TextInput.js';
import { PasswordInput } from '../components/atoms/PasswordInput.js';
import { Button } from '../components/atoms/Button.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { FormField } from '../components/molecules/FormField.js';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const ErrorBanner = styled.div`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSize.sm}px;
`;

type Step = 'email' | 'recovery' | 'newPassword';

export function RecoverView() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { unlockWithRecoveryKey, rewrapMasterKey } = useEncryption();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryParams, setRecoveryParams] = useState<{ recoveryWrappedMK: string; recoveryWrapIv: string } | null>(null);

  const handleEmailStep = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const params = await authApi.getRecoveryParams(email);
      if (!params.recoveryWrappedMK || !params.recoveryWrapIv) {
        throw new Error('No recovery key set for this account');
      }
      setRecoveryParams({ recoveryWrappedMK: params.recoveryWrappedMK, recoveryWrapIv: params.recoveryWrapIv });
      setStep('recovery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find account');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryStep = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Try to unlock master key with recovery key
      const cleanKey = recoveryKey.replace(/[-\s]/g, '');
      await unlockWithRecoveryKey(cleanKey, recoveryParams!.recoveryWrappedMK, recoveryParams!.recoveryWrapIv);
      setStep('newPassword');
    } catch {
      setError('Invalid recovery key');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordStep = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    setLoading(true);
    try {
      // Re-wrap master key with new password
      const { salt, wrappedMK, wrapIv } = await rewrapMasterKey(newPassword);

      // Send to server
      await authApi.recover({
        email,
        recoveryKey: recoveryKey.replace(/[-\s]/g, ''),
        newPassword,
        newEncryptedMasterKey: wrappedMK,
        newKekSalt: salt,
        newKekWrapIv: wrapIv,
      });

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recovery failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthTemplate
      title="Recover Account"
      footer={<>Remember your password? <Link to="/login">Sign in</Link></>}
    >
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {step === 'email' && (
        <Form onSubmit={handleEmailStep}>
          <FormField label="Email address" htmlFor="recover-email">
            <TextInput
              id="recover-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </FormField>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Continue'}
          </Button>
        </Form>
      )}

      {step === 'recovery' && (
        <Form onSubmit={handleRecoveryStep}>
          <FormField label="Recovery Key" htmlFor="recover-key">
            <TextInput
              id="recover-key"
              value={recoveryKey}
              onChange={e => setRecoveryKey(e.target.value)}
              placeholder="Enter your recovery key"
              required
            />
          </FormField>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Verify'}
          </Button>
        </Form>
      )}

      {step === 'newPassword' && (
        <Form onSubmit={handleNewPasswordStep}>
          <FormField label="New Password" htmlFor="recover-newpw">
            <PasswordInput
              id="recover-newpw"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 12 chars"
              required
            />
          </FormField>
          <FormField label="Confirm Password" htmlFor="recover-confirm">
            <PasswordInput
              id="recover-confirm"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
            />
          </FormField>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <Spinner size={18} /> : 'Reset password'}
          </Button>
        </Form>
      )}
    </AuthTemplate>
  );
}
