import { Board, EnhancedBoard, Cell } from "./types";
import { API_URL } from "./constants";

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

export const getRequest = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`);
  const data = await response.json();
  return data as T;
};

export const postRequest = async <T,>(
  path: string,
  payload: object
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  return data as T;
};

export const extractBoard = (board: EnhancedBoard) =>
  board.map((row) => row.map((cell) => cell.symbol));
