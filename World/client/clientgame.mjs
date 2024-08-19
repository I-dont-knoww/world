import Game from '../game/game.mjs';
import Renderer from './render.js';

import { HeaderEncoder } from './encoder.js';
import { keyCodeOf, keyValueOf } from '../keys.mjs';
import { serverGameStateSendTime } from '../server/servergame.mjs';

import decodeGameState from '../game/gamestatemanagers/gamestatedecoder.mjs';
import encodeGameState from '../game/gamestatemanagers/gamestateencoder.mjs';
import gameStateEquals from '../game/gamestatemanagers/gamestateconfirmer.mjs';

import { textDecoder } from '../utils/textDecoderAndEncoder.mjs';
import { socketKeyLength } from '../game/playerobject.mjs';
import headers from '../headers.mjs';

export const maxGameStateSaveLength = 10;

export default class ClientGame {
    /**
     * @param {string[]} playerSocketKeys
     * @param {Random} random
     * @param {Connection} connection
     */
    constructor(playerSocketKeys, random, connection) {
        this.game = new Game(playerSocketKeys, random);
        this.renderer = new Renderer();

        this.keys = Object.fromEntries(playerSocketKeys.map(socketKey => [socketKey, {}]));

        this.connection = connection;
        this.clientSocketKey = connection.key;

        this.animationFrameHandle = undefined;
        this.lastTimeFrame = 0;

        this.gameStateSaves = [];
    }

    initiate() {
        this.createKeyListeners();

        this.createGameStateSaveListener();
        this.createKeyServerListener();
        this.createGameStateServerListener();

        this.animationFrameHandle = requestAnimationFrame(currentTimeFrame => this.update(currentTimeFrame));
    }

    handleClose() {
        this.connection.socket.addEventListener(() => {
            cancelAnimationFrame(this.animationFrameHandle);
        });
    }

    update(currentTimeFrame) {
        const dt = currentTimeFrame - this.lastTimeFrame;

        this.sendKeysToServer();

        this.game.update(this.keys, dt);
        this.renderer.render(this.game.gameObjects);

        this.lastTimeFrame = currentTimeFrame;
        this.animationFrameHandle = requestAnimationFrame(currentTimeFrame => this.update(currentTimeFrame));
    }

    createKeyListeners() {
        window.addEventListener('keydown', event => {
            this.keys[this.clientSocketKey][event.code] = true;
        });

        window.addEventListener('keyup', event => {
            delete this.keys[this.clientSocketKey][event.code];
        });
    }

    createKeyServerListener() {
        this.connection.decoder.on(headers.server.KEYS, message => this.getKeysFromBuffer(message));
    }

    getKeysFromBuffer(keyArraysBuffer) {
        const view = new DataView(keyArraysBuffer);
        let offset = 0;

        for (let i = 0; i < keyArraysBuffer.length; i++) {
            const length = view.getUint8(offset); offset += 1;

            const socketKeyBuffer = keyArraysBuffer.slice(offset, offset + socketKeyLength); offset += socketKeyLength;
            const socketKey = textDecoder.decode(socketKeyBuffer);

            const keyArray = new Uint8Array(keyArraysBuffer.slice(offset, offset + length));
            const keys = Object.fromEntries(keyArray.map(keyCode => [keyValueOf[keyCode], true]));

            this.keys[socketKey] = keys;
        }
    }

    createGameStateSaveListener() {
        this.connection.decoder.on(headers.server.GAMESTATETIME, message => {
            const time = parseInt(textDecoder.decode(message));
            const ping = Date.now() - time;

            setTimeout(() => this.saveGameState(), ping % serverGameStateSendTime);
        });
    }

    createGameStateServerListener() {
        this.connection.decoder.on(headers.server.GAMESTATE, message => {
            this.alignToServerGameState(message);
        });
    }

    alignToServerGameState(gameState) {
        const newGameState = decodeGameState(gameState);
        if (this.gameStateSaves.length == 0) {
            this.resetGameStateToServerGameState(newGameState);
            return;
        }
        
        const gameStateToCheck = decodeGameState(this.gameStateSaves[0]);

        if (this.gameStateSaves.length > maxGameStateSaveLength) this.resetGameStateToServerGameState(newGameState);
        else {
            const isEqual = gameStateEquals(newGameState, gameStateToCheck);

            if (isEqual) this.gameStateSaves.shift();
            else this.resetGameStateToServerGameState(newGameState);
        }

        this.game.updatePlayerObjects();
    }

    resetGameStateToServerGameState(serverGameState) {
        this.game.gameObjects = serverGameState;
        this.gameStateSaves = [];
    }

    saveGameState() {
        this.gameStateSaves.push(encodeGameState(this.game.gameObjects));
    }

    sendKeysToServer() {
        const keys = this.keys[this.clientSocketKey];

        const keyValues = Object.keys(keys);
        const keyCodes = [];
        for (let i = 0; i < keyValues.length; i++) keyCodes.push(keyCodeOf[keyValues[i]]);

        this.connection.send(HeaderEncoder(headers.client.KEYS, new Uint8Array(keyCodes)));
    }
}