import { BigVector } from '../utils/bigvector.mjs';
import IDManager from '../utils/idmanager.mjs';
import PlayerObject from './playerobject.mjs';

import Random from '../utils/random.mjs';

export default class Game {
    /**
     * @param {string[]} playerSocketKeys 
     * @param {Random} random
     */
    constructor(socketKeys, random) {
        this.playerObjects = {};
        this.gameObjects = [];

        this.random = random;

        for (let i = 0; i < socketKeys.length; i++) {
            const socketKey = socketKeys[i];
            const playerObject = new PlayerObject(BigVector.ZERO, socketKey, IDManager.assignID(), this);

            this.playerObjects[socketKey] = playerObject;
            this.gameObjects.push(playerObject);
        }
    }

    /**
     * @param {Object.<string, Object.<string, boolean>>} keys
     * @param {number} dt
     */
    update(keys, dt) {
        this.assignKeysToPlayers(keys);

        this.updateGameObjects(dt);
        this.deleteNecessaryGameObjects();
    }

    /**
     * @param {number} dt
     */
    updateGameObjects(dt) {
        for (let i = 0; i < this.gameObjects.length; i++) this.gameObjects[i].update(dt, this);
    }
    
    deleteNecessaryGameObjects() {
        for (let i = this.gameObjects.length - 1; i >= 0; i--) if (this.gameObjects[i].remove) {
            const temp = this.gameObjects[i];
            this.gameObjects[i] = this.gameObjects.at(-1);
            this.gameObjects[this.gameObjects.length - 1] = temp;
            this.gameObjects.pop();
        }
    }

    updatePlayerObjects() {
        for (let i = 0; i < this.gameObjects.length; i++) {
            const gameObject = this.gameObjects[i];
            if (gameObject.constructor.name == 'PlayerObject')
                this.playerObjects[gameObject.socketKey] = gameObject;
        }
    }

    /**
     * @param {Object.<string, Object.<string, boolean>>} keys
     */
    assignKeysToPlayers(keys) {
        const socketKeysArray = Object.keys(keys);
        for (let i = 0; i < socketKeysArray.length; i++) {
            const socketKey = socketKeysArray[i];

            this.playerObjects[socketKey].assignKeys(keys[socketKey]);
        }
    }
}