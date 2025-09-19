// Implementação direta das chamadas WebSocket para o mock sem depender de api.ts

// Função auxiliar para enviar requisições WebSocket
function wsRequest<T = any>(method: string, params: any = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port || '8080'}`);
    
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    let timeoutId: number;
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id,
        method,
        params
      }));
      
      // Timeout para evitar que a solicitação fique pendente indefinidamente
      timeoutId = window.setTimeout(() => {
        ws.close();
        reject(new Error('Timeout da requisição WebSocket'));
      }, 10000);
    };
    
    ws.onerror = (error) => {
      clearTimeout(timeoutId);
      ws.close();
      reject(error);
    };
    
    ws.onmessage = (event) => {
      clearTimeout(timeoutId);
      try {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.close();
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data.result);
          }
        }
      } catch (err) {
        ws.close();
        reject(err);
      }
    };
    
    ws.onclose = () => {
      clearTimeout(timeoutId);
    };
  });
}

// Função para obter o status atual do modo mock
export async function getMockStatus(): Promise<boolean> {
  try {
    const response = await wsRequest('mock.getStatus');
    return response?.enabled || false;
  } catch (error) {
    console.error("Erro ao obter status do mock:", error);
    return false;
  }
}

// Função para definir o status do modo mock
export async function setMockStatus(enabled: boolean): Promise<boolean> {
  try {
    const response = await wsRequest('mock.setStatus', { enabled });
    return response?.success || false;
  } catch (error) {
    console.error("Erro ao definir status do mock:", error);
    return false;
  }
}

/**
 * Configura detalhes específicos do modo mock
 * @param {Object} config Configurações do mock
 * @returns {Promise<boolean>} Sucesso da operação
 */
export async function configureMock(config: any): Promise<boolean> {
  try {
    const response = await wsRequest('mock.configure', config);
    return response?.success || false;
  } catch (error) {
    console.error("Erro ao configurar mock:", error);
    return false;
  }
}