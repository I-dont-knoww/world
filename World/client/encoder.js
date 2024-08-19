/**
 * @param {string} header
 * @param {Uint8Array|ArrayBuffer} message
 * @returns {Uint8Array}
 */
export function HeaderEncoder(header, message) {
    if (typeof message == 'undefined') message = new Uint8Array([]);

    const encoded = new Uint8Array(message.byteLength + 1);
    encoded[0] = header;
    encoded.set(message, 1);

    return encoded;
}