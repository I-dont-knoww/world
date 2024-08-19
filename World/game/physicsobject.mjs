import GameObject from './gameobject.mjs';
import IDManager from '../utils/idmanager.mjs';

import { Vector } from '../utils/vector.mjs';
import { BigVector } from '../utils/bigvector.mjs';

export const objectMinXY = 0;
export const objectMaxXY = 2 << 16 - 1;

export default class PhysicsObject extends GameObject {
    /**
     * @param {*} pos
     * @param {*} id
     */
    constructor(pos, id) {
        super(id);

        this.pos = BigVector.ensure(pos);
        this.vel = Vector.ZERO;
    }

    /**
     * @param {number} dt
     */
    update(dt) {
        this.pos.addInPlace(this.vel.mul(dt));
    }

    clampXY() {
        if (this.pos.x < objectMinXY) {
            this.pos.x = objectMinXY;
            this.vel.x = Math.max(objectMinXY, this.vel.x);
        }
        if (this.pos.x > objectMaxXY) {
            this.pos.x = objectMaxXY;
            this.vel.x = Math.min(objectMaxXY, this.vel.x);
        }
        if (this.pos.y < objectMinXY) {
            this.pos.y = objectMinXY;
            this.vel.y = Math.max(objectMinXY, this.vel.y);
        }
        if (this.pos.y > objectMaxXY) {
            this.pos.y = objectMaxXY;
            this.vel.y = Math.min(objectMaxXY, this.vel.y);
        }
    }
}