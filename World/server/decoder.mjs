import { EventEmitter } from 'events';
import { opcodes } from './websocket.mjs';

class DecoderClass extends EventEmitter {
    constructor(connection, decodeFunction) {
        super();

        connection.on('data', (opcode, data) => {
            decodeFunction(this, opcode, data);
        });
    }
}

export default function Decoder(connection, decodeFunction) {
    return new DecoderClass(connection, decodeFunction);
}

export function HeaderDecoder(connection) {
    return Decoder(connection, (decoder, opcode, data) => {
        if (opcode != opcodes.BINARY) return;

        const header = data.readUint8(0);
        const message = data.subarray(1, data.byteLength);

        decoder.emit(header, message);
        decoder.emit('data', header, message);
    });
}