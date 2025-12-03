import { getRuntimeConfig, setRuntimeConfigs } from "../core/runtimeConfig";

/**
 * Configuração do sistema de coleta de amendoim.
 * Sistema automático baseado em balança: Balanças 1,2 = entrada | Balança 3 = saída
 */
export interface AmendoimConfig {
  /** Dados de conexão da IHM principal */
  ip: string;
  user: string;
  password: string;
  
  /** Caminho remoto no IHM onde os arquivos estão localizados */
  caminhoRemoto: string;
  
  /** Usar duas IHMs diferentes (uma para entrada, outra para saída) */
  duasIHMs: boolean;
  
  /** Configuração da segunda IHM (se duasIHMs = true) */
  ihm2?: {
    ip: string;
    user: string;
    password: string;
    caminhoRemoto?: string;
  };
}

/**
 * Configuração padrão do sistema de amendoim
 */
export const AMENDOIM_CONFIG_DEFAULT: AmendoimConfig = {
  ip: "",
  user: "anonymous",
  password: "",
  caminhoRemoto: "/InternalStorage/data/",
  duasIHMs: false,
};

/**
 * Service para gerenciar configurações do sistema de amendoim
 */
export class AmendoimConfigService {
  private static CONFIG_KEY = "amendoim-config";

  /**
   * Obter configuração atual do sistema de amendoim
   */
  static getConfig(): AmendoimConfig {
    const stored = getRuntimeConfig(this.CONFIG_KEY);
    if (stored && typeof stored === "object") {
      return { ...AMENDOIM_CONFIG_DEFAULT, ...stored } as AmendoimConfig;
    }
    return { ...AMENDOIM_CONFIG_DEFAULT };
  }

  /**
   * Salvar configuração do sistema de amendoim
   */
  static async setConfig(config: Partial<AmendoimConfig>): Promise<void> {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    await setRuntimeConfigs({ [this.CONFIG_KEY]: updated });
  }

  /**
   * Resetar configuração para valores padrão
   */
  static async resetConfig(): Promise<void> {
    await setRuntimeConfigs({ [this.CONFIG_KEY]: AMENDOIM_CONFIG_DEFAULT });
  }
}
