import * as fs from 'fs';
import * as crypto from 'crypto';

/**
 * Calcula o hash de um arquivo de forma síncrona.
 * @param {string} filePath - Caminho do arquivo a ser processado.
 * @param {string} [alg='sha256'] - Algoritmo de hash a ser utilizado (padrão: sha256).
 * @returns {string | null} - Retorna o hash em formato hexadecimal ou null se o arquivo não existir.
 */
export function computeHashSync(filePath: string, alg = 'sha256') {
  if (!fs.existsSync(filePath)) return null; // Verifica se o arquivo existe
  const buf = fs.readFileSync(filePath); // Lê o conteúdo do arquivo
  const h = crypto.createHash(alg); // Cria um objeto de hash com o algoritmo especificado
  h.update(buf); // Atualiza o hashw com o conteúdo do arquivo
  return h.digest('hex'); // Retorna o hash em formato hexadecimal
}

/**
 * Calcula o hash de um buffer em memória.
 * @param {Buffer} buffer - Buffer contendo os dados a serem processados.
 * @param {string} [alg='sha256'] - Algoritmo de hash a ser utilizado (padrão: sha256).
 * @returns {string} - Retorna o hash em formato hexadecimal.
 */
export function computeHashHex(buffer: Buffer, alg = 'sha256') {
  const h = crypto.createHash(alg); // Cria um objeto de hash com o algoritmo especificado
  h.update(buffer); // Atualiza o hash com o conteúdo do buffer
  return h.digest('hex'); // Retorna o hash em formato hexadecimal
}
