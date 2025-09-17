import axios from "axios";
import { API_BASE_URL } from "../CFG";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Função auxiliar para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);