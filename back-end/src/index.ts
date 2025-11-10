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
import { resumoService } from "./services/resumoService"; // Importação do serviço de resumo
import ExcelJS from "exceljs";
import { dataPopulationService } from "./services/dataPopulationService"; // Importação do serviço de população de dados
import { unidadesService } from "./services/unidadesService"; // Importação do serviço de unidades
import { dumpConverterService } from "./services/dumpConverterService"; // Importação do serviço de conversão de dump
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
import { setRuntimeConfigs, getRuntimeConfig } from "./core/runtimeConfig";
import { csvConverterService } from "./services/csvConverterService";
import { changeDetectionService } from "./services/changeDetectionService";
import { statsLogger, statsMiddleware } from "./services/statsLogger";
import { cacheService } from "./services/CacheService";

console.log("✅ [Startup] Módulos importados com sucesso");
console.log("✅ [Startup] fileProcessorService:", fileProcessorService ? "LOADED" : "UNDEFINED");

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

const TMP_DIR = path.resolve(
  process.cwd(),
  String(
    getRuntimeConfig("collector_tmp") ?? process.env.COLLECTOR_TMP ?? "tmp"
  )
);
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

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
    const downloaded = await ihm.findAndDownloadNewFiles(TMP_DIR);
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

// Ensure database connection before starting
async function ensureDatabaseConnection() {
  try {
    // dbService.init() handles MySQL initialization and will fallback to SQLite
    await dbService.init();
    console.log("Database connection established (via dbService)");
  } catch (e) {
    console.warn("[DB] ensureDatabaseConnection failed:", String(e));
    throw e;
  }
}

const app = express();

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
    await ensureDatabaseConnection();
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
      };
    }
    return res.json(mapping);
  } catch (e) {
    console.error("Failed to get materia prima labels", e);
    return res.status(500).json({});
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
    await dbService.init();
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

// Clear entire database (DELETE all rows from all entities)
app.post("/api/db/clear", async (req, res) => {
  try {
    await dbService.init();
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
    await dbService.init();
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
    await dbService.init();
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

    // Save dump to temporary file for import
    const tmpDumpPath = path.join(TMP_DIR, `import_${Date.now()}.sql`);
    fs.writeFileSync(tmpDumpPath, finalContent, 'utf-8');

    console.log(`[api/db/import-legacy] Dump saved to: ${tmpDumpPath}`);

    // Get import options from query params
    const clearBefore = req.query.clearBefore === 'true';
    const skipCreateTable = req.query.skipCreateTable === 'true';

    // Execute SQL dump using dbService
    await dbService.init();
    
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
    await dbService.init();
    
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
    await dbService.init();
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
    await dbService.init();

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
    await ensureDatabaseConnection();
    const data = await backupSvc.listBackups(); 
    return res.json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/file/process", async (req, res) => {
  try {
    await ensureDatabaseConnection();
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
const upload = multer({ dest: TMP_DIR });
app.post("/api/file/upload", upload.single("file"), async (req, res) => {
  const startTime = Date.now();
  try {
    await ensureDatabaseConnection();
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

app.get("/api/relatorio/paginate", async (req, res) => {
  const startTime = Date.now();
  try {
    // Verificar conexão do banco
    if (!AppDataSource.isInitialized) {
      console.warn('[relatorio/paginate] ⚠️ Database não inicializado, inicializando...');
      await dbService.init();
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

    try {
      await dbService.init();
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
    const qb = repo.createQueryBuilder("r");

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
    for (let i = 1; i <= 40; i++) {
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

    // Map rows to include values array from Prod_1 to Prod_40
    // Normalize product values according to MateriaPrima.measure (grams->kg)
    // OTIMIZAÇÃO: Usar cache em vez de consultar banco a cada request
    const materiasByNum = await getMateriaPrimaCache();

    // OTIMIZAÇÃO: Pré-alocar arrays com tamanho fixo
    const mappedRows = rows.map((row: any) => {
      const values: string[] = new Array(40);
      const valuesRaw: number[] = new Array(40);
      const unidades: string[] = new Array(40);
      
      for (let i = 1; i <= 40; i++) {
        const prodValue = row[`Prod_${i}`];
        let v =
          typeof prodValue === "number"
            ? prodValue
            : prodValue != null
            ? Number(prodValue)
            : 0;
        const materia = materiasByNum[i];
        
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

    const responseData = {
      rows: mappedRows,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages,
    };

    const duration = Date.now() - startTime;
    console.log(`[relatorio/paginate] ✅ Query completed in ${duration}ms (${rows.length} rows)`);

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

// PDF DATA: Retorna dados TOTALMENTE processados, calculados e formatados para PDF
app.get("/api/relatorio/pdf-data", async (req, res) => {
  try {
    await dbService.init();

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
    for (let i = 1; i <= 40; i++) allowed.add(`Prod_${i}`);
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

    // PROCESSAR DADOS PARA PDF: Calcular totais, formatar valores, gráficos
    const produtos: Array<{ nome: string; qtd: number; unidade: string; valorFormatado: string }> = [];
    
    // Mapa: produto index -> total acumulado
    const produtoTotals: Record<number, number> = {};
    
    for (const row of rows) {
      for (let i = 1; i <= 40; i++) {
        const val = row[`Prod_${i}`];
        let v = typeof val === "number" ? val : (val != null ? Number(val) : 0);
        if (v < 0) v = 0;
        
        if (!produtoTotals[i]) produtoTotals[i] = 0;
        produtoTotals[i] += v;
      }
    }

    // Gerar array de produtos com totais calculados e formatados
    for (let i = 1; i <= 40; i++) {
      const total = produtoTotals[i] || 0;
      if (total === 0) continue; // Skip produtos sem uso
      
      const materia = materiasByNum[i];
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
        maximumFractionDigits: 3 
      })} kg`;
      
      produtos.push({
        nome,
        qtd: valorKg, // SEMPRE em kg
        unidade,
        valorFormatado
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
    const sortDir = String(req.query.sortDir || "DESC");

    await dbService.init();
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

    // Header row: Dia, Hora, Nome, Codigo, Numero, Prod_1 ... Prod_40
    const headers = [
      "Dia",
      "Hora",
      "Nome",
      "Codigo do programa",
      "Codigo do cliente",
    ];
    for (let i = 1; i <= 40; i++) {
      // get product name if available
      const mp = materiasByNum[i];
      const unidade = mp?.unidade  ?? (mp && Number(mp.medida) === 0 ? "kg" : "g");
      if (mp && mp.produto) headers.push(`${mp.produto} (${unidade})`);
      else headers.push(`Prod_${i} (${unidade})`);
    }
    ws.addRow(headers);

    for (const r of rows) {
      const rowArr: any[] = [];
      rowArr.push(r.Dia || "");
      rowArr.push(r.Hora || "");
      rowArr.push(r.Nome || "");
      rowArr.push(r.Form1 ?? "");
      rowArr.push(r.Form2 ?? "");
      for (let i = 1; i <= 40; i++) {
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
    for (let col = 6; col < 6 + 40; col++) {
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
      `attachment; filename=relatorio_${Date.now()}.xlsx`
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
    const sortDir = String(req.body.sortDir || "DESC");

    await dbService.init();
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
    for (let i = 1; i <= 40; i++) headers.push(`Prod_${i}`);
    ws.addRow(headers);
    for (const r of rows) {
      const rowArr: any[] = [];
      rowArr.push(r.Dia || "");
      rowArr.push(r.Hora || "");
      rowArr.push(r.Nome || "");
      rowArr.push(r.Form1 ?? "");
      rowArr.push(r.Form2 ?? "");
      for (let i = 1; i <= 40; i++) {
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
      `attachment; filename=relatorio_${Date.now()}.xlsx`
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
    await ensureDatabaseConnection();
    const { username, password, displayName, userType } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "usuário e senha requeridos" });
    const repo = AppDataSource.getRepository(User);
    const existing = await repo.findOne({ where: { username } });
    if (existing) return res.status(409).json({ error: "username taken" });
    // If there are no users yet, make this one admin
    const usersCount = await repo.count();
    const isAdmin = usersCount === 0;
    const u = repo.create({
      username,
      password: password,
      displayName: displayName || null,
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
    await ensureDatabaseConnection();
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
    await ensureDatabaseConnection();
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
    await ensureDatabaseConnection();
    const { username, displayName } = req.body;
    if (!username) return res.status(400).json({ error: "username required" });
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { username } });
    if (!user) return res.status(404).json({ error: "user not found" });
    (user as any).displayName = displayName ?? (user as any).displayName;
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

    await ensureDatabaseConnection();
    const repo = AppDataSource.getRepository(User);

    // Bulk update all users to use the provided photoPath
    await repo.createQueryBuilder().update(User).set({ photoPath: String(photoPath) }).execute();

    return res.json({ success: true, path: photoPath });
  } catch (e: any) {
    console.error("[admin/set-default-photo] error", e);
    return res.status(500).json({ error: e?.message || "internal" });
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



app.get("/api/db/listBatches", async (req, res) => {
  try {
    await dbService.init();
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
    await dbService.init();
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
    await dbService.init();
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
    });

    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
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

app.post("/api/db/populate", async (req, res) => {
  try {
    const { tipo = "relatorio", quantidade = 10, config = {} } = req.body || {};
    if (tipo === "relatorio") {
      const result = await dataPopulationService.populateRelatorio(
        Math.min(Math.max(1, Number(quantidade)), 1000),
        config
      );
      return res.json(result);
    }
    return res.status(400).json({ error: "tipo not supported" });
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
    return res.json(getCollectorStatus());
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "internal" });
  }
});

app.get("/api/relatorioPdf", async (req, res) => {});

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
    await dbService.init();
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
    await ensureDatabaseConnection();
    const { filePath, content } = req.body;
    if (!filePath || !content) {
      return res
        .status(400)
        .json({ error: "filePath and content are required" });
    }

    // For now, just save content to a temp file and process it
    const fs = require("fs");
    const tempPath = `${TMP_DIR}/temp_${Date.now()}.csv`;
    fs.writeFileSync(tempPath, content);

    const r = await fileProcessorService.processFile(tempPath);

    // Clean up temp file
    try {
      fs.unlinkSync(tempPath);
    } catch {}

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
    // Persist each top-level key as a separate Setting row
    await configService.setSettings(configObj);
    try {
      setRuntimeConfigs(configObj);
    } catch (e) {
      /* ignore */
    }
    return res.json({ success: true, saved: Object.keys(configObj) });
  } catch (e) {
    console.error("[config/split] Failed to split/save settings", e);
    return res.status(500).json({ error: "internal" });
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
        // Read amendoim-config and map its fields into IHM fields
        try {
          const amCfg = (await Promise.resolve().then(() => require('./services/AmendoimConfigService')).then(m => m.AmendoimConfigService.getConfig()));
          // Helper: infer method from filename
          const inferMethod = (name: any) => {
            if (!name) return '';
            const s = String(name || '').trim();
            if (/Relatorio_\d{4}_\d{2}\.csv$/i.test(s)) return 'mensal';
            if (/Relatorio_1\.csv$/i.test(s)) return 'geral';
            return 'custom';
          };

          const entradaMethod = inferMethod(amCfg.arquivoEntrada);
          const saidaMethod = inferMethod(amCfg.arquivoSaida);

          if (entradaMethod) baseIhm.metodoCSV = entradaMethod;
          if (entradaMethod === 'custom') baseIhm.localCSV = String(amCfg.arquivoEntrada || baseIhm.localCSV || '');

          if (saidaMethod) baseIhm.metodoCSV2 = saidaMethod;
          if (saidaMethod === 'custom') baseIhm.localCSV2 = String(amCfg.arquivoSaida || baseIhm.localCSV2 || '');

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
    await dbService.init();
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

    const rows = await qb.getMany();

    // Load materia prima units
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    const mapped = rows.map((r: any) => {
      const values: number[] = [];
      const units: Record<string, string> = {};
      for (let i = 1; i <= 40; i++) {
        const v =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
            ? Number(r[`Prod_${i}`])
            : 0;
        // Provide units per product (g or kg). Use medida==0 => 'g', else 'kg'
        const mp = materiasByNum[i];
        const unidade = mp && Number(mp.medida) === 0 ? "g" : "kg";
        values.push(v);
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
    await dbService.init();
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

    const rows = await qb.getMany();

    // Load materia prima units so we can normalize product weights (g -> kg)
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Agregar por fórmula (Nome) using per-row normalized total (kg)
    const sums: Record<string, number> = {};
    const validCount: Record<string, number> = {};

    for (const r of rows) {
      if (!r.Nome) continue;
      const key = r.Nome;

      // compute row total normalized to kg
      let rowTotalKg = 0;
      for (let i = 1; i <= 40; i++) {
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
    await dbService.init();
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

    const rows = await qb.getMany();

    // Carregar unidades das matérias-primas
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Agregar por produto (Prod_1, Prod_2, etc.)
    const productSums: Record<string, number> = {};
    const productUnits: Record<string, string> = {};

    for (const r of rows) {
      for (let i = 1; i <= 40; i++) {
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
    await dbService.init();
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

    const rows = await qb.getMany();

    // Load materias to normalize per-row totals
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Agregar por hora (0h-23h) using normalized per-row total (kg)
    const hourSums: Record<string, number> = {};
    const hourCounts: Record<string, number> = {};

    for (const r of rows) {
      if (!r.Hora) continue;
      const hour = r.Hora.split(":")[0];
      const hourKey = `${hour}h`;

      // compute row total normalized to kg
      let rowTotalKg = 0;
      for (let i = 1; i <= 40; i++) {
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

// Endpoint especializado: Agregação por Dia da Semana
app.get("/api/chartdata/diasSemana", async (req, res) => {
  try {
    await dbService.init();
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

    const rows = await qb.getMany();

    // Load materias to normalize per-row totals
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

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
      for (let i = 1; i <= 40; i++) {
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
    await dbService.init();
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

    const rows = await qb.getMany();

    // Load materias to normalize totals
    const materias = await materiaPrimaService.getAll();
    const materiasByNum: Record<number, any> = {};
    for (const m of materias) {
      const n = typeof m.num === "number" ? m.num : Number(m.num);
      if (!Number.isNaN(n)) materiasByNum[n] = m;
    }

    // Calcular estatísticas gerais normalizadas para kg
    let totalGeralKg = 0;
    for (const r of rows) {
      let rowTotalKg = 0;
      for (let i = 1; i <= 40; i++) {
        const raw =
          typeof r[`Prod_${i}`] === "number"
            ? r[`Prod_${i}`]
            : r[`Prod_${i}`] != null
            ? Number(r[`Prod_${i}`])
            : 0;
        if (!raw || raw <= 0) continue;
        const mp = materiasByNum[i];
        if (mp && Number(mp.medida) === 0) {
          rowTotalKg += raw * 1000; // Converter gramas para kg
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
    await dbService.init();
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

    // Agregar por dia da semana usando total normalizado por linha (kg)
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weekdayTotals = Array(7).fill(0);
    const weekdayCounts = Array(7).fill(0);

    // Also build a per-date total map (YYYY-MM-DD) so callers can get totals for specific dates
    const perDateTotals: Record<string, number> = {};

    for (const r of rows) {
      if (!r.Dia) continue;
      const date = parseDia(r.Dia);
      if (!date) continue;

      const dayIndex = date.getDay();
      const isoDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

      // Calcular total da linha normalizado para kg somando TODOS os produtos
      let rowTotalKg = 0;
      
      for (let i = 1; i <= 40; i++) {
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
    await dbService.init();
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
        for (let i = 1; i <= 40; i++) {
          const raw =
            typeof r[`Prod_${i}`] === "number"
              ? r[`Prod_${i}`]
              : r[`Prod_${i}`] != null
              ? Number(r[`Prod_${i}`])
              : 0;
          if (!raw || raw <= 0) continue;
          const mp = materiasByNum[i];
          if (mp && Number(mp.medida) === 0) {
            rowTotalKg += raw * 1000; // Converter gramas para kg
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

    // Obter tipo do body (entrada ou saida)
    const tipo = (req.body.tipo === 'saida') ? 'saida' : 'entrada';

    const csvContent = req.file.buffer.toString('utf-8');
    const resultado = await AmendoimService.processarCSV(csvContent, tipo);

    return res.json({
      ok: true,
      ...resultado,
      tipo,
      mensagem: `${resultado.salvos} registros de ${tipo} salvos de ${resultado.processados} processados`,
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

    const resultado = await AmendoimService.buscarRegistros({
      page,
      pageSize,
      dataInicio,
      dataFim,
      codigoProduto,
      nomeProduto,
      tipo,
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

    if (dataInicio) {
      qb.andWhere('a.dia >= :dataInicio', { dataInicio });
    }
    if (dataFim) {
      qb.andWhere('a.dia <= :dataFim', { dataFim });
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

    return res.json(chartData);
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

    return res.json(chartData);
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

    return res.json(chartData);
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
    const config = getRuntimeConfig('ihm-config') || {};
    return res.json(config);
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

    const fmt = (d: Date) => `${d.getFullYear().toString().padStart(4,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    const dados = await AmendoimService.obterDadosAnalise({ dataInicio: fmt(prev), dataFim: fmt(today) });

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
    await setRuntimeConfigs({ 'ihm-config': configData });
    const config = getRuntimeConfig('ihm-config') || {};
    return res.json({ success: true, config });
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
    await ensureDatabaseConnection();
    
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
    const resultEntrada = await AmendoimService.processarCSV(csvEntrada, "entrada");

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
    const resultSaida = await AmendoimService.processarCSV(csvSaida, "saida");

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
    const intervalMinutes = req.body.intervalMinutes || 5;
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
    AmendoimCollectorService.clearAllCache();
    return res.json({ success: true, message: 'Cache limpo com sucesso' });
  } catch (e: any) {
    console.error('[api/amendoim/collector/cache] error', e);
    return res.status(500).json({ error: e?.message || 'Erro ao limpar cache' });
  }
});

// ==================== EXPORTAÇÃO AMENDOIM ====================

// GET /api/amendoim/exportExcel - Exportar dados de amendoim para Excel
app.get('/api/amendoim/exportExcel', async (req, res) => {
  try {
    await dbService.init();
    
    // Filtros
    const tipo = req.query.tipo ? String(req.query.tipo) : undefined;
    const codigoProduto = req.query.codigoProduto ? String(req.query.codigoProduto) : undefined;
    const codigoCaixa = req.query.codigoCaixa ? String(req.query.codigoCaixa) : undefined;
    const nomeProduto = req.query.nomeProduto ? String(req.query.nomeProduto) : undefined;
    const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined;

    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("a");

    // Aplicar filtros
    if (tipo && (tipo === 'entrada' || tipo === 'saida')) {
      qb.andWhere("a.tipo = :tipo", { tipo });
    }
    if (codigoProduto) {
      qb.andWhere("a.codigoProduto = :codigoProduto", { codigoProduto });
    }
    if (codigoCaixa) {
      qb.andWhere("a.codigoCaixa = :codigoCaixa", { codigoCaixa });
    }
    if (nomeProduto) {
      qb.andWhere("LOWER(a.nomeProduto) LIKE LOWER(:nomeProduto)", { 
        nomeProduto: `%${nomeProduto}%` 
      });
    }
    if (dataInicio) {
      qb.andWhere("a.dia >= :dataInicio", { dataInicio });
    }
    if (dataFim) {
      qb.andWhere("a.dia <= :dataFim", { dataFim });
    }

    qb.orderBy("a.dia", "DESC").addOrderBy("a.hora", "DESC");

    const registros = await qb.getMany();

    // Criar workbook Excel
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Amendoim");

    // Cabeçalho
    ws.addRow([
      "Tipo",
      "Data",
      "Hora",
      "Código Produto",
      "Código Caixa",
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

    // Adicionar dados
    for (const r of registros) {
      ws.addRow([
        r.tipo === 'entrada' ? 'Entrada' : 'Saída',
        r.dia,
        r.hora,
        r.codigoProduto,
        r.codigoCaixa,
        r.nomeProduto,
        r.peso,
        r.balanca || ""
      ]);
    }

    // Formatar colunas
    ws.getColumn(7).numFmt = "#,##0.000"; // Peso com 3 casas decimais

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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=amendoim_${Date.now()}.xlsx`
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
    await dbService.init();
    
    // Filtros do body
    const tipo = req.body.tipo || undefined;
    const codigoProduto = req.body.codigoProduto || undefined;
    const codigoCaixa = req.body.codigoCaixa || undefined;
    const nomeProduto = req.body.nomeProduto || undefined;
    const dataInicio = req.body.dataInicio || undefined;
    const dataFim = req.body.dataFim || undefined;

    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("a");

    // Aplicar filtros
    if (tipo && (tipo === 'entrada' || tipo === 'saida')) {
      qb.andWhere("a.tipo = :tipo", { tipo });
    }
    if (codigoProduto) {
      qb.andWhere("a.codigoProduto = :codigoProduto", { codigoProduto });
    }
    if (codigoCaixa) {
      qb.andWhere("a.codigoCaixa = :codigoCaixa", { codigoCaixa });
    }
    if (nomeProduto) {
      qb.andWhere("LOWER(a.nomeProduto) LIKE LOWER(:nomeProduto)", { 
        nomeProduto: `%${nomeProduto}%` 
      });
    }
    if (dataInicio) {
      qb.andWhere("a.dia >= :dataInicio", { dataInicio });
    }
    if (dataFim) {
      qb.andWhere("a.dia <= :dataFim", { dataFim });
    }

    qb.orderBy("a.dia", "DESC").addOrderBy("a.hora", "DESC");

    const registros = await qb.getMany();

    // Criar workbook Excel
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Amendoim");

    // Cabeçalho
    ws.addRow([
      "Tipo",
      "Data",
      "Hora",
      "Código Produto",
      "Código Caixa",
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

    // Adicionar dados
    for (const r of registros) {
      ws.addRow([
        r.tipo === 'entrada' ? 'Entrada' : 'Saída',
        r.dia,
        r.hora,
        r.codigoProduto,
        r.codigoCaixa,
        r.nomeProduto,
        r.peso,
        r.balanca || ""
      ]);
    }

    // Formatar colunas
    ws.getColumn(7).numFmt = "#,##0.000"; // Peso com 3 casas decimais

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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=amendoim_${Date.now()}.xlsx`
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
    
    if (deleted) {
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

// Load saved config into runtime store before starting
(async () => {
  try {
    await ensureDatabaseConnection();
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

  app.listen(HTTP_PORT, () =>
    console.log(`[Server] API server running on port ${HTTP_PORT}`)
  );
})();
