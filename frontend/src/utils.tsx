import { API_URL } from "./constants";

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
