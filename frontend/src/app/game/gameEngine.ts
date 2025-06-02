import { EnhancedBoard, PlayerSymbol } from "../types";
import { extractBoard } from "./gameUtils";
import { getValidMoves } from "./gameLogic";
import { postRequest } from "../utils";

export const gameEngine = async (
  gameBoard: EnhancedBoard,
  player: PlayerSymbol,
  difficultyLevel: string,
  token: string
) => {
  const board = extractBoard(gameBoard);
  const validMoves = getValidMoves(board);

  if (difficultyLevel == "medium") {
    const payload = { board: board, player_symbol: player };
    const response = await postRequest<[number, number]>(
      "/mcts",
      token,
      payload
    );
    const [i, j] = response;
    const move = gameBoard![i][j];
    return move;
  }

  if (difficultyLevel == "hard") {
    const payload = { board: board, player_symbol: player };
    const response = await postRequest<[number, number]>(
      "/alphazero",
      token,
      payload
    );
    const [i, j] = response;
    const move = gameBoard![i][j];
    return move;
  }

  const selectedCoordinates =
    validMoves[Math.floor(Math.random() * validMoves.length)];
  const [i, j] = selectedCoordinates;
  const move = gameBoard![i][j];
  return move;
};
