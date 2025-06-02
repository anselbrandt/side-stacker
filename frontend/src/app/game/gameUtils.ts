import { Board, EnhancedBoard, Cell } from "../types";

export const enhancedBoard = (board: Board): EnhancedBoard => {
  return board.map((row, i) =>
    row.map(
      (symbol, j): Cell => ({
        coordinates: { i, j },
        symbol,
      })
    )
  );
};

export const extractBoard = (board: EnhancedBoard) =>
  board.map((row) => row.map((cell) => cell.symbol));
