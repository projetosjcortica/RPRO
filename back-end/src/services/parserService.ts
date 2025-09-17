// Este módulo é responsável por ler arquivos CSV e normalizar os dados para um formato consistente.
// Ele detecta delimitadores, presença de cabeçalhos e converte os dados para objetos padronizados.

import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'fast-csv';

const tmpDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
const processedDir = path.join(tmpDir, 'processed');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

/**
 * Interface que representa uma linha processada pelo parser.
 */
export interface ParserRow {
	/** Data e hora em formato ISO */
	datetime: string;
	label?: string | null;
	group?: number | null;
	flag?: number | null;
	form1?: number | null;
	form2?: number | null;
	values: Array<number | null>;
}

/**
 * Interface do resultado do processamento de um arquivo.
 */
export interface ParserResult {
	processedPath: string;
	rowsCount: number;
	rows: ParserRow[];
}

/**
 * Função auxiliar para converter data e hora em objeto Date.
 * Aceita datas no formato DD/MM/YY ou DD/MM/YYYY.
 */
function parseDateTime(dateStr: string, timeStr: string) {
	if (!dateStr || !timeStr) return new Date();
	const parts = dateStr.split('/');
	const d = parts[0] || '01';
	const m = parts[1] || '01';
	const y = parts[2] || '00';
	const year = Number(y) < 100 ? 2000 + Number(y) : Number(y);
	return new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${timeStr}`);
}

/**
 * Classe responsável por processar arquivos CSV e gerar arquivos JSON normalizados.
 */
class ParserService {
	/**
	 * Processa um arquivo CSV e salva o resultado em JSON na pasta 'tmp/processed'.
	 * @param {string} filePath - Caminho do arquivo CSV a ser processado.
	 * @returns {Promise<ParserResult>} - Retorna uma Promise com o resultado do processamento.
	 */
	processFile(filePath: string): Promise<ParserResult> {
		return new Promise((resolve, reject) => {
			const rows: ParserRow[] = [];
			let firstLine = '';
			try {
				const raw = fs.readFileSync(filePath, 'utf8');
				firstLine = raw.split(/\r?\n/)[0] || '';
			} catch (e) {
				return reject(e);
			}

			// Detecta o delimitador do CSV
			const delim = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';
			// Detecta se há cabeçalho
			const hasHeader = /date|time|label|group|flag/i.test(firstLine);

			fs.createReadStream(filePath)
				.pipe(parse({ headers: hasHeader, trim: true, delimiter: delim }))
				.on('error', (err: unknown) => reject(err))
				.on('data', (row: any) => {
					try {
						// Normaliza os campos da linha
						const datetime = row.datetime || (row.date && row.time ? parseDateTime(row.date, row.time).toISOString() : null);
						// Extrai valores numéricos das colunas (quando sem headers)
						let values: Array<number | null> = [];
						if (Array.isArray(row.values)) {
							values = row.values.map((v: any) => (v === '' || v == null ? null : Number(v)));
						} else {
							values = Object.values(row)
								.map((v: any) => {
									const n = Number(v);
									return Number.isFinite(n) ? n : null;
								})
								.filter((v: any) => v !== null);
						}
						rows.push({
							datetime,
							label: row.label || row.Nome || null,
							group: row.group || null,
							flag: row.flag || null,
							form1: row.form1 || null,
							form2: row.form2 || null,
							values,
						});
					} catch (e) {
						// Ignora erros de linha individual
					}
				})
				.on('end', () => {
					// debug: quantas linhas foram parseadas
					console.log(`[parserService] parsed rows for ${path.basename(filePath)}:`, rows.length);
					const base = path.basename(filePath);
					const outName = base + '.json';
					const outPath = path.join(processedDir, outName);
					fs.writeFileSync(outPath, JSON.stringify({ rows }, null, 2));
					resolve({ processedPath: outPath, rowsCount: rows.length, rows });
				});
		});
	}
}

const parserService = new ParserService();
export default parserService;
export const processFile = (filePath: string) => parserService.processFile(filePath);
