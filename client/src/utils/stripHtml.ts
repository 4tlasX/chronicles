import DOMPurify from 'dompurify';

/** Strip HTML tags from a string, returning plain text. */
export function stripHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  // DOMPurify with no allowed tags returns text-only content
  const tmp = document.createElement('div');
  tmp.innerHTML = clean;
  return tmp.textContent || tmp.innerText || '';
}
