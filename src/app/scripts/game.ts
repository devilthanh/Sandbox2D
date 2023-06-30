import {
  ChatMessage,
  GameMap,
  GameMessage,
  InputController,
  JoinMessage,
  ClientPlayer,
} from '../../server/definitions/type';

declare global {
  var TWEEN: any;
}

class GameClient {
  private _roomId?: string;
  private _clientPlayerId?: string;
  private _wsClient?: WebSocket;
  private _pingSent: boolean;
  private _pingTime: number;
  private _latency: number;
  private _chatBox: HTMLElement;
  private _chatInput: HTMLInputElement;
  private _players: ClientPlayer[];
  private _mapRenderer?: MapRenderer;
  private _clientRotate: number;
  private _clientInputController: InputController;

  constructor() {
    const params = new URLSearchParams(window.location.search);
    this._roomId = params.get('roomId') || undefined;
    this._pingSent = false;
    this._pingTime = Date.now();
    this._latency = 0;
    this._chatBox = document.getElementById('chatBox') as HTMLElement;
    this._chatInput = document.getElementById('chatMsg') as HTMLInputElement;
    this._players = [];
    this._clientRotate = 0;
    this._clientInputController = {
      moveLeft: false,
      moveRight: false,
      moveUp: false,
      moveDown: false,
      running: false,
    };
    const gameScreen = document.getElementById('gameScreen') as HTMLCanvasElement;
    gameScreen.focus();
    this.initNetworking();
    this.initInputController();
    this.initChat();
  }

  public get latency() {
    return this._latency;
  }

  public get players() {
    return this._players;
  }

  public get clientPlayer() {
    return this._players.find(player => player.id === this._clientPlayerId);
  }

  public get clientRotate() {
    return this._clientRotate;
  }

  private initNetworking = () => {
    if (this._roomId) {
      this._pingSent = false;
      this._pingTime = 0;
      this._latency = 0;
      setInterval(() => {
        if (!this._pingSent && this._roomId) {
          this._pingTime = Date.now();
          this.sendMessage({
            roomId: this._roomId,
            event: 'PING',
            data: {
              latency: this._latency,
            },
          });
        }
      }, 3000);

      if (window.location.protocol.startsWith('https')) {
        this._wsClient = new WebSocket(`wss://${window.location.host}`);
      } else {
        this._wsClient = new WebSocket(`ws://${window.location.host}`);
      }

      this._wsClient.onopen = () => {
        this.sendMessage({
          roomId: this._roomId,
          event: 'JOIN',
          data: {
            playerName: 'Player',
          },
        } as GameMessage);
      };

      this._wsClient.onerror = event => {
        console.error(event);
      };

      this._wsClient.onmessage = event => {
        const gameMessage: GameMessage = JSON.parse(event.data) as GameMessage;
        switch (gameMessage.event) {
          case 'PING':
            this._pingSent = false;
            this._latency = Date.now() - this._pingTime;
            break;
          case 'JOIN':
            const joinMessage: JoinMessage = gameMessage.data as JoinMessage;
            this._clientPlayerId = joinMessage.playerId;
            console.log(`Your playerId is ${this._clientPlayerId}`);
            break;
          case 'CHAT':
            const chatMessage: ChatMessage = gameMessage.data as ChatMessage;
            if (this._chatBox) {
              this._chatBox.innerHTML =
                this._chatBox.innerHTML +
                '<div style="color:#ff0000"><b>' +
                chatMessage.playerName +
                ': <span style="color:#000000">' +
                chatMessage.message +
                '</span></b></div>';
              this._chatBox.scrollTop = this._chatBox.scrollHeight;
            }
            break;
          case 'LOAD_MAP':
            const gameMap: GameMap = gameMessage.data as GameMap;
            this._mapRenderer = new MapRenderer(this, gameMap);
            break;
          case 'PLAYER_UPDATE':
            const players: ClientPlayer[] = gameMessage.data as ClientPlayer[];
            players.forEach(player => {
              player.networkPosition = player.position;
              const old = this._players.find(oldPlayer => oldPlayer.id === player.id);
              if (old != null && player.position != null) {
                player.position = old.position;
              }
            });
            this._players.splice(0, this._players.length);
            for (const player of players) {
              this._players.push(player);
            }
            break;
        }
      };
    }
  };

  private initInputController = () => {
    const inputsEqual = (input1: InputController, input2: InputController): boolean => {
      return (
        input1.moveLeft === input2.moveLeft &&
        input1.moveRight === input2.moveRight &&
        input1.moveUp === input2.moveUp &&
        input1.moveDown === input2.moveDown &&
        input1.running === input2.running
      );
    };

    const onKeyEvent = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      const currentInput: InputController = {
        moveLeft: this._clientInputController.moveLeft,
        moveRight: this._clientInputController.moveRight,
        moveUp: this._clientInputController.moveUp,
        moveDown: this._clientInputController.moveDown,
        running: this._clientInputController.running,
      };
      switch (key) {
        case 'A':
          currentInput.moveLeft = event.type === 'keydown';
          break;
        case 'D':
          currentInput.moveRight = event.type === 'keydown';
          break;
        case 'S':
          currentInput.moveDown = event.type === 'keydown';
          break;
        case 'W':
          currentInput.moveUp = event.type === 'keydown';
          break;
        case 'SHIFT':
          currentInput.running = event.type === 'keydown';
          break;
        case 'ENTER':
          this._chatInput.focus();
          break;
      }
      if (this._roomId && !inputsEqual(currentInput, this._clientInputController)) {
        this._clientInputController = currentInput;
        this.sendMessage({
          roomId: this._roomId,
          event: 'INPUT',
          data: this._clientInputController,
        });
      }
    };

    const gameScreen = document.getElementById('gameScreen') as HTMLCanvasElement;

    gameScreen.onmousemove = (event: MouseEvent) => {
      const target = event.target as Element;
      const rect = target.getBoundingClientRect();
      const x = event.offsetX;
      const y = event.offsetY;
      this._clientRotate = -Math.atan2(rect.width / 2 - x, rect.height / 2 - y);
    };

    gameScreen.onkeydown = onKeyEvent;
    gameScreen.onkeyup = onKeyEvent;

    gameScreen.onmousedown = () => {
      this._roomId &&
        this.sendMessage({
          roomId: this._roomId,
          event: 'ATTACK',
          data: {
            type: 'NORMAL',
            rotate: this._clientRotate,
          },
        });
    };

    gameScreen.oncontextmenu = (event: MouseEvent) => {
      event.preventDefault();
      this._roomId &&
        this.sendMessage({
          roomId: this._roomId,
          event: 'ATTACK',
          data: {
            type: 'HEAVY',
            rotate: this._clientRotate,
          },
        });
    };
  };

  private initChat = () => {
    this._chatBox.onfocus = (event: FocusEvent) => {
      event.preventDefault();
    };

    this._chatBox.onclick = (event: MouseEvent) => {
      event.preventDefault();
    };

    this._chatInput.onkeyup = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (key === 'ENTER' && this._chatInput.value) {
        this._roomId &&
          this.sendMessage({
            roomId: this._roomId,
            event: 'CHAT',
            data: {
              channel: 'GAME_ROOM',
              message: this._chatInput.value,
            },
          });
        this._chatInput.value = '';
        const gameScreen = document.getElementById('gameScreen') as HTMLCanvasElement;
        gameScreen.focus();
      }
    };
  };

  private sendMessage = (gameMessage: GameMessage) => {
    this._wsClient?.send(JSON.stringify(gameMessage));
  };
}

class MapRenderer {
  private _gameClient: GameClient;
  private _gameMap: GameMap;
  private _isMapLoaded: boolean;
  private _isTileLoaded: boolean;
  private _isShadowLoaded: boolean;
  private _screenTileWidthCount: number;
  private _screenTileHeightCount: number;
  private _canvas?: HTMLCanvasElement;
  private _context2D?: CanvasRenderingContext2D;
  private _scaleX: number;
  private _scaleY: number;
  private _images: any;
  private _currentFps: number;
  private _fpsCouner: number;
  private _fpsTime: number;
  private _fpsTotalTime: number;

  constructor(gameClient: GameClient, gameMap: GameMap) {
    this._gameClient = gameClient;
    this._gameMap = gameMap;
    this._isMapLoaded = false;
    this._isTileLoaded = false;
    this._isShadowLoaded = false;
    this._currentFps = 0;
    this._fpsCouner = 0;
    this._fpsTime = Date.now();
    this._fpsTotalTime = 0;
    this._scaleX = 1;
    this._scaleY = 1;
    this._canvas = document.querySelector('canvas') || undefined;
    this._context2D = this._canvas?.getContext('2d') || undefined;
    if (this._canvas) {
      this._canvas.width = this._canvas.offsetWidth;
      this._canvas.height = this._canvas?.offsetHeight;
      this._screenTileWidthCount = Math.ceil(this._canvas.width / (2 * this._gameMap.tileWidth));
      this._screenTileHeightCount = Math.ceil(this._canvas.height / (2 * this._gameMap.tileHeight));
    } else {
      this._screenTileWidthCount = 0;
      this._screenTileHeightCount = 0;
    }
    this._images = {};
    this.initImages();
    this.loadMap();
    window.requestAnimationFrame(this.gameDrawLoop);
    console.log('MapRenderer created');
    console.log(this._gameMap);
  }

  private initImages = () => {
    this._images.tiles = [];
    this._images.shadows = [];
    this._images.tileset = new Image();
    this._images.tileset.src = '/client/img/default_dust.png';
    this._images.tileShadow = new Image();
    this._images.tileShadow.src = '/client/img/tileshadow.png';
    this._images.cloud = new Image();
    this._images.cloud.src = '/client/img/cloud.png';
    this._images.player = new Image();
    this._images.player.src = '/client/img/player.png';
    this._images.playerShadow = new Image();
    this._images.playerShadow.src = '/client/img/playershadow.png';
    this._images.monster = new Image();
    this._images.monster.src = '/client/img/monster.png';
    this._images.mapShadow = new Image();
    this._images.mapShadow.src = '/client/img/shadowmap.png';

    this._images.effect = {};
    this._images.effect.blood = new Image();
    this._images.effect.blood.src = '/client/img/blood.png';
    this._images.effect.explosion = new Image();
    this._images.effect.explosion.src = '/client/img/explosion.png';

    this._images.tileset.onload = () => {
      this.loadTiles();
    };

    this._images.mapShadow.onload = () => {
      this.loadMapShadow();
    };
  };

  private drawScaleRect = (x: number, y: number, width: number, height: number) => {
    this._context2D?.rect(
      Math.floor(x * this._scaleX),
      Math.floor(y * this._scaleY),
      Math.ceil(width * this._scaleX),
      Math.ceil(height * this._scaleY)
    );
  };

  private drawScaleImage = (img: CanvasImageSource, x: number, y: number, width: number, height: number) => {
    this._context2D?.drawImage(
      img,
      Math.floor(x * this._scaleX),
      Math.floor(y * this._scaleY),
      Math.ceil(width * this._scaleX),
      Math.ceil(height * this._scaleY)
    );
  };

  private drawScaleCropImage = (
    img: CanvasImageSource,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    this._context2D?.drawImage(
      img,
      sx,
      sy,
      sw,
      sh,
      Math.floor(x * this._scaleX),
      Math.floor(y * this._scaleY),
      Math.ceil(width * this._scaleX),
      Math.ceil(height * this._scaleY)
    );
  };

  private loadTiles = () => {
    if (this._gameMap) {
      const tilesW = this._images.tileset.width / this._gameMap.tileWidth;
      const tilesH = this._images.tileset.height / this._gameMap.tileHeight;
      for (var y = 0; y < tilesH; y++) {
        for (var x = 0; x < tilesW; x++) {
          this._images.tiles.push({
            x: x * this._gameMap.tileWidth,
            y: y * this._gameMap.tileHeight,
            w: this._gameMap.tileWidth,
            h: this._gameMap.tileHeight,
          });
        }
      }
      this._isTileLoaded = true;
    }
  };

  private loadMapShadow = () => {
    const shadowW = this._images.mapShadow.width / this._gameMap.tileWidth;
    const shadowH = this._images.mapShadow.height / this._gameMap.tileHeight;
    for (var y = 0; y < shadowH; y++) {
      for (var x = 0; x < shadowW; x++) {
        this._images.shadows.push({
          x: x * this._gameMap.tileWidth,
          y: y * this._gameMap.tileHeight,
          w: this._gameMap.tileWidth,
          h: this._gameMap.tileHeight,
        });
      }
    }
    this._isShadowLoaded = true;
  };

  private loadMap = () => {
    for (var y = 0; y < this._gameMap.height; y++)
      for (var x = 0; x < this._gameMap.width; x++) {
        this._gameMap.data[y][x].sd = 0;
        if (this._gameMap.data[y][x].type === 1 || this._gameMap.data[y][x].type === 5) this._gameMap.data[y][x].sd = 2;
        if (this._gameMap.data[y][x].type === 2) this._gameMap.data[y][x].sd = 1;

        var sd = 0;

        if (this._gameMap.data[y][x].sd === 0) {
          if (x - 1 >= 0) sd += this._gameMap.data[y][x - 1].sd * 3;
          if (y - 1 >= 0) sd += this._gameMap.data[y - 1][x].sd;
          if (x - 1 >= 0 && y - 1 >= 0) sd += this._gameMap.data[y - 1][x - 1].sd * 9;

          switch (sd) {
            case 1:
              this._gameMap.data[y][x].sdId = 3;
              break;
            case 2:
              this._gameMap.data[y][x].sdId = 2;
              break;
            case 3:
              this._gameMap.data[y][x].sdId = 9;
              break;
            case 4:
            case 13:
            case 22:
              this._gameMap.data[y][x].sdId = 13;
              break;
            case 5:
            case 14:
            case 23:
              this._gameMap.data[y][x].sdId = 11;
              break;
            case 6:
              this._gameMap.data[y][x].sdId = 8;
              break;
            case 7:
            case 16:
            case 25:
              this._gameMap.data[y][x].sdId = 12;
              break;
            case 8:
            case 17:
            case 26:
              this._gameMap.data[y][x].sdId = 10;
              break;
            case 9:
              this._gameMap.data[y][x].sdId = 5;
              break;
            case 10:
              this._gameMap.data[y][x].sdId = 1;
              break;
            case 11:
              this._gameMap.data[y][x].sdId = 16;
              break;
            case 12:
              this._gameMap.data[y][x].sdId = 7;
              break;
            case 15:
              this._gameMap.data[y][x].sdId = 14;
              break;
            case 18:
              this._gameMap.data[y][x].sdId = 4;
              break;
            case 19:
              this._gameMap.data[y][x].sdId = 17;
              break;
            case 20:
              this._gameMap.data[y][x].sdId = 0;
              break;
            case 21:
              this._gameMap.data[y][x].sdId = 15;
              break;
            case 24:
              this._gameMap.data[y][x].sdId = 6;
              break;
            default:
              this._gameMap.data[y][x].sdId = -1;
          }
        } else if (this._gameMap.data[y][x].sd === 1) {
          if (x - 1 >= 0) sd += Math.floor(this._gameMap.data[y][x - 1].sd / 2) * 2;
          if (y - 1 >= 0) sd += Math.floor(this._gameMap.data[y - 1][x].sd / 2);
          if (x - 1 >= 0 && y - 1 >= 0) sd += Math.floor(this._gameMap.data[y - 1][x - 1].sd / 2) * 4;

          switch (sd) {
            case 1:
              this._gameMap.data[y][x].sdId = 3;
              break;
            case 2:
              this._gameMap.data[y][x].sdId = 9;
              break;
            case 3:
            case 7:
              this._gameMap.data[y][x].sdId = 13;
              break;
            case 4:
              this._gameMap.data[y][x].sdId = 5;
              break;
            case 5:
              this._gameMap.data[y][x].sdId = 1;
              break;
            case 6:
              this._gameMap.data[y][x].sdId = 7;
              break;
            default:
              this._gameMap.data[y][x].sdId = -1;
          }
        }
      }
    this._isMapLoaded = true;
  };

  private gameDrawLoop = (time: DOMHighResTimeStamp) => {
    TWEEN.update(time);
    if (this._isMapLoaded && this._isTileLoaded && this._isShadowLoaded && this._canvas && this._context2D) {
      this._context2D.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this.mapUpdate('floor');
      this.mapUpdate('tileshadow_obstacle');
      this.mapUpdate('obstacle');
      this.shadowUpdate();
      this.playersUpdate();
      this.mapUpdate('tileshadow_wall');
      this.mapUpdate('wall');
      this.statsUpdate();

      const now = Date.now();
      const deltaTime = now - this._fpsTime;
      this._fpsTotalTime += deltaTime;
      this._fpsCouner++;
      this._fpsTime = now;

      if (this._fpsTotalTime >= 1000) {
        this._fpsTotalTime -= 1000;
        this._currentFps = this._fpsCouner;
        this._fpsCouner = 0;
      }
    }

    window.requestAnimationFrame(this.gameDrawLoop);
  };

  private mapUpdate = (style: 'floor' | 'tileshadow_obstacle' | 'obstacle' | 'tileshadow_wall' | 'wall') => {
    const clientPlayer = this._gameClient.clientPlayer;
    if (clientPlayer != undefined && this._context2D && this._canvas) {
      var startX = Math.max(
        0,
        Math.floor(clientPlayer.position.x / this._gameMap.tileWidth) - this._screenTileWidthCount
      );
      var startY = Math.max(
        0,
        Math.floor(clientPlayer.position.y / this._gameMap.tileHeight) - this._screenTileHeightCount
      );
      var endX = Math.min(
        this._gameMap.width,
        Math.ceil(clientPlayer.position.x / this._gameMap.tileWidth) + this._screenTileWidthCount
      );
      var endY = Math.min(
        this._gameMap.height,
        Math.ceil(clientPlayer.position.y / this._gameMap.tileHeight) + this._screenTileHeightCount
      );

      for (var y = startY; y < endY; y++)
        for (var x = startX; x < endX; x++) {
          this._context2D.beginPath();
          var tileId = this._gameMap.data[y][x].id;
          var tileType = this._gameMap.data[y][x].type;

          if (style === 'tileshadow_obstacle' && this._gameMap.data[y][x].type === 2)
            this.drawScaleImage(
              this._images.tileShadow,
              x * this._gameMap.tileWidth - clientPlayer.position.x + this._canvas.width / 2 - 2,
              y * this._gameMap.tileHeight - clientPlayer.position.y + this._canvas.height / 2 - 2,
              36,
              36
            );
          else if (style === 'tileshadow_wall' && this._gameMap.data[y][x].type === 1)
            this.drawScaleImage(
              this._images.tileShadow,
              x * this._gameMap.tileWidth - clientPlayer.position.x + this._canvas.width / 2 - 2,
              y * this._gameMap.tileHeight - clientPlayer.position.y + this._canvas.height / 2 - 2,
              36,
              36
            );
          else if (style === 'floor' && (this._gameMap.data[y][x].type === 0 || this._gameMap.data[y][x].type >= 10))
            this.drawScaleCropImage(
              this._images.tileset,
              this._images.tiles[tileId].x,
              this._images.tiles[tileId].y,
              this._images.tiles[tileId].w,
              this._images.tiles[tileId].h,
              x * this._gameMap.tileWidth - clientPlayer.position.x + this._canvas.width / 2,
              y * this._gameMap.tileHeight - clientPlayer.position.y + this._canvas.height / 2,
              this._gameMap.tileWidth,
              this._gameMap.tileHeight
            );
          else if (style === 'obstacle' && this._gameMap.data[y][x].type === 2)
            this.drawScaleCropImage(
              this._images.tileset,
              this._images.tiles[tileId].x,
              this._images.tiles[tileId].y,
              this._images.tiles[tileId].w,
              this._images.tiles[tileId].h,
              x * this._gameMap.tileWidth - clientPlayer.position.x + this._canvas.width / 2,
              y * this._gameMap.tileHeight - clientPlayer.position.y + this._canvas.height / 2,
              this._gameMap.tileWidth,
              this._gameMap.tileHeight
            );
          else if (style === 'wall' && this._gameMap.data[y][x].type === 1)
            this.drawScaleCropImage(
              this._images.tileset,
              this._images.tiles[tileId].x,
              this._images.tiles[tileId].y,
              this._images.tiles[tileId].w,
              this._images.tiles[tileId].h,
              x * this._gameMap.tileWidth - clientPlayer.position.x + this._canvas.width / 2,
              y * this._gameMap.tileHeight - clientPlayer.position.y + this._canvas.height / 2,
              this._gameMap.tileWidth,
              this._gameMap.tileHeight
            );
          this._context2D.closePath();
        }
    }
  };

  private playersUpdate = () => {
    const clientPlayer = this._gameClient.clientPlayer;
    if (clientPlayer != undefined && this._context2D && this._canvas) {
      for (const player of this._gameClient.players) {
        const tween = new TWEEN.Tween(player.position).to(player.networkPosition, 2000 / this._currentFps).start();
        let rot: number;
        if (!player.onAttack) {
          rot = player.id === clientPlayer.id ? this._gameClient.clientRotate : player.rotate;
        } else {
          rot = player.fakeRotate;
        }
        this._context2D.beginPath();
        this._context2D.save();
        this._context2D.drawImage(
          this._images.playerShadow,
          player.position.x - clientPlayer.position.x + this._canvas.width / 2 - this._images.playerShadow.width / 2,
          player.position.y - clientPlayer.position.y + this._canvas.height / 2 - this._images.playerShadow.height / 2,
          this._images.playerShadow.width,
          this._images.playerShadow.height
        );
        this._context2D.translate(
          player.position.x - clientPlayer.position.x + this._canvas.width / 2,
          player.position.y - clientPlayer.position.y + this._canvas.height / 2
        );
        this._context2D.rotate(rot);
        this._context2D.drawImage(
          this._images.player,
          -this._images.player.width / 2,
          -this._images.player.height / 2,
          this._images.player.width,
          this._images.player.height
        );
        this._context2D.restore();
        this._context2D.closePath();
      }
    }
  };

  private shadowUpdate = () => {
    const clientPlayer = this._gameClient.clientPlayer;
    if (clientPlayer != undefined && this._context2D && this._canvas) {
      var startX = Math.max(
        0,
        Math.floor(clientPlayer.position.x / this._gameMap.tileWidth) - this._screenTileWidthCount
      );
      var startY = Math.max(
        0,
        Math.floor(clientPlayer.position.y / this._gameMap.tileHeight) - this._screenTileHeightCount
      );
      var endX = Math.min(
        this._gameMap?.width,
        Math.ceil(clientPlayer.position.x / this._gameMap.tileWidth) + this._screenTileWidthCount
      );
      var endY = Math.min(
        this._gameMap.height,
        Math.ceil(clientPlayer.position.y / this._gameMap.tileHeight) + this._screenTileHeightCount
      );

      for (var y = startY; y < endY; y++)
        for (var x = startX; x < endX; x++) {
          this._context2D.beginPath();
          if (this._gameMap.data[y][x].sd === 0 && this._gameMap.data[y][x].sdId >= 0) {
            this.drawScaleCropImage(
              this._images.mapShadow,
              this._images.shadows[this._gameMap.data[y][x].sdId].x,
              this._images.shadows[this._gameMap.data[y][x].sdId].y,
              this._images.shadows[this._gameMap.data[y][x].sdId].w,
              this._images.shadows[this._gameMap.data[y][x].sdId].h,
              x * this._gameMap.tileWidth - clientPlayer.position.x + this._canvas.width / 2,
              y * this._gameMap.tileHeight - clientPlayer.position.y + this._canvas.height / 2,
              this._gameMap.tileWidth,
              this._gameMap.tileHeight
            );
          } else if (this._gameMap.data[y][x].sd === 1 && this._gameMap.data[y][x].sdId >= 0) {
            this.drawScaleCropImage(
              this._images.mapShadow,
              this._images.shadows[this._gameMap.data[y][x].sdId].x,
              this._images.shadows[this._gameMap.data[y][x].sdId].y,
              this._images.shadows[this._gameMap.data[y][x].sdId].w,
              this._images.shadows[this._gameMap.data[y][x].sdId].h,
              x * this._gameMap.tileWidth - clientPlayer.position.x + this._canvas.width / 2,
              y * this._gameMap.tileHeight - clientPlayer.position.y + this._canvas.height / 2,
              this._gameMap.tileWidth,
              this._gameMap.tileHeight
            );
          }

          this._context2D.closePath();
        }
    }
  };

  private statsUpdate = () => {
    const clientPlayer = this._gameClient.clientPlayer;
    if (clientPlayer != undefined && this._context2D && this._canvas) {
      this._context2D.beginPath();
      this._context2D.font = '9pt Arial';
      this._context2D.fillStyle = 'white';
      this._context2D.textAlign = 'right';
      this._context2D.fillText(
        `Ping: ${this._gameClient.latency} ms | ${this._currentFps} fps`,
        this._canvas.width - 10,
        20
      );

      for (const player of this._gameClient.players) {
        this._context2D.fillStyle = 'blue';
        this._context2D.textAlign = 'center';
        this._context2D.font = 'bold 9pt Arial';
        this._context2D.fillText(
          player.name,
          player.position.x - clientPlayer.position.x + this._canvas.width / 2,
          player.position.y - clientPlayer.position.y + this._canvas.height / 2 + 30
        );
      }

      this._context2D.textAlign = 'right';
      this._context2D.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this._context2D.fillText('Armor', this._canvas.width - 25, this._canvas.height - 120);
      this._context2D.font = 'bold 12pt Arial';
      this._context2D.fillText('Health', this._canvas.width - 25, this._canvas.height - 60);
      this._context2D.fillText(clientPlayer.sheild.toString(), this._canvas.width - 20, this._canvas.height - 100);

      this._context2D.font = 'bold 30pt Arial';
      this._context2D.fillText(clientPlayer.health.toString(), this._canvas.width - 20, this._canvas.height - 20);

      this._context2D.closePath();
    }
  };
}

new GameClient();
export {};
