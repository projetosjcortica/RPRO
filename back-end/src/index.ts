import "reflect-metadata";
import fs from "fs";
import path from "path";
import { AppDataSource, dbService } from "./services/dbService";
import { backupSvc } from "./services/BackupService";
import { parserService } from "./services/ParserService";
import { fileProcessorService } from "./services/fileProcessorService";
import { IHMService } from "./services/IHMService";
import { materiaPrimaService } from "./services/materiaPrimaService";
import { resumoService } from "./services/resumoService"; // Importação do serviço de resumo
import { dataPopulationService } from "./services/dataPopulationService"; // Importação do serviço de população de dados
import { unidadesService } from "./services/unidadesService"; // Importação do serviço de unidades
import { Relatorio, MateriaPrima, Batch } from "./entities";
import { postJson, ProcessPayload } from "./core/utils";
import express from "express";
import cors from "cors";
import { configService } from "./services/configService";

// Collector
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || "60000");
const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || "tmp");
const rawServer =
  process.env.INGEST_URL || process.env.SERVER_URL || "http://192.168.5.254";
const SERVER_URL = /^(?:https?:)\/\//i.test(rawServer)
  ? rawServer
  : `http://${rawServer}`;
const INGEST_TOKEN = process.env.INGEST_TOKEN;
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

let STOP = false;
export function stopCollector() {
  STOP = true;
}
export async function startCollector() {
  const ihm = new IHMService(
    process.env.IHM_IP || "192.168.5.254",
    process.env.IHM_USER || "anonymous",
    process.env.IHM_PASS || ""
  );
  const collector = {
    async cycle() {
      const downloaded = await ihm.findAndDownloadNewFiles(TMP_DIR);
      for (const f of downloaded) {
        const res = await fileProcessorService.processFile(f.localPath);
        if (process.env.INGEST_URL) {
          try {
            await postJson(
              `${SERVER_URL}/api/ingest`,
              { meta: res.meta, count: res.parsed.rowsCount },
              INGEST_TOKEN
            );
          } catch {}
        }
      }
    },
  };
  STOP = false;
  while (!STOP) {
    try {
      await collector.cycle();
    } catch (e) {
      console.error("[collector cycle error]", e);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

// Ensure database connection before starting
async function ensureDatabaseConnection() {
  if (!AppDataSource.isInitialized) {
    console.log("Initializing database connection...");
    await AppDataSource.initialize();
    console.log("Database connection established.");
  }
}

const app = express();
app.use(
  cors({
    origin: ["*"], // Frontend dev servers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

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

app.post("/api/relatorio/paginate", async (req, res) => {
  try {
    // Parse and validate pagination params to avoid passing NaN/invalid values to TypeORM
    const pageRaw = req.body.page;
    const pageSizeRaw = req.body.pageSize;
    const pageNum = ((): number => {
      const n = Number(pageRaw);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
    })();
    const pageSizeNum = ((): number => {
      const n = Number(pageSizeRaw);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 100;
    })();

    // Separate filters: `codigo` (Form1 generated by IHM) and `numero` (Form2 provided by user)
    const codigoRaw = req.body.codigo ?? null;
    const numeroRaw = req.body.numero ?? null;
    const dataInicio = req.body.dataInicio ?? null;
    const dataFim = req.body.dataFim ?? null;
    const sortBy = String(req.body.sortBy || "Dia");
    const sortDir = String(req.body.sortDir || "DESC");
    const includeProducts =
      String(req.body.includeProducts || "true") === "true"; // Default to true for values

    try {
      await dbService.init();
    } catch (dbError: any) {
      console.error(
        "[relatorio/paginate] Database initialization failed:",
        dbError
      );
      return res
        .status(500)
        .json({
          error: "Database connection failed",
          details: dbError?.message,
        });
    }

    const repo = AppDataSource.getRepository(Relatorio);
    const qb = repo.createQueryBuilder("r");

    // Apply separate numeric filters when provided
    if (codigoRaw != null && codigoRaw !== "") {
      const c = Number(codigoRaw);
      if (!Number.isNaN(c)) {
        qb.andWhere("r.Form1 = :c", { c });
      } else {
        // if codigo is not numeric, ignore it (Form1 is numeric generated by IHM)
      }
    }

    if (numeroRaw != null && numeroRaw !== "") {
      const num = Number(numeroRaw);
      if (!Number.isNaN(num)) {
        qb.andWhere("r.Form2 = :num", { num });
      } else {
        // if numero is not numeric, ignore it
      }
    }
    if (dataInicio) qb.andWhere("r.Dia >= :ds", { ds: dataInicio });
    if (dataFim) qb.andWhere("r.Dia <= :de", { de: dataFim });

    const allowed = new Set([
      "Dia",
      "Hora",
      "Nome",
      "Form1",
      "Form2",
      // "processedFile",
    ]);
    const sb = allowed.has(sortBy) ? sortBy : "Dia";
    const sd = sortDir === "ASC" ? "ASC" : "DESC";
    qb.orderBy(`r.${sb}`, sd);

    // Always include products for values mapping
    const offset = (pageNum - 1) * pageSizeNum;
    const take = pageSizeNum;

    let rows: any[] = [];
    let total = 0;

    try {
      [rows, total] = await qb.skip(offset).take(take).getManyAndCount();
    } catch (queryError: any) {
      console.error("[relatorio/paginate] Query execution failed:", queryError);
      return res
        .status(500)
        .json({ error: "Database query failed", details: queryError?.message });
    }

    // Map rows to include values array from Prod_1 to Prod_40
    const mappedRows = rows.map((row: any) => {
      const values: number[] = [];
      for (let i = 1; i <= 40; i++) {
        const prodValue = row[`Prod_${i}`];
        values.push(
          typeof prodValue === "number"
            ? prodValue
            : prodValue != null
            ? Number(prodValue)
            : 0
        );
      }

      return {
        Dia: row.Dia || "",
        Hora: row.Hora || "",
        Nome: row.Nome || "",
        Codigo: row.Form1 ?? 0,
        Numero: row.Form2 ?? 0,
        values,
      };
    });

    const totalPages = Math.ceil(total / pageSizeNum);

    return res.json({
      rows: mappedRows,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages,
    });
  } catch (e: any) {
    console.error("[relatorio/paginate] Unexpected error:", e);
    return res.status(500).json({ error: e?.message || "internal" });
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
      return res.json(saved);
    } catch (err: any) {
      console.error("[setupMateriaPrima] saveMany error", err?.message || err);
      if (
        err?.code === "ER_DUP_ENTRY" ||
        err?.driverError?.code === "ER_DUP_ENTRY"
      ) {
        return res
          .status(400)
          .json({
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
    const dataInicio = req.query.dataInicio
      ? String(req.query.dataInicio)
      : null;
    const dataFim = req.query.dataFim ? String(req.query.dataFim) : null;

    const result = await resumoService.getResumo({
      areaId,
      formula: formula ? Number(formula) : null,
      dateStart: dataInicio,
      dateEnd: dataFim,
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
    startCollector();
    return res.json({ started: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

app.get("/api/collector/stop", async (req, res) => {
  try {
    stopCollector();
    return res.json({ stopped: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

app.get("/api/relatorioPdf", async (req, res) => {
  
});


app.get('/api/filtrosAvaliable', async (req, res) => {
  try {
    // Optional date filters to scope the available values
    const dateStart = req.query.dateStart ? String(req.query.dateStart) : null;
    const dateEnd = req.query.dateEnd ? String(req.query.dateEnd) : null;

    // Use resumoService to compute formulas used in the given period
    const resumo = await resumoService.getResumo({ dateStart, dateEnd });

  const formulasObj = resumo.formulasUtilizadas || {};
  const formulasAll = Object.values(formulasObj).map((f: any) => ({ nome: f.nome, codigo: Number(f.numero) }));
  const formulas = formulasAll.filter((f: any) => !Number.isNaN(f.codigo));

  // Extract unique codigos (Form1) from formulas
  const codigosSet = new Set<number>();
  formulas.forEach((f) => codigosSet.add(f.codigo));
  const codigos = Array.from(codigosSet).sort((a, b) => a - b);

    // For numeros (Form2) we need to query DB for distinct Form2 values within date range
    await dbService.init();
    const repo = AppDataSource.getRepository(Relatorio);
    const qb = repo.createQueryBuilder('r').select('DISTINCT r.Form2', 'numero');
    if (dateStart) qb.andWhere('r.Dia >= :ds', { ds: dateStart });
    if (dateEnd) qb.andWhere('r.Dia <= :de', { de: dateEnd });
    const raw = await qb.getRawMany();
    const numeros = raw
      .map((r: any) => (r && r.numero != null ? Number(r.numero) : null))
      .filter((v): v is number => v != null && !Number.isNaN(v))
      .sort((a, b) => a - b);

    return res.json({ formulas, codigos, numeros });
  } catch (e: any) {
    console.error('[filtrosAvaliable] Error:', e);
    return res.status(500).json({ error: 'internal', details: e?.message });
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

app.get("/api/config/:key", async (req, res) => {
  try {
    const value = await configService.getSetting(req.params.key);
    if (value === null) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json({ key: req.params.key, value });
  } catch (e) {
    console.error(`Failed to get setting ${req.params.key}`, e);
    res.status(500).json({ error: "internal" });
  }
});

/**
 * @example { "key": "ipIhm", "value": "192.168.0.1" }
 * 
 */
app.post("/api/config", async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing key or value" });
    }
    await configService.setSetting(key, value);
    res.json({ success: true });
  } catch (e) {
    console.error("Failed to set setting", e);
    res.status(500).json({ error: "internal" });
  }
});

// Start HTTP server
const HTTP_PORT = Number(
  process.env.FRONTEND_API_PORT || process.env.PORT || 3000
);

// Setup file processor observer for notifications (simplified without WebSocket)
fileProcessorService.addObserver({
  update: async (p: ProcessPayload) => {
    console.log("[File processed]", p);
  },
});

app.listen(HTTP_PORT, () =>
  console.log(`API server running on port ${HTTP_PORT}`)
);
