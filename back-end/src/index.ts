import "reflect-metadata";
import fs from "fs";
import path from "path";
import { AppDataSource, dbService } from "./services/dbService";
import { backupSvc } from "./services/BackupService";
import { parserService } from "./services/ParserService";
import { fileProcessorService } from "./services/fileProcessorService";
import { IHMService } from "./services/IHMService";
import { Relatorio, MateriaPrima, Batch } from "./entities";
import { postJson, ProcessPayload } from "./core/utils";
import { WebSocketBridge, wsbridge } from "./websocket/WebSocketBridge";
import { startCollector, stopCollector } from './collector';

// Heartbeat loop for WebSocket (optional)
let WS_LOOP = false;
let WS_INTERVAL: NodeJS.Timeout | null = null;
function startWsLoop(
  periodMs = Number(process.env.WS_HEARTBEAT_MS || "3000")
) {
  if (WS_LOOP) return { running: true, periodMs };
  WS_LOOP = true;
  WS_INTERVAL = setInterval(() => {
    const payload = {
      port: wsbridge.getPort(),
      clients: wsbridge.getClientCount(),
      ts: new Date().toISOString(),
    };
    wsbridge.sendEvent("heartbeat", payload);
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
wsbridge.register("ping", async () => ({
  pong: true,
  ts: new Date().toISOString(),
}));
wsbridge.register("backup.list", async () => backupSvc.listBackups());
wsbridge.register("file.process", async ({ filePath }: any) => {
  if (!filePath)
    throw Object.assign(new Error("filePath é obrigatório"), { status: 400 });
  const r = await fileProcessorService.processFile(filePath);
  return { meta: r.meta, rowsCount: r.parsed.rowsCount };
});
wsbridge.register(
  "ihm.fetchLatest",
  async ({ ip, user = "anonymous", password = "" }: any) => {
    if (!ip)
      throw Object.assign(new Error("IP do IHM é obrigatório"), {
        status: 400,
      });
    const tmpDir = path.resolve(
      process.cwd(),
      process.env.COLLECTOR_TMP || "tmp"
    );
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const ihm = new IHMService(ip, user, password);
    const downloaded = await ihm.findAndDownloadNewFiles(tmpDir);
    if (!downloaded || downloaded.length === 0)
      return { ok: true, message: "Nenhum CSV novo encontrado" };
    const result = downloaded[0];
    if (!result) return { ok: true, message: "Nenhum CSV novo encontrado" };
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
    return { meta, processed };
  }
);
wsbridge.register(
  "relatorio.paginate",
  async ({
    page = 1,
    pageSize = 300,
    formula = null,
    dateStart = null,
    dateEnd = null,
    sortBy = "Dia",
    sortDir = "DESC",
  }: any) => {
    await dbService.init();
    const repo = AppDataSource.getRepository(Relatorio);
    const qb = repo.createQueryBuilder("r");
    if (formula) {
      const f = String(formula);
      const n = Number(f);
      if (!Number.isNaN(n))
        qb.andWhere("(r.Form1 = :n OR r.Form2 = :n)", { n });
      else
        qb.andWhere("(r.Nome LIKE :f OR r.processedFile LIKE :f)", {
          f: `%${f}%`,
        });
    }
    if (dateStart) qb.andWhere("r.Dia >= :ds", { ds: dateStart });
    if (dateEnd) qb.andWhere("r.Dia <= :de", { de: dateEnd });
    const allowed = new Set([
      "Dia",
      "Hora",
      "Nome",
      "Form1",
      "Form2",
      "processedFile",
    ]);
    const sb = allowed.has(sortBy) ? sortBy : "Dia";
    const sd = sortDir === "ASC" ? "ASC" : "DESC";
    qb.orderBy(`r.${sb}`, sd);
    const total = await qb.getCount();
    const rows = await qb
      .offset((Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize)))
      .limit(Math.max(1, Number(pageSize)))
      .getMany();
    console.log('[Processador] Relatório paginado:', { rows, total, page, pageSize });
    return { rows, total, page, pageSize };
  }
);
wsbridge.register("db.listBatches", async () => {
  await dbService.init();
  const repo = AppDataSource.getRepository(Batch);
  const [items, total] = await repo.findAndCount({
    take: 50,
    order: { fileTimestamp: "DESC" },
  });
  return { items, total, page: 1, pageSize: 50 };
});
wsbridge.register("db.setupMateriaPrima", async ({ items }: any) => {
  await dbService.init();
  const repo = AppDataSource.getRepository(MateriaPrima);
  return repo.save(Array.isArray(items) ? items : []);
});
wsbridge.register("sync.localToMain", async ({ limit = 500 }: any) => {
  await dbService.init();
  const repo = AppDataSource.getRepository(Relatorio);
  const rows = await repo.find({ take: Number(limit) });
  if (!rows || rows.length === 0) return { synced: 0 };
  const inserted = await dbService.insertRelatorioRows(
    rows as any[],
    "local-backup-sync"
  );
  return { synced: Array.isArray(inserted) ? inserted.length : rows.length };
});
wsbridge.register("ws.loop.start", async ({ periodMs }: any) =>
  startWsLoop(Number(periodMs || process.env.WS_HEARTBEAT_MS || 10000))
);
wsbridge.register("ws.loop.stop", async () => stopWsLoop());
wsbridge.register("ws.status", async () => ({
  port: wsbridge.getPort(),
  clients: wsbridge.getClientCount(),
  loop: WS_LOOP,
}));
// Accept config as a command as well (not only as type='config' message)
wsbridge.register("config", async (cfg: any) => {
  wsbridge.sendEvent("config-ack", { ok: true });
  return { ok: true };
});
wsbridge.register("file.processContent", async ({ filePath, content }: any) => {
  if (!filePath || !content) {
    throw Object.assign(new Error("filePath e content são obrigatórios"), {
      status: 400,
    });
  }

  // Salva o conteúdo em um arquivo temporário
  const tempFilePath = path.join(require('./collector').TMP_DIR, filePath);
  fs.writeFileSync(tempFilePath, content, "utf8");

  // Processa o arquivo salvo
  const result = await fileProcessorService.processFile(tempFilePath);

  return {
    meta: result.meta,
    rowsCount: result.parsed.rowsCount,
  };
});

// Register commands to control the collector
wsbridge.register("collector.start", async () => {
  startCollector();
  return { message: "Collector started" };
});

wsbridge.register("collector.stop", async () => {
  stopCollector();
  return { message: "Collector stopped" };
});

// Auto-start when forked from Electron main
if (typeof (process as any)?.send === "function") {
  wsbridge
    .start()
    .then((port) => {
      if (typeof (process as any)?.send === "function") {
        (process as any).send({ type: "websocket-port", port });
      }
      fileProcessorService.addObserver({
        update: async (p: ProcessPayload) =>
          wsbridge.sendEvent("file.processed", p),
      });
      if (process.env.WS_LOOP_AUTO_START === "true") startWsLoop();
    })
    .catch((err) => {
      console.error("[Backend] Failed to start WebSocket server:", err);
      process.exit(1);
    });
}

if (process.env.ENABLE_COLLECTOR === 'true') {
  startCollector();
}

export { WebSocketBridge, wsbridge };
