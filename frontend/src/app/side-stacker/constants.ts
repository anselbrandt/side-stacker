const isProd = !!process.env.NEXT_PUBLIC_API_HOSTNAME;

export const API_URL = isProd
  ? `https://${process.env.NEXT_PUBLIC_API_HOSTNAME}${
      process.env.NEXT_PUBLIC_API_BASEPATH || ""
    }`
  : `http://localhost:8000${process.env.NEXT_PUBLIC_API_BASEPATH || ""}`;

export const WS_URL = isProd
  ? `wss://${process.env.NEXT_PUBLIC_API_HOSTNAME}${
      process.env.NEXT_PUBLIC_API_BASEPATH || ""
    }`
  : `ws://localhost:8000${process.env.NEXT_PUBLIC_API_BASEPATH || ""}`;

export const BOARD_SIZE = 7;
