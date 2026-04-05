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

interface RegisterFormProps {
  onSubmit: (data: { email: string; username: string; password: string }) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (password.length < 12) errors.password = 'Minimum 12 characters';
    if (!/[A-Z]/.test(password)) errors.password = 'Must contain uppercase letter';
    if (!/[a-z]/.test(password)) errors.password = 'Must contain lowercase letter';
    if (!/[0-9]/.test(password)) errors.password = 'Must contain a number';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (username.length < 3) errors.username = 'Minimum 3 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({ email, username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <ErrorBanner role="alert">{error}</ErrorBanner>}

      <FormField label="Email" htmlFor="reg-email" error={fieldErrors.email}>
        <TextInput
          id="reg-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </FormField>

      <FormField label="Username" htmlFor="reg-username" error={fieldErrors.username}>
        <TextInput
          id="reg-username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
          autoComplete="username"
        />
      </FormField>

      <FormField label="Password" htmlFor="reg-password" error={fieldErrors.password}>
        <PasswordInput
          id="reg-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min 12 chars, uppercase, lowercase, number"
          required
          autoComplete="new-password"
        />
      </FormField>

      <FormField label="Confirm Password" htmlFor="reg-confirm" error={fieldErrors.confirmPassword}>
        <PasswordInput
          id="reg-confirm"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          required
          autoComplete="new-password"
        />
      </FormField>

      <Button type="submit" fullWidth disabled={loading} variant="secondary">
        {loading ? <Spinner size={18} /> : 'Create account'}
      </Button>
    </Form>
  );
}
