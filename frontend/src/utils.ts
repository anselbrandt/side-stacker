import { API_URL } from "./constants";
import { PlayerSymbol } from "./types";

export const getRequest = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  const data = await response.json();
  return data as T;
};

export const postRequest = async <T>(
  path: string,
  payload: object
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed with status ${response.status}`);
  }
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
