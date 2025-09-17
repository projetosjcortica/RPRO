import * as http from 'http';
import * as https from 'https';

/**
 * Realiza uma requisição HTTP POST enviando um corpo JSON.
 * @param {string} url - URL para onde a requisição será enviada.
 * @param {any} body - Objeto que será enviado como JSON no corpo da requisição.
 * @param {string} [token] - Token opcional para autenticação Bearer.
 * @returns {Promise<any>} - Retorna uma Promise que resolve com a resposta da requisição.
 */
export function postJson(url: string, body: any, token?: string) {
  return new Promise((resolve, reject) => {
    try {
      // Faz o parsing da URL para extrair informações como hostname e protocolo
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http; // Define a biblioteca correta com base no protocolo
      const data = JSON.stringify(body); // Converte o corpo da requisição para JSON

      // Define os cabeçalhos da requisição
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data).toString(),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`; // Adiciona o cabeçalho de autenticação, se fornecido

      // Configurações da requisição
      const opts: any = {
        hostname: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : parsed.protocol === 'https:' ? 443 : 80,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers,
      };

      // Cria a requisição HTTP/HTTPS
      const req = lib.request(opts, (res: any) => {
        let raw = '';
        res.on('data', (chunk: any) => (raw += chunk)); // Coleta os dados da resposta
        res.on('end', () => {
          try {
            const parsedResponse = JSON.parse(raw); // Tenta fazer o parsing da resposta como JSON
            resolve(parsedResponse);
          } catch (e) {
            resolve(raw); // Retorna a resposta como string se o parsing falhar
          }
        });
      });

      req.on('error', (err: any) => reject(err)); // Trata erros na requisição
      req.write(data); // Envia o corpo da requisição
      req.end(); // Finaliza a requisição
    } catch (err) {
      reject(err); // Trata erros gerais
    }
  });
}
