import { GameMap, Vector2 } from '../definitions/type';

export const NS_PER_SEC = 1e9;

export const getCurrentTickInNanos = () => {
  const tick = process.hrtime();
  return tick[0] * NS_PER_SEC + tick[1];
};

export const magnitudeVector2 = (vector2: Vector2): number => {
  return Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
};

export const normalizeVector2 = (vector2: Vector2): Vector2 => {
  const magnitude = magnitudeVector2(vector2);
  return {
    x: vector2.x / magnitude,
    y: vector2.y / magnitude,
  };
};

export const getRelativeToMapWidth = (x: number, map: GameMap): number => {
  const mapW = map.width * map.tileWidth;
  return x >= mapW ? x - mapW : x < 0 ? x + mapW : x;
};

export const getRelativeToMapHeight = (y: number, map: GameMap): number => {
  const mapH = map.height * map.tileHeight;
  return y >= mapH ? y - mapH : y < 0 ? y + mapH : y;
};

export const toTile = (x: number, map: GameMap): number => {
  return Math.floor(x / map.tileWidth);
};

export const walkable = (type: number): boolean => {
  if (type >= 1 && type <= 4) return false;
  return true;
};

export const randomInt = (min: number, max: number) => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
};
