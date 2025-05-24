import { BOARD_SIZE } from "../constants";
import { PlayerSymbol, Board, Position, EnhancedBoard, Cell } from "../types";
import { extractBoard } from "./gameUtils";

export const getValidMoves = (board: Board): [number, number][] => {
  return board.flatMap((row, i) => {
    const emptyIndices = row
      .map((value, j) => (value === null ? j : -1))
      .filter((j) => j !== -1);
    if (emptyIndices.length === 0) return [];
    return [
      [i, emptyIndices[0]],
      [i, emptyIndices[emptyIndices.length - 1]],
    ];
  });
};

export const isValid = (arr: number[][], pair: number[]): boolean => {
  return arr.some(
    (subArr) =>
      subArr.length === pair.length &&
      subArr.every((val, index) => val === pair[index])
  );
};

export const isDiagonalNegative = (
  board: Board,
  position: Position,
  symbol: PlayerSymbol
): boolean => {
  const [i, j] = position;
  const values: PlayerSymbol[] = [board[i][j]];
  for (let x = 1; x < 4; x++) {
    const i2 = i + x;
    const j2 = j + x;
    if (i2 >= 0 && i2 < BOARD_SIZE && j2 >= 0 && j2 < BOARD_SIZE) {
      values.push(board[i2][j2]);
    }
  }
  return values.length === 4 && values.every((value) => value === symbol);
};

export const isDiagonalPositive = (
  board: Board,
  position: Position,
  symbol: PlayerSymbol
): boolean => {
  const [i, j] = position;
  const values: PlayerSymbol[] = [board[i][j]];
  for (let x = 1; x < 4; x++) {
    const i2 = i + x;
    const j2 = j - x;
    if (i2 >= 0 && i2 < BOARD_SIZE && j2 >= 0 && j2 < BOARD_SIZE) {
      values.push(board[i2][j2]);
    }
  }
  return values.length === 4 && values.every((value) => value === symbol);
};

export const isHorizontal = (
  board: Board,
  position: Position,
  symbol: PlayerSymbol
): boolean => {
  const [i, j] = position;
  const values: PlayerSymbol[] = [board[i][j]];
  for (let x = 1; x < 4; x++) {
    const j2 = j + x;
    if (i >= 0 && i < BOARD_SIZE && j2 >= 0 && j2 < BOARD_SIZE) {
      values.push(board[i][j2]);
    }
  }
  return values.length === 4 && values.every((value) => value === symbol);
};

export const isVertical = (
  board: Board,
  position: Position,
  symbol: PlayerSymbol
): boolean => {
  const [i, j] = position;
  const values: PlayerSymbol[] = [board[i][j]];
  for (let x = 1; x < 4; x++) {
    const i2 = i + x;
    if (i2 >= 0 && i2 < BOARD_SIZE && j >= 0 && j < BOARD_SIZE) {
      values.push(board[i2][j]);
    }
  }
  return values.length === 4 && values.every((value) => value === symbol);
};

export const containsWinningMove = (
  gameBoard: EnhancedBoard,
  player: PlayerSymbol
) => {
  const board = extractBoard(gameBoard);

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const position: Position = [i, j];
      if (
        isDiagonalNegative(board, position, player) ||
        isDiagonalPositive(board, position, player) ||
        isHorizontal(board, position, player) ||
        isVertical(board, position, player)
      )
        return true;
    }
  }
};

export const isWinningMove = (
  gameBoard: EnhancedBoard,
  cell: Cell,
  player: PlayerSymbol
) => {
  const { i, j } = cell.coordinates;
  const board = extractBoard(gameBoard);
  board[i][j] = player;

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      const position: Position = [i, j];
      if (
        isDiagonalNegative(board, position, player) ||
        isDiagonalPositive(board, position, player) ||
        isHorizontal(board, position, player) ||
        isVertical(board, position, player)
      )
        return true;
    }
  }
};
