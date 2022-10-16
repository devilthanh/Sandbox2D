import { connection } from 'websocket';

// Maps
export type MapTile = {
  id: number;
  type: number;
  sd: number;
  sdId: number;
};

export type GameMap = {
  name: string;
  data: MapTile[][];
  tileWidth: number;
  tileHeight: number;
  width: number;
  height: number;
};

// Games
export type GameOptions = {
  id?: string;
  roomName: string;
  maxPlayers: number;
  map: GameMap;
  bots?: number;
  autoStart?: boolean;
};

export type GameInfo = {
  id: string;
  roomName: string;
  players: number;
  maxPlayers: number;
};

// Players
export type PlayerOptions = {
  playerName: string;
  connection?: connection;
};

export type InputController = {
  moveLeft?: boolean;
  moveRight?: boolean;
  moveUp?: boolean;
  moveDown?: boolean;
};

export type PlayerUpdate = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  sheild: number;
  maxSheild: number;
  rotate: number;
  fakeRotate: number;
  onAttack: boolean;
  position: Vector2;
  velocity: Vector2;
  inputController: InputController;
};

// Physics
export type Vector3 = {
  x: number;
  y: number;
  z: number;
};

export type Vector2 = {
  x: number;
  y: number;
};

// Network Message
export enum ChatChannel {
  GLOBAL,
  GAME_ROOM,
  PRIVATE,
}

export type ChatMessage = {
  channel: keyof typeof ChatChannel;
  playerName: string;
  message: string;
};

export type JoinMessage = {
  playerName: string;
  playerId: string;
};

export type PingMessage = {
  latency: number;
};

export enum GameMessageType {
  PING,
  JOIN,
  LOAD_MAP,
  CHAT,
  PLAYER_UPDATE,
  ATTACK,
  INPUT,
}

export type GameMessage = {
  roomId: string;
  event: keyof typeof GameMessageType;
  playerId?: string;
  data?: PlayerUpdate[] | ChatMessage | GameMap | JoinMessage | PingMessage | InputController;
};
