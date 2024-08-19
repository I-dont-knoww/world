import StartMenu from './startmenu.js';

StartMenu.initiate();

const isHost = await StartMenu.askUserForHost();
console.log(`is host: ${isHost}`);

const connection = await StartMenu.initiateConnection('ws://localhost:8000');
console.log(`connection made`);

if (isHost) await StartMenu.hostGameMessageSequence(connection);
else await StartMenu.joinGameMessageSequence(connection);
console.log(`host/join sequence made`);

const game = await StartMenu.startGame(connection);
game.initiate();

console.log(`started game`);
console.log(game);