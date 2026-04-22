import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../atoms/Button.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const KeyBox = styled.div`
  padding: ${({ theme }) => theme.spacing.md}px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border: 1px solid var(--accent-stroke, ${({ theme }) => theme.colors.border});
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  font-family: 'Courier New', monospace;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  word-break: break-all;
  user-select: all;
`;

const Warning = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  color: ${({ theme }) => theme.colors.danger};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

interface RecoveryKeyDisplayProps {
  recoveryKey: string;
  onConfirm: () => void;
}

export function RecoveryKeyDisplay({ recoveryKey, onConfirm }: RecoveryKeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Clear clipboard on unmount to prevent recovery key lingering
  useEffect(() => {
    return () => {
      navigator.clipboard.writeText('').catch(() => {});
    };
  }, []);

  // Format key as groups of 4 hex chars separated by dashes
  const formatted = recoveryKey.match(/.{1,4}/g)?.join('-') ?? recoveryKey;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Auto-clear clipboard after 30 seconds
    setTimeout(() => {
      navigator.clipboard.writeText('').catch(() => {
        console.warn('Failed to auto-clear clipboard');
      });
    }, 30000);
  };

  return (
    <Wrapper>
      <Warning>
        Save this recovery key. If you lose your password and this key, your data is permanently lost.
      </Warning>
      <KeyBox>{formatted}</KeyBox>
      <Button variant="secondary" onClick={handleCopy}>
        {copied ? 'Copied' : 'Copy to clipboard'}
      </Button>
      <Button onClick={onConfirm}>I have saved my recovery key</Button>
    </Wrapper>
  );
}
