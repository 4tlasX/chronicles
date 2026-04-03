import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from '@shared/theme/tokens';
import { GlobalStyle } from '../styles/GlobalStyle.js';
import { SharedTemplate } from '../components/templates/SharedTemplate.js';
import { SharedEntryCard } from '../components/molecules/SharedEntryCard.js';
import { shares as sharesApi } from '../services/api.js';

/* ── Helpers — decrypt share content using key from URL fragment ── */

function base64urlToBytes(str: string): Uint8Array {
  if (!/^[A-Za-z0-9\-_]+$/.test(str)) {
    throw new Error('Invalid base64url string');
  }
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

/* ── View ── */

export function SharedEntryView() {
  const { token } = useParams<{ token: string }>();
  const [content, setContent] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'done'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('Invalid share link.'); return; }

    const shareKey = window.location.hash.slice(1);
    if (!shareKey) { setStatus('error'); setErrorMsg('This link is missing its decryption key.'); return; }
    // Validate base64url format before attempting crypto operations (256-bit key = 43 base64url chars)
    if (!/^[A-Za-z0-9\-_]{43}$/.test(shareKey)) { setStatus('error'); setErrorMsg('Invalid decryption key format.'); return; }

    const load = async () => {
      try {
        const share = await sharesApi.get(token);
        const plaintext = await decryptShareContent(share.contentEncrypted, share.contentIv, shareKey);
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
      <SharedTemplate>
        <SharedEntryCard status={status} errorMsg={errorMsg} content={content} createdAt={createdAt} />
      </SharedTemplate>
    </ThemeProvider>
  );
}
