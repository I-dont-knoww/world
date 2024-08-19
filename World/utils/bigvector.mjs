import { Vec2 } from './vector.mjs';

export class BigVec2 extends Vec2 {
    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    set length(length) {
        const thislength = this.length;
        if (thislength == 0) return new BigVec2(length, 0);
        return this.mulInPlace(length / thislength);
    }

    /**
     * @param {BigVec2} v
     * @returns {BigVec2}
     */
    add(v) {
        return new BigVec2(this.x + v.x, this.y + v.y);
    }

    /**
     * @param {BigVec2} v
     * @returns {BigVec2}
     */
    sub(v) {
        return new BigVec2(this.x - v.x, this.y - v.y);
    }

    /**
     * @param {number} s
     * @returns {BigVec2}
     */
    mul(s) {
        return new BigVec2(this.x * s, this.y * s);
    }

    /**
     * @param {number} s
     * @returns {BigVec2}
     */
    exp(s) {
        return new BigVec2(this.x ** s, this.y ** s);
    }

    /**
     * @param {number} s
     * @returns {BigVec2}
     */
    div(s) {
        return new BigVec2(this.x / s, this.y / s);
    }

    /**
     * @returns {BigVec2}
     */
    clone() {
        return new BigVec2(this.x, this.y);
    }
}

export class BigVector {
    static #ZERO = new BigVec2(0, 0).immutable();
    static #UP = new BigVec2(0, -1).immutable();
    static #DOWN = new BigVec2(0, 1).immutable();
    static #LEFT = new BigVec2(-1, 0).immutable();
    static #RIGHT = new BigVec2(1, 0).immutable();

    static get ZERO() { return BigVector.#ZERO.clone() }
    static get UP() { return BigVector.#UP.clone() }
    static get DOWN() { return BigVector.#DOWN.clone() }
    static get LEFT() { return BigVector.#LEFT.clone() }
    static get RIGHT() { return BigVector.#RIGHT.clone() }

    /**
     * @param {Vec2|BigVec2} v 
     * @returns {BigVec2}
     */
    static ensure(v) {
        if (v instanceof BigVec2) return v;
        return new BigVec2(v.x, v.y);
    }

    /**
     * @param {Vec2|BigVec2} a
     * @param {Vec2|BigVec2} b
     * @returns {BigVec2}
     */
    static add(a, b) {
        return new BigVec2(a.x + b.x, a.y + b.y);
    }

    /**
     * @param {Vec2|BigVec2} a
     * @param {Vec2|BigVec2} b
     * @returns {BigVec2}
     */
    static sub(a, b) {
        return new BigVec2(a.x - b.x, a.y - b.y);
    }

    /**
     * @param {Vec2|BigVec2} a
     * @param {Vec2|BigVec2} b
     * @returns {number}
     */
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }

    /**
     * @param {Vec2|BigVec2} a
     * @param {Vec2|BigVec2} b
     * @returns {number}
     */
    static distance(a, b) {
        return a.sub(b).length;
    }

    /**
     * @param {Vec2|BigVec2} a
     * @param {Vec2|BigVec2} b
     * @returns {number}
     */
    static distanceSquared(a, b) {
        return a.sub(b).lengthSquared;
    }

    /**
     * @param {Vec2|BigVec2} a
     * @param {Vec2|BigVec2} b
     * @param {number} dist
     * @returns {BigVec2}
     */
    static midpoint(a, b, dist = 0.5) {
        return BigVector.add(a.mul(1 - dist), b.mul(dist))
    }

    /**
     * @param {(Vec2|BigVec2)[]} vectors
     * @returns {BigVec2}
     */
    static center(vectors) {
        return vectors.reduce((a, b) => a.add(b), new BigVec2(0, 0)).div(vectors.length);
    }

    /**
     * @param {number} angle
     * @param {number} length
     * @returns {BigVec2}
     */
    static polarVector(angle, length = 1) {
        return new BigVec2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}