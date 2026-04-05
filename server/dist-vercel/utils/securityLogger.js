"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityEvent = logSecurityEvent;
/**
 * Structured security event logger.
 * Outputs JSON to stdout for easy parsing by log aggregators.
 * Replace with a proper logging service (e.g., Winston, Pino) when needed.
 */
function logSecurityEvent(event, options = {}) {
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
