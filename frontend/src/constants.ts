const isProd = !!import.meta.env.VITE_API_HOSTNAME;

export const API_URL = isProd
  ? `https://${import.meta.env.VITE_API_HOSTNAME}${
      import.meta.env.VITE_API_BASEPATH || ""
    }`
  : `http://localhost:8000${import.meta.env.VITE_API_BASEPATH || ""}`;

export const WS_URL = isProd
  ? `wss://${import.meta.env.VITE_API_HOSTNAME}${
      import.meta.env.VITE_API_BASEPATH || ""
    }`
  : `ws://localhost:8000${import.meta.env.VITE_API_BASEPATH || ""}`;

export const BOARD_SIZE = 7;
