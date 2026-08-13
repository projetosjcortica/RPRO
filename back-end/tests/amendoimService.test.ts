import { AmendoimService } from '../src/services/AmendoimService';

describe('AmendoimService.montarEntradaSaidaPorHorario', () => {
  it('deve retornar uma série completa de 24 horas mesmo com dados parciais', () => {
    const result = (AmendoimService as any).montarEntradaSaidaPorHorario([
      { hora: 7, tipo: 'entrada', peso: 10 },
      { hora: 7, tipo: 'saida', peso: 3 },
      { hora: 15, tipo: 'saida', peso: 5 },
    ]);

    expect(result).toHaveLength(24);
    expect(result[0]).toEqual({ hora: 0, entrada: 0, saida: 0 });
    expect(result[7]).toEqual({ hora: 7, entrada: 10, saida: 3 });
    expect(result[15]).toEqual({ hora: 15, entrada: 0, saida: 5 });
  });
});
