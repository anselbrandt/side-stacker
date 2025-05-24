import { API_URL } from "./constants";
import { PlayerSymbol } from "./types";

let authToken: string | null = null;

export const setLocalToken = (token: string) => {
  authToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

export const getLocalToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

export const getRequest = async <T>(
  path: string,
  token?: string
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
};

export const postRequest = async <T>(
  path: string,
  token: string,
  payload: object
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`POST ${path} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
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
