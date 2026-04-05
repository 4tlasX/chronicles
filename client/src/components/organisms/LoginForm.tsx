import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { TextInput } from '../atoms/TextInput.js';
import { PasswordInput } from '../atoms/PasswordInput.js';
import { Button } from '../atoms/Button.js';
import { Spinner } from '../atoms/Spinner.js';
import { FormField } from '../molecules/FormField.js';

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

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onForgotPassword?: () => void;
}

export function LoginForm({ onSubmit, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <FormField label="Email" htmlFor="email">
        <TextInput
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </FormField>

      <FormField label="Password" htmlFor="password">
        <PasswordInput
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          autoComplete="current-password"
        />
      </FormField>

      <Button type="submit" fullWidth disabled={loading} variant="secondary">
        {loading ? <Spinner size={18} /> : 'Sign in'}
      </Button>

      {onForgotPassword && (
        <Button type="button" variant="ghost" onClick={onForgotPassword}>
          Forgot password?
        </Button>
      )}
    </Form>
  );
}
