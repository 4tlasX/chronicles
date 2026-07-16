import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from '@shared/theme/tokens';
import { GlobalStyle } from '../styles/GlobalStyle.js';
import { SharedTemplate } from '../components/templates/SharedTemplate.js';
import { SharedEntryCard } from '../components/molecules/SharedEntryCard.js';
import { shares as sharesApi } from '../services/api.js';

/* ── View ── */

export function SharedEntryView() {
  const { token } = useParams<{ token: string }>();
  const [content, setContent] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'done'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('Invalid share link.'); return; }

    const load = async () => {
      try {
        const share = await sharesApi.get(token);
        if (!share.content) throw new Error('empty share');
        setContent(share.content);
        setCreatedAt(share.createdAt);
        setStatus('done');
      } catch {
        setStatus('error');
        setErrorMsg('This shared entry is unavailable. The link may have been revoked or expired.');
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
