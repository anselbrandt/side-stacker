export const API_URL = import.meta.env.VITE_HOSTNAME
  ? import.meta.env.VITE_API_BASEPATH
  : `http://localhost:8000${import.meta.env.VITE_API_BASEPATH || ""}`;
