import express from 'express';
import path from 'path';
import https from 'https';
import http from 'http';
import { IUtf8Message, server as WebSocketServer } from 'websocket';
import { SERVER_PORT } from '../config/config';
import { GameMessage, GameOptions, JoinMessage } from './definitions/type';
import GameRoom from './games/game';
import { dust2 } from './maps/dust2';

const createServer = (): express.Application => {
  const app = express();
  const httpsServer = https.createServer(app);
  const httpServer = http.createServer(app);
  const gameRooms: Array<GameRoom> = [];
  const wsServer = new WebSocketServer({ httpServer: [httpsServer, httpServer] });

  console.log(`Server running at ${process.env.NODE_ENV} mode`);

  if (process.env.NODE_ENV === 'production') {
    httpsServer.listen(SERVER_PORT, () => {
      console.log(`Https Server listening on ${SERVER_PORT}`);
    });
  } else {
    httpServer.listen(SERVER_PORT, () => {
      console.log(`Http Server listening on ${SERVER_PORT}`);
    });
  }

  app.get('/', (req, res, next) => {
    const gameRoom = gameRooms[0];
    if (gameRoom) {
      res.redirect(`/game?roomId=${gameRoom.id}`);
    } else {
      next();
    }
  });

  app.get('/game', (req, res, next) => {
    const gameRoom = gameRooms.find(gameRoom => gameRoom.id === req.query.roomId);
    if (gameRoom) {
      res.sendFile(path.join(__dirname, '..', 'app', 'index.html'));
    } else {
      next();
    }
  });

  app.use('/client', express.static(path.join(__dirname, '..', 'app')));

  app.get('*', (_req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'app', '404.html'));
  });

  wsServer.on('request', request => {
    const connection = request.accept(null, request.origin);
    const clientIp = connection.remoteAddress;
    console.log(`Client at ${clientIp} connected`);

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
        const gameRoom = gameRooms.find(gameRoom => gameRoom.id === message.roomId);
        if (gameRoom) {
          gameRoom.addPlayer({
            playerName: joinMessage.playerName,
            connection: connection,
          });
          connection.send(
            JSON.stringify({
              roomId: message.roomId,
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

  const removeGameRoom = (id: string) => {
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
    autoStart: true,
  });
  return app;
};

createServer();
