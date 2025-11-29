export enum Screen {
  SPLASH,
  HOME,
  LOADING,
  GAME,
  RESULT
}

export enum CharacterType {
  TURTLE = 'TURTLE',
  BEAR = 'BEAR'
}

export interface Position {
  x: number;
  y: number;
}

export interface MazeConfig {
  width: number;
  height: number;
}

export interface GameState {
  score: number;
  totalCollectibles: number;
  startTime: number;
  endTime: number;
  character: CharacterType;
  customMessage: string;
}

export type CellType = 'WALL' | 'PATH' | 'START' | 'END';

export interface MazeData {
  grid: CellType[][];
  start: Position;
  end: Position;
  collectibles: Position[];
}