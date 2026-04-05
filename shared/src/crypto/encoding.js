/**
 * Base64 and ArrayBuffer encoding utilities
 */
export function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
export function base64ToArrayBuffer(base64) {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
        throw new Error('Invalid base64 string');
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
export function stringToArrayBuffer(str) {
    return new TextEncoder().encode(str).buffer;
}
export function arrayBufferToString(buffer) {
    return new TextDecoder().decode(buffer);
}
export function generateRandomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}
export function uint8ArrayToBase64(bytes) {
    return arrayBufferToBase64(bytes.buffer);
}
export function base64ToUint8Array(base64) {
    return new Uint8Array(base64ToArrayBuffer(base64));
}
