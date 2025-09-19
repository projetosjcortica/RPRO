import axios from "axios";
import { API_BASE_URL, IS_MOCK_ENABLED } from "../CFG";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// WebSocket API para comunicação com o backend quando necessário
let ws: WebSocket | null = null;
let wsReady = false;
let messageId = 1;
const pendingRequests: {[key: string]: { resolve: Function, reject: Function }} = {};

  // Inicializa o WebSocket sob demanda
export function initWebSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  // Obter porta do backend do contexto da aplicação
  const backendPort = (window as any).backendPort || 8080;
  
  // Usar porta específica do backend se disponível
  ws = new WebSocket(`ws://${window.location.hostname}:${backendPort}`);
  
  // Adicionar tratamento de erro à conexão
  ws.onerror = (error) => {
    console.error('Erro na conexão WebSocket:', error);
    wsReady = false;
    ws = null;
  };
  
  ws.onopen = () => {
    console.log('WebSocket conectado na porta:', backendPort);
    wsReady = true;
  };
  
  ws.onclose = () => {
    console.log('WebSocket desconectado');
    wsReady = false;
    ws = null;
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.id && pendingRequests[data.id]) {
        if (data.error) {
          pendingRequests[data.id].reject(data.error);
        } else {
          pendingRequests[data.id].resolve(data.result);
        }
        delete pendingRequests[data.id];
      }
    } catch (err) {
      console.error('Erro ao processar mensagem WebSocket:', err);
    }
  };
}

// Envia uma requisição pelo WebSocket
export function wsRequest<T = any>(method: string, params: any = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      initWebSocket();
      
      // Se o WebSocket não estiver disponível, tenta executar a solicitação via HTTP
      if (IS_MOCK_ENABLED) {
        reject(new Error('WebSocket não disponível'));
        return;
      }
    }
    
    if (!wsReady) {
      setTimeout(() => wsRequest(method, params).then(resolve).catch(reject), 500);
      return;
    }
    
    const id = `${Date.now()}-${messageId++}`;
    pendingRequests[id] = { resolve, reject };
    
    ws?.send(JSON.stringify({
      id,
      method,
      params
    }));
    
    // Timeout para evitar que a solicitação fique pendente indefinidamente
    setTimeout(() => {
      if (pendingRequests[id]) {
        delete pendingRequests[id];
        reject(new Error('Timeout da requisição WebSocket'));
      }
    }, 10000);
  });
}

// Métodos específicos
export const apiWs = {
  getMateriaPrima: () => wsRequest('db.getMateriaPrima'),
  setupMateriaPrima: (items: any[]) => wsRequest('db.setupMateriaPrima', { items }),
  
  // Métodos de estoque
  estoqueLimites: (payload: any) => wsRequest('estoque/limites', payload),
  estoqueListar: (payload: any) => wsRequest('estoque/listar', payload),
  estoqueBaixo: (payload: any) => wsRequest('estoque/baixo', payload),
  estoqueMovimentacoes: (payload: any) => wsRequest('estoque/movimentacoes', payload),
  estoqueAdicionar: (payload: any) => wsRequest('estoque/adicionar', payload),
  estoqueRemover: (payload: any) => wsRequest('estoque/remover', payload),
  estoqueAjustar: (payload: any) => wsRequest('estoque/ajustar', payload),
  estoqueInicializar: (payload: any) => wsRequest('estoque/inicializar', payload),
  
  // Métodos para resumos
  resumoGeral: (filtros: any = {}) => wsRequest('resumo.geral', filtros),
  resumoArea: (areaId: string, filtros: any = {}) => wsRequest('resumo.area', { areaId, ...filtros }),
  resumoAlternarComTimer: (areaId: string, tempoExibicaoSegundos: number = 5, filtros: any = {}) => 
    wsRequest('resumo.alternarComTimer', { areaId, tempoExibicaoSegundos, ...filtros }),
  
  // Métodos para controle de mock
  mockStatus: () => wsRequest('mock.status'),
  mockToggle: (enabled: boolean) => wsRequest('mock.toggle', { enabled }),
  
  // Métodos para conversão de unidades
  unidadesConverter: (valor: number, de: number, para: number) => 
    wsRequest('unidades.converter', { valor, de, para }),
  unidadesNormalizarParaKg: (valores: Record<string, number>, unidades: Record<string, number>) => 
    wsRequest('unidades.normalizarParaKg', { valores, unidades })
};

// Função auxiliar para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);