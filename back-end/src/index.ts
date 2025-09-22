import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { AppDataSource, dbService } from './services/dbService';
import { backupSvc } from './services/BackupService';
import { parserService } from './services/ParserService';
import { fileProcessorService } from './services/fileProcessorService';
import { IHMService } from './services/IHMService';
import { materiaPrimaService } from './services/materiaPrimaService';
import { mockService } from './services/mockService'; // Importação do mockService
import { resumoService } from './services/resumoService'; // Importação do serviço de resumo
import { dataPopulationService } from './services/dataPopulationService'; // Importação do serviço de população de dados
import { unidadesService } from './services/unidadesService'; // Importação do serviço de unidades
import { Relatorio, MateriaPrima, Batch } from './entities';
import { postJson, ProcessPayload } from './core/utils';
import { WebSocketBridge, wsbridge } from './websocket/WebSocketBridge';
import { configureEstoqueEndpoints } from './websocket/estoqueEndpoints';
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

// Ensure database connection before starting WebSocket commands
async function ensureDatabaseConnection() {
  if (!AppDataSource.isInitialized) {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established.');
  }
}

// Register WebSocket commands
wsbridge.register('ping', async () => ({ pong: true, ts: new Date().toISOString() }));
wsbridge.register('backup.list', async () => {
  await ensureDatabaseConnection();
  return backupSvc.listBackups();
});
wsbridge.register('file.process', async ({ filePath }: any) => {
  await ensureDatabaseConnection();
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
wsbridge.register('relatorio.paginate', async ({ page = 1, pageSize = 300, formula = null, dateStart = null, dateEnd = null, sortBy = 'Dia', sortDir = 'DESC', includeProducts = false }: any) => {
  // Se o modo mock estiver habilitado, usar dados mock
  if (mockService.isMockEnabled()) {
    return await wsbridge.executeCommand('mock.getRelatorios', { 
      page, 
      pageSize, 
      formula, 
      dateStart, 
      dateEnd 
    });
  }

  // Caso contrário, usar dados reais do banco
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
  // By default select only summary columns to reduce payload and improve query performance.
  // To include all product columns (Prod_1..Prod_40), set `includeProducts=true` in the request.
  if (!includeProducts) {
    const summaryCols = ['id', 'Dia', 'Hora', 'Nome', 'Form1', 'Form2', 'processedFile'];
    qb.select(summaryCols.map(c => `r.${c}`));
  }

  const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize));
  const take = Math.max(1, Number(pageSize));
  const [rows, total] = await qb.skip(offset).take(take).getManyAndCount();
  return { rows, total, page, pageSize };
});
wsbridge.register('db.listBatches', async () => { await dbService.init(); const repo = AppDataSource.getRepository(Batch); const [items, total] = await repo.findAndCount({ take: 50, order: { fileTimestamp: 'DESC' } }); return { items, total, page: 1, pageSize: 50 }; });
wsbridge.register('db.setupMateriaPrima', async ({ items }: any) => { 
  await dbService.init(); 
  // Filtra apenas os campos necessários e aplica as regras de negócio
  const processedItems = Array.isArray(items) ? items.map(item => {
    // Garante que apenas medida é utilizada para identificar g ou kg
    // e ignora categoria (será removida no serviço)
    return {
      id: item.id,
      num: item.num,
      produto: item.produto,
      medida: item.medida === 0 ? 0 : 1 // 0 = gramas, 1 = kg
    };
  }) : [];
  
  return await materiaPrimaService.saveMany(processedItems); 
});

wsbridge.register('db.getMateriaPrima', async () => { 
  // Se o modo mock estiver habilitado, usar dados mock
  if (mockService.isMockEnabled()) {
    return await wsbridge.executeCommand('mock.getMateriasPrimas', {});
  }
  
  // Caso contrário, usar dados reais
  return await materiaPrimaService.getAll();
});
wsbridge.register('sync.localToMain', async ({ limit = 500 }: any) => { await dbService.init(); const repo = AppDataSource.getRepository(Relatorio); const rows = await repo.find({ take: Number(limit) }); if (!rows || rows.length === 0) return { synced: 0 }; const inserted = await dbService.insertRelatorioRows(rows as any[], 'local-backup-sync'); return { synced: Array.isArray(inserted) ? inserted.length : rows.length }; });

// Registrar endpoints do serviço de resumo
wsbridge.register('resumo.get', async ({ areaId = null, formula = null, dateStart = null, dateEnd = null }: any) => {
  // Se o modo mock estiver habilitado, usar dados mock
  if (mockService.isMockEnabled()) {
    // Obter dados mock filtrados
    const mockData = await wsbridge.executeCommand('mock.getRelatorios', {
      formula,
      dateStart,
      dateEnd
    });
    
    // Processar resumo com os dados mock
    return resumoService.processResumo(mockData.rows, areaId);
  }
  
  // Caso contrário, usar dados reais
  return await resumoService.getResumo({ areaId, formula, dateStart, dateEnd });
});

// Frontend compatibility aliases
wsbridge.register('resumo.geral', async (filtros: any) => {
  return await wsbridge.executeCommand('resumo.get', filtros);
});

wsbridge.register('resumo.area', async ({ areaId, ...filtros }: any) => {
  return await wsbridge.executeCommand('resumo.get', { ...filtros, areaId });
});

// Alternância automática entre resumos
let timerResumoId: NodeJS.Timeout | null = null;

wsbridge.register('resumo.alternarComTimer', async ({ areaId, tempoExibicaoSegundos = 5, formula = null, dateStart = null, dateEnd = null }: any) => {
  if (!areaId) throw Object.assign(new Error('areaId é obrigatório'), { status: 400 });
  
  // Limpar timer anterior se existir
  if (timerResumoId) {
    clearInterval(timerResumoId);
    timerResumoId = null;
  }
  
  // Parâmetros de filtro
  const filtros = { formula, dateStart, dateEnd };
  
  // Função para alternar entre os resumos
  const alternarResumos = async () => {
    // Verificar qual resumo está sendo exibido atualmente (pelo último evento enviado)
    const ultimoTipoResumo = wsbridge.getMetadata('ultimoTipoResumo') || 'geral';
    
    if (ultimoTipoResumo === 'geral') {
      // Enviar resumo da área
      let resumoArea;
      
      if (mockService.isMockEnabled()) {
        // Usar dados mock
        const mockData = await wsbridge.executeCommand('mock.getRelatorios', filtros);
        resumoArea = resumoService.processResumo(mockData.rows, areaId);
      } else {
        // Usar dados reais
        resumoArea = await resumoService.getResumo({ ...filtros, areaId });
      }
      
      wsbridge.sendEvent('resumo.atualizado', { 
        tipo: 'area',
        dados: resumoArea
      });
      wsbridge.setMetadata('ultimoTipoResumo', 'area');
    } else {
      // Enviar resumo geral
      let resumoGeral;
      
      if (mockService.isMockEnabled()) {
        // Usar dados mock
        const mockData = await wsbridge.executeCommand('mock.getRelatorios', filtros);
        resumoGeral = resumoService.processResumo(mockData.rows);
      } else {
        // Usar dados reais
        resumoGeral = await resumoService.getResumo(filtros);
      }
      
      wsbridge.sendEvent('resumo.atualizado', { 
        tipo: 'geral',
        dados: resumoGeral
      });
      wsbridge.setMetadata('ultimoTipoResumo', 'geral');
    }
  };
  
  // Iniciar com o resumo da área
  let resumoArea;
  
  if (mockService.isMockEnabled()) {
    // Usar dados mock
    const mockData = await wsbridge.executeCommand('mock.getRelatorios', filtros);
    resumoArea = resumoService.processResumo(mockData.rows, areaId);
  } else {
    // Usar dados reais
    resumoArea = await resumoService.getResumo({ ...filtros, areaId });
  }
  
  wsbridge.sendEvent('resumo.atualizado', { 
    tipo: 'area',
    dados: resumoArea
  });
  wsbridge.setMetadata('ultimoTipoResumo', 'area');
  
  // Configurar o intervalo para alternar os resumos
  timerResumoId = setInterval(alternarResumos, tempoExibicaoSegundos * 1000);
  
  return { success: true, message: `Timer configurado para ${tempoExibicaoSegundos} segundos` };
});

// Mock services - add all supported mock commands
wsbridge.register('mock.toggle', async ({ enabled }: any) => {
  return mockService.toggleMockMode(enabled);
});

wsbridge.register('mock.status', async () => {
  return { enabled: mockService.isMockEnabled() };
});

// Frontend compatibility aliases
wsbridge.register('mock.getStatus', async () => {
  return { enabled: mockService.isMockEnabled() };
});

wsbridge.register('mock.setStatus', async ({ enabled }: any) => {
  return mockService.toggleMockMode(enabled);
});

wsbridge.register('mock.configure', async (config: any) => {
  // Configurar detalhes específicos do mock se necessário
  return { success: true, config };
});

wsbridge.register('mock.getRelatorios', async (params: any) => {
  return await wsbridge.executeCommand('relatorio.paginate', params);
});

wsbridge.register('mock.getMateriasPrimas', async () => {
  return await materiaPrimaService.getAll();
});

// Registrar endpoints do serviço de unidades
wsbridge.register('unidades.converter', async ({ valor, de, para }: any) => {
  if (valor === undefined || de === undefined || para === undefined) {
    throw Object.assign(new Error('Parâmetros incompletos. Necessário: valor, de, para'), { status: 400 });
  }
  return { 
    original: valor,
    convertido: unidadesService.converterUnidades(Number(valor), Number(de), Number(para)),
    de: Number(de),
    para: Number(para)
  };
});

wsbridge.register('unidades.normalizarParaKg', async ({ valores, unidades }: any) => {
  if (!valores || !unidades || typeof valores !== 'object' || typeof unidades !== 'object') {
    throw Object.assign(new Error('Parâmetros inválidos. Necessário: valores (objeto), unidades (objeto)'), { status: 400 });
  }
  return { 
    valoresOriginais: valores,
    valoresNormalizados: unidadesService.normalizarParaKg(valores, unidades),
    unidades
  };
});

// Endpoint para popular o banco com dados de teste
wsbridge.register('db.populate', async ({ 
  tipo = 'relatorio', 
  quantidade = 10, 
  config = {} 
}: any) => {
  // Por enquanto, só suporta população de relatórios
  if (tipo === 'relatorio') {
    return await dataPopulationService.populateRelatorio(
      Math.min(Math.max(1, quantidade), 1000), // Limitar entre 1 e 1000
      config
    );
  }
  
  throw Object.assign(new Error(`Tipo de população não suportado: ${tipo}`), { status: 400 });
});
wsbridge.register('collector.start', async () => { startCollector(); return { started: true }; });
wsbridge.register('collector.stop', async () => { stopCollector(); return { stopped: true }; });
wsbridge.register('ws.loop.start', async ({ periodMs }: any) => startWsLoop(Number(periodMs || process.env.WS_HEARTBEAT_MS || 10000)));
wsbridge.register('ws.loop.stop', async () => stopWsLoop());
wsbridge.register('ws.status', async () => ({ port: wsbridge.getPort(), clients: wsbridge.getClientCount(), loop: WS_LOOP }));

// Registrar endpoints de estoque
configureEstoqueEndpoints(wsbridge);

// Auto-start when forked from Electron main
if (typeof (process as any)?.send === 'function') {
  wsbridge
    .start()
    .then((port) => {
      if (typeof (process as any)?.send === 'function') {
        (process as any).send({ type: 'websocket-port', port });
        console.log(`Backend WebSocket started on port ${port}`);
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

// If not forked (running standalone during development), start the WebSocket bridge
if (typeof (process as any)?.send !== 'function') {
  wsbridge
    .start()
    .then((port) => {
      console.log(`[Backend] WebSocket started (standalone) on port ${port}`);
      fileProcessorService.addObserver({ update: async (p: ProcessPayload) => wsbridge.sendEvent('file.processed', p) });
      if (process.env.WS_LOOP_AUTO_START === 'true') startWsLoop();
    })
    .catch((err) => {
      console.error('[Backend] Failed to start WebSocket server (standalone):', err);
    });
}

// If parent process sends messages (when forked), route commands to wsbridge handlers
if (typeof (process as any)?.on === 'function') {
  try {
    const sendFn: any = (process as any).send;
    process.on('message', async (msg: any) => {
      if (!msg || typeof msg !== 'object') return;
      // simple RPC: { type: 'cmd', id, cmd, payload }
      if (msg.type === 'cmd' && msg.id && msg.cmd) {
        try {
          const result = await wsbridge.executeCommand(msg.cmd, msg.payload);
          if (typeof sendFn === 'function') sendFn({ id: msg.id, ok: true, data: result });
        } catch (err: any) {
          if (typeof sendFn === 'function') sendFn({ id: msg.id, ok: false, error: { message: err?.message || String(err), status: err?.status } });
        }
      }
    });
  } catch (e) {
    // ignore
  }
}

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', // Frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
    const includeProducts = String(req.query.includeProducts || 'false') === 'true';

    // mock handling
    if (mockService.isMockEnabled()) {
      const data = await wsbridge.executeCommand('mock.getRelatorios', { page, pageSize, formula, dateStart, dateEnd });
      return res.json(data);
    }

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
    if (!includeProducts) {
      const summaryCols = ['id', 'Dia', 'Hora', 'Nome', 'Form1', 'Form2', 'processedFile'];
      qb.select(summaryCols.map(c => `r.${c}`));
    }
    const offset = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize));
    const take = Math.max(1, Number(pageSize));
    const [rows, total] = await qb.skip(offset).take(take).getManyAndCount();
    return res.json({ rows, total, page, pageSize });
  } catch (e: any) { console.error(e); return res.status(500).json({ error: e?.message || 'internal' }); }
});

app.get('/api/db/listBatches', async (req, res) => {
  try { await dbService.init(); const repo = AppDataSource.getRepository(Batch); const [items, total] = await repo.findAndCount({ take: 50, order: { fileTimestamp: 'DESC' } }); return res.json({ items, total, page: 1, pageSize: 50 }); } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.post('/api/db/setupMateriaPrima', async (req, res) => {
  try {
    await dbService.init();
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const processedItems = items.map((item: any) => ({ id: item.id, num: item.num, produto: item.produto, medida: item.medida === 0 ? 0 : 1 }));
    const saved = await materiaPrimaService.saveMany(processedItems);
    return res.json(saved);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/db/getMateriaPrima', async (req, res) => {
  try {
    if (mockService.isMockEnabled()) {
      const data = await wsbridge.executeCommand('mock.getMateriasPrimas', {});
      return res.json(data);
    }
    const items = await materiaPrimaService.getAll();
    return res.json(items);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/db/syncLocalToMain', async (req, res) => {
  try {
    await dbService.init();
    const limit = Number(req.query.limit || 500);
    const repo = AppDataSource.getRepository(Relatorio);
    const rows = await repo.find({ take: Number(limit) });
    if (!rows || rows.length === 0) return res.json({ synced: 0 });
    const inserted = await dbService.insertRelatorioRows(rows as any[], 'local-backup-sync');
    return res.json({ synced: Array.isArray(inserted) ? inserted.length : rows.length });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/resumo', async (req, res) => {
  try {
    const areaId = req.query.areaId ?? null;
    const formula = req.query.formula ?? null;
    const dateStart = req.query.dateStart ?? null;
    const dateEnd = req.query.dateEnd ?? null;

    if (mockService.isMockEnabled()) {
      const mockData = await wsbridge.executeCommand('mock.getRelatorios', { formula, dateStart, dateEnd });
      const result = resumoService.processResumo(mockData.rows, areaId as any);
      return res.json(result);
    }

    const result = await resumoService.getResumo({ areaId, formula, dateStart, dateEnd });
    return res.json(result);
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});

app.get('/api/mock/status', async (req, res) => { try { return res.json({ enabled: mockService.isMockEnabled() }); } catch (e) { console.error(e); return res.status(500).json({}); } });
app.post('/api/mock/toggle', async (req, res) => { try { const enabled = Boolean(req.body.enabled); return res.json(mockService.toggleMockMode(enabled)); } catch (e) { console.error(e); return res.status(500).json({}); } });

app.get('/api/mock/relatorios', async (req, res) => { try { const params = req.query; const data = await wsbridge.executeCommand('mock.getRelatorios', params); return res.json(data); } catch (e) { console.error(e); return res.status(500).json({}); } });
app.get('/api/mock/materias', async (req, res) => { try { const data = await materiaPrimaService.getAll(); return res.json(data); } catch (e) { console.error(e); return res.status(500).json({}); } });

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

app.get('/api/ws/loop/start', async (req, res) => { try { const periodMs = Number(req.query.periodMs || process.env.WS_HEARTBEAT_MS || 10000); return res.json(startWsLoop(Number(periodMs))); } catch (e) { console.error(e); return res.status(500).json({}); } });
app.get('/api/ws/loop/stop', async (req, res) => { try { return res.json(stopWsLoop()); } catch (e) { console.error(e); return res.status(500).json({}); } });
app.get('/api/ws/status', async (req, res) => { try { return res.json({ port: wsbridge.getPort(), clients: wsbridge.getClientCount(), loop: WS_LOOP }); } catch (e) { console.error(e); return res.status(500).json({}); } });

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

// Mount estoque endpoints also for HTTP (delegating to existing wsbridge-configured handlers is complex),
// but we can provide a simple pass-through that executes the same registered handler if present.
app.all('/api/estoque/*', async (req, res) => {
  try {
    // Map path like /api/estoque/listar -> 'estoque/listar'
    const sub = req.path.replace('/api/estoque/', '');
    const cmd = `estoque/${sub}`;
    if (typeof (wsbridge as any).handlers?.[cmd] === 'function') {
      const payload = Object.keys(req.query).length ? req.query : req.body || {};
      const result = await wsbridge.executeCommand(cmd, payload);
      return res.json(result);
    }
    return res.status(404).json({ error: 'not found' });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'internal' }); }
});


// Start HTTP server only in dev mode if needed
const HTTP_PORT = Number(process.env.FRONTEND_API_PORT || process.env.PORT || 3002);
app.listen(HTTP_PORT, () => console.log(`API server running on port ${HTTP_PORT}`));

app.options('*', cors());