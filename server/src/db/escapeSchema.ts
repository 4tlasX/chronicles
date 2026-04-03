/**
 * Shared schema name validation and escaping for tenant isolation.
 * Schema names are generated server-side as `usr_{counter}_{hex}` and never derived from user input.
 * This function validates the format as defense-in-depth against SQL injection.
 */
export function escapeSchema(schemaName: string): string {
  const escaped = schemaName.replace(/[^a-z0-9_]/gi, '');
  if (!escaped || escaped.length < 3) throw new Error('Invalid schema name');
  if (escaped.length > 30) throw new Error('Schema name too long');
  if (!/^usr_\d+_[a-f0-9]{6}$/.test(escaped)) throw new Error('Invalid schema name format');
  return escaped;
}
