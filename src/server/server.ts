import express from 'express';
import path from 'path';
import { Server } from 'http';
import { IUtf8Message, server as WebSocketServer } from 'websocket';
import { SERVER_PORT } from '../config/server';
import { GameMessage, GameOptions, JoinMessage, PlayerOptions } from './definitions/type';
import GameRoom from './games/game';
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
    res.sendFile(path.join(__dirname, '..', 'app', 'index.html'));
  });

  app.use('/client', express.static(path.join(__dirname, '..', 'app')));

  wsServer.on('request', request => {
    const connection = request.accept(null, request.origin);
    const clientIp = connection.remoteAddress.split(':')[3];

    connection.on('close', (code, desc) => {
      console.log(`Client at ${clientIp} disconnected with [${code}]${desc}`);
      for (const gameRoom of gameRooms) {
        gameRoom.removePlayerByIp(clientIp);
      }
    });

    connection.on('message', data => {
      const message: GameMessage = JSON.parse((data as IUtf8Message).utf8Data);
      if (message.event === 'JOIN') {
        const joinMessage: JoinMessage = message.data as JoinMessage;
        const gameRoom = gameRooms.find(gameRoom => gameRoom.id === joinMessage.gameId);
        if (gameRoom) {
          const gameId = gameRoom.id;
          gameRoom.addPlayer({
            playerName: joinMessage.playerName,
            connection: connection,
          });
          connection.send(
            JSON.stringify({
              gameId: gameId,
              event: 'LOAD_MAP',
              data: gameRoom.map,
            } as GameMessage)
          );
        }
      }
    });
  });

  const addGameRoom = (gameOptions: GameOptions) => {
    gameRooms.push(new GameRoom(gameOptions));
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
