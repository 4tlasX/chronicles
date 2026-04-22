import DOMPurify from 'dompurify';
import type { UserFieldDef } from '../types/userFields.js';

/** Strip HTML tags from a string, returning plain text. */
export function stripHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  // DOMPurify with no allowed tags returns text-only content
  const tmp = document.createElement('div');
  tmp.innerHTML = clean;
  return tmp.textContent || tmp.innerText || '';
}

/** Build a one-line summary from user-defined field values, for preview display only. */
export function summarizeUserFields(defs: UserFieldDef[], values: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const def of defs) {
    const val = values[def.id];
    if (val === undefined || val === null || val === '') continue;
    if (def.type !== 'boolean') {
      parts.push(String(val));
    }
  }
  return parts.join(' · ');
}
