import TypeManager from '../utils/typemanager.mjs';

import { playerSize } from '../game/playerobject.mjs';

export default class Renderer {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.resetCanvasSize();
        addEventListener('resize', () => this.resetCanvasSize());
    }

    resetCanvasSize() {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
    }

    render(gameObjects) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < gameObjects.length; i++) renderGameObject(gameObjects[i], this.ctx);
    }
}

/**
 * @param {*} object
 * @param {CanvasRenderingContext2D} ctx
 */
function renderGameObject(object, ctx) {
    const type = TypeManager.getTypeOf(object.constructor.name);

    switch (type) {
        case  TypeManager.getTypeOf('PlayerObject'): {
            ctx.filLStyle = 'red';
            
            ctx.beginPath();
            ctx.arc(object.pos.x, object.pos.y, playerSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}