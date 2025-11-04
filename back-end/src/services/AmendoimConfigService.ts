import { getRuntimeConfig, setRuntimeConfigs } from "../core/runtimeConfig";

/**
 * Configuração do sistema de coleta de amendoim.
 * Suporta múltiplos CSVs (entrada e saída) com diferentes tipos de relatório.
 */
export interface AmendoimConfig {
  /** Nome do arquivo de entrada (pré-debulhamento) */
  arquivoEntrada: string;
  
  /** Nome do arquivo de saída (pós-debulhamento) */
  arquivoSaida: string;
  
  /** Caminho remoto no IHM onde os arquivos estão localizados */
  caminhoRemoto: string;
  
  /** Usar duas IHMs diferentes (uma para entrada, outra para saída) */
  duasIHMs: boolean;
  
  /** Configuração da segunda IHM (se duasIHMs = true) */
  ihm2?: {
    ip: string;
    user: string;
    password: string;
    /** Para qual tipo essa IHM será usada */
    usadaPara: "entrada" | "saida";
  };
}

/**
 * Configuração padrão do sistema de amendoim
 */
export const AMENDOIM_CONFIG_DEFAULT: AmendoimConfig = {
  arquivoEntrada: "Relatorio_2025_11.csv", // Padrão mensal
  arquivoSaida: "Relatorio_2025_11.csv",   // Mesma IHM por padrão
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
      return { ...AMENDOIM_CONFIG_DEFAULT, ...stored };
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
   * Obter nome do arquivo baseado no tipo (entrada ou saída)
   * A configuração agora vem diretamente do frontend
   */
  static getNomeArquivo(tipo: "entrada" | "saida"): string {
    const config = this.getConfig();
    return tipo === "entrada" ? config.arquivoEntrada : config.arquivoSaida;
  }

  /**
   * Obter mês atual no formato YYYY_MM para relatórios mensais automáticos
   */
  static getMesAtual(): string {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    return `${ano}_${mes}`;
  }

  /**
   * Normalizar configuração ao salvar, substituindo placeholders de data
   * Se o arquivo mensal não tiver mês específico, usa o mês atual
   */
  static normalizarConfig(config: Partial<AmendoimConfig>): AmendoimConfig {
    const configBase = { ...AMENDOIM_CONFIG_DEFAULT, ...config };
    
    // Se arquivo de entrada está vazio ou é mensal sem data, gerar com mês atual
    if (configBase.arquivoEntrada.includes("_ATUAL_") || configBase.arquivoEntrada === "") {
      configBase.arquivoEntrada = `Relatorio_${this.getMesAtual()}.csv`;
    }
    
    // Se arquivo de saída está vazio ou é mensal sem data, gerar com mês atual
    if (configBase.arquivoSaida.includes("_ATUAL_") || configBase.arquivoSaida === "") {
      configBase.arquivoSaida = `Relatorio_${this.getMesAtual()}.csv`;
    }

    return configBase;
  }

  /**
   * Resetar configuração para valores padrão
   */
  static async resetConfig(): Promise<void> {
    await setRuntimeConfigs({ [this.CONFIG_KEY]: AMENDOIM_CONFIG_DEFAULT });
  }

  /**
   * Obter lista de arquivos a serem coletados
   */
  static getArquivosParaColetar(): Array<{
    tipo: "entrada" | "saida";
    arquivo: string;
    caminho: string;
  }> {
    const config = this.getConfig();
    
    return [
      {
        tipo: "entrada",
        arquivo: config.arquivoEntrada,
        caminho: config.caminhoRemoto,
      },
      {
        tipo: "saida",
        arquivo: config.arquivoSaida,
        caminho: config.caminhoRemoto,
      },
    ];
  }
}
