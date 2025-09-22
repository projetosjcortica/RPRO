// Configuração inicial baseada na variável de ambiente
export const API_BASE_URL = "/api";

export const config = {
  apiBaseUrl: API_BASE_URL,
  contextoPid: 0 as number | null,
};

export const IS_LOCAL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
