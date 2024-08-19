import EventEmitter from './eventemitter.js';

class DecoderClass extends EventEmitter {
    constructor(connection, decodeFunction) {
        super();

        connection.on('message', data => {
            decodeFunction(this, data);
        });
    }
}

export default function Decoder(connection, decodeFunction) {
    return new DecoderClass(connection, decodeFunction);
}

export function HeaderDecoder(connection) {
    return Decoder(connection, (decoder, data) => {
        const array = new Uint8Array(data);

        const header = array[0];
        const message = array.slice(1);

        decoder.emit(header, message.buffer);
        decoder.emit('data', header, message.buffer);
    });
}