import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { AppDataSource, dbService } from './services/dbService';
import { backupSvc } from './services/backupService';
import { parserService } from './services/parserService';
import { fileProcessorService } from './services/fileProcessorService';
import { IHMService } from './services/IHMService';
import { materiaPrimaService } from './services/materiaPrimaService';
import { resumoService } from './services/resumoService'; // Importação do serviço de resumo
import { dataPopulationService } from './services/dataPopulationService'; // Importação do serviço de população de dados
import { unidadesService } from './services/unidadesService'; // Importação do serviço de unidades
import { Relatorio, MateriaPrima, Batch } from './entities';
import { postJson, ProcessPayload } from './core/utils';
import express from 'express';
import cors from 'cors';

// Collector
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
const rawServer = process.env.INGEST_URL || process.env.SERVER_URL || 'http://192.168.5.200';
const SERVER_URL = /^(?:https?:)\/\//i.test(rawServer) ? rawServer : `http://${rawServer}`;
const INGEST_TOKEN = process.env.INGEST_TOKEN;
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

let STOP = false;
export function stopCollector() { STOP = true; }
export async function startCollector() {
  const ihm = new IHMService(process.env.IHM_IP || '127.0.0.1', process.env.IHM_USER || 'anonymous', process.env.IHM_PASS || '');
  const collector = { async cycle() {
    const downloaded = await ihm.findAndDownloadNewFiles(TMP_DIR);
    for (const f of downloaded) {
      const res = await fileProcessorService.processFile(f.localPath);
      if (process.env.INGEST_URL) { try { await postJson(`${SERVER_URL}/api/ingest`, { meta: res.meta, count: res.parsed.rowsCount }, INGEST_TOKEN); } catch {} }
    }
  }};
  STOP = false;
  while (!STOP) { try { await collector.cycle(); } catch (e) { console.error('[collector cycle error]', e); } await new Promise((r) => setTimeout(r, POLL_INTERVAL)); }
}

// Ensure database connection before starting
async function ensureDatabaseConnection() {
  if (!AppDataSource.isInitialized) {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established.');
  }
}

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Frontend dev servers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/api/materiaprima/labels', async (req, res) => {
  try {
    await ensureDatabaseConnection();
    const materias = await materiaPrimaService.getAll();
    // Map MateriaPrima records to frontend-friendly keys.
    // Assumes `num` is the product index (1..n) and product columns in table start at col6 = Prod_1.
    const mapping: any = {};
    const colOffset = 5; // Prod_1 -> col6
    for (const m of materias) {
      if (!m) continue;
      const num = typeof m.num === 'number' ? m.num : Number(m.num);
      if (Number.isNaN(num)) continue;
      const colKey = `col${num + colOffset}`;
      mapping[colKey] = {
        produto: m.produto ?? `Produto ${num}`,
        medida: typeof m.medida === 'number' ? m.medida : (m.medida ? Number(m.medida) : 1),
      };
    }
    return res.json(mapping);
  } catch (e) {
    console.error('Failed to get materia prima labels', e);
    return res.status(500).json({});
  }
});

// --- HTTP API parity for websocket commands ---

app.get('/api/ping', async (req, res) => {
  try {
    return res.json({ pong: true, ts: new Date().toISOString() });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/backup/list', async (req, res) => {
  try {
    await ensureDatabaseConnection();
    const data = await backupSvc.listBackups();
    return res.json(data);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/file/process', async (req, res) => {
  try {
    await ensureDatabaseConnection();
    const filePath = String(req.query.filePath || req.query.path || '');
    if (!filePath) return res.status(400).json({ error: 'filePath is required' });
    const r = await fileProcessorService.processFile(filePath);
    return res.json({ meta: r.meta, rowsCount: r.parsed.rowsCount });
  } catch (e: any) { console.error(e); return res.status(e?.status || 500).json({ error: e?.message || 'internal' }); }
});

app.get('/api/ihm/fetchLatest', async (req, res) => {
  try {
    const ip = String(req.query.ip || '');
    const user = String(req.query.user || 'anonymous');
    const password = String(req.query.password || '');
    if (!ip) return res.status(400).json({ error: 'ip is required' });
    const tmpDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const ihm = new IHMService(ip, user, password);
    const downloaded = await ihm.findAndDownloadNewFiles(tmpDir);
    if (!downloaded || downloaded.length === 0) return res.json({ ok: true, message: 'Nenhum CSV novo encontrado' });
    const result = downloaded[0];
    const fileStat = fs.statSync(result.localPath);
    const fileObj: any = { originalname: result.name, path: result.localPath, mimetype: 'text/csv', size: fileStat.size };
    const meta = await backupSvc.backupFile(fileObj);
    const processed = await parserService.processFile(meta.workPath || meta.backupPath);
    return res.json({ meta, processed });
  } catch (e: any) { console.error(e); return res.status(500).json({ error: e?.message || 'internal' }); }
});

app.get('/api/relatorio/paginate', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 300);
    const formula = req.query.formula ?? null;
    const dateStart = req.query.dateStart ?? null;
    const dateEnd = req.query.dateEnd ?? null;
    const sortBy = String(req.query.sortBy || 'Dia');
    const sortDir = String(req.query.sortDir || 'DESC');
    const includeProducts = String(req.query.includeProducts || 'true') === 'true'; // Default to true for values

    await dbService.init();
    const repo = AppDataSource.getRepository(Relatorio);
    const qb = repo.createQueryBuilder('r');
    if (formula) { const f = String(formula); const n = Number(f); if (!Number.isNaN(n)) qb.andWhere('(r.Form1 = :n OR r.Form2 = :n)', { n }); else qb.andWhere('(r.Nome LIKE :f OR r.processedFile LIKE :f)', { f: `%${f}%` }); }
    if (dateStart) qb.andWhere('r.Dia >= :ds', { ds: dateStart });
    if (dateEnd) qb.andWhere('r.Dia <= :de', { de: dateEnd });
    const allowed = new Set(['Dia', 'Hora', 'Nome', 'Form1', 'Form2', 'processedFile']);
    const sb = allowed.has(sortBy) ? sortBy : 'Dia';
    const sd = sortDir === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(`r.${sb}`, sd);
    
    // Always include products for values mapping
    const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize));
    const take = Math.max(1, Number(pageSize));
    const [rows, total] = await qb.skip(offset).take(take).getManyAndCount();
    
    // Map rows to include values array from Prod_1 to Prod_40
    const mappedRows = rows.map((row: any) => {
      const values: number[] = [];
      for (let i = 1; i <= 40; i++) {
        const prodValue = row[`Prod_${i}`];
        values.push(typeof prodValue === 'number' ? prodValue : (prodValue != null ? Number(prodValue) : 0));
      }
      
      return {
        Dia: row.Dia || '',
        Hora: row.Hora || '',
        Nome: row.Nome || '',
        Codigo: row.Form1 ?? 0,
        Numero: row.Form2 ?? 0,
        values,
        // Include original fields if needed
        id: row.id,
        processedFile: row.processedFile
      };
    });
    
    return res.json({ rows: mappedRows, total, page, pageSize });
  } catch (e: any) { console.error(e); return res.status(500).json({ error: e?.message || 'internal' }); }
});

app.get('/api/db/listBatches', async (req, res) => {
  try { await dbService.init(); const repo = AppDataSource.getRepository(Batch); const [items, total] = await repo.findAndCount({ take: 50, order: { fileTimestamp: 'DESC' } }); return res.json({ items, total, page: 1, pageSize: 50 }); } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});
/**
 * @example
 * POST /api/db/setupMateriaPrima
 * {
 *   "items": [
 *     { "num": 1, "produto": "Produto A", "medida": 0 },  // 0 = gramas
 *     { "num": 2, "produto": "Produto B", "medida": 1 }   // 1 = kilos
 *   ]
 * }
 */
app.post('/api/db/setupMateriaPrima', async (req, res) => { 
  try {
    await dbService.init();
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    const processedItems = items.map((item: any) => ({
      num: item.num,
      produto: item.produto,
      medida: item.medida === 0 ? 0 : 1  // 0 = gramas, 1 = kilos
    }));

    const saved = await materiaPrimaService.saveMany(processedItems);
    return res.json(saved);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/db/getMateriaPrima', async (req, res) => {
  try {
    const items = await materiaPrimaService.getAll();
    return res.json(items);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/db/syncLocalToMain', async (req, res) => {
  try {
    await dbService.init();
    const limit = Number(req.query.limit || 1000);
    const repo = AppDataSource.getRepository(Relatorio);
    const rows = await repo.find({ take: Number(limit) });
    if (!rows || rows.length === 0) return res.json({ synced: 0 });
    const inserted = await dbService.insertRelatorioRows(rows as any[], 'local-backup-sync');
    return res.json({ synced: Array.isArray(inserted) ? inserted.length : rows.length });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/resumo', async (req, res) => {
  try {
    const areaId = req.query.areaId ? String(req.query.areaId) : null;
    const formula = req.query.formula ? String(req.query.formula) : null;
    const dateStart = req.query.dateStart ? String(req.query.dateStart) : null;
    const dateEnd = req.query.dateEnd ? String(req.query.dateEnd) : null;

    const result = await resumoService.getResumo({ 
      areaId, 
      formula: formula ? Number(formula) : null, 
      dateStart, 
      dateEnd 
    });
    
    return res.json(result);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/unidades/converter', async (req, res) => {
  try {
    const valor = Number(req.query.valor);
    const de = Number(req.query.de);
    const para = Number(req.query.para);
    if (isNaN(valor) || isNaN(de) || isNaN(para)) return res.status(400).json({ error: 'valor,de,para are required' });
    return res.json({ original: valor, convertido: unidadesService.converterUnidades(Number(valor), Number(de), Number(para)), de, para });
  } catch (e) { console.error(e); return res.status(500).json({}); }
});

app.post('/api/unidades/normalizarParaKg', async (req, res) => {
  try {
    const { valores, unidades } = req.body;
    if (!valores || !unidades) return res.status(400).json({ error: 'valores and unidades required' });
    return res.json({ valoresOriginais: valores, valoresNormalizados: unidadesService.normalizarParaKg(valores, unidades), unidades });
  } catch (e) { console.error(e); return res.status(500).json({}); }
});

app.post('/api/db/populate', async (req, res) => {
  try {
    const { tipo = 'relatorio', quantidade = 10, config = {} } = req.body || {};
    if (tipo === 'relatorio') {
      const result = await dataPopulationService.populateRelatorio(Math.min(Math.max(1, Number(quantidade)), 1000), config);
      return res.json(result);
    }
    return res.status(400).json({ error: 'tipo not supported' });
  } catch (e) { console.error(e); return res.status(500).json({}); }
});

app.get('/api/collector/start', async (req, res) => { try { startCollector(); return res.json({ started: true }); } catch (e) { console.error(e); return res.status(500).json({}); } });
app.get('/api/collector/stop', async (req, res) => { try { stopCollector(); return res.json({ stopped: true }); } catch (e) { console.error(e); return res.status(500).json({}); } });

// Additional endpoints for Processador HTTP compatibility
app.post('/api/file/processContent', async (req, res) => {
  try {
    await ensureDatabaseConnection();
    const { filePath, content } = req.body;
    if (!filePath || !content) {
      return res.status(400).json({ error: 'filePath and content are required' });
    }
    
    // For now, just save content to a temp file and process it
    const fs = require('fs');
    const tempPath = `${TMP_DIR}/temp_${Date.now()}.csv`;
    fs.writeFileSync(tempPath, content);
    
    const r = await fileProcessorService.processFile(tempPath);
    
    // Clean up temp file
    try { fs.unlinkSync(tempPath); } catch {}
    
    return res.json({ meta: r.meta, rowsCount: r.parsed.rowsCount });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.post('/api/config', async (req, res) => {
  try {
    const config = req.body;
    // For now, just acknowledge the config
    console.log('[config received]', config);
    return res.json({ ok: true, config });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

// Start HTTP server
const HTTP_PORT = Number(process.env.FRONTEND_API_PORT || process.env.PORT || 3000);

// Setup file processor observer for notifications (simplified without WebSocket)
fileProcessorService.addObserver({ 
  update: async (p: ProcessPayload) => {
    console.log('[File processed]', p);
  }
});

app.listen(HTTP_PORT, () => console.log(`API server running on port ${HTTP_PORT}`));