import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { PasswordInput } from '../atoms/PasswordInput.js';
import { Button } from '../atoms/Button.js';
import { Spinner } from '../atoms/Spinner.js';
import { FormField } from '../molecules/FormField.js';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const Card = styled.div`
  width: 100%;
  max-width: 380px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  background: ${({ theme }) => theme.colors.background === '#1a1b1d' ? '#1a1b1d' : '#faf8f2'};
  border-radius: 0;
  box-shadow: ${({ theme }) => theme.shadow.lg};
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 1.25rem;
  font-weight: 500;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const ErrorText = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.danger};
`;

interface UnlockDialogProps {
  onUnlock: (password: string) => Promise<void>;
}

export function UnlockDialog({ onUnlock }: UnlockDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onUnlock(password);
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay>
      <Card>
        <Title>Unlock Your Journal</Title>
        <Description>
          Enter your password to decrypt your entries.
        </Description>
        <Form onSubmit={handleSubmit}>
          {error && <ErrorText>{error}</ErrorText>}
          <FormField label="Password" htmlFor="unlock-pw">
            <PasswordInput
              id="unlock-pw"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoFocus
              autoComplete="current-password"
            />
          </FormField>
          <Button type="submit" fullWidth disabled={loading} variant="secondary">
            {loading ? <Spinner size={18} /> : 'Unlock'}
          </Button>
        </Form>
      </Card>
    </Overlay>
  );
}
