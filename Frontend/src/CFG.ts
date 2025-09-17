export const IS_LOCAL = import.meta.env.VITE_USE_MOCK === "true";
export const API_BASE_URL = IS_LOCAL 
  ? "http://localhost:3000/api" 
  : "/relatorio"; // URL relativa para mesmo origin no escritório

export const config = {
  isLocal: IS_LOCAL,
  apiBaseUrl: API_BASE_URL
};