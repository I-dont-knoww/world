import createConnection from './connection.js';
import ClientGame from './clientgame.mjs';
import Random from '../utils/random.mjs';

import { textDecoder, textEncoder } from '../utils/textDecoderAndEncoder.mjs';
import { awaitEvent, resolveTo } from '../utils/promise.mjs';
import { HeaderEncoder } from './encoder.js';

import { socketKeyLength } from '../game/playerobject.mjs';
import headers from '../headers.mjs';

export const joinResults = {
    OK: 0,
    NOTEXIST: 1,
    NOTACCEPT: 2
}

export default {
    initiate() {
        this.startMenu = document.querySelector('#startMenu');
        this.hostMenu = document.querySelector('#hostMenu');
        this.joinMenu = document.querySelector('#joinMenu');

        this.hostButton = document.querySelector('#startMenu>#hostButton');
        this.joinCodeInput = document.querySelector('#startMenu>#joinCodeInput');
        this.joinButton = document.querySelector('#startMenu>#joinButton');

        this.startGameButton = document.querySelector('#hostMenu>#startGameButton');
        this.lobbyCode = document.querySelector('#hostMenu>#lobbyCode');

        this.joinInformation = document.querySelector('#joinMenu>#joinInformation');

        this.hostMenu.style.display = 'none';
        this.joinMenu.style.display = 'none';
    },

    async askUserForHost() {
        const isHost = await Promise.any([awaitEvent('click', hostButton, true), awaitEvent('click', joinButton, false)]);
        startMenu.style.display = 'none';

        return isHost;
    },

    async initiateConnection(url) {
        const connection = await createConnection(url);
        connection.initiate();

        return connection;
    },

    async hostGameMessageSequence(connection) {
        connection.send(HeaderEncoder(headers.client.ISHOST, new Uint8Array([1])));
        await connection.awaitMessageWithHeader(headers.server.OK);

        this.hostMenu.style.display = 'block';

        this.lobbyCode.innerText = connection.key;

        await awaitEvent('click', this.startGameButton);

        this.hostMenu.style.display = 'none';

        connection.send(HeaderEncoder(headers.client.STARTGAME));
        await connection.awaitMessageWithHeader(headers.server.OK);
    },
    async joinGameMessageSequence(connection) {
        connection.send(HeaderEncoder(headers.client.ISHOST, new Uint8Array([0])));
        await connection.awaitMessageWithHeader(headers.server.OK);

        this.joinMenu.style.display = 'block';

        connection.send(HeaderEncoder(headers.client.JOINLOBBY, textEncoder.encode(this.joinCodeInput.value)));
        const result = await Promise.any([
            resolveTo(connection.awaitMessageWithHeader(headers.server.OK), joinResults.OK),
            resolveTo(connection.awaitMessageWithHeader(headers.server.LOBBYNOTEXIST), joinResults.NOTEXIST),
            resolveTo(connection.awaitMessageWithHeader(headers.server.LOBBYNOTACCEPT), joinResults.NOTACCEPT),
        ]);

        if (result == joinResults.NOTEXIST) throw new Error('requested lobby does not exist');
        else if (result == joinResults.NOTACCEPT) throw new Error('requested lobby did not accept join request');
    },

    async startGame(connection) {
        const socketKeys = await this.getSocketKeys(connection);
        const randomseed = new Uint32Array(await connection.awaitMessageWithHeader(headers.server.RANDOMSEED))[0];

        this.hostMenu.style.display = 'none';
        this.joinMenu.style.display = 'none';

        return new ClientGame(socketKeys, new Random(randomseed), connection);
    },
    async getSocketKeys(connection) {
        const socketKeysBuffer = new Uint8Array(await connection.awaitMessageWithHeader(headers.server.ALLSOCKETKEYS));

        const socketKeys = [];
        for (let offset = 0; offset < socketKeysBuffer.byteLength; offset += socketKeyLength)
            socketKeys.push(textDecoder.decode(socketKeysBuffer.slice(offset, offset + socketKeyLength)));

        return socketKeys;
    }
}