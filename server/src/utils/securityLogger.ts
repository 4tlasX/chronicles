/**
 * Structured security event logger.
 * Outputs JSON to stdout for easy parsing by log aggregators.
 * Replace with a proper logging service (e.g., Winston, Pino) when needed.
 */
export function logSecurityEvent(
  event: string,
  options: { accountId?: number; ip?: string; details?: Record<string, unknown> } = {}
): void {
  const entry = {
    level: 'security',
    event,
    timestamp: new Date().toISOString(),
    ...(options.accountId !== undefined && { accountId: options.accountId }),
    ...(options.ip && { ip: options.ip }),
    ...(options.details && { details: options.details }),
  };
  console.log(JSON.stringify(entry));
}
