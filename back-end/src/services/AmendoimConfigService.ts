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
    caminhoRemoto?: string;
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
   * Retorna SOMENTE o que está salvo em amendoim-config (sem merge com ihm-config)
   */
  static getConfig(): AmendoimConfig {
    const stored = getRuntimeConfig(this.CONFIG_KEY);
    if (stored && typeof stored === "object") {
      const merged = { ...AMENDOIM_CONFIG_DEFAULT, ...stored } as AmendoimConfig;
      return this.normalizarConfig(merged);
    }
    return this.normalizarConfig({ ...AMENDOIM_CONFIG_DEFAULT });
  }

  /**
   * Salvar configuração do sistema de amendoim
   */
  static async setConfig(config: Partial<AmendoimConfig>): Promise<void> {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    // Persist amendoim-config into runtime store
    // Additionally, mirror relevant fields into 'ihm-config' so the Amendoim collector
    // can use the IHM settings (metodoCSV/localCSV and secondary IHM credentials if provided).
    try {
      const ihmCfg = getRuntimeConfig('ihm-config') || {};

      const methodFromName = (name?: string) => {
        if (!name) return '';
        const n = String(name || '').trim();
        if (/Relatorio_\d{4}_\d{2}\.csv$/i.test(n)) return 'mensal';
        if (/Relatorio_1\.csv$/i.test(n)) return 'geral';
        return 'custom';
      };

      const entradaMethod = methodFromName(updated.arquivoEntrada);
      const saidaMethod = methodFromName(updated.arquivoSaida);

      const newIhmCfg: any = { ...ihmCfg };
      // Map entrada -> metodoCSV / localCSV
      newIhmCfg.metodoCSV = entradaMethod || (newIhmCfg.metodoCSV ?? '');
      if (entradaMethod === 'custom') newIhmCfg.localCSV = String(updated.arquivoEntrada);

      // Map saida -> metodoCSV2 / localCSV2
      newIhmCfg.metodoCSV2 = saidaMethod || (newIhmCfg.metodoCSV2 ?? newIhmCfg.metodoCSV);
      if (saidaMethod === 'custom') newIhmCfg.localCSV2 = String(updated.arquivoSaida);

      // If a second IHM was provided in amendoim config, copy its credentials to ip2/user2/password2
      if (updated.duasIHMs && updated.ihm2) {
        newIhmCfg.ip2 = updated.ihm2.ip || newIhmCfg.ip2;
        newIhmCfg.user2 = updated.ihm2.user || newIhmCfg.user2;
        newIhmCfg.password2 = updated.ihm2.password || newIhmCfg.password2;
        // Optionally store a caminhoRemoto2 so consumers can use it
        if (updated.ihm2.caminhoRemoto) newIhmCfg.localCSVPath2 = updated.ihm2.caminhoRemoto;
      }

      // Also, ensure the main caminhoRemoto is available to IHM consumers
      if (updated.caminhoRemoto) newIhmCfg.localCSVPath = updated.caminhoRemoto;

      // Persist both keys into the runtime store so collector will pick them up immediately
      await setRuntimeConfigs({ [this.CONFIG_KEY]: updated, ['ihm-config']: newIhmCfg });
      return;
    } catch (e) {
      // fallback: at least set amendoim-config
      await setRuntimeConfigs({ [this.CONFIG_KEY]: updated });
    }
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
    if (!configBase.arquivoEntrada || configBase.arquivoEntrada === "") {
      configBase.arquivoEntrada = `Relatorio_${this.getMesAtual()}.csv`;
    }

    // Se arquivo de saída vazio
    if (!configBase.arquivoSaida || configBase.arquivoSaida === "") {
      configBase.arquivoSaida = `Relatorio_${this.getMesAtual()}.csv`;
    }

    // Segurança: garantir que o nome termina em .csv e não possui sufixos estranhos
    const sanitize = (name: string) => {
      if (!name) return name;
      const cleaned = name.trim();
      const lower = cleaned.toLowerCase();
      const idx = lower.indexOf('.csv');
      if (idx >= 0) {
        return cleaned.slice(0, idx + 4);
      }
      // If no .csv, append .csv
      return cleaned + '.csv';
    };

    configBase.arquivoEntrada = sanitize(String(configBase.arquivoEntrada));
    configBase.arquivoSaida = sanitize(String(configBase.arquivoSaida));

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
