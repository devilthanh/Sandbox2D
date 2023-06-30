import express from 'express';
import path from 'path';
import { IUtf8Message, server as WebSocketServer } from 'websocket';
import { GameMessage, GameOptions, JoinMessage } from './definitions/type';
import GameRoom from './games/game';
import { dust2 } from './maps/dust2';

const PORT = process.env.PORT || 3000;

const createServer = (): express.Application => {
  const app = express();
  const gameRooms: Array<GameRoom> = [];

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

  app.use(express.static(path.join(__dirname, '..', 'app')));

  app.get('*', (_req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'app', '404.html'));
  });

  const server = app.listen(PORT, () => {
    console.log(`GameServer running on port ${PORT}`);
  });

  const wsServer = new WebSocketServer({ httpServer: server });

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

  const shutDown = () => {
    console.log('Received kill signal, shutting down gracefully');
    wsServer.closeAllConnections();
    server.close(() => {
      console.log('Closed out remaining connections');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutDown);
  process.on('SIGINT', shutDown);
  return app;
};

createServer();
