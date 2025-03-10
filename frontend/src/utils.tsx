import { API_URL } from "./constants";
import { PlayerSymbol } from "./types";

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

export const symbolColor = (symbol: PlayerSymbol) => {
  if (symbol === "X") {
    return "bg-sky-700";
  }
  if (symbol === "O") {
    return "bg-orange-500";
  }
  return "";
};
