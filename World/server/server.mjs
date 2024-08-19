import FileServer from './fileserver.mjs';
import LobbyHandler from './lobby.mjs';

const PORT = 8000 || process.env.PORT;

const server = FileServer('./../', PORT);
LobbyHandler.initiate(server);