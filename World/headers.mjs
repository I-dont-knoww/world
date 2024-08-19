const headerString = `
server.OK
server.YOURSOCKETKEY
server.LOBBYNOTEXIST
server.LOBBYNOTACCEPT
server.ALLSOCKETKEYS
server.RANDOMSEED
server.KEYS
server.GAMESTATETIME
server.GAMESTATE
client.OK
client.ISHOST
client.STARTGAME
client.JOINLOBBY
client.KEYS
`.trim().split('\n').map(v => v.split('.'));

const headers = {};
let counter = 0;
for (let i = 0; i < headerString.length; i++) {
    let holder = headers;
    for (let j = 0; j < headerString[i].length - 1; j++) {
        holder[headerString[i][j]] = holder[headerString[i][j]] ?? {};
        holder = holder[headerString[i][j]];
    }

    holder[headerString[i].at(-1)] = counter++;
}

if (counter > 255) throw new Error('too many headers');

export default headers;