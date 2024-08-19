import { Vec2 } from './vector.mjs';
import { BigVec2 } from './bigvector.mjs';

import GameObject from '../game/gameobject.mjs';
import PhysicsObject from '../game/physicsobject.mjs';
import PlayerObject from '../game/playerobject.mjs';

const typeToName = [Vec2, BigVec2, GameObject, PhysicsObject, PlayerObject];
const nameToType = {};

for (let i = 0; i < typeToName.length; i++) nameToType[typeToName[i].name] = i;

export default {
    /**
     * @param {String} constructorName
     * @returns {number}
     */
    getTypeOf(constructorName) {
        return nameToType[constructorName];
    },

    /**
     * @param {number} type
     * @returns {ObjectConstructor}
     */
    getConstructorOf(type) {
        return typeToName[type];
    },

    /**
     * @param {number} type
     * @returns {String}
     */
    getConstructorNameOf(type) {
        return typeToName[type].name;
    }
};
