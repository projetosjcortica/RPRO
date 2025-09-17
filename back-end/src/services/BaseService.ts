/**
 * Serviço base abstrato com hooks de ciclo de vida.
 * Fornece um ponto comum para inicialização e finalização de serviços.
 */
export default abstract class BaseService {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Hook opcional executado na inicialização do serviço.
   * Subclasses podem sobrescrever para executar startup async.
   */
  async init(): Promise<void> {
    // noop por padrão
  }

  /**
   * Hook opcional executado no desligamento do serviço.
   */
  async shutdown(): Promise<void> {
    // noop por padrão
  }
}
