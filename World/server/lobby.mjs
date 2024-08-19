import * as websocket from './websocket.mjs';
import { HeaderDecoder } from './decoder.mjs';
import { HeaderEncoder } from './encoder.mjs';
import ServerGame from './servergame.mjs';
import headers from '../headers.mjs';

import { once } from 'events';

export const MAXLOBBYSIZE = 6;
export const clientStates = {
    INQUEUE: 0,
    INLOBBY: 1,
    LEFT: 2
};
export const lobbyStates = {
    WAITING: 0,
    STARTED: 1,
    CLOSED: 2
};

const LobbyHandler = {
    queue: [],
    lobbies: [],

    initiate(server) {
        websocket.listen(server, async connection => {
            const newClient = this.handleClientJoin(connection);
            connection.on('close', this.handleClientClose.bind(this, newClient));

            console.log(`new client: ${newClient.connection.key}`);

            try {
                newClient.send(HeaderEncoder(headers.server.OK));
                await newClient.awaitMessageWithHeader(headers.client.OK);
                newClient.send(HeaderEncoder(headers.server.YOURSOCKETKEY, Buffer.from(newClient.connection.key)));
    
                const isHost = (await newClient.awaitMessageWithHeader(headers.client.ISHOST))[0] == 1;
                if (isHost) this.hostGame(newClient);
                else this.joinGame(newClient);
            } catch (e) {}
        });
    },
    handleClientJoin(connection) {
        const newClient = new Client(connection, this);
        this.queue.push(newClient);
        return newClient;
    },
    handleClientClose(client) {
        client.leave();
    },

    async hostGame(client) {
        try {
            console.log(`client ${client.connection.key} hosting game`);

            const newLobby = new Lobby(client);

            this.lobbies.push(newLobby);
            client.send(HeaderEncoder(headers.server.OK));

            await client.awaitMessageWithHeader(headers.client.STARTGAME);
            client.send(HeaderEncoder(headers.server.OK));

            newLobby.startGame();
        } catch (e) {}
    },
    async joinGame(client) {
        try {
            client.send(HeaderEncoder(headers.server.OK));

            const lobbyKey = (await client.awaitMessageWithHeader(headers.client.JOINLOBBY)).toString('utf8');
            const lobbyToJoin = this.lobbies.find(v => v.key == lobbyKey);

            console.log(`client ${client.connection.key} joining game ${lobbyKey}`);

            if (typeof lobbyToJoin == 'undefined')
                client.send(HeaderEncoder(headers.server.LOBBYNOTEXIST));
            else {
                if (lobbyToJoin.addClient(client)) client.send(HeaderEncoder(headers.server.OK));
                else client.send(HeaderEncoder(headers.server.LOBBYNOTACCEPT))
            }
        } catch (e) {}
    },

    kickClientIndex(index) {
        if (index < 0 || index >= this.queue.length) return null;

        const temp = this.queue[index];
        this.queue[index] = this.queue.at(-1);
        this.queue[this.queue.length - 1] = temp;
        this.queue.pop();
        return temp;
    },
    kickClient(client) {
        const index = this.queue.findIndex(v => v.connection.key == client.connection.key);
        if (index == -1) return null;

        return this.kickClientIndex(index);
    },

    leaveClient(client) {
        console.log(`client ${client.connection.key} has left`);
        this.kickClient(client);
    }
}; export default LobbyHandler;

class Lobby {
    constructor(host) {
        this.players = [host];
        this.key = host.connection.key;
        this.game = null;

        this.state = lobbyStates.WAITING;
    }

    startGame() {
        this.sendAllKeys();

        this.game = new ServerGame(this.players);
        this.sendRandomSeed(this.game.game.random.seed);
    }

    sendAllKeys() {
        const numberOfKeys = this.players.length;
        const sizeBuffer = Buffer.alloc(1);
        sizeBuffer.writeUint8(numberOfKeys);

        const keyBuffers = [];
        for (let i = 0; i < this.players.length; i++) {
            const key = this.players[i].connection.key;
            keyBuffers.push(Buffer.from(key, 'utf8'));
        }

        this.sendToAll(HeaderEncoder(headers.server.ALLSOCKETKEYS, Buffer.concat(keyBuffers)));
    }

    sendRandomSeed(seed) {
        const buffer = Buffer.alloc(4);
        buffer.writeUint32BE(seed);

        this.sendToAll(HeaderEncoder(headers.server.RANDOMSEED, buffer));
    }

    addClient(client) {
        if (this.state == lobbyStates.STARTED) return false;
        if (this.players.length == MAXLOBBYSIZE) return false;

        this.players.push(client);
        client.join(this.key);
        return true;
    }

    sendToAll(data) {
        for (let i = 0; i < this.players.length; i++) this.players[i].send(data);
    }

    kickClientIndex(index) {
        if (index < 0 || index >= this.players.length) return null;

        const temp = this.players[index];
        this.players[index] = this.players.at(-1);
        this.players[this.players.length - 1] = temp;
        this.players.pop();
        return temp;
    }

    kickClient(client) {
        const index = this.players.findIndex(v => v.connection.key == client.connection.key);
        if (index == -1) return null;

        return this.kickClientIndex(index);
    }

    leaveClient(client) {
        this.kickClient(client);
    }
}

class Client {
    constructor(connection, lobbyhander) {
        this.connection = connection;
        this.decoder = new HeaderDecoder(connection);

        this.holder = lobbyhander;
        this.state = clientStates.INQUEUE;

        this.abortController = new AbortController();
    }

    join(lobbyKey) {
        this.state = clientStates.INLOBBY;
    }

    leave() {
        this.abortController.abort();

        this.state = clientStates.LEFT;
        this.holder.leaveClient(this);
    }

    send(data) {
        this.connection.send(data);
    }

    async awaitMessageWithHeader(header) {
        const [val] = await once(this.decoder, header, { signal: this.abortController.signal });
        return val;
    }
}