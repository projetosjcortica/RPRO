import "reflect-metadata";
import fs from "fs";
import path from "path";
import os from "os";
import { AppDataSource, dbService } from "./services/dbService";
import { backupSvc } from "./services/backupService";
import { parserService } from "./services/parserService";
import { fileProcessorService } from "./services/fileProcessorService";
import { IHMService } from "./services/IHMService";
import { materiaPrimaService } from "./services/materiaPrimaService";
import { resumoService } from "./services/resumoService";
import ExcelJS from "exceljs";
import { unidadesService } from "./services/unidadesService";
import { dumpConverterService } from "./services/dumpConverterService";
import {
  Relatorio,
  MateriaPrima,
  Batch,
  User,
  MovimentacaoEstoque,
  Estoque,
  Row,
  Amendoim,
} from "./entities";
import { postJson, ProcessPayload } from "./core/utils";
import express from "express";
import cors from "cors";
import compression from "compression";
import multer from "multer";
import { configService } from "./services/configService";
import { setRuntimeConfigs, setRuntimeConfig, getRuntimeConfig, getAllRuntimeConfigs } from "./core/runtimeConfig";
import { csvConverterService } from "./services/csvConverterService";
import iconv from 'iconv-lite';
import { changeDetectionService } from "./services/changeDetectionService";
import { statsLogger, statsMiddleware } from "./services/statsLogger";
import { cacheService } from "./services/CacheService";
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as net from 'net';
const execFileAsync = promisify(execFile);

console.log("✅ [Startup] Módulos importados com sucesso");

// Global handlers for improved debugging on dev setup
process.on('unhandledRejection', (reason) => {
  console.error('[Global] unhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Global] uncaughtException:', err);
});

// ========== CACHE DE MATÉRIAS-PRIMAS ==========
// Cache global para evitar consultas repetidas ao banco
let materiaPrimaCache: Record<number, any> | null = null;
let materiaPrimaCacheTime: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

async function getMateriaPrimaCache(): Promise<Record<number, any>> {
  const now = Date.now();

  // Retornar cache se ainda válido
  if (materiaPrimaCache && (now - materiaPrimaCacheTime) < CACHE_TTL_MS) {
    return materiaPrimaCache;
  }

  // Buscar do banco e atualizar cache
  const materias = await materiaPrimaService.getAll();
  const cache: Record<number, any> = {};

  for (const m of materias) {
    const n = typeof m.num === "number" ? m.num : Number(m.num);
    if (!Number.isNaN(n)) {
      cache[n] = m;
    }
  }

  materiaPrimaCache = cache;
  materiaPrimaCacheTime = now;

  return cache;
}

// Invalidar cache quando matérias-primas forem atualizadas
export function invalidateMateriaPrimaCache() {
  materiaPrimaCache = null;
  materiaPrimaCacheTime = 0;
  console.log('[Cache] Matéria-prima cache invalidated');
}

// Collector
// Prefer runtime-config values (set via POST /api/config) and fall back to environment variables
const POLL_INTERVAL = Number(
  getRuntimeConfig("poll_interval_ms") ??
  process.env.POLL_INTERVAL_MS ??
  "60000"
);

// Base temp dir for collector: prefer runtime config -> env var -> OS temp dir
const TMP_DIR_BASE = path.resolve(String(getRuntimeConfig("collector_tmp") ?? process.env.COLLECTOR_TMP ?? os.tmpdir()));
if (!fs.existsSync(TMP_DIR_BASE)) fs.mkdirSync(TMP_DIR_BASE, { recursive: true });

type CollectorStatus = {
  running: boolean;
  stopRequested: boolean;
  startedAt: string | null;
  lastCycleAt: string | null;
  lastFinishedAt: string | null;
  lastError: string | null;
  cycles: number;
  pollIntervalMs: number;
};

const collectorState: CollectorStatus = {
  running: false,
  stopRequested: false,
  startedAt: null,
  lastCycleAt: null,
  lastFinishedAt: null,
  lastError: null,
  cycles: 0,
  pollIntervalMs: POLL_INTERVAL,
};

let stopFlag = false;
let loopPromise: Promise<void> | null = null;

export function getCollectorStatus(): CollectorStatus {
  return { ...collectorState };
}

export async function startCollector(overrideConfig?: {
  ip?: string;
  user?: string;
  password?: string;
}): Promise<{
  started: boolean;
  message?: string;
  status: CollectorStatus;
}> {
  if (collectorState.running || collectorState.stopRequested) {
    return {
      started: false,
      message: "Collector já está em execução.",
      status: getCollectorStatus(),
    };
  }

  // Prefer override config, then 'ihm-config' topic (object) saved by frontend; fall back to older flat keys and env
  const runtimeIhm = getRuntimeConfig("ihm-config") || {};

  const finalIp = overrideConfig?.ip ?? runtimeIhm.ip ?? getRuntimeConfig("ip");

  const finalUser =
    overrideConfig?.user ?? runtimeIhm.user ?? getRuntimeConfig("user");

  const finalPassword =
    overrideConfig?.password ?? runtimeIhm.password ?? getRuntimeConfig("pass");

  // If no IHM configuration is present at all, do not start the collector.
  // This avoids throwing low-level errors when the collector runs without any config.
  if (
    (!finalIp || String(finalIp).trim() === "") &&
    (!finalUser || String(finalUser).trim() === "") &&
    (!finalPassword || String(finalPassword).trim() === "")
  ) {
    console.log('[collector] IHM configuration missing; not starting collector.');
    return {
      started: false,
      message:
        'IHM config not provided; collector not started. Configure IHM via /api/config or provide overrideConfig.',
      status: getCollectorStatus(),
    };
  }

  // If we have override config, update the runtime config for future use
  if (overrideConfig) {
    const updatedIhmConfig = { ...runtimeIhm };
    if (overrideConfig.ip) updatedIhmConfig.ip = overrideConfig.ip;
    if (overrideConfig.user) updatedIhmConfig.user = overrideConfig.user;
    if (overrideConfig.password)
      updatedIhmConfig.password = overrideConfig.password;

    try {
      setRuntimeConfigs({ "ihm-config": updatedIhmConfig });
      console.log(`[collector] Updated IHM config with IP: ${finalIp}`);
    } catch (e) {
      console.warn("[collector] Failed to update runtime config:", e);
    }
  }

  const ihm = new IHMService(
    String(finalIp || ""),
    String(finalUser || "anonymous"),
    String(finalPassword || "")
  );

  const runCycle = async () => {
    // Create per-IHM tmp folder to avoid conflicts in packaged builds
    const runtimeIhmCfg = getRuntimeConfig('ihm-config') || {};
    const ihmIpForDir = (runtimeIhmCfg.ip || process.env.IHM_IP || 'local').toString().replace(/\./g, '_');
    const perIhmTmp = path.join(TMP_DIR_BASE, `ihm_${ihmIpForDir}`);
    if (!fs.existsSync(perIhmTmp)) fs.mkdirSync(perIhmTmp, { recursive: true });

    const downloaded = await ihm.findAndDownloadNewFiles(perIhmTmp);
    console.log(`[collector] ${downloaded.length} arquivo(s) baixado(s).`);
    for (const f of downloaded) {
      if (stopFlag) break;
      console.log(`[collector] processando arquivo: ${f.name}`);
      try {
        await fileProcessorService.processFile(f.localPath);
      } catch (err) {
        console.error("[collector] erro ao processar arquivo", err);
        throw err;
      }
    }
  };

  stopFlag = false;
  collectorState.running = true;
  collectorState.stopRequested = false;
  collectorState.startedAt = new Date().toISOString();
  collectorState.lastFinishedAt = null;
  collectorState.lastError = null;
  collectorState.cycles = 0;

  const loop = async () => {
    try {
      while (!stopFlag) {
        try {
          console.log(
            `[collector] iniciando ciclo #${collectorState.cycles + 1}`
          );
          await runCycle();
          collectorState.cycles += 1;
          collectorState.lastCycleAt = new Date().toISOString();
          collectorState.lastError = null;
        } catch (err) {
          collectorState.lastError =
            err instanceof Error ? err.message : String(err);
          console.error("[collector cycle error]", err);
        }

        if (stopFlag) break;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    } finally {
      collectorState.running = false;
      collectorState.stopRequested = false;
      collectorState.lastFinishedAt = new Date().toISOString();
      stopFlag = false;
      loopPromise = null;
    }
  };

  loopPromise = loop();

  return {
    started: true,
    status: getCollectorStatus(),
  };
}

export async function stopCollector(): Promise<{
  stopped: boolean;
  message?: string;
  status: CollectorStatus;
}> {
  if (!collectorState.running && !collectorState.stopRequested) {
    return {
      stopped: false,
      message: "Collector já está parado.",
      status: getCollectorStatus(),
    };
  }

  stopFlag = true;
  collectorState.stopRequested = true;

  const pendingLoop = loopPromise;
  if (pendingLoop) {
    try {
      await pendingLoop;
    } catch (err) {
      collectorState.lastError =
        err instanceof Error ? err.message : String(err);
      console.error("[collector stop] erro aguardando encerramento", err);
    }
  } else {
    collectorState.running = false;
    collectorState.stopRequested = false;
    collectorState.lastFinishedAt = new Date().toISOString();
    stopFlag = false;
  }

  return {
    stopped: true,
    status: getCollectorStatus(),
  };
}

// ========== OTIMIZAÇÃO: Flag global de inicialização ==========
let dbInitialized = false;
let dbInitializing: Promise<void> | null = null;

/**
 * Inicializa o banco de dados UMA ÚNICA VEZ.
 * Se já estiver inicializado, retorna imediatamente.
 * Se estiver inicializando, aguarda a inicialização em progresso.
 */
async function ensureDbReady(): Promise<void> {
  if (dbInitialized && AppDataSource.isInitialized) return;
  
  if (dbInitializing) {
    await dbInitializing;
    return;
  }
  
  dbInitializing = (async () => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (!AppDataSource.isInitialized) {
          await dbService.init();
        }
        dbInitialized = true;
        console.log(`[DB] ✅ Database ready (attempt ${attempt})`);
        return;
      } catch (e) {
        console.warn(`[DB] Attempt ${attempt}/${MAX_RETRIES} failed:`, String(e));
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
        } else {
          throw e;
        }
      }
    }
  })();
  
  try {
    await dbInitializing;
  } finally {
    dbInitializing = null;
  }
}

// Ensure default admin user exists
async function ensureDefaultAdminUser() {
  try {
    const userRepo = AppDataSource.getRepository(User);
    
    // Check if admin user already exists by username 'cortica'
    const adminUser = await userRepo.findOne({ 
      where: { username: 'cortica' } 
    });
    
    if (!adminUser) {
      console.log('[Startup] Creating default admin user: J.Cortiça Software');
      const newAdmin = userRepo.create({
        username: 'cortica',
        password: '197575', // Default password - should be changed
        isAdmin: true,
        displayName: 'J.Cortiça Software',
        userType: 'racao'
      });
      await userRepo.save(newAdmin);
      console.log('[Startup] ✅ Default admin user created successfully');
    } else {
      // Ensure admin flag is set
      if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        await userRepo.save(adminUser);
        console.log('[Startup] ✅ Admin flag updated for J.Cortiça Software user');
      }
    }
  } catch (e) {
    console.warn('[Startup] Error ensuring default admin user:', e);
  }
}

// Helper: Obter lista de produtos ativos (para filtrar produtos inativos)
// if excludeIgnorarCalculos=true, also exclude products where materia.ignorarCalculos === true
async function getProdutosAtivos(excludeIgnorarCalculos = false): Promise<Set<number>> {
  try {
    // 🔄 SEMPRE buscar direto do banco para garantir dados atualizados
    // (não usar cache pois pode estar desatualizado após toggle)
    const materias = await materiaPrimaService.getAll();
    const ativosSet = new Set<number>();

    for (const mp of materias) {
      // Se ativo não está definido (null/undefined) ou é true, considerar ativo
      if (mp.ativo === false) continue; // explicit inactive
      if (mp.num == null) continue;
      // Se solicitado, também excluir produtos marcados para ignorar cálculos
      if (excludeIgnorarCalculos && mp.ignorarCalculos === true) continue;
      ativosSet.add(mp.num);
    }

    console.log(`[getProdutosAtivos] ${ativosSet.size} produtos ativos (excludeIgnorar=${excludeIgnorarCalculos}):`, Array.from(ativosSet).sort((a, b) => a - b));
    return ativosSet;
  } catch (e) {
    console.error('[getProdutosAtivos] Erro:', e);
    // Em caso de erro, retornar set vazio (não filtra nada)
    return new Set<number>();
  }
}

// Helper: Filtrar colunas de produtos inativos de um objeto de relatório
async function filtrarProdutosInativos(obj: any): Promise<any> {
  const produtosAtivos = await getProdutosAtivos();

  // Se set vazio (erro), retornar objeto original
  if (produtosAtivos.size === 0) return obj;

  const filtered = { ...obj };

  // Zerar produtos inativos (Prod_1 até Prod_65)
  for (let i = 1; i <= 65; i++) {
    if (!produtosAtivos.has(i)) {
      const key = `Prod_${i}`;
      if (key in filtered) {
        filtered[key] = 0;
      }
    }
  }

  return filtered;
}

const app = express();

// ========== MIDDLEWARE: Garantir DB conectado ANTES de qualquer rota ==========
app.use(async (req, res, next) => {
  // Ignorar health check para não bloquear
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }
  
  try {
    await ensureDbReady();
    next();
  } catch (e) {
    console.error('[Middleware] Database not ready:', e);
    res.status(503).json({ error: 'Database not available', details: String(e) });
  }
});

// Compressão gzip para otimizar transferência de dados
app.use(compression({
  filter: (req: express.Request, res: express.Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Comprimir respostas > 1KB
  level: 6 // Balanço entre velocidade e compressão
}));

// Allow CORS from any origin during development. Using the default `cors()`
// handler ensures proper handling of preflight OPTIONS requests.
app.use(cors());
// Also explicitly respond to OPTIONS preflight for all routes (defensive)
app.options("*", cors());

// Extra safety: ensure the common CORS headers are present on all responses.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

// ========== HEALTH CHECK ENDPOINT ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: dbInitialized ? 'ok' : 'initializing',
    dbConnected: AppDataSource.isInitialized,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', dbReady: dbInitialized });
});

// POST handler: aceitar body.params + body.advancedFilters (compatível com Processador.relatorioPaginate)
app.post('/api/relatorio/paginate', async (req, res) => {
  const startTime = Date.now();
  try {
    // ✅ DB já garantido pelo middleware global - removido
    const params = req.body?.params || {};
    const advancedFilters = req.body?.advancedFilters || null;

    const pageNum = Number.isFinite(Number(params.page)) && Number(params.page) > 0 ? Number(params.page) : 1;
    const pageSizeNum = Number.isFinite(Number(params.pageSize)) && Number(params.pageSize) > 0 ? Number(params.pageSize) : 100;
    const sortBy = params.sortBy || 'Dia';
    const sortDir = String(params.sortDir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const codigoRaw = params.codigo ?? null;
    const numeroRaw = params.numero ?? null;
    const formulaRaw = params.formula ?? null;
    const dataInicio = params.dataInicio ?? null;
    const dataFim = params.dataFim ?? null;

    const normDataInicio = normalizeDateParam(dataInicio) || null;
    const normDataFim = normalizeDateParam(dataFim) || null;

    const repo = AppDataSource.getRepository(Relatorio);
    let qb = repo.createQueryBuilder('r');

    if (codigoRaw != null && String(codigoRaw) !== '') {
      const c = Number(codigoRaw);
      if (!Number.isNaN(c)) qb.andWhere('r.Form1 = :c', { c });
    }
    if (numeroRaw != null && String(numeroRaw) !== '') {
      const num = Number(numeroRaw);
      if (!Number.isNaN(num)) qb.andWhere('r.Form2 = :num', { num });
    }
    if (formulaRaw != null && String(formulaRaw) !== '') {
      const fNum = Number(String(formulaRaw));
      if (!Number.isNaN(fNum)) qb.andWhere('r.Form1 = :fNum', { fNum });
      else {
        const fStr = String(formulaRaw).toLowerCase();
        qb.andWhere('LOWER(r.Nome) LIKE :fStr', { fStr: `%${fStr}%` });
      }
    }
    if (normDataInicio) qb.andWhere('r.Dia >= :ds', { ds: normDataInicio });
    if (normDataFim) {
      const parts = normDataFim.split('-');
      let dePlus = normDataFim;
      try {
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        dt.setDate(dt.getDate() + 1);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        dePlus = `${y}-${m}-${d}`;
      } catch (e) { dePlus = normDataFim; }
      qb.andWhere('r.Dia < :dePlus', { dePlus });
    }

    // Ordenação seguro
    const allowed = new Set(['Dia', 'Hora', 'Nome', 'Form1', 'Form2']);
    for (let i = 1; i <= 65; i++) allowed.add(`Prod_${i}`);
    const sb = allowed.has(sortBy) ? sortBy : 'Dia';
    const sd = sortDir === 'ASC' ? 'ASC' : 'DESC';
    if (sb === 'Dia') qb.orderBy('r.Dia', sd).addOrderBy('r.Hora', sd as any);
    else qb.orderBy(`r.${sb}`, sd);

    // Carregar materias e aplicar advancedFilters
    const materiasByNum = await getMateriaPrimaCache();
    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);

    const offset = (pageNum - 1) * pageSizeNum;
    qb.offset(offset).limit(pageSizeNum);

    const [rows, total] = await qb.getManyAndCount();

    // Mapear rows para o mesmo formato do GET (values, valuesRaw, unidades)
    const produtosAtivos = true ? null : await getProdutosAtivos();
    const mappedRows = rows.map((row: any) => {
      const values: string[] = new Array(65);
      const valuesRaw: number[] = new Array(65);
      const unidades: string[] = new Array(65);
      for (let i = 1; i <= 65; i++) {
        const prodValue = row[`Prod_${i}`];
        let v = typeof prodValue === 'number' ? prodValue : prodValue != null ? Number(prodValue) : 0;
        const materia = materiasByNum[i];
        if (produtosAtivos && !produtosAtivos.has(i)) v = 0;
        if (v < 0) v = 0;
        const idx = i - 1;
        valuesRaw[idx] = v;
        if (materia && Number(materia.medida) === 0) {
          unidades[idx] = 'g';
          values[idx] = (v / 1000).toFixed(3);
        } else {
          unidades[idx] = 'kg';
          values[idx] = v.toFixed(3);
        }
      }
      return {
        Dia: row.Dia || '',
        Hora: row.Hora || '',
        Nome: row.Nome || '',
        Codigo: row.Form1 ?? 0,
        Numero: row.Form2 ?? 0,
        values,
        valuesRaw,
        unidades,
      };
    });

    // Análise de colunas vazias
    const emptyColumns = {
      Dia: true,
      Hora: true,
      Nome: true,
      Codigo: true,
      Numero: true,
      products: new Array(65).fill(true) // Colunas dinâmicas (col6 até col70)
    };

    // Verificar quais colunas têm dados não-vazios
    for (const row of mappedRows) {
      // Colunas fixas
      if (row.Dia && row.Dia !== '' && row.Dia !== '0') emptyColumns.Dia = false;
      if (row.Hora && row.Hora !== '' && row.Hora !== '0') emptyColumns.Hora = false;
      if (row.Nome && row.Nome !== '' && row.Nome !== '0') emptyColumns.Nome = false;
      if (row.Codigo && row.Codigo !== 0 && row.Codigo !== '0') emptyColumns.Codigo = false;
      if (row.Numero && row.Numero !== 0 && row.Numero !== '0') emptyColumns.Numero = false;

      // Colunas dinâmicas (produtos)
      for (let i = 0; i < 65; i++) {
        const value = row.valuesRaw[i];
        if (value && value !== 0) {
          emptyColumns.products[i] = false;
        }
      }
    }

    const totalPages = Math.ceil(total / pageSizeNum);
    const responseData = { 
      rows: mappedRows, 
      total, 
      page: pageNum, 
      pageSize: pageSizeNum, 
      totalPages,
      emptyColumns // Informar ao frontend quais colunas estão vazias
    };

    res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    return res.json(responseData);
  } catch (e: any) {
    console.error('[relatorio/paginate POST] error', e);
    return res.status(500).json({ error: e?.message || 'Internal server error' });
  }
});

// Lightweight ping endpoint used by frontend dev to detect backend availability
app.get('/api/ping', (_req, res) => {
  try {
    return res.json({ ok: true, ts: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
});

// Defensive: log and respond to preflight OPTIONS explicitly so the browser
// receives the required CORS headers even if some route middleware would
// otherwise interfere.
app.use((req, res, next) => {
  try {
    if (req.method === "OPTIONS") {
      console.log(
        "[CORS preflight] ",
        req.method,
        req.path,
        "from",
        req.headers.origin
      );
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        req.headers["access-control-request-headers"] ||
        "Content-Type,Authorization"
      );
      res.setHeader("Access-Control-Max-Age", "600");
      return res.status(204).end();
    }
  } catch (e) {
    console.warn("[CORS preflight handler error]", e);
  }
  next();
});
// Allow larger JSON bodies (base64 images can be large). Default was too small and caused 413 errors.
app.use(express.json({ limit: "20mb" }));
// Also accept large urlencoded bodies if any clients send form-encoded data
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Statistics logging middleware
app.use(statsMiddleware);

// Helper: normalize incoming date strings to ISO `yyyy-MM-dd` used in DB
function normalizeDateParam(d: any): string | null {
  if (!d && d !== 0) return null;
  const s = String(d).trim();
  if (!s) return null;
  // If already in ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // If in DD-MM-YYYY convert
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const parts = s.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  // Try Date parse fallback
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }
  return null;
}

app.get("/api/materiaprima/labels", async (req, res) => {
  try {
    // 🔄 Sempre buscar dados frescos do banco (não usar cache)
    // pois esta API é chamada ao carregar produtos e precisa estar atualizada
    const materias = await materiaPrimaService.getAll();

    // Map MateriaPrima records to frontend-friendly keys.
    // Assumes `num` is the product index (1..n) and product columns in table start at col6 = Prod_1.
    const mapping: any = {};
    const colOffset = 5; // Prod_1 -> col6
    for (const m of materias) {
      if (!m) continue;
      const num = typeof m.num === "number" ? m.num : Number(m.num);
      if (Number.isNaN(num)) continue;
      const colKey = `col${num + colOffset}`;
      mapping[colKey] = {
        produto: m.produto ?? `Produto ${num}`,
        medida:
          typeof m.medida === "number"
            ? m.medida
            : m.medida
              ? Number(m.medida)
              : 1,
        ativo: m.ativo ?? true,
      };
    }
    return res.json(mapping);
  } catch (e) {
    console.error("Failed to get materia prima labels", e);
    return res.status(500).json({});
  }
});

// Labels de fórmulas: retorna map { codigo: nome }
app.get('/api/formulas/labels', async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);
    const raw = await repo
      .createQueryBuilder('r')
      .select(['r.Form1 as codigo', 'r.Nome as nome'])
      .groupBy('r.Form1, r.Nome')
      .orderBy('r.Form1')
      .getRawMany();

    const map: Record<string, string> = {};
    for (const row of raw) {
      if (row.codigo != null) {
        map[String(row.codigo)] = row.nome || `Formula ${row.codigo}`;
      }
    }

    return res.json(map);
  } catch (e: any) {
    console.error('[formulas/labels] error', e);
    return res.status(500).json({ error: e?.message || 'Internal server error' });
  }
});

// Alternar status ativo/inativo de um produto
app.patch("/api/materiaprima/:num/toggle", async (req, res) => {
  try {
    const num = parseInt(req.params.num);

    console.log(`[MateriaPrima Toggle] Recebido request para produto num=${num}`);

    if (isNaN(num)) {
      console.error(`[MateriaPrima Toggle] Número inválido: ${req.params.num}`);
      return res.status(400).json({ error: "Número de produto inválido" });
    }

    const repo = AppDataSource.getRepository(MateriaPrima);
    const produto = await repo.findOne({ where: { num } });

    console.log(`[MateriaPrima Toggle] Produto encontrado:`, produto);

    if (!produto) {
      console.error(`[MateriaPrima Toggle] Produto ${num} não encontrado no banco`);
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const antigoStatus = produto.ativo;
    produto.ativo = !produto.ativo;

    console.log(`[MateriaPrima Toggle] Alterando status: ${antigoStatus} → ${produto.ativo}`);

    await repo.save(produto);

    // 🔄 Invalidar cache para forçar reload nos próximos requests
    invalidateMateriaPrimaCache();

    // Verificar se salvou corretamente
    const verificacao = await repo.findOne({ where: { num } });
    console.log(`[MateriaPrima Toggle] Verificação pós-save:`, verificacao);

    console.log(`[MateriaPrima Toggle] ✅ Produto ${num} (${produto.produto}) ${produto.ativo ? 'ATIVADO' : 'DESATIVADO'}`);

    return res.json({
      success: true,
      num: produto.num,
      produto: produto.produto,
      ativo: produto.ativo
    });
  } catch (e: any) {
    console.error("Failed to toggle materia prima status", e);
    return res.status(500).json({ error: e?.message || "Erro ao alternar status" });
  }
});

// Alternar status ignorar cálculos de um produto
app.patch("/api/materiaprima/:num/toggle-ignorar-calculos", async (req, res) => {
  try {
    const num = parseInt(req.params.num);

    console.log(`[MateriaPrima ToggleIgnorarCalculos] Recebido request para produto num=${num}`);

    if (isNaN(num)) {
      console.error(`[MateriaPrima ToggleIgnorarCalculos] Número inválido: ${req.params.num}`);
      return res.status(400).json({ error: "Número de produto inválido" });
    }

    const repo = AppDataSource.getRepository(MateriaPrima);
    const produto = await repo.findOne({ where: { num } });

    console.log(`[MateriaPrima ToggleIgnorarCalculos] Produto encontrado:`, produto);

    if (!produto) {
      console.error(`[MateriaPrima ToggleIgnorarCalculos] Produto ${num} não encontrado no banco`);
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const antigoStatus = produto.ignorarCalculos;
    produto.ignorarCalculos = !produto.ignorarCalculos;

    console.log(`[MateriaPrima ToggleIgnorarCalculos] Alterando status: ${antigoStatus} → ${produto.ignorarCalculos}`);

    await repo.save(produto);

    // 🔄 Invalidar cache para forçar reload nos próximos requests
    invalidateMateriaPrimaCache();

    // Verificar se salvou corretamente
    const verificacao = await repo.findOne({ where: { num } });
    console.log(`[MateriaPrima ToggleIgnorarCalculos] Verificação pós-save:`, verificacao);

    console.log(`[MateriaPrima ToggleIgnorarCalculos] ✅ Produto ${num} (${produto.produto}) ${produto.ignorarCalculos ? 'REMOVIDO dos CÁLCULOS' : 'INCLUÍDO nos CÁLCULOS'}`);

    return res.json({
      success: true,
      num: produto.num,
      produto: produto.produto,
      ignorarCalculos: produto.ignorarCalculos
    });
  } catch (e: any) {
    console.error("Failed to toggle ignorar calculos status", e);
    return res.status(500).json({ error: e?.message || "Erro ao alternar status de cálculos" });
  }
});

// Reativar todos os produtos (resetar para padrão)
app.post("/api/materiaprima/reset-all", async (req, res) => {
  try {
    console.log('[MateriaPrima Reset] Reativando todos os produtos...');

    const repo = AppDataSource.getRepository(MateriaPrima);

    // Buscar todos os produtos e atualizar um por um
    const allProducts = await repo.find();

    for (const product of allProducts) {
      product.ativo = true;
      await repo.save(product);
    }

    // Invalidar cache
    invalidateMateriaPrimaCache();

    console.log(`[MateriaPrima Reset] ✅ ${allProducts.length} produtos reativados`);

    return res.json({
      success: true,
      total: allProducts.length,
      message: `${allProducts.length} produtos reativados com sucesso`
    });
  } catch (e: any) {
    console.error("Failed to reset products", e);
    return res.status(500).json({ error: e?.message || "Erro ao resetar produtos" });
  }
});

// --- HTTP API parity for websocket commands ---

app.get("/api/ping", async (req, res) => {
  try {
    return res.json({ pong: true, ts: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/db/status", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);
    const count = await repo.count();
    return res.json({
      status: "connected",
      isInitialized: AppDataSource.isInitialized,
      relatorioCount: count,
      ts: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("[db/status] Error:", e);
    return res.status(500).json({
      status: "error",
      error: e?.message || "internal",
      isInitialized: AppDataSource.isInitialized,
      ts: new Date().toISOString(),
    });
  }
});

// Synchronize database schema (add missing columns)
app.post("/api/db/sync-schema", async (req, res) => {
  try {
    // Forçar adição da coluna 'ativo' na tabela materia_prima se não existir
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Verificar se a coluna existe
      const table = await queryRunner.getTable('materia_prima');
      const ativoColumn = table?.columns.find(col => col.name === 'ativo');

      if (!ativoColumn) {
        console.log('[sync-schema] Coluna "ativo" não existe, adicionando...');
        await queryRunner.query(`ALTER TABLE materia_prima ADD COLUMN ativo TINYINT(1) DEFAULT 1`);
        console.log('[sync-schema] ✅ Coluna "ativo" adicionada com sucesso');
      } else {
        console.log('[sync-schema] Coluna "ativo" já existe');
      }
    } finally {
      await queryRunner.release();
    }

    await dbService.synchronizeSchema();
    return res.json({ ok: true, message: "Schema synchronized successfully" });
  } catch (e: any) {
    console.error("[api/db/sync-schema] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Clear entire database (DELETE all rows from all entities)
app.post("/api/db/clear", async (req, res) => {
  try {
    await dbService.clearAll();
    return res.json({ ok: true });
  } catch (e: any) {
    console.error("[api/db/clear] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Compatibility route: some frontends call /api/database/clean
app.post("/api/database/clean", async (req, res) => {
  try {
    await dbService.clearAll();
    return res.json({ ok: true });
  } catch (e: any) {
    console.error("[api/database/clean] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Export DB dump as JSON (and optionally save to disk). Returns { dump, savedPath }
app.get("/api/db/dump", async (req, res) => {
  try {
    const result = await dbService.exportDump(true);
    return res.json({
      ok: true,
      savedPath: result.savedPath,
      meta: result.dump._meta,
    });
  } catch (e: any) {
    console.error("[api/db/dump] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Import DB dump (JSON body with dump object). This will replace existing tables.
app.post("/api/db/import", async (req, res) => {
  try {
    const dumpObj = req.body;
    if (!dumpObj) return res.status(400).json({ error: "dump body required" });
    const result = await dbService.importDump(dumpObj);
    return res.json({ ok: true, ...result });
  } catch (e: any) {
    console.error("[api/db/import] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Upload and import SQL dump (supports both legacy DD/MM/YY and modern YYYY-MM-DD formats)
const dumpUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

app.post("/api/db/import-legacy", dumpUpload.single("dump"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No dump file uploaded" });
    }

    console.log(`[api/db/import-legacy] Received file: ${req.file.originalname}, size: ${(req.file.size / 1024).toFixed(2)} KB`);

    // Check if file has legacy dates
    const originalContent = req.file.buffer.toString('utf-8');
    const hadLegacyDates = dumpConverterService.hasLegacyDates(originalContent);

    let finalContent = originalContent;
    let convertedSizes = {
      originalSize: req.file.size,
      convertedSize: req.file.size
    };
    let warnings: string[] = [];

    // Convert legacy dates if detected
    if (hadLegacyDates) {
      console.log('[api/db/import-legacy] Legacy dates detected, converting...');
      const converted = dumpConverterService.convertDumpFromBuffer(
        req.file.buffer,
        req.file.originalname
      );
      finalContent = converted.convertedContent;
      convertedSizes = {
        originalSize: converted.originalSize,
        convertedSize: converted.convertedSize
      };
    } else {
      console.log('[api/db/import-legacy] No legacy dates detected, importing as-is');
    }

    // Sanitize dump for compatibility (handles partial dumps, different formats, etc.)
    const sanitized = dumpConverterService.sanitizeDump(finalContent);
    finalContent = sanitized.sanitized;
    warnings = sanitized.warnings;

    if (warnings.length > 0) {
      console.log('[api/db/import-legacy] Dump sanitized with warnings:', warnings);
    }

    // Save dump to temporary file for import (use collector temp base)
    const tmpDumpPath = path.join(TMP_DIR_BASE, `import_${Date.now()}.sql`);
    fs.writeFileSync(tmpDumpPath, finalContent, 'utf-8');

    console.log(`[api/db/import-legacy] Dump saved to: ${tmpDumpPath}`);

    // Get import options from query params
    const clearBefore = req.query.clearBefore === 'true';
    const skipCreateTable = req.query.skipCreateTable === 'true';

    // Execute SQL dump using dbService
    // Import the SQL file with options
    const result = await dbService.executeSqlFile(tmpDumpPath, {
      failOnError: false,
      clearBefore,
      skipCreateTable
    });

    // Clean up temporary file
    try {
      fs.unlinkSync(tmpDumpPath);
    } catch (e) {
      console.warn(`[api/db/import-legacy] Failed to delete temp file: ${tmpDumpPath}`, e);
    }

    return res.json({
      ok: true,
      message: "Dump importado com sucesso",
      hadLegacyDates,
      originalSize: convertedSizes.originalSize,
      convertedSize: convertedSizes.convertedSize,
      dateConversionApplied: hadLegacyDates,
      clearBefore,
      skipCreateTable,
      warnings,
      result
    });
  } catch (e: any) {
    console.error("[api/db/import-legacy] error", e);
    return res.status(500).json({
      error: e?.message || "Erro ao importar dump",
      details: e?.stack
    });
  }
});
// PAU NO SEU CU

// Export database as SQL dump file
app.get("/api/db/export-sql", async (req, res) => {
  try {
    console.log('[api/db/export-sql] Generating SQL dump...');

    const result = await dbService.exportSqlDump();

    console.log(`[api/db/export-sql] Dump generated: ${result.filePath}, ${(result.size / 1024).toFixed(2)} KB`);

    // Read the file and send it as download
    const fileContent = fs.readFileSync(result.filePath, 'utf-8');
    const filename = path.basename(result.filePath);

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', result.size);

    return res.send(fileContent);
  } catch (e: any) {
    console.error("[api/db/export-sql] error", e);
    return res.status(500).json({
      error: e?.message || "Erro ao exportar dump",
      details: e?.stack
    });
  }
});

// Clear cache DB used by cacheService (deprecated - no longer needed)
app.post("/api/cache/clear", async (req, res) => {
  try {
    return res.json({ ok: true, message: 'Cache system removed - no-op endpoint' });
  } catch (e: any) {
    console.error("[api/cache/clear] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Unified clear all: DB + backups
app.post("/api/clear/all", async (req, res) => {
  try {
    await backupSvc.listBackups();
    // perform clears
    await dbService.clearAll();
    try {
      await backupSvc.clearAllBackups();
    } catch (e) {
      console.warn("[api/clear/all] clearing backups failed", e);
    }
    return res.json({ ok: true });
  } catch (e: any) {
    console.error("[api/clear/all] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Clear production data but keep users and materia prima with default setup
app.post("/api/clear/production", async (req, res) => {
  try {
    // Clear production tables (keep User; MateriaPrima will be reset below)
    const relatorioRepo = AppDataSource.getRepository(Relatorio);
    const batchRepo = AppDataSource.getRepository(Batch);
    const rowRepo = AppDataSource.getRepository(Row);
    const estoqueRepo = AppDataSource.getRepository(Estoque);
    const movimentacaoRepo = AppDataSource.getRepository(MovimentacaoEstoque);
    const materiaPrimaRepo = AppDataSource.getRepository(MateriaPrima);
    const amendoimRepo = AppDataSource.getRepository(Amendoim);

    // Clear child tables first to avoid FK constraint issues when possible.
    // We'll attempt normal TypeORM clears in a safe order and fallback to a MySQL-specific
    // disable-foreign-keys + TRUNCATE approach if we hit ER_TRUNCATE_ILLEGAL_FK.
    const tryNormalClear = async () => {
      // Order: deepest children first, then parents
      await movimentacaoRepo.clear(); // references estoque
      await estoqueRepo.clear(); // references materia_prima
      await rowRepo.clear(); // references batch
      await batchRepo.clear(); // references relatorio
      await relatorioRepo.clear();
      await amendoimRepo.clear(); // clear amendoim table
      // await materiaPrimaRepo.clear(); // now safe to clear (estoque already cleared)
    };

    try {
      await tryNormalClear();
    } catch (e: any) {
      console.warn('[api/clear/production] normal clear failed, attempting fallback:', e?.message || e);
      // If MySQL and the error is due to truncation with FK, try a safe raw SQL fallback
      const driverType = (AppDataSource.options as any)?.type || '';
      if ((driverType === 'mysql' || driverType === 'mariadb') && e?.code === 'ER_TRUNCATE_ILLEGAL_FK') {
        const manager = AppDataSource.manager;
        try {
          await manager.query('SET FOREIGN_KEY_CHECKS=0');
          // Truncate or delete in order: deepest child tables first
          const tables = ['movimentacao_estoque', 'estoque', 'row', 'batch', 'relatorio', 'amendoim'];
          for (const t of tables) {
            try {
              await manager.query(`TRUNCATE TABLE \`${t}\``);
            } catch (inner) {
              // fallback to DELETE if truncate fails for any reason
              try {
                await manager.query(`DELETE FROM \`${t}\``);
              } catch (errDel) {
                console.warn(`[api/clear/production] failed to truncate/delete table ${t}:`, errDel);
              }
            }
          }
        } finally {
          try {
            await manager.query('SET FOREIGN_KEY_CHECKS=1');
          } catch (re) {
            console.warn('[api/clear/production] failed to re-enable FK checks:', re);
          }
        }
      } else {
        // Not a MySQL FK truncation error or unknown driver: rethrow to surface the error
        throw e;
      }
    }

    // Reset MateriaPrima to default products after clearing (already cleared above)
    // let defaultProducts = [];
    // // Setup default products (example products - adjust as needed)
    // for (let i = 1; i <= 40; i++) {
    //   defaultProducts.push({
    //     num: i,
    //     produto: `Produto ${i}`,
    //     medida: 1, // kg
    //   });
    // }

    // for (const prod of defaultProducts) {
    //   try {
    //     const newProduct = materiaPrimaRepo.create(prod);
    //     await materiaPrimaRepo.save(newProduct);
    //   } catch (e) {
    //     console.warn(
    //       "[api/clear/production] failed to create default product:",
    //       prod,
    //       e
    //     );
    //   }
    // }

    // Clear collector cache (file tracking)
    try {
      // Clear CacheService database (collector file metadata)
      if (cacheService) {
        await cacheService.init();
        await cacheService.clearAll();
        console.log('[api/clear/production] collector cache cleared');
      }

      // Clear AmendoimCollector change detection cache (in-memory)
      AmendoimCollectorService.clearChangeCache();
    } catch (e) {
      console.warn("[api/clear/production] clearing collector cache failed", e);
    }

    // Clear backups (optional)
    try {
      await backupSvc.clearAllBackups();
    } catch (e) {
      console.warn("[api/clear/production] clearing backups failed", e);
    }

    return res.json({
      ok: true,
      message:
        "Production data cleared successfully. Users preserved, MateriaPrima reset to defaults, collector cache cleared. Amendoim data cleared.",
    });
  } catch (e: any) {
    console.error("[api/clear/production] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

app.get("/api/backup/list", async (req, res) => {
  try {
    const data = await backupSvc.listBackups();
    return res.json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/file/process", async (req, res) => {
  try {
    const filePath = String(req.query.filePath || req.query.path || "");
    if (!filePath)
      return res.status(400).json({ error: "filePath is required" });
    const r = await fileProcessorService.processFile(filePath);
    return res.json({ meta: r.meta, rowsCount: r.parsed.rowsCount });
  } catch (e: any) {
    console.error(e);
    return res
      .status(e?.status || 500)
      .json({ error: e?.message || "internal" });
  }
});

// Upload CSV and import into DB. Form field: `file` (multipart/form-data)
// Ensure multer writes to the configured temp base dir
const upload = multer({ dest: TMP_DIR_BASE });
app.post("/api/file/upload", upload.single("file"), async (req, res) => {
  const startTime = Date.now();
  try {
    const f: any = req.file;
    if (!f)
      return res
        .status(400)
        .json({ error: "file is required (field name: file)" });
    // Determine the saved path (multer uses f.path in some setups, otherwise use destination+filename)
    const savedPath =
      f.path || (f.destination ? path.join(f.destination, f.filename) : null);
    if (!savedPath || !fs.existsSync(savedPath))
      return res
        .status(500)
        .json({ error: "uploaded file not found on server" });

    console.log(`[Upload] File received: ${f.originalname} (${f.size} bytes)`);

    // Use fileProcessorService instead of direct parser to get proper conversions
    const parseStart = Date.now();
    const result = await fileProcessorService.processFile(savedPath);
    console.log(`[Upload] Processing completed in ${Date.now() - parseStart}ms (${result.parsed.rowsCount} rows)`);

    const totalTime = Date.now() - startTime;
    console.log(`[Upload] Total process time: ${totalTime}ms`);

    return res.json({
      ok: true,
      meta: result.meta,
      processed: {
        rowsCount: result.parsed.rowsCount,
        processedPath: result.parsed.processedPath,
        isLegacyFormat: result.parsed.isLegacyFormat || false,
      },
      performance: {
        totalTimeMs: totalTime,
        rowsPerSecond: result.parsed.rowsCount > 0 ? Math.round((result.parsed.rowsCount / totalTime) * 1000) : 0
      }
    });
  } catch (e: any) {
    console.error("[api/file/upload] error:", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Converter CSV legado para novo formato
app.post("/api/file/convert", upload.single("file"), async (req, res) => {
  try {
    const f: any = req.file;
    if (!f)
      return res
        .status(400)
        .json({ error: "file is required (field name: file)" });

    const savedPath = f.path || (f.destination ? path.join(f.destination, f.filename) : null);
    if (!savedPath || !fs.existsSync(savedPath))
      return res
        .status(500)
        .json({ error: "uploaded file not found on server" });

    console.log(`[Convert] File received: ${f.originalname} (${f.size} bytes)`);

    // Converter arquivo
    const result = await csvConverterService.convertLegacyCSV(savedPath);

    if (!result.success) {
      return res.status(500).json({
        error: "Conversão falhou",
        details: result.errors
      });
    }

    // Ler arquivo convertido
    const convertedContent = fs.readFileSync(result.outputPath, 'utf8');

    // Limpar arquivos temporários
    try {
      if (fs.existsSync(savedPath)) fs.unlinkSync(savedPath);
      if (fs.existsSync(result.outputPath)) fs.unlinkSync(result.outputPath);
    } catch (cleanupErr) {
      console.warn("[Convert] Cleanup error:", cleanupErr);
    }

    console.log(`[Convert] Conversion completed: ${result.rowsConverted} rows, ${result.errors.length} errors`);

    return res.json({
      ok: true,
      rowsProcessed: result.rowsProcessed,
      rowsConverted: result.rowsConverted,
      errors: result.errors,
      convertedData: convertedContent
    });

  } catch (e: any) {
    console.error("[api/file/convert] error:", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

app.get("/api/ihm/fetchLatest", async (req, res) => {
  try {
    const ip = String(req.query.ip || "");
    const user = String(req.query.user || "anonymous");
    const password = String(req.query.password || "");
    if (!ip) return res.status(400).json({ error: "ip is required" });
    const tmpDir = path.resolve(
      process.cwd(),
      process.env.COLLECTOR_TMP || "tmp"
    );
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const ihm = new IHMService(ip, user, password);
    const downloaded = await ihm.findAndDownloadNewFiles(tmpDir);
    if (!downloaded || downloaded.length === 0)
      return res.json({ ok: true, message: "Nenhum CSV novo encontrado" });
    const result = downloaded[0];
    const fileStat = fs.statSync(result.localPath);
    const fileObj: any = {
      originalname: result.name,
      path: result.localPath,
      mimetype: "text/csv",
      size: fileStat.size,
    };
    const meta = await backupSvc.backupFile(fileObj);
    const processed = await parserService.processFile(
      meta.workPath || meta.backupPath
    );
    return res.json({ meta, processed });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Central helper to apply advancedFilters to a QueryBuilder
function applyAdvancedFiltersToQuery(
  qb: any,
  advancedFilters: any,
  materiasByNum: Record<number, any> = {}
) {
  if (!advancedFilters || typeof advancedFilters !== 'object') return qb;

  const asNums = (arr: any[]) => Array.from(
    new Set((arr || [])
      .map((x: any) => Number(x))
      .filter(n => Number.isFinite(n) && n >= 1 && n <= 40))
  ).slice(0, 200);

  // exclude by product codes
  const excludeCodes = asNums(advancedFilters.excludeProductCodes || []);
  if (excludeCodes.length) {
    const conditions = excludeCodes.map(n => `r.Prod_${n} > 0`).join(' OR ');
    qb.andWhere(`NOT (${conditions})`);
  }

  // include by product codes
  const includeCodes = asNums(advancedFilters.includeProductCodes || []);
  if (includeCodes.length) {
    const conditions = includeCodes.map(n => `r.Prod_${n} > 0`).join(' OR ');
    qb.andWhere(`(${conditions})`);
  }

  // map names -> nums using materiasByNum
  const matchMode = advancedFilters.matchMode === 'exact' ? 'exact' : 'contains';
  const mapNamesToNums = (names: any[]) => {
    if (!names || !names.length) return [];
    const searchTerms = names.map((s: any) => String(s).toLowerCase().trim());
    const nums: number[] = [];
    Object.entries(materiasByNum).forEach(([k, v]: any) => {
      const prodName = String(v.produto || v.nome || '').toLowerCase();
      for (const term of searchTerms) {
        if (!term) continue;
        if (matchMode === 'exact') {
          if (prodName === term) nums.push(Number(k));
        } else {
          if (prodName.includes(term)) nums.push(Number(k));
        }
      }
    });
    return Array.from(new Set(nums)).slice(0, 200);
  };

  const includeNameCodes = mapNamesToNums(advancedFilters.includeProductNames || []);
  if (includeNameCodes.length) {
    const conditions = includeNameCodes.map(n => `r.Prod_${n} > 0`).join(' OR ');
    qb.andWhere(`(${conditions})`);
  }

  const excludeNameCodes = mapNamesToNums(advancedFilters.excludeProductNames || []);
  if (excludeNameCodes.length) {
    const conditions = excludeNameCodes.map(n => `r.Prod_${n} > 0`).join(' OR ');
    qb.andWhere(`NOT (${conditions})`);
  }

  // formulas include/exclude
  if (Array.isArray(advancedFilters.includeFormulas) && advancedFilters.includeFormulas.length) {
    const formulas = advancedFilters.includeFormulas.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n));
    if (formulas.length) qb.andWhere('r.Form1 IN (:...arrIncludeFormulas)', { arrIncludeFormulas: formulas });
  }
  if (Array.isArray(advancedFilters.excludeFormulas) && advancedFilters.excludeFormulas.length) {
    const formulas = advancedFilters.excludeFormulas.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n));
    if (formulas.length) qb.andWhere('r.Form1 NOT IN (:...arrExcludeFormulas)', { arrExcludeFormulas: formulas });
  }

  // formula names (LOWER(r.Nome) LIKE ...)
  if (Array.isArray(advancedFilters.includeFormulaNames) && advancedFilters.includeFormulaNames.length) {
    const formulaNames = (advancedFilters.includeFormulaNames || []).map((s: any) => String(s).toLowerCase().trim()).filter(Boolean);
    if (formulaNames.length) {
      const conditions = formulaNames.map((_: string, i: number) => `LOWER(r.Nome) LIKE :includeFormulaName${i}`).join(' OR ');
      qb.andWhere(`(${conditions})`);
      formulaNames.forEach((name: string, i: number) => qb.setParameter(`includeFormulaName${i}`, `%${name}%`));
    }
  }

  if (Array.isArray(advancedFilters.excludeFormulaNames) && advancedFilters.excludeFormulaNames.length) {
    const formulaNames = (advancedFilters.excludeFormulaNames || []).map((s: any) => String(s).toLowerCase().trim()).filter(Boolean);
    if (formulaNames.length) {
      const conditions = formulaNames.map((_: string, i: number) => `LOWER(r.Nome) NOT LIKE :excludeFormulaName${i}`).join(' AND ');
      qb.andWhere(`(${conditions})`);
      formulaNames.forEach((name: string, i: number) => qb.setParameter(`excludeFormulaName${i}`, `%${name}%`));
    }
  }

  return qb;
}

app.get("/api/relatorio/paginate", async (req, res) => {
  const startTime = Date.now();
  try {
    // Verificar conexão do banco
    if (!AppDataSource.isInitialized) {
      console.warn('[relatorio/paginate] ⚠️ Database não inicializado, inicializando...');
    }

    // Parse and validate pagination params to avoid passing NaN/invalid values to TypeORM
    const pageRaw = req.query.page;
    const pageSizeRaw = req.query.pageSize;
    const allRaw = String(req.query.all || "").toLowerCase();
    const returnAll = allRaw === "true" || allRaw === "1";
    const pageNum = ((): number => {
      const n = Number(pageRaw);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
    })();
    const pageSizeNum = ((): number => {
      const n = Number(pageSizeRaw);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 100;
    })();

    // Separate filters: `codigo` (Form1 generated by IHM), `numero` (Form2 provided by user), and `formula` (name or code)
    const codigoRaw = req.query.codigo ?? null;
    const numeroRaw = req.query.numero ?? null;
    const formulaRaw = req.query.formula ?? null;
    const dataInicio = req.query.dataInicio ?? null;
    const dataFim = req.query.dataFim ?? null;
    // Normalize date params to yyyy-mm-dd when present
    const normDataInicio = normalizeDateParam(dataInicio) || null;
    const normDataFim = normalizeDateParam(dataFim) || null;
    const sortBy = String(req.query.sortBy || "Dia");
    const sortDir = String(req.query.sortDir || "DESC");
    const includeProducts =
      String(req.query.includeProducts || "true") === "true"; // Default to true for values
    // If includeIgnored=true, include products even if they are deactivated or marked ignorarCalculos
    const includeIgnored = String(req.query.includeIgnored || "").toLowerCase() === "true";

    try {
    } catch (dbError: any) {
      console.error(
        "[relatorio/paginate] Database initialization failed:",
        dbError
      );
      return res.status(500).json({
        error: "Database connection failed",
        details: dbError?.message,
      });
    }

    const repo = AppDataSource.getRepository(Relatorio);
    let qb = repo.createQueryBuilder("r");

    // Apply separate numeric filters when provided
    if (codigoRaw != null && String(codigoRaw) !== "") {
      const c = Number(codigoRaw);
      if (!Number.isNaN(c)) {
        qb.andWhere("r.Form1 = :c", { c });
      }
    }

    if (numeroRaw != null && String(numeroRaw) !== "") {
      const num = Number(numeroRaw);
      if (!Number.isNaN(num)) {
        qb.andWhere("r.Form2 = :num", { num });
      }
    }

    // Support filtering by formula: numeric => Form1, string => Nome like
    if (formulaRaw != null && String(formulaRaw) !== "") {
      const fNum = Number(String(formulaRaw));
      if (!Number.isNaN(fNum)) {
        qb.andWhere("r.Form1 = :fNum", { fNum });
      } else {
        const fStr = String(formulaRaw).toLowerCase();
        qb.andWhere("LOWER(r.Nome) LIKE :fStr", { fStr: `%${fStr}%` });
      }
    }

    if (normDataInicio) qb.andWhere("r.Dia >= :ds", { ds: normDataInicio });
    // For inclusive end-date when Dia is date-only, compare with exclusive next day
    if (normDataFim) {
      // compute next day
      const parts = normDataFim.split("-");
      let dePlus = normDataFim;
      try {
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        dePlus = `${y}-${m}-${d}`;
      } catch (e) {
        dePlus = normDataFim;
      }
      qb.andWhere("r.Dia < :dePlus", { dePlus });
    }

    // Allow sorting by Prod_1..Prod_40 (dynamic product columns)
    const allowed = new Set([
      "Dia",
      "Hora",
      "Nome",
      "Form1",
      "Form2",
      // "processedFile",
    ]);
    // Also allow Prod_1 through Prod_40
    for (let i = 1; i <= 65; i++) {
      allowed.add(`Prod_${i}`);
    }
    const sb = allowed.has(sortBy) ? sortBy : "Dia";
    const sd = sortDir === "ASC" ? "ASC" : "DESC";
    // If sorting by Dia (default), add secondary ordering by Hora to guarantee deterministic order
    if (sb === 'Dia') {
      qb.orderBy(`r.Dia`, sd).addOrderBy('r.Hora', sd as any);
    } else {
      qb.orderBy(`r.${sb}`, sd);
    }

    // Always include products for values mapping
    const offset = (pageNum - 1) * pageSizeNum;
    const take = pageSizeNum;

    // Carregar materias para permitir mapeamento nomes->nums e aplicar filtros avançados
    const materiasByNum = await getMateriaPrimaCache();

    // Aplicar advancedFilters vindos por query string (se houver)
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(decodeURIComponent(advancedFiltersRaw));
      } catch (e) {
        console.warn('[relatorio/paginate] Erro ao parsear advancedFilters:', e);
      }
    }

    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);



    let rows: any[] = [];
    let total = 0;

    try {
      if (returnAll) {
        rows = await qb.getMany();
        total = rows.length;
      } else {
        [rows, total] = await qb.skip(offset).take(take).getManyAndCount();
      }
    } catch (queryError: any) {
      console.error("[relatorio/paginate] Query execution failed:", queryError);
      return res
        .status(500)
        .json({ error: "Database query failed", details: queryError?.message });
    }

    // Map rows to include values array from Prod_1 to Prod_65
    // Normalize product values according to MateriaPrima.measure (grams->kg)
    // OTIMIZAÇÃO: Usar cache em vez de consultar banco a cada request

    // 🔍 Obter produtos ativos para filtrar inativos (a menos que client peça incluir todos via includeIgnored)
    const produtosAtivos = includeIgnored ? null : await getProdutosAtivos();

    // OTIMIZAÇÃO: Pré-alocar arrays com tamanho fixo
    const mappedRows = rows.map((row: any) => {
      const values: string[] = new Array(65);
      const valuesRaw: number[] = new Array(65);
      const unidades: string[] = new Array(65);

      for (let i = 1; i <= 65; i++) {
        const prodValue = row[`Prod_${i}`];
        let v =
          typeof prodValue === "number"
            ? prodValue
            : prodValue != null
              ? Number(prodValue)
              : 0;
        const materia = materiasByNum[i];

        // ⚠️ FILTRO: Se produto está inativo, zerar valor (aplica somente quando produtosAtivos foi carregado)
        if (produtosAtivos && !produtosAtivos.has(i)) {
          v = 0;
        }

        // Garantir que não há valores negativos (dados corrompidos)
        if (v < 0) v = 0;

        // valuesRaw: SEMPRE valor original do banco de dados (sem conversão, sem negativos)
        const idx = i - 1;
        valuesRaw[idx] = v;

        // Determinar unidade e formatar valor com 3 casas decimais
        // OTIMIZAÇÃO: Usar acesso direto ao índice em vez de push
        if (materia && Number(materia.medida) === 0) {
          // Produto em gramas: converter para kg e formatar
          unidades[idx] = 'g';
          values[idx] = (v / 1000).toFixed(3);
        } else {
          // Produto em kg: formatar direto
          unidades[idx] = 'kg';
          values[idx] = v.toFixed(3);
        }
      }

      return {
        Dia: row.Dia || "",
        Hora: row.Hora || "",
        Nome: row.Nome || "",
        Codigo: row.Form1 ?? 0,
        Numero: row.Form2 ?? 0,
        values,
        valuesRaw,
        unidades,
      };
    });

    const totalPages = Math.ceil(total / pageSizeNum);

    // 🔍 Detectar colunas vazias (produtos sem valor em nenhuma linha)
    const usedProductIndices = new Set<number>();
    for (const row of mappedRows) {
      for (let i = 0; i < 65; i++) {
        const rawValue = row.valuesRaw[i];
        if (rawValue > 0) {
          usedProductIndices.add(i); // 0-indexed for products array
        }
      }
    }

    // Criar array booleano indicando quais produtos estão vazios
    // emptyColumns.products[i] = true se produto i está vazio, false se tem dados
    const emptyProductsArray = new Array(65);
    for (let i = 0; i < 65; i++) {
      emptyProductsArray[i] = !usedProductIndices.has(i); // true se NÃO está em usedProductIndices
    }

    const emptyColumns = {
      products: emptyProductsArray,
    };

    const responseData = {
      rows: mappedRows,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages,
      emptyColumns,
    };

    const duration = Date.now() - startTime;
    const emptyCount = emptyProductsArray.filter(e => e).length;
    console.log(`[relatorio/paginate] ✅ Query completed in ${duration}ms (${rows.length} rows), empty products: ${emptyCount}`);

    // Headers para otimização de navegador (sem cache de servidor)
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });

    return res.json(responseData);
  } catch (e: any) {
    console.error("[relatorio/paginate] Unexpected error:", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// 🔍 Endpoint especializado: Detecta colunas vazias em TODO o período/filtro (sem paginação)
app.get("/api/relatorio/empty-columns", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);
    let qb = repo.createQueryBuilder("r");

    // Aplicar os MESMOS filtros do paginate
    const codigoRaw = req.query.codigo ?? null;
    const numeroRaw = req.query.numero ?? null;
    const formulaRaw = req.query.formula ?? null;
    const dataInicio = req.query.dataInicio ?? null;
    const dataFim = req.query.dataFim ?? null;
    
    const normDataInicio = normalizeDateParam(dataInicio) || null;
    const normDataFim = normalizeDateParam(dataFim) || null;

    // Aplicar filtros
    if (codigoRaw != null && String(codigoRaw) !== "") {
      const c = Number(codigoRaw);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :c", { c });
    }

    if (numeroRaw != null && String(numeroRaw) !== "") {
      const num = Number(numeroRaw);
      if (!Number.isNaN(num)) qb.andWhere("r.Form2 = :num", { num });
    }

    if (formulaRaw != null && String(formulaRaw) !== "") {
      const fNum = Number(String(formulaRaw));
      if (!Number.isNaN(fNum)) {
        qb.andWhere("r.Form1 = :fNum", { fNum });
      } else {
        const fStr = String(formulaRaw).toLowerCase();
        qb.andWhere("LOWER(r.Nome) LIKE :fStr", { fStr: `%${fStr}%` });
      }
    }

    if (normDataInicio) qb.andWhere("r.Dia >= :ds", { ds: normDataInicio });
    if (normDataFim) {
      const parts = normDataFim.split("-");
      let dePlus = normDataFim;
      try {
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        dt.setDate(dt.getDate() + 1);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        dePlus = `${y}-${m}-${d}`;
      } catch (e) {
        dePlus = normDataFim;
      }
      qb.andWhere("r.Dia < :dePlus", { dePlus });
    }

    // Aplicar advancedFilters se houver
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(decodeURIComponent(advancedFiltersRaw));
      } catch (e) {
        console.warn('[relatorio/empty-columns] Erro ao parsear advancedFilters:', e);
      }
    }

    const materiasByNum = await getMateriaPrimaCache();
    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);

    // 🔑 CHAVE: Buscar TODOS os rows (sem paginação) apenas para analisar produtos usados
    const allRows = await qb.getMany();

    // 🔍 Detectar quais produtos têm dados em QUALQUER linha do período
    const usedProductIndices = new Set<number>();
    for (const row of allRows) {
      for (let i = 1; i <= 65; i++) {
        const prodValue = row[`Prod_${i}`];
        const v = typeof prodValue === "number" ? prodValue : (prodValue != null ? Number(prodValue) : 0);
        if (v > 0) {
          usedProductIndices.add(i - 1); // 0-indexed
        }
      }
    }

    // Criar array booleano: true = VAZIO (não usado em nenhuma linha), false = TEM DADOS
    const emptyProductsArray = new Array(65);
    for (let i = 0; i < 65; i++) {
      emptyProductsArray[i] = !usedProductIndices.has(i);
    }

    const emptyColumns = {
      products: emptyProductsArray,
    };

    const emptyCount = emptyProductsArray.filter(e => e).length;
    console.log(`[relatorio/empty-columns] ✅ Analyzed ${allRows.length} total rows, empty products: ${emptyCount}`);

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });

    return res.json(emptyColumns);
  } catch (e: any) {
    console.error("[relatorio/empty-columns] Error:", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// PDF DATA: Retorna dados TOTALMENTE processados, calculados e formatados para PDF
app.get("/api/relatorio/pdf-data", async (req, res) => {
  try {
    // Mesmos filtros do paginate
    const codigoRaw = req.query.codigo ?? null;
    const numeroRaw = req.query.numero ?? null;
    const formulaRaw = req.query.formula ?? null;
    const dataInicio = req.query.dataInicio ?? null;
    const dataFim = req.query.dataFim ?? null;
    const normDataInicio = normalizeDateParam(dataInicio) || null;
    const normDataFim = normalizeDateParam(dataFim) || null;
    const sortBy = String(req.query.sortBy || "Dia");
    const sortDir = String(req.query.sortDir || "DESC");

    const repo = AppDataSource.getRepository(Relatorio);
    const qb = repo.createQueryBuilder("r");

    // Aplicar filtros
    if (codigoRaw != null && String(codigoRaw) !== "") {
      const c = Number(codigoRaw);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :c", { c });
    }
    if (numeroRaw != null && String(numeroRaw) !== "") {
      const num = Number(numeroRaw);
      if (!Number.isNaN(num)) qb.andWhere("r.Form2 = :num", { num });
    }
    if (formulaRaw != null && String(formulaRaw) !== "") {
      const fNum = Number(String(formulaRaw));
      if (!Number.isNaN(fNum)) qb.andWhere("r.Form1 = :fNum", { fNum });
      else {
        const fStr = String(formulaRaw).toLowerCase();
        qb.andWhere("LOWER(r.Nome) LIKE :fStr", { fStr: `%${fStr}%` });
      }
    }
    if (normDataInicio) qb.andWhere("r.Dia >= :ds", { ds: normDataInicio });
    if (normDataFim) {
      const parts = normDataFim.split("-");
      let dePlus = normDataFim;
      try {
        const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        dt.setDate(dt.getDate() + 1);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        dePlus = `${y}-${m}-${d}`;
      } catch (e) {
        dePlus = normDataFim;
      }
      qb.andWhere("r.Dia < :dePlus", { dePlus });
    }

    // Sort
    const allowed = new Set(["Dia", "Hora", "Nome", "Form1", "Form2"]);
    for (let i = 1; i <= 65; i++) allowed.add(`Prod_${i}`);
    const sb = allowed.has(sortBy) ? sortBy : "Dia";
    const sd = sortDir === "ASC" ? "ASC" : "DESC";
    if (sb === 'Dia') {
      qb.orderBy(`r.Dia`, sd).addOrderBy('r.Hora', sd as any);
    } else {
      qb.orderBy(`r.${sb}`, sd);
    }

    const rows = await qb.getMany();

    // Carregar matérias primas
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Filtrar produtos inativos e produtos marcados para ignorar cálculos (semana charts devem respeitar ignorarCalculos)
    const produtosAtivos = await getProdutosAtivos(true);
    console.log(`[api/chartdata/semana] Produtos ativos (excluindo ignorarCalculos): ${produtosAtivos.size}`);

    // 🔁 manter comportamento antigo: não excluir produtos marcados como ignorarCalculos para relatórios/PDF

    // PROCESSAR DADOS PARA PDF: Calcular totais, formatar valores, gráficos
    const produtos: Array<{ nome: string; qtd: number; unidade: string; valorFormatado: string }> = [];

    // Mapa: produto index -> total acumulado
    const produtoTotals: Record<number, number> = {};

    for (const row of rows) {
      for (let i = 1; i <= 65; i++) {
        const val = row[`Prod_${i}`];
        let v = typeof val === "number" ? val : (val != null ? Number(val) : 0);
        if (v < 0) v = 0;

        if (!produtoTotals[i]) produtoTotals[i] = 0;
        produtoTotals[i] += v;
      }
    }

    // Gerar array de produtos com totais calculados e formatados
    // Importante: para o PDF queremos os cálculos como se o flag `ignorarCalculos` não existisse,
    // porém devemos excluir produtos que estejam explicitamente desativados (materia.ativo === false).
    for (let i = 1; i <= 65; i++) {
      const total = produtoTotals[i] || 0;
      if (total === 0) continue; // Skip produtos sem uso

      const materia = materiasByNum[i];
      // Se a matéria-prima existe e está desativada, não deve entrar nos cálculos/relatório PDF
      if (materia && materia.ativo === false) continue;

      const nome = materia?.produto || `Produto ${i}`;

      let unidade = 'kg';
      let valorKg = total;
      let valorFormatado = '';

      if (materia && Number(materia.medida) === 0) {
        // Gramas: converter para kg
        unidade = 'g';
        valorKg = total / 1000;
      }

      valorFormatado = `${valorKg.toLocaleString('pt-BR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      })} kg`;

      produtos.push({
        nome,
        qtd: valorKg, // SEMPRE em kg
        unidade,
        valorFormatado,
      });
    }

    // Ordenar por quantidade (maior -> menor)
    produtos.sort((a, b) => b.qtd - a.qtd);

    // GRÁFICOS: Top 5 produtos
    const chartTop5 = produtos.slice(0, 5).map(p => ({
      nome: p.nome,
      valor: p.qtd, // Já em kg
      valorFormatado: p.valorFormatado,
      percentual: 0 // Será calculado no frontend se necessário, ou aqui:
    }));

    // Calcular percentuais
    const totalGeral = produtos.reduce((sum, p) => sum + p.qtd, 0);
    if (totalGeral > 0) {
      chartTop5.forEach(item => {
        item.percentual = (item.valor / totalGeral) * 100;
      });
    }

    // Dados de resumo
    const primeiroRow = rows[0];
    const ultimoRow = rows[rows.length - 1];

    const resumo = {
      totalRegistros: rows.length,
      dataInicio: primeiroRow?.Dia || '',
      dataFim: ultimoRow?.Dia || '',
      nomeFormula: primeiroRow?.Nome || '',
      codigoPrograma: primeiroRow?.Form1 || 0,
      codigoCliente: primeiroRow?.Form2 || 0,
    };

    // Retornar tudo processado
    res.json({
      produtos, // Array com { nome, qtd (em kg), unidade, valorFormatado }
      chartTop5, // Top 5 para gráfico
      resumo,
      materiaPrima: materias.map(m => ({
        num: m.num,
        produto: m.produto,
        medida: m.medida,
        unidade: Number(m.medida) === 0 ? 'g' : 'kg'
      }))
    });

  } catch (e: any) {
    console.error("[relatorio/pdf-data] Error:", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Export filtered relatorio rows to Excel
app.get("/api/relatorio/exportExcel", async (req, res) => {
  try {
    // Reuse same filters as paginate GET
    const codigoRaw = req.query.codigo ?? null;
    const numeroRaw = req.query.numero ?? null;
    const formulaRaw = req.query.formula ?? null;
    const dataInicio = req.query.dataInicio ?? null;
    const dataFim = req.query.dataFim ?? null;
    const normDataInicio = normalizeDateParam(dataInicio) || null;
    const normDataFim = normalizeDateParam(dataFim) || null;
    const sortBy = String(req.query.sortBy || "Dia");
    const sortDir = String(req.query.sortDir || "ASC");
    const repo = AppDataSource.getRepository(Relatorio);
    const qb = repo.createQueryBuilder("r");

    if (codigoRaw != null && String(codigoRaw) !== "") {
      const c = Number(codigoRaw);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :c", { c });
    }
    if (numeroRaw != null && String(numeroRaw) !== "") {
      const num = Number(numeroRaw);
      if (!Number.isNaN(num)) qb.andWhere("r.Form2 = :num", { num });
    }
    if (formulaRaw != null && String(formulaRaw) !== "") {
      const fNum = Number(String(formulaRaw));
      if (!Number.isNaN(fNum)) qb.andWhere("r.Form1 = :fNum", { fNum });
      else {
        const fStr = String(formulaRaw).toLowerCase();
        qb.andWhere("LOWER(r.Nome) LIKE :fStr", { fStr: `%${fStr}%` });
      }
    }
    if (normDataInicio) qb.andWhere("r.Dia >= :ds", { ds: normDataInicio });
    if (normDataFim) {
      const parts = normDataFim.split("-");
      let dePlus = normDataFim;
      try {
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        dePlus = `${y}-${m}-${d}`;
      } catch (e) {
        dePlus = normDataFim;
      }
      qb.andWhere("r.Dia < :dePlus", { dePlus });
    }

    const allowed = new Set(["Dia", "Hora", "Nome", "Form1", "Form2"]);
    const sb = allowed.has(sortBy) ? sortBy : "Dia";
    const sd = sortDir === "ASC" ? "ASC" : "DESC";
    qb.orderBy(`r.${sb}`, sd);
    // Ensure chronological order when sorting by Dia
    if (sb === "Dia") {
      qb.addOrderBy("r.Hora", "ASC");
    }

    const rows = await qb.getMany();

    // Load materia prima labels/units for normalization
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Build workbook
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Relatorio");

    // Header row: Dia, Hora, Nome, Codigo, Numero, Prod_1 ... Prod_65
    const headers = [
      "Dia",
      "Hora",
      "Nome",
      "Codigo do programa",
      "Codigo do cliente",
    ];
    for (let i = 1; i <= 65; i++) {
      // get product name if available
      const mp = materiasByNum[i];
      const unidade = mp?.unidade ?? (mp && Number(mp.medida) === 0 ? "kg" : "g");
      if (mp && mp.produto) headers.push(`${mp.produto} (${unidade})`);
      else headers.push(`Prod_${i} (${unidade})`);
    }
    ws.addRow(headers);

    for (const r of rows) {
      const rowArr: any[] = [];
      // Format date to dd/mm/yyyy
      let diaFormatted = r.Dia || "";
      if (diaFormatted && /^\d{4}-\d{2}-\d{2}$/.test(diaFormatted)) {
        const [y, m, d] = diaFormatted.split('-');
        diaFormatted = `${d}/${m}/${y}`;
      }
      rowArr.push(diaFormatted);
      rowArr.push(r.Hora || "");
      rowArr.push(r.Nome || "");
      rowArr.push(r.Form1 ?? "");
      rowArr.push(r.Form2 ?? "");
      for (let i = 1; i <= 65; i++) {
        let v =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;
        const mp = materiasByNum[i];
        // if (mp && Number(mp.medida) === 0 && v) v = v / 1000; // grams -> kg
        rowArr.push(v);
      }
      ws.addRow(rowArr);
    }

    // Set number format for product columns
    for (let col = 6; col < 6 + 65; col++) {
      const column = ws.getColumn(col);
      column.numFmt = "#,##0.##";
    }
    // consigo criar uma pagina para enviar os dados do materia prima tambem?
    const wsMateriais = wb.addWorksheet("Materiais");

    wsMateriais.addRow(["Num", "Produto", "Medida"]);
    for (const m of materias) {
      wsMateriais.addRow([m.num, m.produto, m.medida]);
    }

    // Stream workbook to response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_${dataInicio}-${dataFim}.xlsx`
    );
    await wb.xlsx.write(res as any);
    // signal end
    res.end();
  } catch (e: any) {
    console.error("[exportExcel] error", e);
    return res.status(500).json({ error: "internal", details: e?.message });
  }
});

// POST variant that accepts same body as paginate POST
app.post("/api/relatorio/exportExcel", async (req, res) => {
  try {
    const codigoRaw = req.body.codigo ?? null;
    const numeroRaw = req.body.numero ?? null;
    const formulaRaw = req.body.formula ?? null;
    const dataInicio = req.body.dataInicio ?? null;
    const dataFim = req.body.dataFim ?? null;
    const normDataInicio = normalizeDateParam(dataInicio) || null;
    const normDataFim = normalizeDateParam(dataFim) || null;
    const sortBy = String(req.body.sortBy || "Dia");
    const sortDir = String(req.body.sortDir || "ASC");
    const repo = AppDataSource.getRepository(Relatorio);
    const qb = repo.createQueryBuilder("r");

    if (codigoRaw != null && codigoRaw !== "") {
      const c = Number(codigoRaw);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :c", { c });
    }
    if (numeroRaw != null && numeroRaw !== "") {
      const num = Number(numeroRaw);
      if (!Number.isNaN(num)) qb.andWhere("r.Form2 = :num", { num });
    }
    if (formulaRaw != null && formulaRaw !== "") {
      const fNum = Number(formulaRaw);
      if (!Number.isNaN(fNum)) qb.andWhere("r.Form1 = :fNum", { fNum });
      else
        qb.andWhere("LOWER(r.Nome) LIKE :fStr", {
          fStr: `%${String(formulaRaw).toLowerCase()}%`,
        });
    }
    if (normDataInicio) qb.andWhere("r.Dia >= :ds", { ds: normDataInicio });
    if (normDataFim) {
      const parts = normDataFim.split("-");
      let dePlus = normDataFim;
      try {
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        dePlus = `${y}-${m}-${d}`;
      } catch (e) {
        dePlus = normDataFim;
      }
      qb.andWhere("r.Dia < :dePlus", { dePlus });
    }

    const allowed = new Set(["Dia", "Hora", "Nome", "Form1", "Form2"]);
    const sb = allowed.has(sortBy) ? sortBy : "Dia";
    const sd = sortDir === "ASC" ? "ASC" : "DESC";
    qb.orderBy(`r.${sb}`, sd);
    // Ensure chronological order when sorting by Dia
    if (sb === "Dia") {
      qb.addOrderBy("r.Hora", "ASC");
    }

    const rows = await qb.getMany();

    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Relatorio");
    const headers = ["Dia", "Hora", "Nome", "Codigo", "Numero"];
    for (let i = 1; i <= 65; i++) headers.push(`Prod_${i}`);
    ws.addRow(headers);
    for (const r of rows) {
      const rowArr: any[] = [];
      // Format date to dd/mm/yyyy
      let diaFormatted = r.Dia || "";
      if (diaFormatted && /^\d{4}-\d{2}-\d{2}$/.test(diaFormatted)) {
        const [y, m, d] = diaFormatted.split('-');
        diaFormatted = `${d}/${m}/${y}`;
      }
      rowArr.push(diaFormatted);
      rowArr.push(r.Hora || "");
      rowArr.push(r.Nome || "");
      rowArr.push(r.Form1 ?? "");
      rowArr.push(r.Form2 ?? "");
      for (let i = 1; i <= 65; i++) {
        let v =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;
        const mp = materiasByNum[i];
        // If product is stored in grams, keep raw for export but mark that it was grams (do not multiply)
        // The frontend and consumers should interpret units via materiaPrimaService
        rowArr.push(v);
      }
      ws.addRow(rowArr);
    }
    for (let col = 6; col < 6 + 40; col++)
      ws.getColumn(col).numFmt = "#,##0.##";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_${dataInicio}-${dataFim}.xlsx`
    );
    await wb.xlsx.write(res as any);
    res.end();
  } catch (e: any) {
    console.error("[exportExcel POST] error", e);
    return res.status(500).json({ error: "internal", details: e?.message });
  }
});

// --- Simple auth endpoints: register, login, upload photo
// Stores plain-text passwords (per user request). First registered user becomes admin.
// Determine a writable directory for user photos that works both in dev and in
// packaged/dist builds. Allow overriding via USER_PHOTOS_DIR env var.
const isDev = process.env.NODE_ENV !== "production";
const photosBase = process.env.USER_PHOTOS_DIR
  || (isDev ? path.resolve(process.cwd(), "user_photos") : path.resolve(process.env.APPDATA || os.homedir(), "Cortez", "user_photos"));

// Ensure folder exists and is writable
if (!fs.existsSync(photosBase)) fs.mkdirSync(photosBase, { recursive: true });

const userUpload = multer({ dest: photosBase });

// Serve uploaded profile photos from the chosen folder
app.use("/user_photos", express.static(photosBase));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, displayName, userType } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "usuário e senha requeridos" });
    const repo = AppDataSource.getRepository(User);
    const existing = await repo.findOne({ where: { username } });
    if (existing) return res.status(409).json({ error: "usuário já existe" });
    // If there are no users yet, make this one admin
    const usersCount = await repo.count();
    const isAdmin = usersCount === 0;
    let photoPath;
    if (!isAdmin) {
      // get this admin photo
      const adminUser = await repo.findOne({ where: { isAdmin: true } });
      if (adminUser && adminUser.photoPath) {
        // copy admin photo to new user
        const adminPhotoPath = path.join(photosBase, path.basename(adminUser.photoPath));
        const newPhotoName = `${username}_${Date.now()}${path.extname(adminPhotoPath)}`;
        const newPhotoPath = path.join(photosBase, newPhotoName);
        fs.copyFileSync(adminPhotoPath, newPhotoPath);
        photoPath = `/user_photos/${newPhotoName}`;
      }
    }
    const u = repo.create({
      username,
      password: password,
      displayName: displayName || null,
      photoPath,
      userType: userType || 'racao',
      isAdmin,
    });
    const saved = await repo.save(u as any);
    // Do not return password hash
    const { password: _pw, ...out } = saved as any;
    return res.json(out);
  } catch (e: any) {
    console.error("[auth/register] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "usuário e senha requeridos" });
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: "invalid" });
    if ((user as any).password !== password)
      return res.status(401).json({ error: "invalid" });
    const { password: _pw, ...out } = user as any;
    return res.json(out);
  } catch (e: any) {
    console.error("[auth/login] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

app.post("/api/auth/photo", userUpload.single("photo"), async (req, res) => {
  try {
    const f: any = req.file;
    const username = req.body.username;
    if (!username) return res.status(400).json({ error: "username required" });
    if (!f)
      return res
        .status(400)
        .json({ error: "photo file required (field: photo)" });
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: "user not found" });
    // move file to persistent path and store relative path
    const destDir = path.resolve(process.cwd(), "user_photos");
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const ext = path.extname(f.originalname || f.filename || "");
    const newName = `${username}_${Date.now()}${ext}`;
    const newPath = path.join(destDir, newName);
    fs.renameSync(f.path, newPath);
    // store a relative URL so frontend can access via /user_photos/<name>
    (user as any).photoPath = `/user_photos/${newName}`;
    await repo.save(user as any);
    const { password: _pw, ...out } = user as any;
    return res.json(out);
  } catch (e: any) {
    console.error("[auth/photo] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

app.post("/api/auth/update", async (req, res) => {
  try {
    const { username, displayName, userType } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: "user not found" });
    
    if (displayName !== undefined) (user as any).displayName = displayName;
    if (userType !== undefined) (user as any).userType = userType;
    
    await repo.save(user as any);
    const { passwordHash, ...out } = user as any;
    return res.json(out);
  } catch (e: any) {
    console.error("[auth/update] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Accept profile image as base64 data (JSON). This endpoint allows the frontend
// to store inline image data in the DB instead of relying on filesystem paths.
// NOTE: Inline base64 storage has been removed. Use multipart upload to /api/auth/photo instead.

// Endpoints to store/retrieve a report logo path in the settings store.
// The stored key will be 'report-logo-path' and will be used later when
// generating reports to include a logo image by path.
app.post("/api/report/logo", async (req, res) => {
  try {
    const { path: logoPath } = req.body || {};
    if (!logoPath) return res.status(400).json({ error: "path is required" });
    // Save as a single config key so it persists in DB via configService
    await configService.setSettings({ "report-logo-path": String(logoPath) });
    return res.json({ success: true, path: logoPath });
  } catch (e: any) {
    console.error("[report/logo] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

app.get("/api/report/logo", async (req, res) => {
  try {
    const val = await configService.getSetting("report-logo-path");
    return res.json({ path: val ?? null });
  } catch (e: any) {
    console.error("[report/logo:get] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Upload a logo file for reports. Accepts multipart ('photo') only (no base64 in DB)
app.post(
  "/api/report/logo/upload",
  // reuse multer for multipart fallback; if request is JSON it will be ignored
  userUpload.single("photo"),
  async (req, res) => {
    try {
      // Ensure folder exists
      const destDir = path.resolve(process.cwd(), "user_photos");
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      // If multipart file present, move it into destDir
      const f: any = req.file;
      if (f) {
        const ext = path.extname(f.originalname || f.filename || "") || ".png";
        const newName = `report_logo_${Date.now()}${ext}`;
        const newPath = path.join(destDir, newName);
        fs.renameSync(f.path, newPath);
        const relative = `/user_photos/${newName}`;
        await configService.setSettings({ "report-logo-path": relative });
        return res.json({ success: true, path: relative });
      }

      // Only multipart file uploads are accepted now. If no file present, return error.
      return res.status(400).json({ error: "photo file required (multipart form-data field 'photo')" });
    } catch (e: any) {
      console.error("[report/logo/upload] error", e);
      return res.status(500).json({ error: e?.message || "internal" });
    }
  }
);

// Admin helper: set a default profile photo path for all users
app.post("/api/admin/set-default-photo", async (req, res) => {
  try {
    const { path: photoPath } = req.body || {};
    if (!photoPath) return res.status(400).json({ error: "path is required" });

    const repo = AppDataSource.getRepository(User);

    // Bulk update all users to use the provided photoPath
    await repo.createQueryBuilder().update(User).set({ photoPath: String(photoPath) }).execute();

    return res.json({ success: true, path: photoPath });
  } catch (e: any) {
    console.error("[admin/set-default-photo] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
  }
});

// Admin: list users (public, but only useful to admin UI)
app.get('/api/admin/users', async (_req, res) => {
  try {
    const repo = AppDataSource.getRepository(User);
    const users = await repo.find();
    const sanitized = users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName, photoPath: u.photoPath, isAdmin: u.isAdmin, userType: u.userType }));
    return res.json({ ok: true, users: sanitized });
  } catch (e: any) {
    console.error('[admin/users] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal' });
  }
});

// Admin: delete a user by username or id
app.post('/api/admin/delete-user', async (req, res) => {
  try {
    const { username, id } = req.body || {};
    if (!username && !id) return res.status(400).json({ ok: false, error: 'username or id required' });
    const repo = AppDataSource.getRepository(User);
    if (id) {
      await repo.delete({ id: Number(id) });
    } else {
      await repo.delete({ username: String(username) });
    }
    return res.json({ ok: true });
  } catch (e: any) {
    console.error('[admin/delete-user] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal' });
  }
});

// Admin: toggle admin status
app.post('/api/admin/toggle-admin', async (req, res) => {
  try {
    const { username, id, isAdmin } = req.body || {};
    if ((!username && !id) || typeof isAdmin !== 'boolean') return res.status(400).json({ ok: false, error: 'username/id and isAdmin required' });
    const repo = AppDataSource.getRepository(User);
    const target = id ? await repo.findOne({ where: { id: Number(id) } }) : await repo.findOne({ where: { username: String(username) } });
    if (!target) return res.status(404).json({ ok: false, error: 'user not found' });
    target.isAdmin = isAdmin;
    await repo.save(target);
    return res.json({ ok: true, user: { id: target.id, username: target.username, isAdmin: target.isAdmin } });
  } catch (e: any) {
    console.error('[admin/toggle-admin] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal' });
  }
});

// Admin: set user password (plain-text) - used by Admin UI to reset passwords
app.post('/api/admin/set-password', async (req, res) => {
  try {
    const { username, id, newPassword } = req.body || {};
    if ((!username && !id) || !newPassword) return res.status(400).json({ ok: false, error: 'username/id and newPassword required' });
    const repo = AppDataSource.getRepository(User);
    const target = id ? await repo.findOne({ where: { id: Number(id) } }) : await repo.findOne({ where: { username: String(username) } });
    if (!target) return res.status(404).json({ ok: false, error: 'user not found' });
    // Note: passwords are stored in plain-text per project conventions
    (target as any).password = String(newPassword);
    await repo.save(target);
    return res.json({ ok: true });
  } catch (e: any) {
    console.error('[admin/set-password] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal' });
  }
});

// Admin utility: trigger TypeORM schema synchronization (creates missing tables/columns)
app.post('/api/admin/sync-schema', async (req, res) => {
  try {
    await dbService.synchronizeSchema();
    return res.json({ success: true });
  } catch (e: any) {
    console.error('[admin/sync-schema] error', e);
    return res.status(500).json({ error: e?.message || 'internal' });
  }
});

// Quick IHM connectivity test: attempts a TCP connect to the given IP/port (default 21)
app.post('/api/ihm/test', async (req, res) => {
  try {
    const { ip, port } = req.body || {};
    if (!ip) return res.status(400).json({ ok: false, error: 'ip required' });
    const targetPort = Number(port || 21);

    const start = Date.now();
    let done = false;
    const socket = new net.Socket();

    socket.setTimeout(3000);
    socket.once('connect', () => {
      const latency = Date.now() - start;
      try { socket.destroy(); } catch (e) { }
      if (done) return;
      done = true;
      return res.json({ ok: true, latency, ip, port: targetPort });
    });

    socket.once('timeout', () => {
      try { socket.destroy(); } catch (e) { }
      if (done) return;
      done = true;
      return res.status(504).json({ ok: false, error: 'timeout', ip, port: targetPort });
    });

    socket.once('error', (err: any) => {
      try { socket.destroy(); } catch (e) { }
      if (done) return;
      done = true;
      return res.status(502).json({ ok: false, error: String(err), ip, port: targetPort });
    });

    socket.connect(targetPort, String(ip));
  } catch (e: any) {
    console.error('[api/ihm/test] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal' });
  }
});



app.get("/api/db/listBatches", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Batch);
    const [items, total] = await repo.findAndCount({
      take: 50,
      order: { fileTimestamp: "DESC" },
    });
    return res.json({ items, total, page: 1, pageSize: 50 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

// Force reconnect of DBService using current runtime configs (useful after updating db-config)
app.post('/api/db/reconnect', async (req, res) => {
  try {
    // Validate connection first using current runtime 'db-config' (merge with saved password when needed)
    try {
      // If runtime config lacks a password, merge with stored setting so testConnection gets credentials
      const runtimeDb = getRuntimeConfig('db-config') || {};
      if (!runtimeDb.passwordDB) {
        const saved = await configService.getSetting('db-config');
        if (saved) {
          try {
            const savedObj = JSON.parse(saved);
            if (savedObj?.passwordDB) {
              setRuntimeConfig('db-config', { ...(runtimeDb as any), passwordDB: savedObj.passwordDB });
            }
          } catch (e) {}
        }
      }
      await dbService.testConnection();
    } catch (err: any) {
      console.error('[api/db/reconnect] testConnection failed', err);
      return res.status(400).json({ ok: false, error: 'testConnection failed', details: String(err?.message || err) });
    }
    await dbService.reconnect();
    return res.json({ ok: true, message: 'DB reconnected' });
  } catch (e: any) {
    console.error('[api/db/reconnect] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal' });
  }
});

// Test DB connection using a provided payload or the runtime config
app.post('/api/db/test', async (req, res) => {
  try {
    const cfg = req.body && Object.keys(req.body).length > 0 ? req.body : undefined;
    try {
      // If password isn't present in the payload, merge with saved db-config (if any)
      let merged: any = undefined;
      if (cfg) {
        const savedRaw = await configService.getSetting('db-config');
        let savedObj: any = null;
        if (savedRaw) {
          try { savedObj = JSON.parse(savedRaw); } catch { savedObj = null; }
        }
        merged = {
          host: cfg.host ?? cfg.serverDB ?? savedObj?.serverDB,
          port: cfg.port ?? cfg.port ?? savedObj?.port,
          user: cfg.user ?? cfg.userDB ?? savedObj?.userDB,
          password: cfg.password ?? cfg.passwordDB ?? savedObj?.passwordDB,
          database: cfg.database ?? savedObj?.database,
        };
      }
      await dbService.testConnection(merged);
      return res.json({ ok: true });
    } catch (e: any) {
      console.warn('[api/db/test] validation failed', e);
      return res.status(400).json({ ok: false, error: String(e?.message || e) });
    }
  } catch (e: any) {
    console.error('[api/db/test] error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'internal' });
  }
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
app.post("/api/db/setupMateriaPrima", async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    // Sanitize and validate items
    const processedItems = items
      .map((item: any) => ({
        num: item.num,
        produto: typeof item.produto === "string" ? item.produto : "",
        medida: item.medida === 0 ? 0 : 1, // 0 = gramas, 1 = kilos
      }))
      .filter((it: any) => {
        const n = Number(it.num);
        if (!Number.isFinite(n)) {
          console.warn(
            "[setupMateriaPrima] skipping invalid item (num not numeric):",
            it
          );
          return false;
        }
        return true;
      });

    try {
      const saved = await materiaPrimaService.saveMany(processedItems);
      // Invalidar cache após atualização
      invalidateMateriaPrimaCache();
      return res.json(saved);
    } catch (err: any) {
      console.error("[setupMateriaPrima] saveMany error", err?.message || err);
      if (
        err?.code === "ER_DUP_ENTRY" ||
        err?.driverError?.code === "ER_DUP_ENTRY"
      ) {
        return res.status(400).json({
          error: "duplicate_num",
          message: 'One or more provided "num" values already exist',
        });
      }
      return res.status(500).json({ error: "internal" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/db/getMateriaPrima", async (req, res) => {
  try {
    const items = await materiaPrimaService.getAll();
    return res.json(items);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/db/syncLocalToMain", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 1000);
    const repo = AppDataSource.getRepository(Relatorio);
    const rows = await repo.find({ take: Number(limit) });
    if (!rows || rows.length === 0) return res.json({ synced: 0 });
    const inserted = await dbService.insertRelatorioRows(
      rows as any[],
      "local-backup-sync"
    );
    return res.json({
      synced: Array.isArray(inserted) ? inserted.length : rows.length,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/resumo", async (req, res) => {
  try {
    const areaId = req.query.areaId ? String(req.query.areaId) : null;
    const formula = req.query.formula ? String(req.query.formula) : null;
    const nomeFormula = req.query.nomeFormula
      ? String(req.query.nomeFormula)
      : null;
    const codigo =
      req.query.codigo != null ? Number(String(req.query.codigo)) : null;
    const numero =
      req.query.numero != null ? Number(String(req.query.numero)) : null;
    const dataInicio = req.query.dataInicio
      ? String(req.query.dataInicio)
      : null;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : null;
    const normDataInicioResumo = normalizeDateParam(dataInicio) || null;
    const normDataFimResumo = normalizeDateParam(dataFim) || null;

    // parse advancedFilters if provided (JSON encoded)
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(decodeURIComponent(advancedFiltersRaw));
      } catch (e) {
        console.warn('[resumo] Erro ao parsear advancedFilters:', e);
      }
    }

    // If nomeFormula looks like a number, prefer numeric formula filtering
    let numericFormula: number | null = null;
    if (nomeFormula != null && nomeFormula !== "") {
      const nf = Number(nomeFormula);
      if (Number.isFinite(nf)) numericFormula = nf;
    }

    const result = await resumoService.getResumo({
      areaId,
      formula:
        numericFormula != null
          ? numericFormula
          : formula !== null && formula !== ""
            ? Number(formula)
            : null,
      formulaName: numericFormula == null ? nomeFormula : null,
      codigo: Number.isFinite(codigo) ? codigo : null,
      numero: Number.isFinite(numero) ? numero : null,
      dateStart: normDataInicioResumo,
      dateEnd: normDataFimResumo,
    }, advancedFilters);

    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

// POST variant: accept body { params, advancedFilters } so clients can send large advancedFilters in the body
app.post('/api/resumo', async (req, res) => {
  try {
    const body = req.body || {};
    const params = body.params || {};
    const advancedFilters = body.advancedFilters || null;

    const areaId = params.areaId ? String(params.areaId) : null;
    const formula = params.formula ? String(params.formula) : null;
    const nomeFormula = params.nomeFormula ? String(params.nomeFormula) : null;
    const codigo = params.codigo != null ? Number(params.codigo) : null;
    const numero = params.numero != null ? Number(params.numero) : null;
    const dataInicio = params.dataInicio ? String(params.dataInicio) : null;
    const dataFim = params.dataFim ? String(params.dataFim) : null;
    const normDataInicioResumo = normalizeDateParam(dataInicio) || null;
    const normDataFimResumo = normalizeDateParam(dataFim) || null;

    // If nomeFormula looks like a number, prefer numeric formula filtering
    let numericFormula: number | null = null;
    if (nomeFormula != null && nomeFormula !== "") {
      const nf = Number(nomeFormula);
      if (Number.isFinite(nf)) numericFormula = nf;
    }

    const result = await resumoService.getResumo({
      areaId,
      formula:
        numericFormula != null
          ? numericFormula
          : formula !== null && formula !== ""
            ? Number(formula)
            : null,
      formulaName: numericFormula == null ? nomeFormula : null,
      codigo: Number.isFinite(codigo) ? codigo : null,
      numero: Number.isFinite(numero) ? numero : null,
      dateStart: normDataInicioResumo,
      dateEnd: normDataFimResumo,
    }, advancedFilters);

    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal' });
  }
});

app.get("/api/unidades/converter", async (req, res) => {
  try {
    const valor = Number(req.query.valor);
    const de = Number(req.query.de);
    const para = Number(req.query.para);
    if (isNaN(valor) || isNaN(de) || isNaN(para))
      return res.status(400).json({ error: "valor,de,para are required" });
    return res.json({
      original: valor,
      convertido: unidadesService.converterUnidades(
        Number(valor),
        Number(de),
        Number(para)
      ),
      de,
      para,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

app.post("/api/unidades/normalizarParaKg", async (req, res) => {
  try {
    const { valores, unidades } = req.body;
    if (!valores || !unidades)
      return res.status(400).json({ error: "valores and unidades required" });
    return res.json({
      valoresOriginais: valores,
      valoresNormalizados: unidadesService.normalizarParaKg(valores, unidades),
      unidades,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

app.get("/api/collector/start", async (req, res) => {
  try {
    // Accept optional override parameters
    const overrideConfig: any = {};
    if (req.query.ip) overrideConfig.ip = String(req.query.ip);
    if (req.query.user) overrideConfig.user = String(req.query.user);
    if (req.query.password)
      overrideConfig.password = String(req.query.password);

    const result = await startCollector(
      Object.keys(overrideConfig).length > 0 ? overrideConfig : undefined
    );
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.post("/api/collector/start", async (req, res) => {
  try {
    // Accept optional override parameters in body
    const { ip, user, password } = req.body || {};
    const overrideConfig: any = {};
    if (ip) overrideConfig.ip = String(ip);
    if (user) overrideConfig.user = String(user);
    if (password) overrideConfig.password = String(password);

    const result = await startCollector(
      Object.keys(overrideConfig).length > 0 ? overrideConfig : undefined
    );
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/collector/stop", async (req, res) => {
  try {
    const result = await stopCollector();
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/collector/status", async (_req, res) => {
  try {
    // Determine if a default IHM IP is configured (runtime config or legacy 'ip' key or env)
    const runtimeIhm = getRuntimeConfig('ihm-config') || {};
    const defaultIp = (runtimeIhm && runtimeIhm.ip) || getRuntimeConfig('ip') || process.env.IHM_IP || process.env.IP || null;
    const configMissing = !defaultIp || String(defaultIp).trim() === '';

    const status = getCollectorStatus();
    // Only expose lastError to the client when there is no default IP configured.
    // This prevents spurious toasts when an old error exists but a default IP is set.
    const out = { ...status, configMissing } as any;
    if (!configMissing) out.lastError = null;
    return res.json(out);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

// IHM network discovery — runs tools/ihm-discovery/discover.js (Node) or scan.ps1 on Windows
app.post('/api/ihm/discover', async (req, res) => {
  try {
    const { method = 'node', ports = [80, 443, 502], timeoutMs = 800, paths = ['/visu', '/visu/index.html'] } = req.body || {};
    const toolsDir = path.resolve(process.cwd(), 'tools', 'ihm-discovery');
    const outFile = path.join(toolsDir, 'results.json');

    // Ensure the tools folder exists
    if (!fs.existsSync(toolsDir)) {
      return res.status(404).json({ ok: false, error: 'ihm-discovery tools not found' });
    }

    let cmd: string;
    let args: string[] = [];

    if (String(method).toLowerCase() === 'powershell' && process.platform === 'win32') {
      cmd = 'powershell.exe';
      args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(toolsDir, 'scan.ps1'), '-TimeoutMs', String(timeoutMs), '-Ports', String((ports || []).join(',')), '-Paths', String((paths || []).join(',')), '-OutFile', outFile];
    } else {
      // Default to Node script
      cmd = process.execPath; // Node binary
      args = [path.join(toolsDir, 'discover.js'), '--timeout', String(timeoutMs), '--ports', String((ports || []).join(',')), '--paths', String((paths || []).join(','))];
    }

    console.log('[IHM Discover] running', cmd, args.join(' '));

    // Execute with a 2-minute max so request doesn't hang indefinitely
    await execFileAsync(cmd, args, { cwd: toolsDir, timeout: 2 * 60 * 1000 });

    // If the script succeeded, parse results.json
    let json = {};
    if (fs.existsSync(outFile)) {
      json = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    }

    return res.json({ ok: true, results: json });
  } catch (e) {
    console.error('[IHM Discover] error:', e);
    const toolsDir = path.resolve(process.cwd(), 'tools', 'ihm-discovery');
    const outFile = path.join(toolsDir, 'results.json');
    let partial = {};
    try {
      if (fs.existsSync(outFile)) partial = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    } catch (_) { }
    return res.status(500).json({ ok: false, error: String(e), results: partial });
  }
});

app.get('/api/ihm/discover/last', async (_req, res) => {
  try {
    const outFile = path.resolve(process.cwd(), 'tools', 'ihm-discovery', 'results.json');
    if (!fs.existsSync(outFile)) return res.status(404).json({ ok: false, error: 'not found' });
    const json = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    return res.json({ ok: true, results: json });
  } catch (e) {
    console.error('[IHM Discover] read/last error', e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get("/api/relatorioPdf", async (req, res) => { });

app.get("/api/filtrosAvaliable", async (req, res) => {
  try {
    // Optional date filters to scope the available values
    const dateStart = req.query.dateStart ? String(req.query.dateStart) : null;
    const dateEnd = req.query.dateEnd ? String(req.query.dateEnd) : null;
    const normDateStartFiltros = normalizeDateParam(dateStart) || null;
    const normDateEndFiltros = normalizeDateParam(dateEnd) || null;

    // Use resumoService to compute formulas used in the given period
    const resumo = await resumoService.getResumo({ dateStart, dateEnd });

    const formulasObj = resumo.formulasUtilizadas || {};
    const formulasAll = Object.values(formulasObj).map((f: any) => ({
      nome: f.nome,
      codigo: Number(f.numero),
    }));
    const formulas = formulasAll.filter((f: any) => !Number.isNaN(f.codigo));

    // Extract unique codigos (Form1) from formulas
    const codigosSet = new Set<number>();
    formulas.forEach((f) => codigosSet.add(f.codigo));
    const codigos = Array.from(codigosSet).sort((a, b) => a - b);

    // For numeros (Form2) we need to query DB for distinct Form2 values within date range
    const repo = AppDataSource.getRepository(Relatorio);
    const qb = repo
      .createQueryBuilder("r")
      .select("DISTINCT r.Form2", "numero");
    if (normDateStartFiltros)
      qb.andWhere("r.Dia >= :ds", { ds: normDateStartFiltros });
    if (normDateEndFiltros) {
      const parts = normDateEndFiltros.split("-");
      let dePlus = normDateEndFiltros;
      try {
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        dePlus = `${y}-${m}-${d}`;
      } catch (e) {
        dePlus = normDateEndFiltros;
      }
      qb.andWhere("r.Dia < :dePlus", { dePlus });
    }
    const raw = await qb.getRawMany();
    const numeros = raw
      .map((r: any) => (r && r.numero != null ? Number(r.numero) : null))
      .filter((v): v is number => v != null && !Number.isNaN(v))
      .sort((a, b) => a - b);

    return res.json({ formulas, codigos, numeros });
  } catch (e: any) {
    console.error("[filtrosAvaliable] Error:", e);
    return res.status(500).json({ error: "internal", details: e?.message });
  }
});

// Additional endpoints for Processador HTTP compatibility
app.post("/api/file/processContent", async (req, res) => {
  try {
    const { filePath, content } = req.body;
    if (!filePath || !content) {
      return res
        .status(400)
        .json({ error: "filePath and content are required" });
    }

    // For now, just save content to a temp file and process it (use TMP_DIR_BASE)
    const fs = require("fs");
    const tempPath = path.join(TMP_DIR_BASE, `temp_${Date.now()}.csv`);
    fs.writeFileSync(tempPath, content);

    const r = await fileProcessorService.processFile(tempPath);

    // Clean up temp file
    try {
      fs.unlinkSync(tempPath);
    } catch { }

    return res.json({ meta: r.meta, rowsCount: r.parsed.rowsCount });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});
// envie a config inteira
app.get("/api/config/", async (req, res) => {
  try {
    const config = await configService.getAllSettings();

    // Try to normalize stored string values into JSON/objects when possible
    const normalized: Record<string, any> = {};
    for (const k of Object.keys(config || {})) {
      const raw = config[k];
      if (raw == null) {
        normalized[k] = raw;
        continue;
      }
      // If it's already an object (shouldn't happen here) just pass through
      if (typeof raw !== "string") {
        normalized[k] = raw;
        continue;
      }

      // Try normal JSON parse
      let out: any = raw;
      try {
        out = JSON.parse(raw);
      } catch (e) {
        // parsing failed; attempt to handle common double-encoded or numeric-indexed maps
        try {
          // Attempt to unescape and parse
          const unescaped = raw.replace(/\\"/g, '"');
          out = JSON.parse(unescaped);
        } catch (e2) {
          // As a last resort try to eval (should be safe as data is from DB)
          try {
            // eslint-disable-next-line no-eval
            out = eval("(" + raw + ")");
          } catch (e3) {
            out = raw;
          }
        }
      }

      // If out looks like a numeric index -> char map, reconstruct string
      if (out && typeof out === "object" && !Array.isArray(out)) {
        const numericKeys = Object.keys(out).filter((x) => /^\d+$/.test(x));
        // Only reconstruct when ALL keys are numeric-indexed (indicates a char map)
        if (
          numericKeys.length > 0 &&
          numericKeys.length === Object.keys(out).length
        ) {
          // Build string from numeric keys in order
          const chars: string[] = [];
          numericKeys
            .map((n) => Number(n))
            .sort((a, b) => a - b)
            .forEach((i) => {
              const v = out[String(i)];
              if (typeof v === "string") chars.push(v);
            });
          if (chars.length > 0) {
            const joined = chars.join("");
            // try parse joined as json to recover nested object
            try {
              normalized[k] = JSON.parse(joined);
              continue;
            } catch {
              normalized[k] = joined;
              continue;
            }
          }
        }
      }

      normalized[k] = out;
    }

    // Provide sensible defaults and ensure common keys are present separately
    const defaults: Record<string, any> = {
      "admin-config": "",
      "db-config": {
        // expose sensible runtime defaults so admin UI can edit DB host/port
        serverDB: String(getRuntimeConfig("mysql_ip") ?? getRuntimeConfig("db-host") ?? process.env.MYSQL_HOST ?? "localhost"),
        port: Number(getRuntimeConfig("mysql_port") ?? process.env.MYSQL_PORT ?? 3306),
        database: String(getRuntimeConfig("mysql_db") ?? process.env.MYSQL_DB ?? "cadastro"),
        userDB: String(getRuntimeConfig("mysql_user") ?? process.env.MYSQL_USER ?? "root"),
        passwordDB: String(getRuntimeConfig("mysql_password") ?? process.env.MYSQL_PASSWORD ?? "root"),
      },
      "general-config": "",
      "ihm-config": {
        nomeCliente: "",
        ip: String(getRuntimeConfig("ihm_ip") ?? process.env.IHM_IP ?? ""),
        user: "",
        password: "",
        localCSV: "",
        metodoCSV: "",
        habilitarCSV: false,
        serverDB: "",
        database: "",
        userDB: "",
        passwordDB: "",
        mySqlDir: "",
        dumpDir: "",
        batchDumpDir: "",
      },
      produtosInfo: {},
    };

    // Merge defaults for missing keys to ensure separation (do not overwrite existing)
    for (const k of Object.keys(defaults)) {
      if (normalized[k] === undefined) normalized[k] = defaults[k];
    }

    res.json(normalized);
  } catch (e) {
    console.error("Failed to get config", e);
    res.status(500).json({ error: "internal" });
  }
});

// Return a separated default config structure (frontend can use this to initialize forms)
app.get("/api/config/defaults", async (req, res) => {
  try {
    const defaults = {
      "admin-config": "",
      "db-config": {
        serverDB: String(getRuntimeConfig("mysql_ip") ?? process.env.MYSQL_HOST ?? "localhost"),
        port: Number(getRuntimeConfig("mysql_port") ?? process.env.MYSQL_PORT ?? 3306),
        database: String(getRuntimeConfig("mysql_db") ?? process.env.MYSQL_DB ?? "cadastro"),
        userDB: String(getRuntimeConfig("mysql_user") ?? process.env.MYSQL_USER ?? "root"),
        passwordDB: String(getRuntimeConfig("mysql_password") ?? process.env.MYSQL_PASSWORD ?? "root"),
      },
      "general-config": "",
      "ihm-config": {
        nomeCliente: "",
        ip: String(getRuntimeConfig("ihm_ip") ?? process.env.IHM_IP ?? ""),
        user: "",
        password: "",
        localCSV: "",
        metodoCSV: "",
        habilitarCSV: false,
        serverDB: "",
        database: "",
        userDB: "",
        passwordDB: "",
        mySqlDir: "",
        dumpDir: "",
        batchDumpDir: "",
      },
      produtosInfo: {},
    };
    res.json(defaults);
  } catch (e) {
    console.error("[config/defaults] error", e);
    res.status(500).json({ error: "internal" });
  }
});

// Accept a combined config object and persist each top-level key as separate settings
app.post("/api/config/split", async (req, res) => {
  try {
    const configObj = req.body;
    if (
      !configObj ||
      typeof configObj !== "object" ||
      Array.isArray(configObj)
    ) {
      return res
        .status(400)
        .json({
          error: "Request body must be an object with top-level config keys",
        });
    }
    // If db-config present, validate the new DB connection before persisting
    if (configObj['db-config']) {
      try {
        const parsedVal = configObj['db-config'];
        const savedRaw = await configService.getSetting('db-config');
        let savedObj: any = null;
        if (savedRaw) {
          try { savedObj = JSON.parse(savedRaw); } catch { savedObj = null; }
        }
        const merged = {
          serverDB: parsedVal?.serverDB ?? parsedVal?.host ?? savedObj?.serverDB,
          port: parsedVal?.port ?? savedObj?.port,
          database: parsedVal?.database ?? savedObj?.database,
          userDB: parsedVal?.userDB ?? parsedVal?.user ?? savedObj?.userDB,
          passwordDB: parsedVal?.passwordDB ?? parsedVal?.password ?? savedObj?.passwordDB,
        };
        const testPayload = {
          host: merged.serverDB,
          port: merged.port,
          user: merged.userDB,
          password: merged.passwordDB,
          database: merged.database,
        };
        await dbService.testConnection(testPayload);
      } catch (e: any) {
        console.error('[config/split] db-config validation failed', e);
        return res.status(400).json({ error: 'db-config validation failed', details: String(e?.message || e) });
      }
    }
    // Persist each top-level key as a separate Setting row
    // If db-config is present and missing password, merge with saved value to prevent clearing
    if (configObj['db-config']) {
      try {
        const savedRaw = await configService.getSetting('db-config');
        let savedObj: any = null;
        if (savedRaw) {
          try { savedObj = JSON.parse(savedRaw); } catch { savedObj = null; }
        }
        if (savedObj && typeof savedObj === 'object' && typeof configObj['db-config'] === 'object') {
          const parsed = configObj['db-config'];
          configObj['db-config'] = {
            serverDB: parsed.serverDB ?? parsed.host ?? savedObj.serverDB,
            port: parsed.port ?? savedObj.port,
            database: parsed.database ?? savedObj.database,
            userDB: parsed.userDB ?? parsed.user ?? savedObj.userDB,
            passwordDB: parsed.passwordDB ?? parsed.password ?? savedObj.passwordDB,
          };
        }
      } catch (e) {
        // ignore merge failures and continue
      }
    }
    await configService.setSettings(configObj);
    try {
      setRuntimeConfigs(configObj);
    } catch (e) {
      /* ignore */
    }
    // Configs persisted to DB via configService; no external JSON file used anymore.
    // Return updated parsed values to the client so UI can synchronize without an extra GET
    const updated: Record<string, any> = {};
    for (const k of Object.keys(configObj)) {
      const raw = await configService.getSetting(k);
      let parsed: any = raw;
      if (typeof raw === 'string') {
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
      }
      updated[k] = parsed;
    } 
    return res.json({ success: true, saved: Object.keys(configObj), updated });
  } catch (e) {
    console.error("[config/split] Failed to split/save settings", e);
    return res.status(500).json({ error: "internal" });
  }
});

// Get a single config key
app.get('/api/config/:key', async (req, res) => {
  try {
    const rawKey = String(req.params.key || '').trim();
    if (!rawKey) return res.status(400).json({ error: 'missing key' });

    // Special-case: return structured defaults for known config keys
    if (rawKey === 'ihm-config' && req.query.inputs === 'true') {
      const defaultIhm = {
        nomeCliente: '',
        ip: String(getRuntimeConfig('ihm_ip') ?? process.env.IHM_IP ?? ''),
        user: '',
        password: '',
        localCSV: '',
        metodoCSV: '',
        habilitarCSV: false,
        serverDB: '',
        database: '',
        userDB: '',
        passwordDB: '',
        mySqlDir: '',
        dumpDir: '',
        batchDumpDir: '',
      };
      return res.json({ key: rawKey, value: defaultIhm });
    }

    if (rawKey === 'db-config' && req.query.inputs === 'true') {
      const defaultDb = {
        serverDB: String(getRuntimeConfig('mysql_ip') ?? process.env.MYSQL_HOST ?? 'localhost'),
        port: Number(getRuntimeConfig('mysql_port') ?? process.env.MYSQL_PORT ?? 3306),
        database: String(getRuntimeConfig('mysql_db') ?? process.env.MYSQL_DB ?? 'cadastro'),
        userDB: String(getRuntimeConfig('mysql_user') ?? process.env.MYSQL_USER ?? 'root'),
        // default to 'root' if no runtime or env override exists
        passwordDB: String(getRuntimeConfig('mysql_password') ?? process.env.MYSQL_PASSWORD ?? 'root'),
      };
      return res.json({ key: rawKey, value: defaultDb });
    }

    // Otherwise try to load from persisted settings
    const stored = await configService.getSetting(rawKey);
    if (stored === null || stored === undefined) return res.status(404).json({ error: 'not found' });

    // Attempt parse
    let out: any = stored;
    if (typeof stored === 'string') {
      try { out = JSON.parse(stored); } catch (e) { out = stored; }
    }

    return res.json({ key: rawKey, value: out });
  } catch (e) {
    console.error('[config/:key] error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

// Persist a single config key (body: { value: ... })
app.post('/api/config/:key', async (req, res) => {
  try {
    const rawKey = String(req.params.key || '').trim();
    if (!rawKey) return res.status(400).json({ error: 'missing key' });

    const payload = req.body;
    if (payload === undefined) return res.status(400).json({ error: 'missing body' });

    const value = payload.value !== undefined ? payload.value : payload;
    let finalValue: any = value;
    if (rawKey === 'db-config') {
      // Merge with saved setting so partial payloads (omitting password) don't clear existing password
      const savedRaw = await configService.getSetting('db-config');
      let savedObj: any = null;
      if (savedRaw) {
        try { savedObj = JSON.parse(savedRaw); } catch { savedObj = null; }
      }
      if (savedObj && typeof savedObj === 'object' && typeof finalValue === 'object') {
        // Only merge specific keys
        finalValue = {
          serverDB: finalValue.serverDB ?? finalValue.host ?? savedObj.serverDB,
          port: finalValue.port ?? savedObj.port,
          database: finalValue.database ?? savedObj.database,
          userDB: finalValue.userDB ?? finalValue.user ?? savedObj.userDB,
          passwordDB: finalValue.passwordDB ?? finalValue.password ?? savedObj.passwordDB,
        };
      }
    }
    const toStore = typeof finalValue === 'string' ? finalValue : JSON.stringify(finalValue);

    // If saving db-config, validate before storing (merge with saved values when needed)
    if (rawKey === 'db-config') {
      try {
        const parsedVal = typeof value === 'string' ? JSON.parse(value) : value;
        // Load saved db-config (if any) so we can merge missing fields such as password
        const savedRaw = await configService.getSetting('db-config');
        let savedObj: any = null;
        if (savedRaw) {
          try { savedObj = JSON.parse(savedRaw); } catch { savedObj = null; }
        }
        const merged = {
          serverDB: parsedVal?.serverDB ?? parsedVal?.host ?? savedObj?.serverDB,
          port: parsedVal?.port ?? savedObj?.port,
          database: parsedVal?.database ?? savedObj?.database,
          userDB: parsedVal?.userDB ?? parsedVal?.user ?? savedObj?.userDB,
          passwordDB: parsedVal?.passwordDB ?? parsedVal?.password ?? savedObj?.passwordDB,
        };
        const testPayload = {
          host: merged.serverDB,
          port: merged.port,
          user: merged.userDB,
          password: merged.passwordDB,
          database: merged.database,
        };
        await dbService.testConnection(testPayload);
      } catch (e: any) {
        console.error('[config/:key POST] db-config validation failed', e);
        return res.status(400).json({ error: 'db-config validation failed', details: String(e?.message || e) });
      }
    }
    await configService.setSetting(rawKey, toStore);

    // update in-memory runtime configs as well
    try { setRuntimeConfigs({ [rawKey]: value }); } catch (e) { /* ignore */ }
    // persist to runtime-config file if we updated a critical key
    // Configs are persisted to DB via configService; no external JSON file used.

    // Return updated parsed value to the client so UI can sync without extra GET
    let outParsed: any = toStore;
    try {
      outParsed = JSON.parse(toStore);
    } catch { /* ignore */ } 
    return res.json({ success: true, key: rawKey, value: outParsed });
  } catch (e) {
    console.error('[config/:key POST] error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

app.get("/api/config/:key", async (req, res) => {
  try {
    const key = req.params.key;
    if (!key) {
      return res.status(400).json({ error: "Key parameter is required" });
    }
    const raw = await configService.getSetting(key);

    // Known defaults for frontend topics
    const knownDefaults: Record<string, any> = {
      "admin-config": "",
      "db-config": "",
      "general-config": "",
      "ihm-config": {
        nomeCliente: "",
        ip: String(getRuntimeConfig("ihm_ip") ?? process.env.IHM_IP ?? ""),
        user: "",
        password: "",
        localCSV: "",
        metodoCSV: "",
        habilitarCSV: false,
        serverDB: "",
        database: "",
        userDB: "",
        passwordDB: "",
        mySqlDir: "",
        dumpDir: "",
        batchDumpDir: "",
      },
      produtosInfo: {},
    };

    if (raw === null) {
      // Return the known default structure if available
      if (knownDefaults[key] !== undefined)
        return res.json({ key, value: knownDefaults[key] });
      return res.json({ key, value: {} });
    }

    // Parse/normalize the stored value similarly to the bulk endpoint
    let out: any = raw;
    if (typeof raw === "string") {
      try {
        out = JSON.parse(raw);
      } catch (e) {
        try {
          const unescaped = raw.replace(/\\"/g, '"');
          out = JSON.parse(unescaped);
        } catch (e2) {
          try {
            // eslint-disable-next-line no-eval
            out = eval("(" + raw + ")");
          } catch (e3) {
            out = raw;
          }
        }
      }
    }

    // Reconstruct numeric-index char map if appropriate
    if (out && typeof out === "object" && !Array.isArray(out)) {
      const numericKeys = Object.keys(out).filter((x) => /^\d+$/.test(x));
      if (
        numericKeys.length > 0 &&
        numericKeys.length === Object.keys(out).length
      ) {
        const chars: string[] = [];
        numericKeys
          .map((n) => Number(n))
          .sort((a, b) => a - b)
          .forEach((i) => {
            const v = out[String(i)];
            if (typeof v === "string") chars.push(v);
          });
        if (chars.length > 0) {
          const joined = chars.join("");
          try {
            out = JSON.parse(joined);
          } catch {
            out = joined;
          }
        }
      }
    }

    // If the client asked for only input fields (e.g. ?inputs=true), filter
    // the returned object to only the input-relevant keys for known topics.
    const onlyInputs = String(req.query?.inputs || "").toLowerCase() === "true";
    if (onlyInputs && out && typeof out === "object" && !Array.isArray(out)) {
      const inputsMap: Record<string, string[]> = {
        "ihm-config": ["ip", "user", "password"],
        "general-config": [
          "nomeCliente",
          "localCSV",
          "metodoCSV",
          "habilitarCSV",
          "serverDB",
          "database",
          "userDB",
          "passwordDB",
          "mySqlDir",
          "dumpDir",
          "batchDumpDir",
        ],
        "admin-config": [],
        "db-config": [],
        produtosInfo: [],
      };

      if (Object.prototype.hasOwnProperty.call(inputsMap, key)) {
        if (key === "produtosInfo") {
          // For produtosInfo return only nome and unidade per column
          const filtered: Record<string, any> = {};
          for (const col of Object.keys(out)) {
            const item = out[col] || {};
            filtered[col] = {
              nome: item.nome ?? "",
              unidade: item.unidade ?? "",
            };
          }
          out = filtered;
        } else {
          const fields = inputsMap[key];
          const filtered: Record<string, any> = {};
          for (const f of fields) {
            // prefer value in parsed object, otherwise fallback to knownDefaults if present
            filtered[f] =
              out[f] !== undefined
                ? out[f]
                : knownDefaults[key] && knownDefaults[key][f] !== undefined
                  ? knownDefaults[key][f]
                  : "";
          }
          out = filtered;
        }
      }
    }

    // If the client requested the IHM config while working in the Amendoim module,
    // prefer to return an IHM object derived from the current amendoim-config so
    // the frontend can show the Amendoim-specific options and the collector uses them.
    const wantsAmendoimModule = String(req.query?.module || "").toLowerCase() === "amendoim" ||
      String(req.query?.userType || "").toLowerCase() === "amendoim" ||
      String((req.headers || {})["x-module"] || "").toLowerCase() === "amendoim";

    if (key === 'ihm-config' && wantsAmendoimModule) {
      try {
        // Build a base IHM config from the parsed value or known defaults
        const baseIhm = (out && typeof out === 'object') ? { ...(knownDefaults['ihm-config'] || {}), ...out } : { ...(knownDefaults['ihm-config'] || {}) };

        // Read amendoim-config and copy secondary IHM credentials if provided
        try {
          const amCfg = (await Promise.resolve().then(() => require('./services/AmendoimConfigService')).then(m => m.AmendoimConfigService.getConfig()));

          // Copy secondary IHM creds if provided in amendoim-config
          if (amCfg.duasIHMs && amCfg.ihm2) {
            baseIhm.ip2 = amCfg.ihm2.ip || baseIhm.ip2;
            baseIhm.user2 = amCfg.ihm2.user || baseIhm.user2;
            baseIhm.password2 = amCfg.ihm2.password || baseIhm.password2;
          }

          // Ensure paths are present
          if (amCfg.caminhoRemoto) baseIhm.localCSVPath = amCfg.caminhoRemoto;
          if (amCfg.ihm2 && amCfg.ihm2.caminhoRemoto) baseIhm.localCSVPath2 = amCfg.ihm2.caminhoRemoto;

        } catch (e) {
          // ignore mapping failures and fall back to parsed out
        }

        out = baseIhm;
      } catch (e) {
        // ignore and continue to normal behavior
      }
    }

    // If known default exists and parsed out is empty, return default
    if (
      (out === null ||
        out === "" ||
        (typeof out === "object" && Object.keys(out).length === 0)) &&
      knownDefaults[key] !== undefined
    ) {
      return res.json({ key, value: knownDefaults[key] });
    }

    // Do not expose DB password over GET APIs; instead return a flag 'passwordSet'
    if (key === 'db-config') {
      try {
        const saved = await configService.getSetting('db-config');
        let savedObj: any = null;
        if (saved) {
          try { savedObj = JSON.parse(saved); } catch { savedObj = null; }
        }
        const hasPassword = !!(savedObj && (savedObj.passwordDB || savedObj.password));
        if (out && typeof out === 'object') {
          out.passwordSet = hasPassword;
          if (out.passwordDB !== undefined) out.passwordDB = '';
          if (out.password !== undefined) out.password = '';
        }
      } catch (e) {
        // ignore errors here
      }
    }

    return res.json({ key, value: out });
  } catch (e) {
    console.error("Failed to get setting", e);
    res.status(500).json({ error: "internal" });
  }
});

app.post("/api/config", async (req, res) => {
  try {
    const configObj = req.body;
    if (
      !configObj ||
      typeof configObj !== "object" ||
      Array.isArray(configObj)
    ) {
      return res.status(400).json({
        error: "Request body must be a JSON object with config keys/values",
      });
    }
    const keys = Object.keys(configObj);
    if (keys.length === 0) {
      return res.status(400).json({ error: "No config keys provided" });
    }
    // Salva todas as configurações de uma vez e atualiza runtime
    await configService.setSettings(configObj);
    try {
      setRuntimeConfigs(configObj);
    } catch (e) {
      /* ignore */
    }
    res.json({ success: true, saved: keys });
  } catch (e) {
    console.error("Failed to set settings", e);
    res.status(500).json({ error: "internal" });
  }
});

// Provide chart-oriented data for frontend dashboards
app.get("/api/chartdata", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);

    // Optional query params: limit, dateStart, dateEnd
    // If limit is provided and >0 we will apply it. Otherwise return all matching rows.
    const limitRaw = req.query.limit;
    const limit = limitRaw != null ? Number(limitRaw) : 0;
    const dateStart = req.query.dateStart ? String(req.query.dateStart) : null;
    const dateEnd = req.query.dateEnd ? String(req.query.dateEnd) : null;
    const normDateStartChart = normalizeDateParam(dateStart) || null;
    const normDateEndChart = normalizeDateParam(dateEnd) || null;

    const qb = repo
      .createQueryBuilder("r")
      .orderBy("r.Dia", "DESC")
      .addOrderBy("r.Hora", "DESC");
    if (limit && Number.isFinite(limit) && limit > 0) qb.take(limit);
    if (normDateStartChart)
      qb.andWhere("r.Dia >= :ds", { ds: normDateStartChart });
    if (normDateEndChart) {
      const parts = normDateEndChart.split("-");
      let dePlus = normDateEndChart;
      try {
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, "0");
        const d = String(dt.getDate()).padStart(2, "0");
        dePlus = `${y}-${m}-${d}`;
      } catch (e) {
        dePlus = normDateEndChart;
      }
      qb.andWhere("r.Dia < :dePlus", { dePlus });
    }

    // Load materia prima units early so we can apply advancedFilters mapping names->nums
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // apply advancedFilters if provided via query (JSON encoded)
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(decodeURIComponent(advancedFiltersRaw));
      } catch (e) {
        console.warn('[chartdata] Erro ao parsear advancedFilters:', e);
      }
    }

    if (advancedFilters) {
      applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);
    }

    const rows = await qb.getMany();

    // Filtrar produtos inativos e produtos marcados para ignorar cálculos (usado por dashboards/home)
    const produtosAtivos = await getProdutosAtivos(true);

    const mapped = rows.map((r: any) => {
      const values: number[] = [];
      const units: Record<string, string> = {};
      for (let i = 1; i <= 65; i++) {
        const v =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;
        // If product is inactive for charts (including ignorarCalculos), hide its value (0)
        const showInCharts = produtosAtivos.has(i);
        const valueToPush = showInCharts ? v : 0;

        // Provide units per product (g or kg). Use medida==0 => 'g', else 'kg'
        const mp = materiasByNum[i];
        const unidade = mp && Number(mp.medida) === 0 ? "g" : "kg";
        values.push(valueToPush);
        units[`Unidade_${i}`] = unidade;
      }

      return {
        Nome: r.Nome || "",
        values,
        Dia: r.Dia || "",
        Hora: r.Hora || "",
        Form1: r.Form1 ?? null,
        Form2: r.Form2 ?? null,
        ...units,
      };
    });

    return res.json({
      rows: mapped,
      total: mapped.length,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/chartdata] error", e);
    return res.status(500).json({ error: "internal" });
  }
});

// Endpoint especializado: Agregação por Fórmulas
app.get("/api/chartdata/formulas", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);

    const { formula, dataInicio, dataFim, codigo, numero } = req.query;

    const qb = repo.createQueryBuilder("r").orderBy("r.Dia", "DESC");

    if (formula)
      qb.andWhere("r.Nome LIKE :formula", { formula: `%${formula}%` });
    if (dataInicio) {
      const normalized = normalizeDateParam(dataInicio);
      if (normalized)
        qb.andWhere("r.Dia >= :dataInicio", { dataInicio: normalized });
    }
    if (dataFim) {
      const normalized = normalizeDateParam(dataFim);
      if (normalized) {
        const parts = normalized.split("-");
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const nextDay = `${dt.getFullYear()}-${String(
          dt.getMonth() + 1
        ).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        qb.andWhere("r.Dia < :dataFim", { dataFim: nextDay });
      }
    }
    if (codigo) {
      const c = Number(codigo);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :codigo", { codigo: c });
    }
    if (numero) {
      const n = Number(numero);
      if (!Number.isNaN(n)) qb.andWhere("r.Form2 = :numero", { numero: n });
    }

    // Load materia prima for mapping names->nums and for product metadata
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // parse advancedFilters if provided and apply
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(decodeURIComponent(advancedFiltersRaw));
      } catch (e) {
        console.warn('[chartdata/formulas] Erro ao parsear advancedFilters:', e);
      }
    }
    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);

    const rows = await qb.getMany();

    // Filtrar produtos inativos e produtos marcados para ignorar cálculos
    const produtosAtivos = await getProdutosAtivos(true);
    console.log(`[chartdata/formulas] Produtos ativos (excluindo ignorarCalculos): ${produtosAtivos.size}`);

    // Agregar por fórmula (Nome) using per-row normalized total (kg)
    const sums: Record<string, number> = {};
    const validCount: Record<string, number> = {};

    for (const r of rows) {
      if (!r.Nome) continue;
      const key = r.Nome;

      // compute row total normalized to kg
      let rowTotalKg = 0;
      for (let i = 1; i <= 65; i++) {
        // Ignorar produtos inativos
        if (!produtosAtivos.has(i)) continue;

        let raw =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;

        // Garantir que não há valores negativos
        if (raw < 0) raw = 0;

        if (!raw || raw === 0) continue;

        const mp = materiasByNum[i];
        let valueKg = raw;

        if (mp) {
          const medida = typeof mp.medida === 'number' ? mp.medida : Number(mp.medida || 1);
          if (medida === 0) {
            // stored in grams -> convert to kg
            valueKg = raw / 1000;
          } else {
            // já em kg
            valueKg = raw;
          }
        }

        rowTotalKg += valueKg;
      }

      if (isNaN(rowTotalKg) || rowTotalKg <= 0) continue;

      sums[key] = (sums[key] || 0) + rowTotalKg;
      validCount[key] = (validCount[key] || 0) + 1;
    }

    const chartData = Object.entries(sums)
      .map(([name, value]) => ({
        name,
        value,
        count: validCount[name],
      }))
      .sort((a, b) => b.value - a.value);

    return res.json({
      chartData,
      total: chartData.reduce((sum, item) => sum + item.value, 0),
      totalRecords: rows.length,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/chartdata/formulas] error", e);
    return res.status(500).json({ error: "internal" });
  }
});

// Endpoint especializado: Agregação por Produtos
app.get("/api/chartdata/produtos", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);

    const { formula, dataInicio, dataFim, codigo, numero } = req.query;

    const qb = repo.createQueryBuilder("r").orderBy("r.Dia", "DESC");

    if (formula)
      qb.andWhere("r.Nome LIKE :formula", { formula: `%${formula}%` });
    if (dataInicio) {
      const normalized = normalizeDateParam(dataInicio);
      if (normalized)
        qb.andWhere("r.Dia >= :dataInicio", { dataInicio: normalized });
    }
    if (dataFim) {
      const normalized = normalizeDateParam(dataFim);
      if (normalized) {
        const parts = normalized.split("-");
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const nextDay = `${dt.getFullYear()}-${String(
          dt.getMonth() + 1
        ).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        qb.andWhere("r.Dia < :dataFim", { dataFim: nextDay });
      }
    }
    if (codigo) {
      const c = Number(codigo);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :codigo", { codigo: c });
    }
    if (numero) {
      const n = Number(numero);
      if (!Number.isNaN(n)) qb.andWhere("r.Form2 = :numero", { numero: n });
    }

    // Carregar unidades das matérias-primas cedo para aplicar advancedFilters
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // parse advancedFilters if provided and apply to query
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(decodeURIComponent(advancedFiltersRaw));
      } catch (e) {
        console.warn('[chartdata/produtos] Erro ao parsear advancedFilters:', e);
      }
    }
    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);

    const rows = await qb.getMany();

    // Filtrar produtos inativos e também produtos marcados para ignorar cálculos
    const produtosAtivos = await getProdutosAtivos(true);
    console.log(`[chartdata/produtos] Produtos ativos (excluindo ignorarCalculos): ${produtosAtivos.size}`);

    // Agregar por produto (Prod_1, Prod_2, etc.)
    const productSums: Record<string, number> = {};
    const productUnits: Record<string, string> = {};

    for (const r of rows) {
      for (let i = 1; i <= 65; i++) {
        // Ignorar produtos inativos
        if (!produtosAtivos.has(i)) continue;

        let v =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;

        // Garantir que não há valores negativos
        if (v < 0) v = 0;

        if (v <= 0) continue;

        const mp = materiasByNum[i];
        const productKey = mp?.produto || `Produto ${i}`;

        // Calcular valor em kg considerando a unidade de armazenagem
        let valueKg = v;
        if (mp) {
          const medida = typeof mp.medida === 'number' ? mp.medida : Number(mp.medida || 1);
          if (medida === 0) {
            // stored in grams -> convert to kg
            valueKg = v / 1000;
          } else {
            // já em kg
            valueKg = v;
          }
        }

        const unidade = "kg";

        productSums[productKey] = (productSums[productKey] || 0) + valueKg;
        productUnits[productKey] = unidade;
      }
    }

    // Chart data já normalizado em kg
    const chartData = Object.entries(productSums)
      .map(([name, value]) => {
        return {
          name,
          value,
          unit: "kg",
        };
      })
      .sort((a, b) => b.value - a.value);

    return res.json({
      chartData,
      total: chartData.reduce((sum, item) => sum + item.value, 0),
      totalRecords: rows.length,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/chartdata/produtos] error", e);
    return res.status(500).json({ error: "internal" });
  }
});

// Endpoint especializado: Agregação por Horário
app.get("/api/chartdata/horarios", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);

    const { formula, dataInicio, dataFim, codigo, numero } = req.query;

    const qb = repo.createQueryBuilder("r").orderBy("r.Dia", "DESC");

    if (formula)
      qb.andWhere("r.Nome LIKE :formula", { formula: `%${formula}%` });
    if (dataInicio) {
      const normalized = normalizeDateParam(dataInicio);
      if (normalized)
        qb.andWhere("r.Dia >= :dataInicio", { dataInicio: normalized });
    }
    if (dataFim) {
      const normalized = normalizeDateParam(dataFim);
      if (normalized) {
        const parts = normalized.split("-");
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const nextDay = `${dt.getFullYear()}-${String(
          dt.getMonth() + 1
        ).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        qb.andWhere("r.Dia < :dataFim", { dataFim: nextDay });
      }
    }
    if (codigo) {
      const c = Number(codigo);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :codigo", { codigo: c });
    }
    if (numero) {
      const n = Number(numero);
      if (!Number.isNaN(n)) qb.andWhere("r.Form2 = :numero", { numero: n });
    }

    // Load materias first so we can apply advancedFilters to the query builder
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Parse advancedFilters if provided (sent as JSON string in query)
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(String(advancedFiltersRaw));
      } catch (e) {
        // ignore parse errors and continue without advanced filters
      }
    }

    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);

    const rows = await qb.getMany();

    // Filtrar produtos inativos e produtos marcados para ignorar cálculos
    const produtosAtivos = await getProdutosAtivos(true);
    console.log(`[chartdata/horarios] Produtos ativos (excluindo ignorarCalculos): ${produtosAtivos.size}`);

    // Agregar por hora (0h-23h) using normalized per-row total (kg)
    const hourSums: Record<string, number> = {};
    const hourCounts: Record<string, number> = {};

    for (const r of rows) {
      if (!r.Hora) continue;
      const hour = r.Hora.split(":")[0];
      const hourKey = `${hour}h`;

      // compute row total normalized to kg
      let rowTotalKg = 0;
      for (let i = 1; i <= 65; i++) {
        // Ignorar produtos inativos
        if (!produtosAtivos.has(i)) continue;

        const raw =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;
        if (!raw || raw <= 0) continue;
        const mp = materiasByNum[i];
        if (mp && Number(mp.medida) === 0) {
          // stored in grams -> convert to kg
          rowTotalKg += raw / 1000;
        } else {
          rowTotalKg += raw;
        }
      }

      if (isNaN(rowTotalKg) || rowTotalKg <= 0) continue;

      hourSums[hourKey] = (hourSums[hourKey] || 0) + rowTotalKg;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    }

    const chartData = Object.entries(hourSums)
      .map(([name, value]) => ({
        name,
        value,
        count: hourCounts[name],
        average: value / hourCounts[name],
      }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));

    return res.json({
      chartData,
      total: chartData.reduce((sum, item) => sum + item.value, 0),
      totalRecords: rows.length,
      peakHour:
        chartData.length > 0
          ? chartData.reduce((max, item) =>
            item.value > max.value ? item : max
          ).name
          : null,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/chartdata/horarios] error", e);
    return res.status(500).json({ error: "internal" });
  }
});

// About: expose releases derived from posted release notes (READMES)
app.get('/api/about/releases', async (req, res) => {
  try {
    const repoRoot = path.resolve(process.cwd(), '..');
    const readmesDir = path.join(repoRoot, 'READMES');
    if (!fs.existsSync(readmesDir)) return res.json({ releases: [] });
    const files = await fs.promises.readdir(readmesDir);
    const releaseFiles = files.filter(f => /^release[_\-]/i.test(f));
    const out: Array<{ filename: string; version: string; date: string; excerpt: string; content: string }> = [];
    for (const f of releaseFiles) {
      try {
        const full = path.join(readmesDir, f);
        const stat = await fs.promises.stat(full);
        if (!stat.isFile()) continue;
        const content = await fs.promises.readFile(full, 'utf8');
        const firstNonEmpty = (content || '').split(/\r?\n/).map(l => l.trim()).find(l => l.length > 0) || '';
        const version = f.replace(/\.[^/.]+$/, '');
        out.push({ filename: f, version, date: new Date(stat.mtimeMs).toISOString(), excerpt: firstNonEmpty.slice(0, 240), content });
      } catch (e) {
        // ignore single file failures
      }
    }
    // sort by date desc
    out.sort((a, b) => (a.date < b.date ? 1 : -1));
    return res.json({ releases: out });
  } catch (e) {
    console.error('[/api/about/releases] error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

app.get('/api/about/features', async (req, res) => {
  try {
    const repoRoot = path.resolve(process.cwd(), '..');
    const readmesDir = path.join(repoRoot, 'READMES');
    if (!fs.existsSync(readmesDir)) return res.json({ files: [] });
    const files = await fs.promises.readdir(readmesDir);
    const out: Array<{ filename: string; content: string }> = [];
    for (const f of files) {
      try {
        const full = path.join(readmesDir, f);
        const stat = await fs.promises.stat(full);
        if (!stat.isFile()) continue;
        const content = await fs.promises.readFile(full, 'utf8');
        out.push({ filename: f, content });
      } catch (e) {
        // ignore single file failures
      }
    }
    return res.json({ files: out });
  } catch (e) {
    console.error('[/api/about/features] error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

// Consolidated about/info endpoint: latest release note + other READMES
app.get('/api/about/info', async (req, res) => {
  try {
    const repoRoot = path.resolve(process.cwd(), '..');
    const readmesDir = path.join(repoRoot, 'READMES');
    const filesOut: Array<{ filename: string; content: string }> = [];
    if (fs.existsSync(readmesDir)) {
      const files = await fs.promises.readdir(readmesDir);
      for (const f of files) {
        try {
          const full = path.join(readmesDir, f);
          const stat = await fs.promises.stat(full);
          if (!stat.isFile()) continue;
          const content = await fs.promises.readFile(full, 'utf8');
          filesOut.push({ filename: f, content });
        } catch (e) { }
      }
    }

    // Find latest release notes file if any
    const releaseCandidates = filesOut.filter(x => x.filename.toLowerCase().startsWith('release_notes') || x.filename.toLowerCase().startsWith('release-notes'));
    let latestRelease: { filename: string; content: string } | null = null;
    if (releaseCandidates.length > 0) {
      // choose by filename descending or fallback to first
      releaseCandidates.sort((a, b) => b.filename.localeCompare(a.filename));
      latestRelease = releaseCandidates[0];
    }

    return res.json({ releaseNote: latestRelease, readmes: filesOut });
  } catch (e) {
    console.error('[/api/about/info] error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

// Endpoint especializado: Agregação por Dia da Semana
app.get("/api/chartdata/diasSemana", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);

    const { formula, dataInicio, dataFim, codigo, numero } = req.query;

    const qb = repo.createQueryBuilder("r").orderBy("r.Dia", "DESC");

    if (formula)
      qb.andWhere("r.Nome LIKE :formula", { formula: `%${formula}%` });
    if (dataInicio) {
      const normalized = normalizeDateParam(dataInicio);
      if (normalized)
        qb.andWhere("r.Dia >= :dataInicio", { dataInicio: normalized });
    }
    if (dataFim) {
      const normalized = normalizeDateParam(dataFim);
      if (normalized) {
        const parts = normalized.split("-");
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const nextDay = `${dt.getFullYear()}-${String(
          dt.getMonth() + 1
        ).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        qb.andWhere("r.Dia < :dataFim", { dataFim: nextDay });
      }
    }
    if (codigo) {
      const c = Number(codigo);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :codigo", { codigo: c });
    }
    if (numero) {
      const n = Number(numero);
      if (!Number.isNaN(n)) qb.andWhere("r.Form2 = :numero", { numero: n });
    }

    // Load materias first so applyAdvancedFiltersToQuery can map product numbers
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Parse advancedFilters if provided (sent as JSON string in query)
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(String(advancedFiltersRaw));
      } catch (e) {
        // ignore parse errors and continue without advanced filters
      }
    }

    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);

    const rows = await qb.getMany();

    // Filtrar produtos inativos e produtos marcados para ignorar cálculos
    const produtosAtivos = await getProdutosAtivos(true);
    console.log(`[chartdata/diasSemana] Produtos ativos (excluindo ignorarCalculos): ${produtosAtivos.size}`);

    // Helper para parsear datas
    const parseDia = (dia?: string): Date | null => {
      if (!dia) return null;
      const s = dia.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T00:00:00");
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
        const parts = s.split("/");
        let y = parts[2];
        if (y.length === 2) y = String(2000 + Number(y));
        return new Date(Number(y), Number(parts[1]) - 1, Number(parts[0]));
      }
      const dt = new Date(s);
      return !isNaN(dt.getTime()) ? dt : null;
    };

    // Agregar por dia da semana using per-row normalized total (kg)
    const weekdays = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    const weekdaySums: Record<string, number> = {};
    const weekdayCounts: Record<string, number> = {};

    for (const r of rows) {
      if (!r.Dia) continue;
      const date = parseDia(r.Dia);
      if (!date) continue;

      const dayIndex = date.getDay();
      const dayName = weekdays[dayIndex];

      // compute row total normalized to kg
      let rowTotalKg = 0;
      for (let i = 1; i <= 65; i++) {
        // Ignorar produtos inativos
        if (!produtosAtivos.has(i)) continue;

        const raw =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;
        if (!raw || raw <= 0) continue;
        const mp = materiasByNum[i];
        if (mp && Number(mp.medida) === 0) {
          // stored in grams -> convert to kg
          rowTotalKg += raw / 1000;
        } else {
          rowTotalKg += raw;
        }
      }

      if (isNaN(rowTotalKg) || rowTotalKg <= 0) continue;

      weekdaySums[dayName] = (weekdaySums[dayName] || 0) + rowTotalKg;
      weekdayCounts[dayName] = (weekdayCounts[dayName] || 0) + 1;
    }

    const chartData = weekdays
      .map((name) => ({
        name,
        value: weekdaySums[name] || 0,
        count: weekdayCounts[name] || 0,
        average: weekdaySums[name]
          ? weekdaySums[name] / weekdayCounts[name]
          : 0,
      }))
      .filter((d) => d.value > 0);

    return res.json({
      chartData,
      total: chartData.reduce((sum, item) => sum + item.value, 0),
      totalRecords: rows.length,
      peakDay:
        chartData.length > 0
          ? chartData.reduce((max, item) =>
            item.value > max.value ? item : max
          ).name
          : null,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/chartdata/diasSemana] error", e);
    return res.status(500).json({ error: "internal" });
  }
});

// Endpoint especializado: Estatísticas Gerais
app.get("/api/chartdata/stats", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);

    const { formula, dataInicio, dataFim, codigo, numero } = req.query;

    const qb = repo.createQueryBuilder("r");

    if (formula)
      qb.andWhere("r.Nome LIKE :formula", { formula: `%${formula}%` });
    if (dataInicio) {
      const normalized = normalizeDateParam(dataInicio);
      if (normalized)
        qb.andWhere("r.Dia >= :dataInicio", { dataInicio: normalized });
    }
    if (dataFim) {
      const normalized = normalizeDateParam(dataFim);
      if (normalized) {
        const parts = normalized.split("-");
        const dt = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2])
        );
        dt.setDate(dt.getDate() + 1);
        const nextDay = `${dt.getFullYear()}-${String(
          dt.getMonth() + 1
        ).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        qb.andWhere("r.Dia < :dataFim", { dataFim: nextDay });
      }
    }
    if (codigo) {
      const c = Number(codigo);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :codigo", { codigo: c });
    }
    if (numero) {
      const n = Number(numero);
      if (!Number.isNaN(n)) qb.andWhere("r.Form2 = :numero", { numero: n });
    }

    // Load materias first so we can apply advancedFilters to the query if provided
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Parse advancedFilters if provided (sent as JSON string in query)
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(String(advancedFiltersRaw));
      } catch (e) {
        // ignore parse errors and continue without advanced filters
      }
    }

    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);

    const rows = await qb.getMany();

    // Filtrar produtos inativos e produtos marcados para ignorar cálculos
    const produtosAtivos = await getProdutosAtivos(true);

    // Calcular estatísticas gerais normalizadas para kg (exclui produtos marcados para ignorar cálculos)
    let totalGeralKg = 0;
    for (const r of rows) {
      let rowTotalKg = 0;
      for (let i = 1; i <= 65; i++) {
        // Ignorar produtos que não devem entrar em cálculos
        if (!produtosAtivos.has(i)) continue;

        const raw =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;
        if (!raw || raw <= 0) continue;
        const mp = materiasByNum[i];
        if (mp && Number(mp.medida) === 0) {
          // stored in grams -> convert to kg
          rowTotalKg += raw / 1000;
        } else {
          rowTotalKg += raw;
        }
      }
      totalGeralKg += rowTotalKg;
    }

    const uniqueFormulas = new Set(rows.map((r) => r.Nome)).size;

    const uniqueDays = new Set(rows.map((r) => r.Dia).filter(Boolean)).size;

    return res.json({
      totalGeral: totalGeralKg,
      totalRecords: rows.length,
      uniqueFormulas,
      uniqueDays,
      average: rows.length > 0 ? totalGeralKg / rows.length : 0,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/chartdata/stats] error", e);
    return res.status(500).json({ error: "internal" });
  }
});

// Endpoint especializado: Dados de Semana Específica
app.get("/api/chartdata/semana", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);

    const { weekStart, formula, codigo, numero } = req.query;

    if (!weekStart) {
      return res
        .status(400)
        .json({ error: "weekStart parameter is required (YYYY-MM-DD)" });
    }

    // Calcular início e fim da semana
    const startDate = new Date(String(weekStart));
    if (isNaN(startDate.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid weekStart format. Use YYYY-MM-DD" });
    }

    // Ajustar para o início da semana (domingo)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Formatar datas para query
    const startStr = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
    const endStr = `${endDate.getFullYear()}-${String(
      endDate.getMonth() + 1
    ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

    const qb = repo
      .createQueryBuilder("r")
      .where("r.Dia >= :startStr", { startStr })
      .andWhere("r.Dia <= :endStr", { endStr })
      .orderBy("r.Dia", "ASC")
      .addOrderBy("r.Hora", "ASC");

    if (formula)
      qb.andWhere("r.Nome LIKE :formula", { formula: `%${formula}%` });
    if (codigo) {
      const c = Number(codigo);
      if (!Number.isNaN(c)) qb.andWhere("r.Form1 = :codigo", { codigo: c });
    }
    if (numero) {
      const n = Number(numero);
      if (!Number.isNaN(n)) qb.andWhere("r.Form2 = :numero", { numero: n });
    }

    // Load materias first so we can apply advancedFilters to the query
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Parse advancedFilters if provided (sent as JSON string in query)
    const advancedFiltersRaw = req.query.advancedFilters as string | undefined;
    let advancedFilters: any = null;
    if (advancedFiltersRaw) {
      try {
        advancedFilters = JSON.parse(String(advancedFiltersRaw));
      } catch (e) {
        // ignore parse errors and continue without advanced filters
      }
    }

    if (advancedFilters) applyAdvancedFiltersToQuery(qb, advancedFilters, materiasByNum);

    const rows = await qb.getMany();

    const parseDia = (dia?: string): Date | null => {
      if (!dia) return null;
      const s = dia.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T00:00:00");
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
        const parts = s.split("/");
        let y = parts[2];
        if (y.length === 2) y = String(2000 + Number(y));
        return new Date(Number(y), Number(parts[1]) - 1, Number(parts[0]));
      }
      const dt = new Date(s);
      return !isNaN(dt.getTime()) ? dt : null;
    };

    // materias already loaded above and mapped to materiasByNum

    // Agregar por dia da semana usando total normalizado por linha (kg)
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weekdayTotals = Array(7).fill(0);
    const weekdayCounts = Array(7).fill(0);

    // Also build a per-date total map (YYYY-MM-DD) so callers can get totals for specific dates
    const perDateTotals: Record<string, number> = {};

    // Produtos ativos para esta rota (exclui os marcados como ignorarCalculos)
    const produtosAtivosSemana = await getProdutosAtivos(true);
    console.log(`[api/chartdata/semana] Produtos ativos (excluindo ignorarCalculos): ${produtosAtivosSemana.size}`);

    for (const r of rows) {
      if (!r.Dia) continue;
      const date = parseDia(r.Dia);
      if (!date) continue;

      const dayIndex = date.getDay();
      const isoDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      // Calcular total da linha normalizado para kg somando TODOS os produtos
      let rowTotalKg = 0;

      for (let i = 1; i <= 65; i++) {
        // Ignorar produtos que não devem entrar em cálculos
        if (!produtosAtivosSemana.has(i)) continue;
        // Sempre lê do Prod_N no banco
        let raw = 0;
        const prodKey = `Prod_${i}`;
        if (Object.prototype.hasOwnProperty.call(r, prodKey) && r[prodKey] != null) {
          raw = typeof r[prodKey] === 'number' ? r[prodKey] : Number(r[prodKey]);
        }

        // Garantir que não há valores negativos
        if (raw < 0) raw = 0;

        // Pular zeros
        if (!raw || raw === 0) continue;

        const mp = materiasByNum[i];
        // Conversão baseada no tipo de unidade do produto
        let valueKg = raw;

        if (mp) {
          const medida = typeof mp.medida === 'number' ? mp.medida : Number(mp.medida || 1);
          if (medida === 0) {
            // Armazenado em gramas no banco -> converter para kg
            valueKg = raw / 1000;
          } else {
            // Já em kg
            valueKg = raw;
          }
        } else {
          // Se não achar metadata, assume kg (segurança)
          valueKg = raw;
        }

        rowTotalKg += valueKg;
      }

      // Só contar a linha se tiver alguma produção válida
      if (isNaN(rowTotalKg) || rowTotalKg <= 0) continue;

      weekdayTotals[dayIndex] += rowTotalKg;
      weekdayCounts[dayIndex] += 1;

      // accumulate per-date total (use ISO date yyyy-mm-dd)
      perDateTotals[isoDay] = (perDateTotals[isoDay] || 0) + rowTotalKg;
    }

    const chartData = weekdays.map((name, idx) => ({
      name,
      value: weekdayTotals[idx],
      count: weekdayCounts[idx],
      average:
        weekdayCounts[idx] > 0 ? weekdayTotals[idx] / weekdayCounts[idx] : 0,
    }));

    const weekTotal = weekdayTotals.reduce((sum, val) => sum + val, 0);
    const peakDay = chartData.reduce(
      (max, item) => (item.value > max.value ? item : max),
      chartData[0]
    );

    // Build per-date chart array sorted by date
    const chartDataByDate = Object.keys(perDateTotals)
      .sort()
      .map((d) => ({ date: d, value: perDateTotals[d] }));

    return res.json({
      chartData,
      chartDataByDate,
      weekStart: startStr,
      weekEnd: endStr,
      total: weekTotal,
      totalRecords: rows.length,
      peakDay: peakDay.name,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[api/chartdata/semana] error", e);
    return res.status(500).json({ error: "internal" });
  }
});

// POST: compute multiple weeks in one call
app.post("/api/chartdata/semana/bulk", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Relatorio);

    const { weekStarts, formula, codigo, numero } = req.body || {};

    if (!Array.isArray(weekStarts) || weekStarts.length === 0) {
      return res
        .status(400)
        .json({ error: "weekStarts must be an array of YYYY-MM-DD strings" });
    }

    const results: any[] = [];

    for (const ws of weekStarts) {
      const startDate = new Date(String(ws));
      if (isNaN(startDate.getTime())) {
        results.push({ weekStart: ws, error: "invalid date" });
        continue;
      }

      // Adjust to beginning of week (Sunday)
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      const startStr = `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`;
      const endStr = `${endDate.getFullYear()}-${String(
        endDate.getMonth() + 1
      ).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

      const qb = repo
        .createQueryBuilder("r")
        .where("r.Dia >= :startStr", { startStr })
        .andWhere("r.Dia <= :endStr", { endStr })
        .orderBy("r.Dia", "ASC")
        .addOrderBy("r.Hora", "ASC");

      if (formula)
        qb.andWhere("r.Nome LIKE :formula", { formula: `%${formula}%` });

      const rows = await qb.getMany();
      const parseDia = (dia?: string): Date | null => {
        if (!dia) return null;
        const s = dia.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T00:00:00");
        if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
          const parts = s.split("/");
          let y = parts[2];
          if (y.length === 2) y = String(2000 + Number(y));
          return new Date(Number(y), Number(parts[1]) - 1, Number(parts[0]));
        }
        const dt = new Date(s);
        return !isNaN(dt.getTime()) ? dt : null;
      };

      // Load materias to normalize per-row totals
      const materias = await materiaPrimaService.getAll();
      const materiasByNum: Record<number, any> = {};
      for (const m of materias) {
        const n = typeof m.num === "number" ? m.num : Number(m.num);
        if (!Number.isNaN(n)) materiasByNum[n] = m;
      }

      // Filtrar produtos inativos e produtos marcados para ignorar cálculos (usado por gráficos semanais em lote)
      const produtosAtivos = await getProdutosAtivos(true);
      console.log(`[api/chartdata/semana/bulk] Produtos ativos (excluindo ignorarCalculos): ${produtosAtivos.size}`);

      const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const weekdayTotals = Array(7).fill(0);
      const weekdayCounts = Array(7).fill(0);

      for (const r of rows) {
        if (!r.Dia) continue;
        const date = parseDia(r.Dia);
        if (!date) continue;
        const dayIndex = date.getDay();

        // Calcular total da linha normalizado para kg
        let rowTotalKg = 0;
        for (let i = 1; i <= 65; i++) {
          // Ignorar produtos que não devem entrar em cálculos
          if (!produtosAtivos.has(i)) continue;

          const raw =
            typeof r[`Prod_${i}`] === "number"
              ? r[`Prod_${i}`]
              : r[`Prod_${i}`] != null
                ? Number(r[`Prod_${i}`])
                : 0;
          if (!raw || raw <= 0) continue;
          const mp = materiasByNum[i];
          if (mp && Number(mp.medida) === 0) {
            // stored in grams -> convert to kg
            rowTotalKg += raw / 1000;
          } else {
            rowTotalKg += raw;
          }
        }

        if (isNaN(rowTotalKg) || rowTotalKg <= 0) continue;
        weekdayTotals[dayIndex] += rowTotalKg;
        weekdayCounts[dayIndex] += 1;
      }

      const chartData = weekdays.map((name, idx) => ({
        name,
        value: weekdayTotals[idx],
        count: weekdayCounts[idx],
        average:
          weekdayCounts[idx] > 0 ? weekdayTotals[idx] / weekdayCounts[idx] : 0,
      }));

      const weekTotal = weekdayTotals.reduce((sum, val) => sum + val, 0);
      const peakDay = chartData.reduce(
        (max, item) => (item.value > max.value ? item : max),
        chartData[0]
      );

      results.push({
        weekStart: startStr,
        weekEnd: endStr,
        chartData,
        total: weekTotal,
        totalRecords: rows.length,
        peakDay: peakDay.name,
      });
    }

    return res.json({ results, ts: new Date().toISOString() });
  } catch (e) {
    console.error("[api/chartdata/semana/bulk] error", e);
    return res.status(500).json({ error: "internal" });
  }
});

// ==================== ENDPOINTS DE ESTATÍSTICAS ====================

// GET /api/stats - Obter estatísticas de uso
app.get('/api/stats', async (req, res) => {
  try {
    const { startDate, endDate, endpoint, limit } = req.query;

    const options: any = {};
    if (startDate) options.startDate = new Date(String(startDate));
    if (endDate) options.endDate = new Date(String(endDate));
    if (endpoint) options.endpoint = String(endpoint);
    if (limit) options.limit = Number(limit);

    const entries = statsLogger.readStats(options);
    const metrics = statsLogger.getMetrics(entries);

    return res.json({
      entries,
      metrics,
      period: {
        start: options.startDate?.toISOString() || null,
        end: options.endDate?.toISOString() || null
      }
    });
  } catch (e: any) {
    console.error('[api/stats] error', e);
    return res.status(500).json({ error: e?.message || 'internal' });
  }
});

// GET /api/stats/metrics - Obter apenas métricas agregadas
app.get('/api/stats/metrics', async (req, res) => {
  try {
    const { startDate, endDate, endpoint } = req.query;

    const options: any = {};
    if (startDate) options.startDate = new Date(String(startDate));
    if (endDate) options.endDate = new Date(String(endDate));
    if (endpoint) options.endpoint = String(endpoint);

    const entries = statsLogger.readStats(options);
    const metrics = statsLogger.getMetrics(entries);

    return res.json(metrics);
  } catch (e: any) {
    console.error('[api/stats/metrics] error', e);
    return res.status(500).json({ error: e?.message || 'internal' });
  }
});

// POST /api/stats/cleanup - Limpar logs antigos
app.post('/api/stats/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;
    statsLogger.cleanup(Number(daysToKeep));
    return res.json({ ok: true, message: 'Logs antigos removidos' });
  } catch (e: any) {
    console.error('[api/stats/cleanup] error', e);
    return res.status(500).json({ error: e?.message || 'internal' });
  }
});

// ==================== ENDPOINTS AMENDOIM ====================

import { AmendoimService } from "./services/AmendoimService";

// POST /api/amendoim/upload - Upload e processamento de CSV de amendoim
const amendoimUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

app.post('/api/amendoim/upload', amendoimUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // const csvContent = req.file.buffer.toString('utf-8');
    const buffer = req.file.buffer;
    let csvContent = iconv.decode(buffer, 'utf8');
    if (csvContent.includes('\uFFFD')) {
      console.log(`[API Upload] ⚠️ Detectado possível problema de encoding (UTF-8 inválido). Tentando Latin1...`);
      csvContent = iconv.decode(buffer, 'win1252');
    }
    const resultado = await AmendoimService.processarCSV(csvContent);

    return res.json({
      ok: true,
      ...resultado,
      mensagem: `${resultado.salvos} registros salvos (${resultado.entradasSalvas} entradas, ${resultado.saidasSalvas} saídas) de ${resultado.processados} processados`,
    });
  } catch (e: any) {
    console.error('[api/amendoim/upload] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao processar CSV' });
  }
});

// GET /api/amendoim/registros - Buscar registros com paginação e filtros
app.get('/api/amendoim/registros', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 100;
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;
    const codigoProduto = req.query.codigoProduto ? String(req.query.codigoProduto) : undefined;
    const nomeProduto = req.query.nomeProduto ? String(req.query.nomeProduto) : undefined;
    const tipo = req.query.tipo === 'saida' ? 'saida' : req.query.tipo === 'entrada' ? 'entrada' : undefined;
    const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'dia';
    const sortDir = req.query.sortDir === 'ASC' ? 'ASC' : 'DESC';

    const resultado = await AmendoimService.buscarRegistros({
      page,
      pageSize,
      dataInicio,
      dataFim,
      codigoProduto,
      nomeProduto,
      tipo,
      sortBy,
      sortDir,
    });

    return res.json(resultado);
  } catch (e: any) {
    console.error('[api/amendoim/registros] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao buscar registros' });
  }
});

// GET /api/amendoim/estatisticas - Obter estatísticas dos registros
app.get('/api/amendoim/estatisticas', async (req, res) => {
  try {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;
    const tipo = req.query.tipo === 'saida' ? 'saida' : req.query.tipo === 'entrada' ? 'entrada' : undefined;
    const codigoProduto = req.query.codigoProduto ? String(req.query.codigoProduto) : undefined;
    const nomeProduto = req.query.nomeProduto ? String(req.query.nomeProduto) : undefined;

    const estatisticas = await AmendoimService.obterEstatisticas({
      dataInicio,
      dataFim,
      tipo,
      codigoProduto,
      nomeProduto,
    });

    return res.json(estatisticas);
  } catch (e: any) {
    console.error('[api/amendoim/estatisticas] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter estatísticas' });
  }
});

// GET /api/amendoim/filtrosDisponiveis - Obter filtros disponíveis
app.get('/api/amendoim/filtrosDisponiveis', async (req, res) => {
  try {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;

    const repository = AppDataSource.getRepository(Amendoim);
    const qb = repository.createQueryBuilder('a');

    // Convert dates from YYYY-MM-DD to DD/MM/YY format for comparison
    const convertDateToDBFormat = (dateStr?: string): string | undefined => {
      if (!dateStr) return undefined;
      // If already in DD/MM/YY format, return as is
      if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      // If in DD-MM-YY format, convert to DD/MM/YY
      if (/^\d{2}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr.replace(/-/g, '/');
      }
      // Convert YYYY-MM-DD to DD/MM/YY
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        const shortYear = year.slice(-2);
        return `${day}/${month}/${shortYear}`;
      }
      return dateStr;
    };

    if (dataInicio) {
      const dataInicioDB = convertDateToDBFormat(dataInicio);
      qb.andWhere("a.dia >= :dataInicio", { dataInicio: dataInicioDB });
    }
    if (dataFim) {
      const dataFimDB = convertDateToDBFormat(dataFim);
      qb.andWhere("a.dia <= :dataFim", { dataFim: dataFimDB });
    }

    const tipo = req.query.tipo ? String(req.query.tipo) : undefined;
    if (tipo && (tipo === 'entrada' || tipo === 'saida')) {
      qb.andWhere("a.tipo = :tipo", { tipo });
    }

    // Buscar códigos únicos de produtos
    const codigosProduto = await qb
      .select('DISTINCT a.codigoProduto', 'codigo')
      .orderBy('a.codigoProduto', 'ASC')
      .getRawMany();

    return res.json({
      codigosProduto: codigosProduto.map(c => c.codigo).filter(Boolean)
    });
  } catch (e: any) {
    console.error('[api/amendoim/filtrosDisponiveis] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter filtros disponíveis' });
  }
});

// GET /api/amendoim/chartdata/produtos - Dados para gráfico de produtos
app.get('/api/amendoim/chartdata/produtos', async (req, res) => {
  try {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;
    const codigoProduto = req.query.codigoProduto ? String(req.query.codigoProduto) : undefined;
    const tipo = req.query.tipo === 'saida' ? 'saida' : req.query.tipo === 'entrada' ? 'entrada' : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const chartData = await AmendoimService.getChartDataProdutos({
      dataInicio,
      dataFim,
      codigoProduto,
      tipo,
      limit,
    });

    // ⚠️ Filtrar produtos ignorarCalculos=true
    const materiaPrimaCache = await getMateriaPrimaCache();
    const produtosIgnorados = new Set(
      Object.values(materiaPrimaCache)
        .filter((mp: any) => mp.ignorarCalculos === true)
        .map((mp: any) => mp.nomeProduto)
    );

    return res.json({
      ...chartData,
      chartData: chartData.chartData.filter((d: any) => !produtosIgnorados.has(d.name)),
      total: chartData.chartData
        .filter((d: any) => !produtosIgnorados.has(d.name))
        .reduce((sum: number, d: any) => sum + d.value, 0),
      totalRecords: chartData.chartData.filter((d: any) => !produtosIgnorados.has(d.name)).length,
    });
  } catch (e: any) {
    console.error('[api/amendoim/chartdata/produtos] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter dados do gráfico' });
  }
});

// GET /api/amendoim/chartdata/caixas - Dados para gráfico de caixas
app.get('/api/amendoim/chartdata/caixas', async (req, res) => {
  try {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;
    const codigoProduto = req.query.codigoProduto ? String(req.query.codigoProduto) : undefined;
    const tipo = req.query.tipo === 'saida' ? 'saida' : req.query.tipo === 'entrada' ? 'entrada' : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const chartData = await AmendoimService.getChartDataCaixas({
      dataInicio,
      dataFim,
      codigoProduto,
      tipo,
      limit,
    });

    // ⚠️ Filtrar produtos ignorarCalculos=true
    const materiaPrimaCache = await getMateriaPrimaCache();
    const produtosIgnorados = new Set(
      Object.values(materiaPrimaCache)
        .filter((mp: any) => mp.ignorarCalculos === true)
        .map((mp: any) => mp.nomeProduto)
    );

    return res.json({
      ...chartData,
      chartData: chartData.chartData.filter((d: any) => !produtosIgnorados.has(d.name)),
      total: chartData.chartData
        .filter((d: any) => !produtosIgnorados.has(d.name))
        .reduce((sum: number, d: any) => sum + d.value, 0),
      totalRecords: chartData.chartData.filter((d: any) => !produtosIgnorados.has(d.name)).length,
    });
  } catch (e: any) {
    console.error('[api/amendoim/chartdata/caixas] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter dados do gráfico' });
  }
});

// GET /api/amendoim/chartdata/entradaSaida - Dados para donut Entrada x Saída
app.get('/api/amendoim/chartdata/entradaSaida', async (req, res) => {
  try {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;

    const metricas = await AmendoimService.calcularMetricasRendimento({ dataInicio, dataFim });

    if (!metricas) {
      return res.json({ chartData: [], total: 0, totalRecords: 0 });
    }

    // ⚠️ Filtrar produtos ignorarCalculos=true para cálculo de métricas
    const materiaPrimaCache = await getMateriaPrimaCache();
    const produtosAtivos = Object.values(materiaPrimaCache).filter(
      (mp: any) => mp.ativo !== false && mp.ignorarCalculos !== true
    );

    // Se não há produtos ativos, retornar vazio
    if (produtosAtivos.length === 0) {
      return res.json({ chartData: [], total: 0, totalRecords: 0 });
    }

    const entrada = Number(metricas.pesoEntrada || 0);
    const saida = Number(metricas.pesoSaida || 0);
    const chartData = [
      { name: 'Entrada', value: entrada, count: 0 },
      { name: 'Saída', value: saida, count: 0 },
    ];

    return res.json({ chartData, total: entrada + saida, totalRecords: 1 });
  } catch (e: any) {
    console.error('[api/amendoim/chartdata/entradaSaida] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter dados do gráfico' });
  }
});

// GET /api/amendoim/chartdata/horarios - Dados para gráfico de horários
app.get('/api/amendoim/chartdata/horarios', async (req, res) => {
  try {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;
    const codigoProduto = req.query.codigoProduto ? String(req.query.codigoProduto) : undefined;
    const tipo = req.query.tipo === 'saida' ? 'saida' : req.query.tipo === 'entrada' ? 'entrada' : undefined;

    const chartData = await AmendoimService.getChartDataHorarios({
      dataInicio,
      dataFim,
      codigoProduto,
      tipo,
    });

    // ⚠️ Filtrar produtos ignorarCalculos=true
    const materiaPrimaCache = await getMateriaPrimaCache();
    const produtosIgnorados = new Set(
      Object.values(materiaPrimaCache)
        .filter((mp: any) => mp.ignorarCalculos === true)
        .map((mp: any) => mp.nomeProduto)
    );

    const chartDataFiltrado = chartData.chartData.filter((d: any) => !produtosIgnorados.has(d.name));
    const totalFiltrado = chartDataFiltrado.reduce((sum: number, d: any) => sum + d.value, 0);

    return res.json({
      ...chartData,
      chartData: chartDataFiltrado,
      total: totalFiltrado,
      totalRecords: chartDataFiltrado.length,
    });
  } catch (e: any) {
    console.error('[api/amendoim/chartdata/horarios] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter dados do gráfico' });
  }
});

// ==================== CONFIGURAÇÃO AMENDOIM ====================
// Usa ihm-config diretamente ao invés de amendoim-config

// GET /api/amendoim/config - Obter configuração atual
app.get('/api/amendoim/config', async (req, res) => {
  try {
    let config = getRuntimeConfig('ihm-config') || {};

    // 🔄 MIGRAÇÃO AUTOMÁTICA: Converter ip2/user2/password2 para ihm2.ip
    if (config.duasIHMs && !config.ihm2 && config.ip2) {
      console.log('[api/amendoim/config GET] 🔄 Migrando config antiga (ip2) para nova estrutura (ihm2)');
      config.ihm2 = {
        ip: config.ip2 || '',
        user: config.user2 || 'anonymous',
        password: config.password2 || '',
        caminhoRemoto: config.localCSV2 || '/InternalStorage/data/',
        usadaPara: 'saida',
      };
      // Salvar configuração migrada
      await setRuntimeConfigs({ 'ihm-config': config });
      console.log('[api/amendoim/config GET] ✅ Config migrada e salva:', config.ihm2);
    }

    // console.log('[api/amendoim/config GET] Config completo:', JSON.stringify(config, null, 2));
    // console.log('[api/amendoim/config GET] config.duasIHMs:', config.duasIHMs);
    // console.log('[api/amendoim/config GET] config.ihm2:', config.ihm2);
    // console.log('[api/amendoim/config GET] config.ihm2?.ip:', config.ihm2?.ip);

    // Validar configuração
    const validation = {
      isValid: true,
      errors: [] as string[],
      needsIhmSelection: false,
    };

    // // Se IHM1 não configurada
    // if (!config.ip || !config.ip.trim()) {
    //   validation.isValid = false;
    //   validation.errors.push('IP da IHM1 é obrigatório.');
    // }

    // ⚠️ Validação IHM2 temporariamente desabilitada para testes
    // if (config.duasIHMs && (!config.ihm2?.ip || !config.ihm2.ip.trim())) {
    //   validation.isValid = false;
    //   validation.errors.push('IHM2 não configurada. Configure o IP da IHM2 ou desmarque "Usar duas IHMs".');
    // }

    // Backwards-compat: return top-level keys for legacy scripts/tools
    // e.g. scripts/check-amendoim-config.ps1 expects fields at root
    const flat: Record<string, any> = { ...(config || {}) };

    // If duasIHMs is true but ihm2 not present, provide a placeholder so tools show a consistent shape
    if (flat.duasIHMs && !flat.ihm2) {
      flat.ihm2 = {
        ip: '',
        user: 'anonymous',
        password: '',
        caminhoRemoto: '/InternalStorage/data/',
        usadaPara: 'saida',
      };
    }

    return res.json({ config, validation, ...flat });
  } catch (e: any) {
    console.error('[api/amendoim/config] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter configuração' });
  }
});

// POST /api/amendoim/config - Atualizar configuração

// GET /api/amendoim/chartdata/last30 - últimos 30 dias (linha)
app.get('/api/amendoim/chartdata/last30', async (req, res) => {
  try {
    const today = new Date();
    const prev = new Date();
    prev.setDate(prev.getDate() - 29);

    const fmt = (d: Date) => `${d.getFullYear().toString().padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const dados = await AmendoimService.obterDadosAnalise({ dataInicio: fmt(prev), dataFim: fmt(today) });

    // ⚠️ Filtrar produtos ignorarCalculos=true
    const materiaPrimaCache = await getMateriaPrimaCache();
    const produtosIgnorados = new Set(
      Object.values(materiaPrimaCache)
        .filter((mp: any) => mp.ignorarCalculos === true)
        .map((mp: any) => mp.nomeProduto)
    );

    // Map rendimentoPorDia to chart friendly shape
    const chartData = (dados.rendimentoPorDia || []).map((d: any) => ({ name: d.dia, entrada: d.entrada, saida: d.saida }));

    return res.json({ chartData, total: chartData.reduce((s: number, x: any) => s + (x.entrada + x.saida), 0) });
  } catch (e: any) {
    console.error('[api/amendoim/chartdata/last30] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter dados last30' });
  }
});

app.post('/api/amendoim/config', async (req, res) => {
  try {
    // Salvar configuração diretamente no ihm-config
    const configData = req.body;

    // 🔍 DEBUG: Log da configuração recebida
    console.log('[api/amendoim/config POST] Configuração recebida:');
    console.log('  - payload completo:', JSON.stringify(configData, null, 2));
    console.log('  - arquivoEntrada:', configData.arquivoEntrada);
    console.log('  - arquivoSaida:', configData.arquivoSaida);
    console.log('  - duasIHMs:', configData.duasIHMs);
    console.log('  - ihm2:', JSON.stringify(configData.ihm2, null, 2));
    console.log('  - ihm2?.ip:', configData.ihm2?.ip);

    await setRuntimeConfigs({ 'ihm-config': configData });

    const savedConfig = getRuntimeConfig('ihm-config') || {};
    console.log('[api/amendoim/config POST] Config salvo:', JSON.stringify(savedConfig, null, 2));
    console.log('[api/amendoim/config POST] savedConfig.duasIHMs:', savedConfig.duasIHMs);
    console.log('[api/amendoim/config POST] savedConfig.ihm2:', savedConfig.ihm2);

    return res.json({ success: true, config: savedConfig });
  } catch (e: any) {
    console.error('[api/amendoim/config] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao atualizar configuração' });
  }
});

// GET /api/amendoim/metricas/rendimento - Calcular métricas de rendimento (entrada vs saída)
app.get('/api/amendoim/metricas/rendimento', async (req, res) => {
  try {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;
    const codigoProduto = req.query.codigoProduto ? String(req.query.codigoProduto) : undefined;
    const nomeProduto = req.query.nomeProduto ? String(req.query.nomeProduto) : undefined;

    const metricas = await AmendoimService.calcularMetricasRendimento({
      dataInicio,
      dataFim,
      codigoProduto,
      nomeProduto,
    });

    return res.json(metricas);
  } catch (e: any) {
    console.error('[api/amendoim/metricas/rendimento] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao calcular métricas' });
  }
});

// GET /api/amendoim/analise - Obter dados pré-processados para gráficos de análise
app.get('/api/amendoim/analise', async (req, res) => {
  try {
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;

    console.log('[API /api/amendoim/analise] REQUEST - dataInicio:', dataInicio, 'dataFim:', dataFim);

    const dadosAnalise = await AmendoimService.obterDadosAnalise({
      dataInicio,
      dataFim,
    });

    console.log('[API /api/amendoim/analise] RESPONSE - entradaSaidaPorHorario length:', dadosAnalise.entradaSaidaPorHorario.length);
    console.log('[API /api/amendoim/analise] RESPONSE - sample:', JSON.stringify(dadosAnalise.entradaSaidaPorHorario.slice(0, 3)));

    return res.json(dadosAnalise);
  } catch (e: any) {
    console.error('[api/amendoim/analise] error', e);
    // Sempre retornar estrutura válida, mesmo em erro
    const emptyStructure = {
      entradaSaidaPorHorario: Array.from({ length: 24 }, (_, h) => ({ hora: h, entrada: 0, saida: 0 })),
      rendimentoPorDia: [],
      fluxoSemanal: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map(dia => ({ diaSemana: dia, entrada: 0, saida: 0 })),
      eficienciaPorTurno: [
        { turno: "Madrugada", entrada: 0, saida: 0, rendimento: 0 },
        { turno: "Manhã", entrada: 0, saida: 0, rendimento: 0 },
        { turno: "Tarde", entrada: 0, saida: 0, rendimento: 0 },
        { turno: "Noite", entrada: 0, saida: 0, rendimento: 0 },
      ],
      perdaAcumulada: [],
    };
    return res.status(200).json(emptyStructure);
  }
});

// GET /api/amendoim/count - Verifica quantos registros existem
app.get('/api/amendoim/count', async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Amendoim);
    const total = await repo.count();
    const entrada = await repo.count({ where: { tipo: 'entrada' } });
    const saida = await repo.count({ where: { tipo: 'saida' } });

    console.log('[api/amendoim/count]', { total, entrada, saida });

    return res.json({ total, entrada, saida });
  } catch (e: any) {
    console.error('[api/amendoim/count] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao contar registros' });
  }
});

// GET /api/amendoim/datas - Retorna intervalo de datas disponíveis
app.get('/api/amendoim/datas', async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Amendoim);
    const registros = await repo.find({
      select: ['dia'],
      order: { dia: 'ASC' },
    });

    if (registros.length === 0) {
      return res.json({ min: null, max: null, datas: [] });
    }

    const datas = [...new Set(registros.map(r => r.dia))].sort();

    console.log('[api/amendoim/datas]', { min: datas[0], max: datas[datas.length - 1], total: datas.length });

    return res.json({
      min: datas[0],
      max: datas[datas.length - 1],
      datas
    });
  } catch (e: any) {
    console.error('[api/amendoim/datas] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao buscar datas' });
  }
});

// POST /api/amendoim/seed - Popula dados de teste (desenvolvimento apenas)
app.post('/api/amendoim/seed', async (req, res) => {
  try {
    console.log('[api/amendoim/seed] Gerando dados de teste...');

    const hoje = new Date();
    const csvLines: string[] = [];

    // Gerar dados para últimos 7 dias
    for (let d = 0; d < 7; d++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - d);
      const diaStr = data.toISOString().split('T')[0];
      const [y, m, dd] = diaStr.split('-');
      const diaFormatado = `${dd}-${m}-${y.slice(2)}`; // DD-MM-YY

      // Dados de entrada
      for (let h = 6; h < 18; h++) {
        const hora = `${String(h).padStart(2, '0')}:00:00`;
        const peso = 100 + Math.random() * 400;
        csvLines.push(`${diaFormatado} ${hora},X,001,CX${h},Amendoim Cru,X,X,${peso.toFixed(2)}`);
      }
    }

    const csvEntrada = csvLines.join('\n');
    const resultEntrada = await AmendoimService.processarCSV(csvEntrada);

    // Dados de saída
    const csvLinesSaida: string[] = [];
    for (let d = 0; d < 7; d++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() - d);
      const diaStr = data.toISOString().split('T')[0];
      const [y, m, dd] = diaStr.split('-');
      const diaFormatado = `${dd}-${m}-${y.slice(2)}`;

      for (let h = 6; h < 18; h++) {
        const hora = `${String(h).padStart(2, '0')}:30:00`;
        const pesoOriginal = 100 + Math.random() * 400;
        const rendimento = 0.70 + Math.random() * 0.10;
        const peso = pesoOriginal * rendimento;
        csvLinesSaida.push(`${diaFormatado} ${hora},X,001,CX${h},Amendoim Debulhado,X,X,${peso.toFixed(2)}`);
      }
    }

    const csvSaida = csvLinesSaida.join('\n');
    const resultSaida = await AmendoimService.processarCSV(csvSaida);

    console.log('[api/amendoim/seed] Concluído!', {
      entrada: resultEntrada,
      saida: resultSaida
    });

    return res.json({
      success: true,
      entrada: resultEntrada,
      saida: resultSaida,
      message: 'Dados de teste criados com sucesso'
    });
  } catch (e: any) {
    console.error('[api/amendoim/seed] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao criar dados de teste' });
  }
});

// ==================== COLETOR AMENDOIM ====================
import { AmendoimCollectorService } from './services/AmendoimCollectorService';

// POST /api/amendoim/collector/start - Inicia o coletor automático
app.post('/api/amendoim/collector/start', async (req, res) => {
  try {
    const intervalMinutes = req.body.intervalMinutes || 5; // Padrão 5 minutos
    await AmendoimCollectorService.start(intervalMinutes);
    return res.json({ success: true, message: 'Coletor iniciado com sucesso' });
  } catch (e: any) {
    console.error('[api/amendoim/collector/start] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao iniciar coletor' });
  }
});

// POST /api/amendoim/collector/stop - Para o coletor automático
app.post('/api/amendoim/collector/stop', async (req, res) => {
  try {
    AmendoimCollectorService.stop();
    return res.json({ success: true, message: 'Coletor parado com sucesso' });
  } catch (e: any) {
    console.error('[api/amendoim/collector/stop] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao parar coletor' });
  }
});

// GET /api/amendoim/collector/status - Retorna o status do coletor
app.get('/api/amendoim/collector/status', async (req, res) => {
  try {
    const status = AmendoimCollectorService.getStatus();
    return res.json(status);
  } catch (e: any) {
    console.error('[api/amendoim/collector/status] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter status' });
  }
});

// POST /api/amendoim/collector/collect - Executa uma coleta única
app.post('/api/amendoim/collector/collect', async (req, res) => {
  try {
    const result = await AmendoimCollectorService.collectOnce();
    return res.json(result);
  } catch (e: any) {
    console.error('[api/amendoim/collector/collect] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao executar coleta' });
  }
});



// GET /api/amendoim/collector/cache/stats - Estatísticas do cache
app.get('/api/amendoim/collector/cache/stats', async (req, res) => {
  try {
    const stats = AmendoimCollectorService.getCacheStats();
    return res.json(stats);
  } catch (e: any) {
    console.error('[api/amendoim/collector/cache/stats] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao obter estatísticas do cache' });
  }
});

// DELETE /api/amendoim/collector/cache - Limpar todo o cache
app.delete('/api/amendoim/collector/cache', async (req, res) => {
  try {
    await AmendoimCollectorService.clearAllCache();
    return res.json({ success: true, message: 'Cache limpo com sucesso' });
  } catch (e: any) {
    console.error('[api/amendoim/collector/cache] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao limpar cache' });
  }
});

// DELETE /api/amendoim/collector/cache/:fileName - Limpar cache de arquivo específico
app.delete('/api/amendoim/collector/cache/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const deleted = await AmendoimCollectorService.clearFileCache(fileName);
    return res.json({
      success: true,
      deleted,
      message: deleted ? 'Cache do arquivo limpo com sucesso' : 'Arquivo não encontrado no cache'
    });
  } catch (e: any) {
    console.error('[api/amendoim/collector/cache/:fileName] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao limpar cache do arquivo' });
  }
});

// ==================== EXPORTAÇÃO AMENDOIM ====================

// GET /api/amendoim/exportExcel - Exportar dados de amendoim para Excel
app.get('/api/amendoim/exportExcel', async (req, res) => {
  try {
    // Filtros
    const tipo = req.query.tipo ? String(req.query.tipo) : undefined;
    const codigoProduto = req.query.codigoProduto ? String(req.query.codigoProduto) : undefined;
    const nomeProduto = req.query.nomeProduto ? String(req.query.nomeProduto) : undefined;
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;

    // Função para converter data YYYY-MM-DD para DD/MM/YY (formato do banco)
    const convertDateToDBFormat = (dateStr: string): string => {
      if (!dateStr) return dateStr;
      // Se já está em formato DD/MM/YY com barra, retornar como está
      if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateStr)) return dateStr;
      // Converter YYYY-MM-DD para DD/MM/YY
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
      }
      return dateStr;
    };

    console.log('[Excel Export GET] 🔍 Filtros recebidos:', { tipo, codigoProduto, nomeProduto, dataInicio, dataFim });

    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("a");

    // Aplicar filtros
    if (tipo && (tipo === 'entrada' || tipo === 'saida')) {
      qb.andWhere("a.tipo = :tipo", { tipo });
    }
    if (codigoProduto) {
      qb.andWhere("a.codigoProduto = :codigoProduto", { codigoProduto });
    }
    if (nomeProduto) {
      qb.andWhere("LOWER(a.nomeProduto) LIKE LOWER(:nomeProduto)", {
        nomeProduto: `%${nomeProduto}%`
      });
    }
    // Handle date filters differently depending on DB engine.
    // MySQL: use STR_TO_DATE / DATE_ADD in SQL for efficient filtering.
    // Other engines (SQLite fallback): fetch rows and filter in JS to avoid missing SQL functions.
    const isMySQL = (AppDataSource.options as any)?.type === 'mysql';

    if (isMySQL) {
      if (dataInicio) {
        const dataInicioDB = convertDateToDBFormat(dataInicio);
        console.log('[Excel Export GET] 📅 Conversão dataInicio (SQL path):', { original: dataInicio, convertido: dataInicioDB });
        qb.andWhere("STR_TO_DATE(a.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicioDB, '%d/%m/%y')", { dataInicioDB });
      }
      if (dataFim) {
        const dataFimDB = convertDateToDBFormat(dataFim);
        console.log('[Excel Export GET] 📅 Conversão dataFim (SQL path):', { original: dataFim, convertido: dataFimDB });
        qb.andWhere("STR_TO_DATE(a.dia, '%d/%m/%y') < DATE_ADD(STR_TO_DATE(:dataFimDB, '%d/%m/%y'), INTERVAL 1 DAY)", { dataFimDB });
      }
    } else {
      // Non-MySQL: we'll apply data filters in JS after fetching rows.
      if (dataInicio) console.log('[Excel Export GET] 📅 dataInicio provided (JS filter path):', dataInicio);
      if (dataFim) console.log('[Excel Export GET] 📅 dataFim provided (JS filter path):', dataFim);
    }

    qb.orderBy("STR_TO_DATE(a.dia, '%d/%m/%y')", "ASC").addOrderBy("a.hora", "ASC");

    // Log da SQL gerada para debug
    const sql = qb.getSql();
    console.log('[Excel Export GET] 📋 SQL Gerada:', sql);

    let registros = await qb.getMany();
    console.log('[Excel Export GET] ✅ Registros encontrados (pre-date-filter):', registros.length);

    // If not using MySQL, apply inclusive/exclusive date filtering in JS to avoid DB function incompatibilities.
    if (!isMySQL && (dataInicio || dataFim)) {
      const normalizeToISO = (d: string) => {
        // Accepts YYYY-MM-DD or DD/MM/YY or DD/MM/YYYY
        if (!d) return null as string | null;
        const s = String(d).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        if (/^\d{2}\/\d{2}\/\d{2}$/.test(s)) {
          const [day, month, year] = s.split('/');
          const fullYear = Number(year) < 50 ? '20' + year : '19' + year;
          return `${fullYear}-${month}-${day}`;
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
          const [day, month, year] = s.split('/');
          return `${year}-${month}-${day}`;
        }
        return null;
      };

      const startISO = dataInicio ? normalizeToISO(dataInicio) : null;
      const endISOExclusive = dataFim ? (() => {
        const iso = normalizeToISO(dataFim!);
        if (!iso) return null;
        const dt = new Date(iso);
        dt.setDate(dt.getDate() + 1);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      })() : null;

      registros = registros.filter(r => {
        try {
          const dia = String(r.dia || '').trim();
          // dia stored as DD/MM/YY
          const parts = dia.split('/');
          if (parts.length !== 3) return false;
          const year = Number(parts[2]);
          const fullYear = year < 50 ? 2000 + year : 1900 + year;
          const iso = `${fullYear}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;

          if (startISO && iso < startISO) return false;
          if (endISOExclusive && iso >= endISOExclusive) return false;
          return true;
        } catch (e) {
          return false;
        }
      });

      console.log('[Excel Export GET] ✅ Registros após filtro JS:', registros.length);
    }

    // ROBUST SORTING (JS Fallback): Ensure chronological order (Date + Time)
    registros.sort((a, b) => {
      const parseDateTime = (d: string, t: string) => {
        try {
          const dParts = d.split('/'); // DD/MM/YY
          if (dParts.length !== 3) return 0;
          const year = Number(dParts[2]) < 50 ? 2000 + Number(dParts[2]) : 1900 + Number(dParts[2]);
          const month = Number(dParts[1]) - 1;
          const day = Number(dParts[0]);
          
          const tParts = t.split(':');
          const hour = Number(tParts[0] || 0);
          const min = Number(tParts[1] || 0);
          const sec = Number(tParts[2] || 0);
          
          return new Date(year, month, day, hour, min, sec).getTime();
        } catch { return 0; }
      };
      
      const ta = parseDateTime(a.dia, a.hora);
      const tb = parseDateTime(b.dia, b.hora);
      return ta - tb;
    });

    // Criar workbook Excel
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Amendoim");

    // Cabeçalho (sem Código Caixa)
    ws.addRow([
      "Tipo",
      "Data",
      "Hora",
      "Código Produto",
      "Nome Produto",
      "Peso (kg)",
      "Balança"
    ]);

    // Estilizar cabeçalho
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Adicionar dados (sem codigoCaixa)
    for (const r of registros) {
      ws.addRow([
        r.tipo === 'entrada' ? 'Entrada' : 'Saída',
        r.dia,
        r.hora,
        r.codigoProduto,
        r.nomeProduto,
        r.peso,
        r.balanca || ""
      ]);
    }

    // Formatar colunas (peso agora é coluna 6)
    ws.getColumn(6).numFmt = "#,##0.000"; // Peso com 3 casas decimais

    // Auto-ajustar largura das colunas
    ws.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellLength = cell.value ? String(cell.value).length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Enviar arquivo
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Generate filename with dataInicio and dataFim if available
    let filename = 'relatorio';
    if (dataInicio && dataFim) {
      filename = `relatorio_${dataInicio}_${dataFim}`;
    } else if (dataInicio) {
      filename = `relatorio_${dataInicio}`;
    } else if (dataFim) {
      filename = `relatorio_ate_${dataFim}`;
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}.xlsx`
    );

    await wb.xlsx.write(res as any);
    res.end();
  } catch (e: any) {
    console.error("[exportExcel amendoim] error", e);
    return res.status(500).json({ error: "internal", details: e?.message });
  }
});

// POST /api/amendoim/exportExcel - Exportar com filtros no body
app.post('/api/amendoim/exportExcel', async (req, res) => {
  try {
    // Filtros do body
    const tipo = req.body.tipo || undefined;
    const codigoProduto = req.body.codigoProduto || undefined;
    const nomeProduto = req.body.nomeProduto || undefined;
    const dataInicio = req.body.dataInicio || undefined;
    const dataFim = req.body.dataFim || undefined;

    // Função para converter data YYYY-MM-DD para DD/MM/YY (formato do banco)
    const convertDateToDBFormat = (dateStr: string): string => {
      if (!dateStr) return dateStr;
      // Se já está em formato DD/MM/YY com barra, retornar como está
      if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateStr)) return dateStr;
      // Converter YYYY-MM-DD para DD/MM/YY
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
      }
      return dateStr;
    };

    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("a");

    // Aplicar filtros
    if (tipo && (tipo === 'entrada' || tipo === 'saida')) {
      qb.andWhere("a.tipo = :tipo", { tipo });
    }
    if (codigoProduto) {
      qb.andWhere("a.codigoProduto = :codigoProduto", { codigoProduto });
    }
    if (nomeProduto) {
      qb.andWhere("LOWER(a.nomeProduto) LIKE LOWER(:nomeProduto)", {
        nomeProduto: `%${nomeProduto}%`
      });
    }
    const isMySQL = (AppDataSource.options as any)?.type === 'mysql';

    if (isMySQL) {
      if (dataInicio) {
        const dataInicioDB = convertDateToDBFormat(dataInicio);
        // Usar STR_TO_DATE para comparação cronológica, não lexicográfica
        qb.andWhere("STR_TO_DATE(a.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicioDB, '%d/%m/%y')", { dataInicioDB });
      }
      if (dataFim) {
        const dataFimDB = convertDateToDBFormat(dataFim);
        // Usar STR_TO_DATE com < (exclusive) - comparar com próximo dia (dataFim + 1)
        // DATE_ADD retorna DATE, então não precisa STR_TO_DATE depois
        qb.andWhere("STR_TO_DATE(a.dia, '%d/%m/%y') < DATE_ADD(STR_TO_DATE(:dataFimDB, '%d/%m/%y'), INTERVAL 1 DAY)", { dataFimDB });
      }
    } else {
      if (dataInicio) console.log('[Excel Export POST] 📅 dataInicio provided (JS filter path):', dataInicio);
      if (dataFim) console.log('[Excel Export POST] 📅 dataFim provided (JS filter path):', dataFim);
    }

    qb.orderBy("STR_TO_DATE(a.dia, '%d/%m/%y')", "ASC").addOrderBy("a.hora", "ASC");

    // Log da SQL gerada para debug
    const sql = qb.getSql();
    console.log('[Excel Export POST] 📋 SQL Gerada:', sql);

    let registros = await qb.getMany();
    console.log('[Excel Export POST] ✅ Registros encontrados (pre-date-filter):', registros.length);

    if (!isMySQL && (dataInicio || dataFim)) {
      const normalizeToISO = (d: string) => {
        if (!d) return null as string | null;
        const s = String(d).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        if (/^\d{2}\/\d{2}\/\d{2}$/.test(s)) {
          const [day, month, year] = s.split('/');
          const fullYear = Number(year) < 50 ? '20' + year : '19' + year;
          return `${fullYear}-${month}-${day}`;
        }
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
          const [day, month, year] = s.split('/');
          return `${year}-${month}-${day}`;
        }
        return null;
      };

      const startISO = dataInicio ? normalizeToISO(dataInicio) : null;
      const endISOExclusive = dataFim ? (() => {
        const iso = normalizeToISO(dataFim!);
        if (!iso) return null;
        const dt = new Date(iso);
        dt.setDate(dt.getDate() + 1);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      })() : null;

      registros = registros.filter(r => {
        try {
          const dia = String(r.dia || '').trim();
          const parts = dia.split('/');
          if (parts.length !== 3) return false;
          const year = Number(parts[2]);
          const fullYear = year < 50 ? 2000 + year : 1900 + year;
          const iso = `${fullYear}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          if (startISO && iso < startISO) return false;
          if (endISOExclusive && iso >= endISOExclusive) return false;
          return true;
        } catch (e) {
          return false;
        }
      });

      console.log('[Excel Export POST] ✅ Registros após filtro JS:', registros.length);
    }

    // ROBUST SORTING (JS Fallback): Ensure chronological order (Date + Time)
    registros.sort((a, b) => {
      const parseDateTime = (d: string, t: string) => {
        try {
          const dParts = d.split('/'); // DD/MM/YY
          if (dParts.length !== 3) return 0;
          const year = Number(dParts[2]) < 50 ? 2000 + Number(dParts[2]) : 1900 + Number(dParts[2]);
          const month = Number(dParts[1]) - 1;
          const day = Number(dParts[0]);
          
          const tParts = t.split(':');
          const hour = Number(tParts[0] || 0);
          const min = Number(tParts[1] || 0);
          const sec = Number(tParts[2] || 0);
          
          return new Date(year, month, day, hour, min, sec).getTime();
        } catch { return 0; }
      };
      
      const ta = parseDateTime(a.dia, a.hora);
      const tb = parseDateTime(b.dia, b.hora);
      return ta - tb;
    });

    // Criar workbook Excel
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Amendoim");

    // Cabeçalho (sem Código Caixa)
    ws.addRow([
      "Tipo",
      "Data",
      "Hora",
      "Código Produto",
      "Nome Produto",
      "Peso (kg)",
      "Balança"
    ]);

    // Estilizar cabeçalho
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Adicionar dados (sem codigoCaixa)
    for (const r of registros) {
      ws.addRow([
        r.tipo === 'entrada' ? 'Entrada' : 'Saída',
        r.dia,
        r.hora,
        r.codigoProduto,
        r.nomeProduto,
        r.peso,
        r.balanca || ""
      ]);
    }

    // Formatar colunas (peso agora é coluna 6)
    ws.getColumn(6).numFmt = "#,##0.000"; // Peso com 3 casas decimais

    // Auto-ajustar largura das colunas
    ws.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const cellLength = cell.value ? String(cell.value).length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Enviar arquivo
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Generate filename with dataInicio and dataFim if available
    let filename = 'relatorio';
    if (dataInicio && dataFim) {
      filename = `relatorio_${dataInicio}_${dataFim}`;
    } else if (dataInicio) {
      filename = `relatorio_${dataInicio}`;
    } else if (dataFim) {
      filename = `relatorio_ate_${dataFim}`;
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}.xlsx`
    );

    await wb.xlsx.write(res as any);
    res.end();
  } catch (e: any) {
    console.error("[exportExcel POST amendoim] error", e);
    return res.status(500).json({ error: "internal", details: e?.message });
  }
});

// DELETE /api/amendoim/collector/cache/:fileName - Limpar cache de um arquivo
app.delete('/api/amendoim/collector/cache/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const deleted = AmendoimCollectorService.clearFileCache(fileName);

    if (await deleted) {
      return res.json({ success: true, message: `Cache do arquivo ${fileName} limpo com sucesso` });
    } else {
      return res.status(404).json({ error: 'Arquivo não encontrado no cache' });
    }
  } catch (e: any) {
    console.error('[api/amendoim/collector/cache/:fileName] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao limpar cache do arquivo' });
  }
});

// ==================== FIM DOS ENDPOINTS ====================

// Start HTTP server (prefer runtime-config 'http_port' then env vars)
const HTTP_PORT = Number(
  getRuntimeConfig("http_port") ??
  process.env.FRONTEND_API_PORT ??
  process.env.PORT ??
  3000
);

// Setup file processor observer for notifications (simplified without WebSocket)
fileProcessorService.addObserver({
  update: async (p: ProcessPayload) => {
    console.log("[File processed]", p);
  },
});

// Runtime-config is persisted via DB-backed `configService`. No external
// runtime-config JSON files are used in packaged apps.

// Load saved config into runtime store before starting
// Validate db-config from runtime/file: if present test and remove when invalid
async function validateRuntimeDbConfig() {
  try {
    const runtimeDb = getRuntimeConfig('db-config') || null;
    if (!runtimeDb) return;
    try {
      const mapped = {
        host: runtimeDb?.serverDB ?? runtimeDb?.host,
        port: runtimeDb?.port,
        user: runtimeDb?.userDB ?? runtimeDb?.user,
        password: runtimeDb?.passwordDB ?? runtimeDb?.password,
        database: runtimeDb?.database,
      };
      // If password is missing, merge from saved setting so startup validation can use it
      if (!mapped.password) {
        try {
          const saved = await configService.getSetting('db-config');
          if (saved) {
            const savedObj = JSON.parse(saved);
            if (savedObj?.passwordDB) mapped.password = savedObj.passwordDB;
            if (!mapped.user && savedObj.userDB) mapped.user = savedObj.userDB;
            if (!mapped.host && savedObj.serverDB) mapped.host = savedObj.serverDB;
            if (!mapped.database && savedObj.database) mapped.database = savedObj.database;
            if (!mapped.port && savedObj.port) mapped.port = savedObj.port;
            // also set runtime config so subsequent dbService.init() picks up the password
            try {
              setRuntimeConfig('db-config', { ...(runtimeDb as any), passwordDB: mapped.password });
            } catch (e) { /* ignore */ }
          }
        } catch (e) {}
      }
      await dbService.testConnection(mapped);
      console.log('[Startup] runtime db-config validated');
    } catch (e) {
      // invalid connection -> remove from runtime to avoid startup failure
      console.warn('[Startup] saved db-config failed validation; clearing to avoid startup failure', e);
      try { setRuntimeConfig('db-config', undefined); } catch (ee) {}
    }
  } catch (e) {
    console.warn('[Startup] validateRuntimeDbConfig error', e);
  }
}

// main startup
(async () => {
  const startupTime = Date.now();
  console.log('[Startup] 🚀 Iniciando servidor...');
  
  // load config file first, so DB init can use it
  await validateRuntimeDbConfig();
  
  try {
    // 🔧 Inicializar banco de dados com retry
    console.log('[Startup] Conectando ao banco de dados...');
    await ensureDbReady();
    
    // 🔧 Garantir que o usuário admin padrão existe
    await ensureDefaultAdminUser();

    // 🔧 Garantir que a coluna 'ativo' existe na tabela materia_prima
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        const table = await queryRunner.getTable('materia_prima');
        const ativoColumn = table?.columns.find(col => col.name === 'ativo');

        if (!ativoColumn) {
          console.log('[Startup] Adicionando coluna "ativo" na tabela materia_prima...');
          await queryRunner.query(`ALTER TABLE materia_prima ADD COLUMN ativo TINYINT(1) DEFAULT 1`);
          console.log('[Startup] ✅ Coluna "ativo" adicionada');
        }
      } finally {
        await queryRunner.release();
      }
    } catch (e) {
      console.warn('[Startup] Erro ao verificar/adicionar coluna "ativo":', e);
    }

    const all = await configService.getAllSettings();
    setRuntimeConfigs(all);
    console.log(
      "[Server] Loaded runtime configs from DB:",
      Object.keys(all).length
    );
  } catch (e) {
    console.warn(
      "[Server] Could not load runtime configs at startup:",
      String(e)
    );
  }

  app.listen(HTTP_PORT, () => {
    const duration = Date.now() - startupTime;
    console.log(`[Server] ✅ API server running on port ${HTTP_PORT} (startup: ${duration}ms)`);
  });
})();


