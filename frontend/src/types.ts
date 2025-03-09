interface Coordinates {
  i: number;
  j: number;
}

export type PlayerSymbol = "X" | "O" | null | undefined;

export interface Cell {
  coordinates: Coordinates;
  symbol?: PlayerSymbol;
}

export type EnhancedBoard = Cell[][];

export type Board = PlayerSymbol[][];

export interface Game {
  id: number;
  owner: number;
  board: Board;
  expires: number;
}

export interface User {
  name: string;
  id: number;
}

export type Position = [number, number];
