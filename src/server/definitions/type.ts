// Maps
export type MapTile = {
  id: number;
  type: number;
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
  id?: string | number;
  roomName: string;
  maxPlayers: number;
  map: GameMap;
  bots?: number;
  autoStart?: boolean;
};

export type GameInfo = {
  id: number | string;
  roomName: string;
  players: number;
  maxPlayers: number;
};

// Players
export type PlayerOptions = {
  playerName: string;
  ip?: string;
};

export type InputController = {
  moveLeft?: boolean;
  moveRight?: boolean;
  moveUp?: boolean;
  moveDown?: boolean;
};

export type PlayerUpdate = {
  id: number | string;
  rotate: number;
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
  message: string;
};

export enum GameMessageType {
  CHAT,
  PLAYER_UPDATE,
}

export type GameMessage = {
  gameId: number | string;
  event: keyof typeof GameMessageType;
  playerId?: number | string;
  data: PlayerUpdate[] | ChatMessage;
};
