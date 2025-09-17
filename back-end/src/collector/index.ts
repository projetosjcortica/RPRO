// Este arquivo é o ponto de entrada do coletor automático.
// Ele inicia o processo de coleta e garante o encerramento seguro ao receber SIGINT.

import { startCollector, stopCollector } from './collector';

// Função auto-executável para iniciar o coletor
(async () => {
  try {
    await startCollector(); // Inicia o coletor
  } catch (err) {
    // Em caso de erro, exibe no console e encerra o processo
    console.error('Falha ao iniciar o coletor', err);
    process.exit(1);
  }
})();

// Captura o sinal SIGINT (Ctrl+C) para encerrar o coletor de forma segura
process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando coletor...');
  stopCollector();
  process.exit(0);
});
