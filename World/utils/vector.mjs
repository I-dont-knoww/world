import { BigVec2 } from './bigvector.mjs';

export class Vec2 {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    set(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {Vec2|BigVec2} other
     * @returns {boolean}
     */
    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    /**
     * @returns {Vec2|BigVec2}
     */
    sum() {
        this.x + this.y;
        return this;
    }

    get lengthSquared() {
        return this.x ** 2 + this.y ** 2;
    }

    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    set length(length) {
        const thislength = this.length;
        if (thislength == 0) return new Vec2(length, 0);
        return this.mulInPlace(length / thislength);
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    set angle(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        this.x = this.x * cos - this.y * sin;
        this.y = this.x * sin + this.y * cos;
    }

    /**
     * @returns {boolean}
     */
    containsNaN() {
        return isNaN(this.x) || isNaN(this.y);
    }

    *components() {
        yield this.x;
        yield this.y;
    }

    /**
     * @param {Vec2} v
     * @returns {Vec2}
     */
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    /**
     * @param {Vec2|BigVec2} v
     * @returns {Vec2|BigVec2}
     */
    addInPlace(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /**
     * @param {Vec2} v
     * @returns {Vec2}
     */
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    /**
     * @param {Vec2|BigVec2} v
     * @returns {Vec2|BigVec2}
     */
    subInPlace(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /**
     * @param {number} s
     * @returns {Vec2}
     */
    mul(s) {
        return new Vec2(this.x * s, this.y * s);
    }

    /**
     * @param {number} s
     * @returns {Vec2|BigVec2}
     */
    mulInPlace(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    /**
     * @param {number} s 
     * @returns {Vec2}
     */
    exp(s) {
        return new Vec2(this.x ** s, this.y ** s);
    }

    /**
     * @param {number} s
     * @returns {Vec2|BigVec2}
     */
    expInPlace(s) {
        this.x **= s;
        this.y **= s;
        return this;
    }

    /**
     * @param {number} s
     * @returns {Vec2}
     */
    div(s) {
        return new Vec2(this.x / s, this.y / s);
    }

    /**
     * @param {number} s
     * @returns {Vec2|BigVec2}
     */
    divInPlace(s) {
        this.x /= s;
        this.y /= s;
        return this;
    }

    /**
     * @param {Vec2|BigVec2} v
     * @returns {number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * @param {Vec2|BigVec2} v
     * @returns {Vec2|BigVec2}
     */
    copy(v) {
        this.set(v.x, v.y);
        return this;
    }

    /**
     * @returns {Vec2}
     */
    clone() {
        return new Vec2(this.x, this.y);
    }

    /**
     * @returns {Vec2|BigVec2}
     */
    mutable() {
        Object.defineProperties(this, {
            x: { writable: true },
            y: { writable: true }
        });
        return this;
    }

    /**
     * @returns {Vec2|BigVec2}
     */
    immutable() {
        Object.defineProperties(this, {
            x: { writable: false },
            y: { writable: false }
        });
        return this;
    }
}

export class Vector {
    static #ZERO = new Vec2(0, 0).immutable();
    static #UP = new Vec2(0, -1).immutable();
    static #DOWN = new Vec2(0, 1).immutable();
    static #LEFT = new Vec2(-1, 0).immutable();
    static #RIGHT = new Vec2(1, 0).immutable();

    static get ZERO() { return Vector.#ZERO.clone() }
    static get UP() { return Vector.#UP.clone() }
    static get DOWN() { return Vector.#DOWN.clone() }
    static get LEFT() { return Vector.#LEFT.clone() }
    static get RIGHT() { return Vector.#RIGHT.clone() }

    /**
     * @param {Vec2|BigVec2} v 
     * @returns {Vec2}
     */
    static ensure(v) {
        if (v instanceof BigVec2) return v;
        return new Vec2(v.x, v.y);
    }

    /**
     * @param {Vec2|BigVec2} a
     * @param {Vec2|BigVec2} b
     * @returns {Vec2}
     */
    static add(a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }

    /**
     * @param {Vec2|BigVec2} a
     * @param {Vec2|BigVec2} b
     * @returns {Vec2}
     */
    static sub(a, b) {
        return new Vec2(a.x - b.x, a.y - b.y);
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
     * @returns {Vec2}
     */
    static midpoint(a, b, dist = 0.5) {
        return Vector.add(a.mul(1 - dist), b.mul(dist))
    }

    /**
     * @param {(Vec2|BigVec2)[]} vectors
     * @returns {Vec2}
     */
    static center(vectors) {
        return vectors.reduce((a, b) => a.add(b), new Vec2(0, 0)).div(vectors.length);
    }

    /**
     * @param {number} angle
     * @param {number} length
     * @returns {Vec2}
     */
    static polarVector(angle, length = 1) {
        return new Vec2(Math.cos(angle) * length, Math.sin(angle) * length);
    }
}