import { ChatMessage, GameInfo, GameMap, GameMessage, GameOptions, PlayerOptions } from '../definitions/type';
import Player from './player';
import async from 'async';
import { getCurrentTickInNanos, NS_PER_SEC, toTile, walkable, normalizeVector2 } from './gameUtils';

const serverTick = 30;

class GameRoom {
  private _id: string;
  private _roomName: string;
  private _maxPlayer: number;
  private _map: GameMap;
  private _players: Player[];
  private _bots?: number;
  private _tick: number;
  private _tickIndex: number;
  private _mapW: number;
  private _mapH: number;

  constructor(gameOptions: GameOptions) {
    this._id = gameOptions.id || getCurrentTickInNanos().toString();
    this._roomName = gameOptions.roomName;
    this._maxPlayer = gameOptions.maxPlayers;
    this._map = gameOptions.map;
    this._players = [];
    this._bots = gameOptions.bots;
    this._tick = 0;
    this._tickIndex = 0;
    this._mapW = this._map.width * this._map.tileWidth;
    this._mapH = this._map.height * this._map.tileHeight;
    console.log(`Created GameRoom [${this._id}]${this._roomName}`);
    gameOptions.autoStart && this.start();
  }

  public get id(): string {
    return this._id;
  }

  public get info(): GameInfo {
    return {
      id: this._id,
      roomName: this._roomName,
      players: this._players.length,
      maxPlayers: this._maxPlayer,
    } as GameInfo;
  }

  public get map(): GameMap {
    return this._map;
  }

  public start = () => {
    this.init();
    this._tick = getCurrentTickInNanos();
    this.loop();
    console.log(`Started GameRoom [${this._id}]${this._roomName}`);
  };

  public destroy = () => {
    console.log(`Destroyed GameRoom [${this._id}]${this._roomName}`);
  };

  public broadcast = (gameMessage: GameMessage) => {
    async.each(this._players, (player, callback) => {
      if (!gameMessage.playerId || gameMessage.playerId === player.id) {
        player.sendMessage(gameMessage);
      }
      callback();
    });
  };

  public addPlayer = (playerOptions: PlayerOptions): Player => {
    const player = new Player(this, playerOptions);
    this._players.push(player);
    player.sendMessage({
      roomId: this._id,
      event: 'JOIN',
      data: {
        playerId: player.id,
      },
    } as GameMessage);
    this.broadcast({
      roomId: this._id,
      event: 'CHAT',
      data: {
        channel: 'GAME_ROOM',
        playerName: '[System]',
        message: `Player [${player.id}]${player.name} joined GameRoom [${this._id}]${this._roomName}`,
      },
    });
    console.log(`Player [${player.id}]${player.name} joined GameRoom [${this._id}]${this._roomName}`);
    return player;
  };

  public removePlayerById = (id: string) => {
    const player = this._players.find(player => player.id === id);
    if (player) {
      const index = this._players.indexOf(player);
      this._players.splice(index, 1);
      this.broadcast({
        roomId: this._id,
        event: 'CHAT',
        data: {
          channel: 'GAME_ROOM',
          playerName: '[System]',
          message: `Player [${player.id}]${player.name} left GameRoom [${this._id}]${this._roomName}`,
        },
      });
      console.log(`Player [${player.id}]${player.name} left GameRoom [${this._id}]${this._roomName}`);
    }
  };

  public removePlayerByIp = (ip: string) => {
    const player = this._players.find(player => player.ip === ip);
    if (player) {
      const index = this._players.indexOf(player);
      this._players.splice(index, 1);
      console.log(`Player [${player.id}]${player.name} left GameRoom [${this._id}]${this._roomName}`);
    }
  };

  private initBots = () => {
    if (this._bots) {
      for (var i = 0; i < this._bots; i++) {
        this.addPlayer({ playerName: `Bot ${i}` });
      }
    }
  };

  private init = () => {
    this.initBots();
  };

  private gameUpdate = () => {
    async
      .each(this._players, (player, callback) => {
        try {
          player.velocity = { x: 0, y: 0 };

          if (player.knockTime > 0) player.knockTime -= 1;

          if (player.knockTime === 0) {
            if (player.inputController.moveLeft) {
              player.velocity.x -= 1;
            }
            if (player.inputController.moveRight) {
              player.velocity.x += 1;
            }
            if (player.inputController.moveUp) {
              player.velocity.y -= 1;
            }
            if (player.inputController.moveDown) {
              player.velocity.y += 1;
            }

            player.velocity = normalizeVector2(player.velocity);
          } else {
            player.velocity = normalizeVector2({ x: Math.sin(player.knockDir) * 7, y: -Math.cos(player.knockDir) * 7 });
          }

          player.velocity.x *= 6 + (player.inputController.running ? 4 : 0);
          player.velocity.y *= 6 + (player.inputController.running ? 4 : 0);

          const ox = player.velocity.x === 0 ? 0 : player.velocity.x < 0 ? -12 : 12;
          const oy = player.velocity.y === 0 ? 0 : player.velocity.y < 0 ? -12 : 12;
          const x = toTile(player.position.x, this._map);
          const x1 = toTile(player.position.x - 12, this._map);
          const x2 = toTile(player.position.x + 12, this._map);
          const xh = toTile(player.position.x + player.velocity.x + ox, this._map);
          const y = toTile(player.position.y, this._map);
          const y1 = toTile(player.position.y - 12, this._map);
          const y2 = toTile(player.position.y + 12, this._map);
          const yv = toTile(player.position.y + player.velocity.y + oy, this._map);

          if (
            player.position.x + player.velocity.x - 32 < 0 ||
            player.position.x + player.velocity.x + 32 >= this._mapW
          ) {
            player.velocity.x = 0;
          }
          if (
            player.position.y + player.velocity.y - 32 < 0 ||
            player.position.y + player.velocity.y + 32 >= this._mapH
          ) {
            player.velocity.y = 0;
          }

          if (player.velocity.x != 0 || player.velocity.y != 0) {
            if (!walkable(this._map.data[y1][xh].type) || !walkable(this._map.data[y2][xh].type)) {
              player.velocity.x = 0;
            }
            if (!walkable(this._map.data[yv][x1].type) || !walkable(this._map.data[yv][x2].type)) {
              player.velocity.y = 0;
            }
          }

          player.position.x += player.velocity.x;
          player.position.y += player.velocity.y;
          player.fakeRotate = player.rotate;

          if (player.onAttack) {
            if (player.attackStage === 3) {
              player.fakeRotate += 0.2 * (5 - player.attackCount);
            } else if (player.attackStage === 2) {
              player.fakeRotate -= 0.4 * (5 - player.attackCount) - 0.2 * 5;
              for (const otherPlayer of this._players) {
                if (player.id != otherPlayer.id) {
                  const dt =
                    (player.position.x - otherPlayer.position.x) * (player.position.x - otherPlayer.position.x) +
                    (player.position.y - otherPlayer.position.y) * (player.position.y - otherPlayer.position.y);
                  const dir = -Math.atan2(
                    player.position.x - otherPlayer.position.x,
                    player.position.y - otherPlayer.position.y
                  );

                  if (dt <= 35 * 35 && !player.knock[otherPlayer.id]) {
                    if (
                      Math.abs(player.rotate - dir) <= 0.8 ||
                      Math.abs(player.rotate + 2 * Math.PI - dir) <= 0.8 ||
                      Math.abs(player.rotate - 2 * Math.PI - dir) <= 0.8
                    ) {
                      const killed = otherPlayer.hit(player, dir);
                      if (killed) {
                        this.broadcast({
                          roomId: this._id,
                          event: 'CHAT',
                          data: {
                            channel: 'GAME_ROOM',
                            message:
                              '<span style="color:blue">' +
                              player.name +
                              ' </span>' +
                              '<span style="color:#dd0000"> killed </span>' +
                              '<span style="color:blue">' +
                              otherPlayer.name +
                              ' </span>',
                          } as ChatMessage,
                        });
                      } else {
                        player.knock[otherPlayer.id] = true;
                      }
                    }
                  }
                }
              }
            } else if (player.attackStage === 1) {
              player.fakeRotate += 0.1 * (10 - player.attackCount) - 0.1 * 10;
            }

            if (player.fakeRotate > Math.PI) player.fakeRotate = player.fakeRotate - 2 * Math.PI;

            if (player.fakeRotate < -Math.PI) player.fakeRotate = 2 * Math.PI + player.fakeRotate;

            player.attackCount -= 1;
            if (player.attackCount < 0) {
              player.attackStage -= 1;
              if (player.attackStage === 2) player.attackCount = 2;
              else if (player.attackStage === 1) player.attackCount = 5;
            }

            if (player.attackStage === 0) {
              player.onAttack = false;
              player.attackCount = 0;
            }
          }
        } catch (err) {
          console.log(err);
        }
        callback();
      })
      .then(() => {
        this.broadcast({
          roomId: this._id,
          event: 'PLAYER_UPDATE',
          data: this._players.map(player => ({
            id: player.id,
            name: player.name,
            health: player.health,
            maxHealth: player.maxHealth,
            sheild: player.sheild,
            maxSheild: player.maxSheild,
            rotate: player.rotate,
            fakeRotate: player.fakeRotate,
            onAttack: player.onAttack,
            position: player.position,
            velocity: player.velocity,
            inputController: player.inputController,
          })),
        });
      });
  };

  private loop = () => {
    setInterval(() => this.gameUpdate(), 1000 / serverTick);
    // const now = getCurrentTickInNanos();
    // if (now - this._tick > NS_PER_SEC / serverTick) {
    //   this._tick = now;
    //   this._tickIndex++;
    //   this.gameUpdate();
    // }

    // if (now - this._tick < NS_PER_SEC / serverTick - 16 * 1e6) {
    //   setTimeout(() => {
    //     this.loop();
    //   }, 1);
    // } else {
    //   setImmediate(() => {
    //     this.loop();
    //   });
    // }
  };
}

export default GameRoom;
