export function HeaderEncoder(header, message) {
    if (typeof message == 'undefined') message = Buffer.allocUnsafe(0);

    const encoded = Buffer.allocUnsafe(message.byteLength + 1);
    encoded.writeUint8(header);
    encoded.set(message, 1);

    return encoded;
}