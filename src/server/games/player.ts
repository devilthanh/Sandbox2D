import { connection, IUtf8Message } from 'websocket';
import { PlayerOptions, InputController, Vector2, GameMessage, ChatMessage, PingMessage } from '../definitions/type';
import GameRoom from './game';
import { randomInt, getCurrentTickInNanos, NS_PER_SEC, walkable } from './gameUtils';

const botUpdateSeconds = 3;

class Player {
  private _id: string;
  private _name: string;
  private _ip?: string;
  private _isBot: boolean;
  private _tick: number;
  private _gameRoom: GameRoom;
  private _connection?: connection;
  private _inputController: InputController;
  private _latency: number;
  public position: Vector2;
  public rotate: number;
  public fakeRotate: number;
  public health: number;
  public maxHealth: number;
  public sheild: number;
  public maxSheild: number;
  public velocity: Vector2;
  public isRunning: boolean;
  public onAttack: boolean;
  public attackStage: number;
  public attackCount: number;
  public knockTime: number;
  public knockDir: number;
  public knock: any;

  constructor(gameRoom: GameRoom, playerOptions: PlayerOptions) {
    this._gameRoom = gameRoom;
    this._connection = playerOptions.connection;
    this._ip = playerOptions.connection?.remoteAddress.split(':')[3];
    this._name = playerOptions.playerName;
    this._id = getCurrentTickInNanos().toString();
    this._isBot = this._ip === undefined;
    this._tick = getCurrentTickInNanos();
    this._inputController = { moveLeft: false, moveRight: false, moveUp: false, moveDown: false };
    this._latency = 0;
    this.position = { x: 0, y: 0 };
    this.rotate = 0;
    this.fakeRotate = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.maxSheild = 100;
    this.sheild = 0;
    this.maxSheild = 0;
    this.velocity = { x: 0, y: 0 };
    this.isRunning = false;
    this.onAttack = false;
    this.attackStage = 0;
    this.attackCount = 0;
    this.knockTime = 0;
    this.knockDir = 0;
    this.knock = {};
    this.spawn();
    this._isBot && this.botLoop();
    this.initNetwork();
  }

  public get id() {
    return this._id;
  }

  public get ip() {
    return this._ip;
  }

  public get name() {
    return this._name;
  }

  public get inputController() {
    return this._inputController;
  }

  public sendMessage = (gameMessage: GameMessage) => {
    this._connection?.send(JSON.stringify(gameMessage));
  };

  public hit = (attackPlayer: Player, dir: number): boolean => {
    this.knockTime = 20;
    this.knockDir = dir;
    this.health -= Math.floor(Math.random() * 30);
    if (this.health <= 0) {
      this.health = 100;
      this.spawn();
      return true;
    }
    return false;
  };

  private initNetwork = () => {
    this._connection?.on('message', data => {
      const message: GameMessage = JSON.parse((data as IUtf8Message).utf8Data);
      switch (message.event) {
        case 'PING': {
          const pingMessage: PingMessage = message.data as PingMessage;
          this._latency = pingMessage.latency;
          break;
        }
        case 'CHAT': {
          const chatMessage: ChatMessage = message.data as ChatMessage;
          chatMessage.playerName = this._name;
          message.data = chatMessage;
          this._gameRoom.broadcast(message);
          break;
        }
        case 'INPUT':
          this._inputController = message.data as InputController;
          break;
        case 'ATTACK':
          this.onAttack = true;
          this.attackStage = 3;
          this.attackCount = 5;
          break;
      }
    });
  };

  private botUpdate = () => {
    if (!this._isBot) return;
    const moveX = randomInt(-1, 1);
    const moveY = randomInt(-1, 1);

    switch (moveX) {
      case -1:
        this._inputController.moveLeft = true;
        this._inputController.moveRight = false;
        break;
      case 1:
        this._inputController.moveLeft = false;
        this._inputController.moveRight = true;
        break;
      default:
        this._inputController.moveLeft = false;
        this._inputController.moveRight = false;
    }

    switch (moveY) {
      case -1:
        this._inputController.moveUp = true;
        this._inputController.moveDown = false;
        break;
      case 1:
        this._inputController.moveUp = false;
        this._inputController.moveDown = true;
        break;
      default:
        this._inputController.moveUp = false;
        this._inputController.moveDown = false;
    }

    this.isRunning = randomInt(0, 3) === 0 ? true : false;
    this.onAttack = randomInt(0, 3) === 0 ? true : false;

    const rotateVector: Vector2 = { x: 0, y: 0 };

    if (this._inputController.moveLeft) rotateVector.x = -1;
    if (this._inputController.moveRight) rotateVector.x = 1;
    if (this._inputController.moveUp) rotateVector.y = -1;
    if (this._inputController.moveDown) rotateVector.y = 1;

    this.rotate = -Math.atan2(0 - rotateVector.x, 0 - rotateVector.y);

    if (this.onAttack) {
      this.attackStage = 3;
      this.attackCount = 5;
    }
  };

  private botLoop = () => {
    const now = getCurrentTickInNanos();

    if (now - this._tick > NS_PER_SEC * botUpdateSeconds) {
      this._tick = now;
      this.botUpdate();
    }

    if (now - this._tick < NS_PER_SEC * botUpdateSeconds - 16 * 1e6) {
      setTimeout(() => {
        this.botLoop();
      }, 1);
    } else {
      setImmediate(() => {
        this.botLoop();
      });
    }
  };

  private spawn = () => {
    var xx, yy;
    do {
      xx = Math.floor(Math.random() * this._gameRoom.map.width);
      yy = Math.floor(Math.random() * this._gameRoom.map.height);
    } while (!walkable(this._gameRoom.map.data[yy][xx].type) || this._gameRoom.map.data[yy][xx].id === 0);
    this.position.x = xx * this._gameRoom.map.tileWidth + this._gameRoom.map.tileWidth / 2;
    this.position.y = yy * this._gameRoom.map.tileHeight + this._gameRoom.map.tileHeight / 2;
  };
}

export default Player;
