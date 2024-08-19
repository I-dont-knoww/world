import PhysicsObject from './physicsobject.mjs';
import { BigVector } from '../utils/bigvector.mjs';

export const playerSpeed = 0.05;
export const socketKeyLength = 24;

export const playerSize = 10;

export default class PlayerObject extends PhysicsObject {
    /**
     * @param {BigVec2} pos
     * @param {string} socketKey
     * @param {number} id
     */
    constructor(pos, socketKey, id) {
        super(pos, id);

        this.socketKey = socketKey;
    }

    /**
     * @param {number} dt
     */
    update(dt) {
        this.vel.mulInPlace(0.9);

        super.update(dt);
        super.clampXY();
    }

    /**
     * @param {Object.<string, boolean>} keys
     */
    assignKeys(keys) {
        this.moveUsingKeys(keys);
    }

    /**
     * @param {Object.<string, boolean>} keys
     */
    moveUsingKeys(keys) {
        const movementDirection = BigVector.ZERO;
        if (keys.KeyW) movementDirection.addInPlace(BigVector.UP);
        if (keys.KeyA) movementDirection.addInPlace(BigVector.LEFT);
        if (keys.KeyS) movementDirection.addInPlace(BigVector.DOWN);
        if (keys.KeyD) movementDirection.addInPlace(BigVector.RIGHT);
        movementDirection.length = playerSpeed;
        this.vel.addInPlace(movementDirection);
    }
}