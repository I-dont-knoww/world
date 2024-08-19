import Game from '../game/game.mjs';
import Random, { getSeed } from '../utils/random.mjs';

import { HeaderEncoder } from './encoder.mjs';
import { textEncoder } from '../utils/textDecoderAndEncoder.mjs';
import encodeGameState from '../game/gamestatemanagers/gamestateencoder.mjs';

import { socketKeyLength } from '../game/playerobject.mjs';
import { keyValueOf } from '../keys.mjs';
import headers from '../headers.mjs';

export const serverUpdateTime = 1000 / 60;
export const serverGameStateSendTime = 1000 / 5;

export default class ServerGame {
    constructor(players) {
        this.players = players;

        this.game = new Game(players.map(player => player.connection.key), new Random(getSeed()));

        this.keys = {};
        this.keyArrays = {};

        this.createKeyListeners();
        this.createUpdateInterval();
        this.createGameStateSendInterval();
    }

    createKeyListeners() {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];

            player.decoder.on(headers.client.KEYS, keyBuffer => {
                const keyCodes = [];
                for (let offset = 0; offset < keyBuffer.byteLength; offset++) keyCodes.push(keyBuffer.readUint8(offset));

                this.keyArrays[player.connection.key] = keyBuffer;
                this.keys[player.connection.key] = Object.fromEntries(keyCodes.map(keyCode => [keyValueOf[keyCode], true]));
            });
        }
    }

    sendKeyArrays() {
        const message = Object.entries(this.keyArrays).flat();
        for (let i = 0; i < message.length; i += 2) {
            const socketKeyBuffer = Buffer.from(message[i], 'utf8');
            const length = this.keyArrays[message[i]].byteLength;

            const header = Buffer.allocUnsafe(socketKeyLength + 1);
            header.writeUint8(length);
            header.set(socketKeyBuffer, 1);

            message[i] = header;
        }

        for (let i = 0; i < this.players.length; i++)
            this.players[i].send(HeaderEncoder(headers.server.KEYS, Buffer.concat(message)));
    }

    createUpdateInterval() {
        this.updateInterval = setInterval(() => {
            this.sendKeyArrays();

            this.game.update(this.keys, serverUpdateTime);
        }, serverUpdateTime);
    }

    createGameStateSendInterval() {
        this.gameStateSendInterval = setInterval(() => {
            this.sendGameStateTime();
            this.sendGameState();
        }, serverGameStateSendTime);
    }

    sendGameStateTime() {
        const message = textEncoder.encode(Date.now().toString());
        const data = HeaderEncoder(headers.server.GAMESTATETIME, message);

        for (let i = 0; i < this.players.length; i++)
            this.players[i].connection.send(data);
    }

    sendGameState() {
        const message = HeaderEncoder(headers.server.GAMESTATE, Buffer.from(encodeGameState(this.game.gameObjects)));

        for (let i = 0; i < this.players.length; i++)
            this.players[i].connection.send(message);
    }
}