import * as fs from 'fs';
import { parse } from 'fast-csv';
import { Readable } from 'stream';

/**
 * Processa um CSV a partir de um objeto que contenha `buffer` ou `path`.
 * Retorna uma Promise que resolve com { message, rowsCount, rows }.
 * Comentários em Português (Brasil).
 */
export async function processCSV(input: { buffer?: Buffer; path?: string } | any) {
  return new Promise<{ message: string; rowsCount: number; rows: any[] }>((resolve, reject) => {
    const rows: any[] = [];
    const onData = (row: any) => rows.push(row);
    const onEnd = () => resolve({ message: 'CSV processado', rowsCount: rows.length, rows });
    const onError = (err: unknown) => reject(err);

    if (input && input.buffer) {
      const r = new Readable();
      r.push(input.buffer);
      r.push(null);
      r.pipe(parse({ headers: true }))
        .on('error', onError)
        .on('data', onData)
        .on('end', onEnd);
    } else if (input && input.path) {
      if (!fs.existsSync(input.path)) return reject(new Error('Arquivo CSV não encontrado: ' + input.path));
      fs.createReadStream(input.path)
        .pipe(parse({ headers: true }))
        .on('error', onError)
        .on('data', onData)
        .on('end', onEnd);
    } else {
      reject(new Error('Entrada inválida para processamento CSV'));
    }
  });
}

export default { processCSV };
