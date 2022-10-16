import express from 'express';
import path from 'path';
import { Server } from 'http';
import { server as WebSocketServer } from 'websocket';
import { SERVER_PORT } from '../config/server';
import { GameOptions, PlayerOptions } from './definitions/type';
import { GameRoom } from './games/game';
import { dust2 } from './maps/dust2';

export interface GameServer {
  wsServer: WebSocketServer;
  gameRooms: GameRoom[];
  addGameRoom: (gameOptions: GameOptions) => void;
  removeGameRoom: (id: number | string) => void;
  addPlayer: (gameId: number | string, playerOptions: PlayerOptions) => void;
  removePlayer: (gameId: number | string, playerId: number | string) => void;
}

const createServer = (): express.Application => {
  const app = express();
  const server = new Server(app);
  const gameRooms: Array<GameRoom> = [];
  const wsServer = new WebSocketServer({ httpServer: server });

  server.listen(SERVER_PORT, () => {
    console.log(`Server listening on ${SERVER_PORT}`);
  });

  app.get('/', (_req, res) => {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    console.log(path.join(__dirname, '..', 'app', 'index.html'));
    res.sendFile(path.join(__dirname, '..', 'app', 'index.html'));
  });

  app.use('/client', express.static(path.join(__dirname, '..', 'app')));

  const addGameRoom = (gameOptions: GameOptions) => {
    gameRooms.push(new GameRoom(wsServer, gameOptions));
  };

  const removeGameRoom = (id: number | string) => {
    const gameRoom = gameRooms.find(gameRoom => gameRoom.id === id);
    if (gameRoom) {
      const index = gameRooms.indexOf(gameRoom);
      gameRoom.destroy();
      gameRooms.splice(index, 1);
    }
  };

  addGameRoom({
    roomName: 'Default Room',
    maxPlayers: 32,
    map: dust2,
    bots: 5,
  });
  return app;
};

createServer();
