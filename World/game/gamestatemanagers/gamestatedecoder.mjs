import TypeManager from '../../utils/typemanager.mjs';
import { textDecoder } from '../../utils/textDecoderAndEncoder.mjs';

import { Vec2 } from '../../utils/vector.mjs';
import { BigVec2 } from '../../utils/bigvector.mjs';
import GameObject from '../gameobject.mjs';
import PhysicsObject from '../physicsobject.mjs';
import PlayerObject, { socketKeyLength } from '../playerobject.mjs';

/**
 * @typedef {Object} ObjectAndOffset
 * @property {Object} data
 * @property {number} offset
 */

/**
 * @param {ArrayBuffer} gameState
 * @returns {*[]}
 */
export default function decodeGameState(gameState) {
    const view = new DataView(gameState);
    let offset = 0;

    const objectListLength = view.getUint16(offset, false); offset += 2;
    const objectList = [];

    for (let i = 0; i < objectListLength; i++) {
        const type = view.getUint8(offset); offset += 1;

        const decodedData = decodeGameStateObject(type, { view, offset });
        offset = decodedData.offset;

        const decodedObject = gameStateObjectFromData(type, decodedData.data);
        objectList.push(decodedObject);
    }

    return objectList;
}

/**
 * @param {number} type
 * @param {Object} viewAndOffset
 * @param {DataView} viewAndOffset.view
 * @param {number} viewAndOffset.offset
 * @returns {ObjectAndOffset}
 */
function decodeGameStateObject(type, { view, offset }) {
    switch (type) {
        case TypeManager.getTypeOf('Vec2'): {
            const x = view.getUint8(offset); offset++;
            const y = view.getUint8(offset); offset++;

            return { data: { x, y }, offset };
        }
        case TypeManager.getTypeOf('BigVec2'): {
            const x = view.getUint16(offset, false); offset += 2;
            const y = view.getUint16(offset, false); offset += 2;

            return { data: { x, y }, offset };
        }
        case TypeManager.getTypeOf('GameObject'): {
            const id = view.getUint16(offset, false); offset += 2;

            return { data: { id }, offset };
        }
        case TypeManager.getTypeOf('PhysicsObject'): {
            let id, pos, vel;

            ({ data: { id }, offset } = decodeGameStateObject(TypeManager.getTypeOf('GameObject'), { view, offset }));
            ({ data: pos, offset } = decodeGameStateObject(TypeManager.getTypeOf('BigVec2'), { view, offset }));
            ({ data: vel, offset } = decodeGameStateObject(TypeManager.getTypeOf('Vec2'), { view, offset }));

            return { data: { id, pos, vel }, offset };
        }
        case TypeManager.getTypeOf('PlayerObject'): {
            let physicsData;
            ({ data: physicsData, offset } = decodeGameStateObject(TypeManager.getTypeOf('PhysicsObject'), { view, offset }));

            const socketKeyData = [];
            for (let i = 0; i < socketKeyLength; i++) {
                socketKeyData.push(view.getUint8(offset));
                offset++;
            }
            const socketKey = textDecoder.decode(new Uint8Array(socketKeyData));

            return { data: { physicsData, socketKey }, offset };
        }
    }
}

/**
 * @param {number} type
 * @param {Object} data
 * @returns {*}
 */
function gameStateObjectFromData(type, data) {
    switch (type) {
        case TypeManager.getTypeOf('Vec2'): {
            return Object.assign(new Vec2(), data);
        }
        case TypeManager.getTypeOf('BigVec2'): {
            return Object.assign(new BigVec2(), data);
        }
        case TypeManager.getTypeOf('GameObject'): {
            return Object.assign(new GameObject(), data);
        }
        case TypeManager.getTypeOf('PhysicsObject'): {
            const newObject = new PhysicsObject(data.pos, data.id);
            newObject.vel = data.vel;

            return newObject;
        }
        case TypeManager.getTypeOf('PlayerObject'): {
            const { physicsData, socketKey } = data;

            const pos = gameStateObjectFromData(TypeManager.getTypeOf('BigVec2'), physicsData.pos);
            const vel = gameStateObjectFromData(TypeManager.getTypeOf('Vec2'), physicsData.vel);

            const newObject = new PlayerObject(pos, socketKey, physicsData.id);
            newObject.vel = vel;

            return newObject;
        }
    }
}