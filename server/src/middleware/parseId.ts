/**
 * Safely parse a route param as a positive integer.
 * Returns NaN for non-numeric strings like "abc".
 */
export function parseId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return NaN;
  return id;
}
