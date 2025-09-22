// Configuração inicial baseada na variável de ambiente
export let IS_MOCK_ENABLED = import.meta.env.VITE_USE_MOCK === "true";
export let API_BASE_URL = "/api/relatorio/paginate"; // URL relativa para mesmo origin no escritório

// Para compatibilidade com código existente
let isLocalMutable = IS_MOCK_ENABLED; // Mutable copy for compatibility
export const IS_LOCAL = isLocalMutable;

export const config = {
  isMockEnabled: IS_MOCK_ENABLED,
  apiBaseUrl: API_BASE_URL,
  contextoPid: 0 as number | null,
};

// Função para atualizar as configurações com base no status do mock
export async function updateConfig(mockEnabled: boolean) {
  IS_MOCK_ENABLED = mockEnabled;

  // Para compatibilidade com código existente
  isLocalMutable = mockEnabled;

  // Atualiza o objeto config
  config.isMockEnabled = IS_MOCK_ENABLED;

  // Se o backend estiver conectado, envia o status do mock para o backend
  if (config.contextoPid) {
    const { getProcessador } = require('./Processador');
    try {
      const p = getProcessador(config.contextoPid);
      await p.mockSetStatus(mockEnabled);
      console.log(`[CFG] Mock status atualizado no backend: ${mockEnabled}`);
    } catch (e) {
      console.error('[CFG] Erro ao atualizar status do mock no backend:', e);
    }
  }
}

// Função para obter o status do mock do backend
export async function synchronizeMockStatus() {
  if (config.contextoPid) {
    const { getProcessador } = require('./Processador');
    try {
      const p = getProcessador(config.contextoPid);
      const status = await p.mockGetStatus();
      if (status && typeof status.enabled === 'boolean') {
        IS_MOCK_ENABLED = status.enabled;
        isLocalMutable = status.enabled; // Update mutable copy
        config.isMockEnabled = IS_MOCK_ENABLED;
        console.log(`[CFG] Mock status sincronizado com o backend: ${IS_MOCK_ENABLED}`);
      }
    } catch (e) {
      console.error('[CFG] Erro ao obter status do mock do backend:', e);
    }
  }
}
