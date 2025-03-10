import { EnhancedBoard } from "../types";
import { extractBoard } from "./gameUtils";
import { getValidMoves } from "./gameLogic";

export const gameEngine = (gameBoard: EnhancedBoard) => {
  const board = extractBoard(gameBoard);
  const validMoves = getValidMoves(board);
  const selectedCoordinates =
    validMoves[Math.floor(Math.random() * validMoves.length)];
  const [i, j] = selectedCoordinates;
  const move = gameBoard![i][j];
  return move;
};
