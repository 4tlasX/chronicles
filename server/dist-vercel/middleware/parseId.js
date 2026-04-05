"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseId = parseId;
/**
 * Safely parse a route param as a positive integer.
 * Returns NaN for non-numeric strings like "abc".
 */
function parseId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1)
        return NaN;
    return id;
}
