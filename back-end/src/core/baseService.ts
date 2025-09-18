export abstract class BaseService {
  constructor(public name: string) {}
  async init(): Promise<void> {}
  async shutdown(): Promise<void> {}
}