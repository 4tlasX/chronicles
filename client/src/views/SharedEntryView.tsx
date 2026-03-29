import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from '@shared/theme/tokens';
import { GlobalStyle } from '../styles/GlobalStyle.js';
import { shares as sharesApi } from '../services/api.js';

// =============================================================================
// Helpers — decrypt share content using key from URL fragment
// =============================================================================

function base64urlToBytes(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function decryptShareContent(
  contentEncrypted: string,
  contentIv: string,
  shareKeyStr: string
): Promise<string> {
  const keyBytes = base64urlToBytes(shareKeyStr);
  const key = await crypto.subtle.importKey('raw', keyBytes.buffer as ArrayBuffer, { name: 'AES-GCM' }, false, ['decrypt']);

  const ciphertext = base64urlToBytes(contentEncrypted);
  const iv = base64urlToBytes(contentIv);

  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer }, key, ciphertext.buffer as ArrayBuffer);
  return new TextDecoder().decode(plaintext);
}

// =============================================================================
// Styled components
// =============================================================================

const Page = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 16px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 680px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
`;

const CardHeader = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AppName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
`;

const SharedBadge = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-left: auto;
`;

const CardBody = styled.div`
  padding: 28px 32px;
  font-size: 15px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.text};

  h1 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; }
  h2 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0; }
  h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0; }
  ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
  blockquote {
    border-left: 3px solid ${({ theme }) => theme.colors.border};
    padding-left: 1em;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0.5em 0;
  }
  code {
    background: rgba(0,0,0,0.05);
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 0.9em;
  }
  pre {
    background: rgba(0,0,0,0.05);
    padding: 12px;
    border-radius: 6px;
    code { background: none; padding: 0; }
  }
  p { margin: 0 0 0.75em; }
  p:last-child { margin-bottom: 0; }
`;

const CardFooter = styled.div`
  padding: 12px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusMessage = styled.div<{ $error?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.textMuted};
  font-size: 15px;
  text-align: center;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// =============================================================================
// Component
// =============================================================================

export function SharedEntryView() {
  const { token } = useParams<{ token: string }>();
  const [content, setContent] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'done'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('Invalid share link.'); return; }

    const shareKey = window.location.hash.slice(1); // everything after #
    if (!shareKey) { setStatus('error'); setErrorMsg('This link is missing its decryption key.'); return; }

    const load = async () => {
      try {
        const share = await sharesApi.get(token);
        const plaintext = await decryptShareContent(
          share.contentEncrypted,
          share.contentIv,
          shareKey
        );
        setContent(plaintext);
        setCreatedAt(share.createdAt);
        setStatus('done');
      } catch {
        setStatus('error');
        setErrorMsg('Unable to decrypt this entry. The link may be corrupt or expired.');
      }
    };

    load();
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Card>
          <CardHeader>
            <AppName>Chronicles</AppName>
            <SharedBadge>Shared entry</SharedBadge>
          </CardHeader>

          {status === 'loading' && (
            <StatusMessage>
              <Spinner />
              Decrypting entry…
            </StatusMessage>
          )}

          {status === 'error' && (
            <StatusMessage $error>
              <span>⚠</span>
              {errorMsg}
            </StatusMessage>
          )}

          {status === 'done' && content !== null && (
            <>
              <CardBody dangerouslySetInnerHTML={{ __html: content }} />
              <CardFooter>
                {createdAt && <>Originally written {new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</>}
              </CardFooter>
            </>
          )}
        </Card>
      </Page>
    </ThemeProvider>
  );
}
