import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { AppDataSource, dbService } from './services/dbService';
import { backupSvc } from './services/BackupService';
import { parserService } from './services/ParserService';
import { fileProcessorService } from './services/fileProcessorService';
import { IHMService } from './services/IHMService';
import { Relatorio, MateriaPrima, Batch } from './entities';
import { postJson, ProcessPayload } from './core/utils';
import { WebSocketBridge, wsbridge } from './websocket/WebSocketBridge';

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

// Heartbeat loop for WebSocket (optional)
let WS_LOOP = false;
let WS_INTERVAL: NodeJS.Timeout | null = null;
function startWsLoop(periodMs = Number(process.env.WS_HEARTBEAT_MS || '10000')) {
  if (WS_LOOP) return { running: true, periodMs };
  WS_LOOP = true;
  WS_INTERVAL = setInterval(() => {
    const payload = { port: wsbridge.getPort(), clients: wsbridge.getClientCount(), ts: new Date().toISOString() };
    wsbridge.sendEvent('heartbeat', payload);
  }, periodMs);
  return { running: true, periodMs };
}
function stopWsLoop() {
  if (WS_INTERVAL) clearInterval(WS_INTERVAL);
  WS_INTERVAL = null;
  WS_LOOP = false;
  return { stopped: true };
}

// Register WebSocket commands
wsbridge.register('ping', async () => ({ pong: true, ts: new Date().toISOString() }));
wsbridge.register('backup.list', async () => backupSvc.listBackups());
wsbridge.register('file.process', async ({ filePath }: any) => {
  if (!filePath) throw Object.assign(new Error('filePath é obrigatório'), { status: 400 });
  const r = await fileProcessorService.processFile(filePath);
  return { meta: r.meta, rowsCount: r.parsed.rowsCount };
});
wsbridge.register('ihm.fetchLatest', async ({ ip, user = 'anonymous', password = '' }: any) => {
  if (!ip) throw Object.assign(new Error('IP do IHM é obrigatório'), { status: 400 });
  const tmpDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const ihm = new IHMService(ip, user, password);
  const downloaded = await ihm.findAndDownloadNewFiles(tmpDir);
  if (!downloaded || downloaded.length === 0) return { ok: true, message: 'Nenhum CSV novo encontrado' };
  const result = downloaded[0];
  if (!result) return { ok: true, message: 'Nenhum CSV novo encontrado' };
  const fileStat = fs.statSync(result.localPath);
  const fileObj: any = { originalname: result.name, path: result.localPath, mimetype: 'text/csv', size: fileStat.size };
  const meta = await backupSvc.backupFile(fileObj);
  const processed = await parserService.processFile(meta.workPath || meta.backupPath);
  return { meta, processed };
});
wsbridge.register('relatorio.paginate', async ({ page = 1, pageSize = 50, formula = null, dateStart = null, dateEnd = null, sortBy = 'Dia', sortDir = 'DESC' }: any) => {
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
  const total = await qb.getCount();
  const rows = await qb.offset((Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize))).limit(Math.max(1, Number(pageSize))).getMany();
  return { rows, total, page, pageSize };
});
wsbridge.register('db.listBatches', async () => { await dbService.init(); const repo = AppDataSource.getRepository(Batch); const [items, total] = await repo.findAndCount({ take: 50, order: { fileTimestamp: 'DESC' } }); return { items, total, page: 1, pageSize: 50 }; });
wsbridge.register('db.setupMateriaPrima', async ({ items }: any) => { await dbService.init(); const repo = AppDataSource.getRepository(MateriaPrima); return repo.save(Array.isArray(items) ? items : []); });
wsbridge.register('sync.localToMain', async ({ limit = 500 }: any) => { await dbService.init(); const repo = AppDataSource.getRepository(Relatorio); const rows = await repo.find({ take: Number(limit) }); if (!rows || rows.length === 0) return { synced: 0 }; const inserted = await dbService.insertRelatorioRows(rows as any[], 'local-backup-sync'); return { synced: Array.isArray(inserted) ? inserted.length : rows.length }; });
wsbridge.register('collector.start', async () => { startCollector(); return { started: true }; });
wsbridge.register('collector.stop', async () => { stopCollector(); return { stopped: true }; });
wsbridge.register('ws.loop.start', async ({ periodMs }: any) => startWsLoop(Number(periodMs || process.env.WS_HEARTBEAT_MS || 10000)));
wsbridge.register('ws.loop.stop', async () => stopWsLoop());
wsbridge.register('ws.status', async () => ({ port: wsbridge.getPort(), clients: wsbridge.getClientCount(), loop: WS_LOOP }));

// Auto-start when forked from Electron main
if (typeof (process as any)?.send === 'function') {
  wsbridge
    .start()
    .then((port) => {
      if (typeof (process as any)?.send === 'function') {
        (process as any).send({ type: 'websocket-port', port });
      }
      fileProcessorService.addObserver({ update: async (p: ProcessPayload) => wsbridge.sendEvent('file.processed', p) });
      if (process.env.WS_LOOP_AUTO_START === 'true') startWsLoop();
    })
    .catch((err) => {
      console.error('[Backend] Failed to start WebSocket server:', err);
      process.exit(1);
    });
}

export { WebSocketBridge, wsbridge };