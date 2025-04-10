import { EnhancedBoard } from "../types";
import { extractBoard } from "./gameUtils";
import { getValidMoves } from "./gameLogic";
import { postRequest } from "../utils";

export const gameEngine = async (
  gameBoard: EnhancedBoard,
  difficultyLevel: string
) => {
  const board = extractBoard(gameBoard);
  const validMoves = getValidMoves(board);
  if (difficultyLevel == "easy") {
    const selectedCoordinates =
      validMoves[Math.floor(Math.random() * validMoves.length)];
    const [i, j] = selectedCoordinates;
    const move = gameBoard![i][j];
    return move;
  } else {
    const payload = { difficulty: difficultyLevel, board: board };
    console.log(payload);
    const response = await postRequest("/alphazero", payload);
    console.log(response);
    const selectedCoordinates =
      validMoves[Math.floor(Math.random() * validMoves.length)];
    const [i, j] = selectedCoordinates;
    const move = gameBoard![i][j];
    return move;
  }
};
