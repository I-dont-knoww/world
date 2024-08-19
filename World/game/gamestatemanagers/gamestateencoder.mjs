import { textEncoder } from '../../utils/textDecoderAndEncoder.mjs';
import TypeManager from '../../utils/typemanager.mjs';

/**
 * @param {*[]} objectList
 * @returns {ArrayBuffer}
 */
export default function encodeGameState(objectList) {
    const objectListLength = objectList.length;

    const objectListBuffers = [];
    for (let i = 0; i < objectListLength; i++) {
        const object = objectList[i];
        const type = TypeManager.getTypeOf(object.constructor.name);

        const objectBufferData = encodeGameStateObject(object, type);

        objectListBuffers.push(concat([new Uint8Array([type]), objectBufferData]));
    }
    const objectListBuffer = concat(objectListBuffers);

    const lengthBuffer = new DataView(new ArrayBuffer(2));
    lengthBuffer.setUint16(0, objectListLength, false);

    return concat([lengthBuffer.buffer, objectListBuffer]);
}

/**
 * @param {*} object
 * @returns {ArrayBuffer}
 */
function encodeGameStateObject(object, type) {
    switch (type) {
        case TypeManager.getTypeOf('Vec2'): {
            return new Uint8Array([object.x, object.y]).buffer;
        }
        case TypeManager.getTypeOf('BigVec2'): {
            const view = new DataView(new ArrayBuffer(2 * 2));
            view.setUint16(0, object.x, false);
            view.setUint16(0 + 2, object.y, false);

            return view.buffer;
        }
        case TypeManager.getTypeOf('GameObject'): {
            const view = new DataView(new ArrayBuffer(2));
            view.setUint16(0, object.id, false);

            return view.buffer;
        }
        case TypeManager.getTypeOf('PhysicsObject'): {
            const ID = encodeGameStateObject(object, TypeManager.getTypeOf('GameObject'));
            const pos = encodeGameStateObject(object.pos, TypeManager.getTypeOf('BigVec2'));
            const vel = encodeGameStateObject(object.vel, TypeManager.getTypeOf('Vec2'));

            return concat([ID, pos, vel]);
        }
        case TypeManager.getTypeOf('PlayerObject'): {
            const physicsObjectData = encodeGameStateObject(object, TypeManager.getTypeOf('PhysicsObject'));
            const socketKey = textEncoder.encode(object.socketKey);

            return concat([physicsObjectData, socketKey]);
        }
    }
}

/**
 * @param {(Uint8Array|ArrayBuffer)[]} arrays
 */
function concat(arrays) {
    let totalLength = 0;
    for (let i = 0; i < arrays.length; i++) totalLength += arrays[i].byteLength;

    const concatedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (let i = 0; i < arrays.length; i++) {
        let array;
        if (arrays[i] instanceof ArrayBuffer) array = new Uint8Array(arrays[i]);
        else array = arrays[i];

        concatedArray.set(array, offset);
        offset += array.byteLength;
    }

    return concatedArray.buffer;
}