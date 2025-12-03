"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectorStatus = getCollectorStatus;
exports.startCollector = startCollector;
exports.stopCollector = stopCollector;
require("reflect-metadata");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dbService_1 = require("./services/dbService");
const backupService_1 = require("./services/backupService");
const parserService_1 = require("./services/parserService");
const fileProcessorService_1 = require("./services/fileProcessorService");
const IHMService_1 = require("./services/IHMService");
const materiaPrimaService_1 = require("./services/materiaPrimaService");
const resumoService_1 = require("./services/resumoService"); // Importação do serviço de resumo
const dataPopulationService_1 = require("./services/dataPopulationService"); // Importação do serviço de população de dados
const unidadesService_1 = require("./services/unidadesService"); // Importação do serviço de unidades
const entities_1 = require("./entities");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const configService_1 = require("./services/configService");
const runtimeConfig_1 = require("./core/runtimeConfig");
// Collector
// Prefer runtime-config values (set via POST /api/config) and fall back to environment variables
const POLL_INTERVAL = Number((_b = (_a = (0, runtimeConfig_1.getRuntimeConfig)("poll_interval_ms")) !== null && _a !== void 0 ? _a : process.env.POLL_INTERVAL_MS) !== null && _b !== void 0 ? _b : "60000");
const TMP_DIR = path_1.default.resolve(process.cwd(), String((_d = (_c = (0, runtimeConfig_1.getRuntimeConfig)("collector_tmp")) !== null && _c !== void 0 ? _c : process.env.COLLECTOR_TMP) !== null && _d !== void 0 ? _d : "tmp"));
if (!fs_1.default.existsSync(TMP_DIR))
    fs_1.default.mkdirSync(TMP_DIR, { recursive: true });
const collectorState = {
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
let loopPromise = null;
function getCollectorStatus() {
    return Object.assign({}, collectorState);
}
function startCollector() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (collectorState.running || collectorState.stopRequested) {
            return {
                started: false,
                message: "Collector já está em execução.",
                status: getCollectorStatus(),
            };
        }
        // Prefer the 'ihm-config' topic (object) saved by frontend; fall back to older flat keys and env
        const runtimeIhm = (0, runtimeConfig_1.getRuntimeConfig)("ihm-config") || {};
        // Resolve IP/user/password with safe fallbacks. Avoid calling String() on undefined
        // which would produce the literal string "undefined" and break DNS lookups.
        const resolvedIp = (_c = (_b = (_a = runtimeIhm.ip) !== null && _a !== void 0 ? _a : (0, runtimeConfig_1.getRuntimeConfig)("ip")) !== null && _b !== void 0 ? _b : process.env.IHM_IP) !== null && _c !== void 0 ? _c : "192.168.5.252";
        const resolvedUser = (_f = (_e = (_d = runtimeIhm.user) !== null && _d !== void 0 ? _d : (0, runtimeConfig_1.getRuntimeConfig)("user")) !== null && _e !== void 0 ? _e : process.env.IHM_USER) !== null && _f !== void 0 ? _f : "anonymous";
        const resolvedPassword = (_j = (_h = (_g = runtimeIhm.password) !== null && _g !== void 0 ? _g : (0, runtimeConfig_1.getRuntimeConfig)("pass")) !== null && _h !== void 0 ? _h : process.env.IHM_PASSWORD) !== null && _j !== void 0 ? _j : "";
        const ihm = new IHMService_1.IHMService(String(resolvedIp), String(resolvedUser), String(resolvedPassword));
        const runCycle = () => __awaiter(this, void 0, void 0, function* () {
            const downloaded = yield ihm.findAndDownloadNewFiles(TMP_DIR);
            console.log(`[collector] ${downloaded.length} arquivo(s) baixado(s).`);
            for (const f of downloaded) {
                if (stopFlag)
                    break;
                console.log(`[collector] processando arquivo: ${f.name}`);
                try {
                    yield fileProcessorService_1.fileProcessorService.processFile(f.localPath);
                }
                catch (err) {
                    console.error("[collector] erro ao processar arquivo", err);
                    throw err;
                }
            }
        });
        stopFlag = false;
        collectorState.running = true;
        collectorState.stopRequested = false;
        collectorState.startedAt = new Date().toISOString();
        collectorState.lastFinishedAt = null;
        collectorState.lastError = null;
        collectorState.cycles = 0;
        const loop = () => __awaiter(this, void 0, void 0, function* () {
            try {
                while (!stopFlag) {
                    try {
                        console.log(`[collector] iniciando ciclo #${collectorState.cycles + 1}`);
                        yield runCycle();
                        collectorState.cycles += 1;
                        collectorState.lastCycleAt = new Date().toISOString();
                        collectorState.lastError = null;
                    }
                    catch (err) {
                        collectorState.lastError =
                            err instanceof Error ? err.message : String(err);
                        console.error("[collector cycle error]", err);
                    }
                    if (stopFlag)
                        break;
                    yield new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
                }
            }
            finally {
                collectorState.running = false;
                collectorState.stopRequested = false;
                collectorState.lastFinishedAt = new Date().toISOString();
                stopFlag = false;
                loopPromise = null;
            }
        });
        loopPromise = loop();
        return {
            started: true,
            status: getCollectorStatus(),
        };
    });
}
function stopCollector() {
    return __awaiter(this, void 0, void 0, function* () {
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
                yield pendingLoop;
            }
            catch (err) {
                collectorState.lastError =
                    err instanceof Error ? err.message : String(err);
                console.error("[collector stop] erro aguardando encerramento", err);
            }
        }
        else {
            collectorState.running = false;
            collectorState.stopRequested = false;
            collectorState.lastFinishedAt = new Date().toISOString();
            stopFlag = false;
        }
        return {
            stopped: true,
            status: getCollectorStatus(),
        };
    });
}
// Ensure database connection before starting
function ensureDatabaseConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // dbService.init() handles MySQL initialization and will fallback to SQLite
            yield dbService_1.dbService.init();
            console.log("Database connection established (via dbService)");
        }
        catch (e) {
            console.warn("[DB] ensureDatabaseConnection failed:", String(e));
            throw e;
        }
    });
}
const app = (0, express_1.default)();
// Allow CORS from any origin during development. Using the default `cors()`
// handler ensures proper handling of preflight OPTIONS requests.
app.use((0, cors_1.default)());
// Also explicitly respond to OPTIONS preflight for all routes (defensive)
app.options('*', (0, cors_1.default)());
// Extra safety: ensure the common CORS headers are present on all responses.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});
// Defensive: log and respond to preflight OPTIONS explicitly so the browser
// receives the required CORS headers even if some route middleware would
// otherwise interfere.
app.use((req, res, next) => {
    try {
        if (req.method === 'OPTIONS') {
            console.log('[CORS preflight] ', req.method, req.path, 'from', req.headers.origin);
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type,Authorization');
            res.setHeader('Access-Control-Max-Age', '600');
            return res.status(204).end();
        }
    }
    catch (e) {
        console.warn('[CORS preflight handler error]', e);
    }
    next();
});
// Allow larger JSON bodies (base64 images can be large). Default was too small and caused 413 errors.
app.use(express_1.default.json({ limit: '20mb' }));
// Also accept large urlencoded bodies if any clients send form-encoded data
app.use(express_1.default.urlencoded({ extended: true, limit: '20mb' }));
// Helper: normalize incoming date strings to ISO `yyyy-MM-dd` used in DB
function normalizeDateParam(d) {
    if (!d && d !== 0)
        return null;
    const s = String(d).trim();
    if (!s)
        return null;
    // If already in ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s))
        return s;
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
app.get("/api/materiaprima/labels", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield ensureDatabaseConnection();
        const materias = yield materiaPrimaService_1.materiaPrimaService.getAll();
        // Map MateriaPrima records to frontend-friendly keys.
        // Assumes `num` is the product index (1..n) and product columns in table start at col6 = Prod_1.
        const mapping = {};
        const colOffset = 5; // Prod_1 -> col6
        for (const m of materias) {
            if (!m)
                continue;
            const num = typeof m.num === "number" ? m.num : Number(m.num);
            if (Number.isNaN(num))
                continue;
            const colKey = `col${num + colOffset}`;
            mapping[colKey] = {
                produto: (_a = m.produto) !== null && _a !== void 0 ? _a : `Produto ${num}`,
                medida: typeof m.medida === "number"
                    ? m.medida
                    : m.medida
                        ? Number(m.medida)
                        : 1,
            };
        }
        return res.json(mapping);
    }
    catch (e) {
        console.error("Failed to get materia prima labels", e);
        return res.status(500).json({});
    }
}));
// --- HTTP API parity for websocket commands ---
app.get("/api/ping", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.json({ pong: true, ts: new Date().toISOString() });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/db/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbService_1.dbService.init();
        const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio);
        const count = yield repo.count();
        return res.json({
            status: "connected",
            isInitialized: dbService_1.AppDataSource.isInitialized,
            relatorioCount: count,
            ts: new Date().toISOString(),
        });
    }
    catch (e) {
        console.error("[db/status] Error:", e);
        return res.status(500).json({
            status: "error",
            error: (e === null || e === void 0 ? void 0 : e.message) || "internal",
            isInitialized: dbService_1.AppDataSource.isInitialized,
            ts: new Date().toISOString(),
        });
    }
}));
app.get("/api/backup/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const data = yield backupService_1.backupSvc.listBackups();
        return res.json(data);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/file/process", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const filePath = String(req.query.filePath || req.query.path || "");
        if (!filePath)
            return res.status(400).json({ error: "filePath is required" });
        const r = yield fileProcessorService_1.fileProcessorService.processFile(filePath);
        return res.json({ meta: r.meta, rowsCount: r.parsed.rowsCount });
    }
    catch (e) {
        console.error(e);
        return res
            .status((e === null || e === void 0 ? void 0 : e.status) || 500)
            .json({ error: (e === null || e === void 0 ? void 0 : e.message) || "internal" });
    }
}));
// Upload CSV and import into DB. Form field: `file` (multipart/form-data)
const upload = (0, multer_1.default)({ dest: TMP_DIR });
app.post("/api/file/upload", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const f = req.file;
        if (!f)
            return res
                .status(400)
                .json({ error: "file is required (field name: file)" });
        // Determine the saved path (multer uses f.path in some setups, otherwise use destination+filename)
        const savedPath = f.path || (f.destination ? path_1.default.join(f.destination, f.filename) : null);
        if (!savedPath || !fs_1.default.existsSync(savedPath))
            return res
                .status(500)
                .json({ error: "uploaded file not found on server" });
        // Backup the uploaded file
        const meta = yield backupService_1.backupSvc.backupFile({
            originalname: f.originalname || f.filename,
            path: savedPath,
            size: f.size,
        });
        // Parse
        const parsed = yield parserService_1.parserService.processFile(savedPath);
        // Insert into DB
        if (parsed.rows && parsed.rows.length > 0) {
            yield dbService_1.dbService.insertRelatorioRows(parsed.rows, meta.workPath || meta.backupPath || path_1.default.basename(savedPath));
        }
        return res.json({
            ok: true,
            meta,
            processed: {
                rowsCount: parsed.rows.length,
                processedPath: parsed.processedPath,
            },
        });
    }
    catch (e) {
        console.error("[api/file/upload] error:", e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || "internal" });
    }
}));
app.get("/api/ihm/fetchLatest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ip = String(req.query.ip || "");
        const user = String(req.query.user || "anonymous");
        const password = String(req.query.password || "");
        if (!ip)
            return res.status(400).json({ error: "ip is required" });
        const tmpDir = path_1.default.resolve(process.cwd(), process.env.COLLECTOR_TMP || "tmp");
        if (!fs_1.default.existsSync(tmpDir))
            fs_1.default.mkdirSync(tmpDir, { recursive: true });
        const ihm = new IHMService_1.IHMService(ip, user, password);
        const downloaded = yield ihm.findAndDownloadNewFiles(tmpDir);
        if (!downloaded || downloaded.length === 0)
            return res.json({ ok: true, message: "Nenhum CSV novo encontrado" });
        const result = downloaded[0];
        const fileStat = fs_1.default.statSync(result.localPath);
        const fileObj = {
            originalname: result.name,
            path: result.localPath,
            mimetype: "text/csv",
            size: fileStat.size,
        };
        const meta = yield backupService_1.backupSvc.backupFile(fileObj);
        const processed = yield parserService_1.parserService.processFile(meta.workPath || meta.backupPath);
        return res.json({ meta, processed });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || "internal" });
    }
}));
app.get("/api/relatorio/paginate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    // quero que seja pro GET e POST
    try {
        // Parse and validate pagination params to avoid passing NaN/invalid values to TypeORM
        const pageRaw = req.query.page;
        const pageSizeRaw = req.query.pageSize;
        const allRaw = String(req.query.all || '').toLowerCase();
        const returnAll = allRaw === 'true' || allRaw === '1';
        const pageNum = (() => {
            const n = Number(pageRaw);
            return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
        })();
        const pageSizeNum = (() => {
            const n = Number(pageSizeRaw);
            return Number.isFinite(n) && n > 0 ? Math.floor(n) : 100;
        })();
        // Separate filters: `codigo` (Form1 generated by IHM), `numero` (Form2 provided by user), and `formula` (name or code)
        const codigoRaw = (_a = req.query.codigo) !== null && _a !== void 0 ? _a : null;
        const numeroRaw = (_b = req.query.numero) !== null && _b !== void 0 ? _b : null;
        const formulaRaw = (_c = req.query.formula) !== null && _c !== void 0 ? _c : null;
        const dataInicio = (_d = req.query.dataInicio) !== null && _d !== void 0 ? _d : null;
        const dataFim = (_e = req.query.dataFim) !== null && _e !== void 0 ? _e : null;
        // Normalize date params to yyyy-mm-dd when present
        const normDataInicio = normalizeDateParam(dataInicio) || null;
        const normDataFim = normalizeDateParam(dataFim) || null;
        const sortBy = String(req.query.sortBy || "Dia");
        const sortDir = String(req.query.sortDir || "DESC");
        const includeProducts = String(req.query.includeProducts || "true") === "true"; // Default to true for values
        try {
            yield dbService_1.dbService.init();
        }
        catch (dbError) {
            console.error("[relatorio/paginate] Database initialization failed:", dbError);
            return res.status(500).json({
                error: "Database connection failed",
                details: dbError === null || dbError === void 0 ? void 0 : dbError.message,
            });
        }
        const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio);
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
            }
            else {
                const fStr = String(formulaRaw).toLowerCase();
                qb.andWhere("LOWER(r.Nome) LIKE :fStr", { fStr: `%${fStr}%` });
            }
        }
        if (normDataInicio)
            qb.andWhere("r.Dia >= :ds", { ds: normDataInicio });
        // For inclusive end-date when Dia is date-only, compare with exclusive next day
        if (normDataFim) {
            // compute next day
            const parts = normDataFim.split("-");
            let dePlus = normDataFim;
            try {
                const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                dt.setDate(dt.getDate() + 1);
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, "0");
                const d = String(dt.getDate()).padStart(2, "0");
                dePlus = `${y}-${m}-${d}`;
            }
            catch (e) {
                dePlus = normDataFim;
            }
            qb.andWhere("r.Dia < :dePlus", { dePlus });
        }
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
        let rows = [];
        let total = 0;
        try {
            if (returnAll) {
                rows = yield qb.getMany();
                total = rows.length;
            }
            else {
                [rows, total] = yield qb.skip(offset).take(take).getManyAndCount();
            }
        }
        catch (queryError) {
            console.error("[relatorio/paginate] Query execution failed:", queryError);
            return res
                .status(500)
                .json({ error: "Database query failed", details: queryError === null || queryError === void 0 ? void 0 : queryError.message });
        }
        // Map rows to include values array from Prod_1 to Prod_40
        // Normalize product values according to MateriaPrima.measure (grams->kg)
        const materias = yield materiaPrimaService_1.materiaPrimaService.getAll();
        const materiasByNum = {};
        for (const m of materias) {
            const n = typeof m.num === "number" ? m.num : Number(m.num);
            if (!Number.isNaN(n))
                materiasByNum[n] = m;
        }
        const mappedRows = rows.map((row) => {
            var _a, _b;
            const values = [];
            for (let i = 1; i <= 40; i++) {
                const prodValue = row[`Prod_${i}`];
                let v = typeof prodValue === "number"
                    ? prodValue
                    : prodValue != null
                        ? Number(prodValue)
                        : 0;
                const materia = materiasByNum[i];
                // If materia exists and medida===0 (grams), normalize to kg by dividing 1000
                if (materia && Number(materia.medida) === 0 && v) {
                    v = v / 1000;
                }
                values.push(v);
            }
            return {
                Dia: row.Dia || "",
                Hora: row.Hora || "",
                Nome: row.Nome || "",
                Codigo: (_a = row.Form1) !== null && _a !== void 0 ? _a : 0,
                Numero: (_b = row.Form2) !== null && _b !== void 0 ? _b : 0,
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
    }
    catch (e) {
        console.error("[relatorio/paginate] Unexpected error:", e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || "internal" });
    }
}));
// --- Simple auth endpoints: register, login, upload photo
// Stores plain-text passwords (per user request). First registered user becomes admin.
const userUpload = (0, multer_1.default)({ dest: path_1.default.resolve(process.cwd(), 'user_photos') });
if (!fs_1.default.existsSync(path_1.default.resolve(process.cwd(), 'user_photos')))
    fs_1.default.mkdirSync(path_1.default.resolve(process.cwd(), 'user_photos'), { recursive: true });
// Serve uploaded profile photos
app.use('/user_photos', express_1.default.static(path_1.default.resolve(process.cwd(), 'user_photos')));
app.post('/api/auth/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const { username, password, displayName } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'username and password required' });
        const repo = dbService_1.AppDataSource.getRepository(entities_1.User);
        const existing = yield repo.findOne({ where: { username } });
        if (existing)
            return res.status(409).json({ error: 'username taken' });
        // If there are no users yet, make this one admin
        const usersCount = yield repo.count();
        const isAdmin = usersCount === 0;
        const u = repo.create({ username, password: password, displayName: displayName || null, isAdmin });
        const saved = yield repo.save(u);
        // Do not return password hash
        const _a = saved, { password: _pw } = _a, out = __rest(_a, ["password"]);
        return res.json(out);
    }
    catch (e) {
        console.error('[auth/register] error', e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || 'internal' });
    }
}));
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'username and password required' });
        const repo = dbService_1.AppDataSource.getRepository(entities_1.User);
        const user = yield repo.findOne({ where: { username } });
        if (!user)
            return res.status(401).json({ error: 'invalid' });
        if (user.password !== password)
            return res.status(401).json({ error: 'invalid' });
        const _a = user, { password: _pw } = _a, out = __rest(_a, ["password"]);
        return res.json(out);
    }
    catch (e) {
        console.error('[auth/login] error', e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || 'internal' });
    }
}));
app.post('/api/auth/photo', userUpload.single('photo'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const f = req.file;
        const username = req.body.username;
        if (!username)
            return res.status(400).json({ error: 'username required' });
        if (!f)
            return res.status(400).json({ error: 'photo file required (field: photo)' });
        const repo = dbService_1.AppDataSource.getRepository(entities_1.User);
        const user = yield repo.findOne({ where: { username } });
        if (!user)
            return res.status(404).json({ error: 'user not found' });
        // move file to persistent path and store relative path
        const destDir = path_1.default.resolve(process.cwd(), 'user_photos');
        if (!fs_1.default.existsSync(destDir))
            fs_1.default.mkdirSync(destDir, { recursive: true });
        const ext = path_1.default.extname(f.originalname || f.filename || '');
        const newName = `${username}_${Date.now()}${ext}`;
        const newPath = path_1.default.join(destDir, newName);
        fs_1.default.renameSync(f.path, newPath);
        // store a relative URL so frontend can access via /user_photos/<name>
        user.photoPath = `/user_photos/${newName}`;
        yield repo.save(user);
        const _a = user, { password: _pw } = _a, out = __rest(_a, ["password"]);
        return res.json(out);
    }
    catch (e) {
        console.error('[auth/photo] error', e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || 'internal' });
    }
}));
app.post('/api/auth/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const { username, displayName } = req.body;
        if (!username)
            return res.status(400).json({ error: 'username required' });
        const repo = dbService_1.AppDataSource.getRepository(entities_1.User);
        const user = yield repo.findOne({ where: { username } });
        if (!user)
            return res.status(404).json({ error: 'user not found' });
        user.displayName = displayName !== null && displayName !== void 0 ? displayName : user.displayName;
        yield repo.save(user);
        const _a = user, { passwordHash } = _a, out = __rest(_a, ["passwordHash"]);
        return res.json(out);
    }
    catch (e) {
        console.error('[auth/update] error', e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || 'internal' });
    }
}));
// Accept profile image as base64 data (JSON). This endpoint allows the frontend
// to store inline image data in the DB instead of relying on filesystem paths.
app.post('/api/auth/photoBase64', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const { username, photoBase64 } = req.body;
        if (!username)
            return res.status(400).json({ error: 'username required' });
        if (!photoBase64)
            return res.status(400).json({ error: 'photoBase64 required' });
        const repo = dbService_1.AppDataSource.getRepository(entities_1.User);
        const user = yield repo.findOne({ where: { username } });
        if (!user)
            return res.status(404).json({ error: 'user not found' });
        // Store inline base64 (data URL) directly on the user.row
        user.photoData = photoBase64;
        // Optionally keep existing photoPath intact; do not remove it here.
        yield repo.save(user);
        const _a = user, { password: _pw } = _a, out = __rest(_a, ["password"]);
        return res.json(out);
    }
    catch (e) {
        console.error('[auth/photoBase64] error', e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || 'internal' });
    }
}));
// Endpoints to store/retrieve a report logo path in the settings store.
// The stored key will be 'report-logo-path' and will be used later when
// generating reports to include a logo image by path.
app.post('/api/report/logo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { path: logoPath } = req.body || {};
        if (!logoPath)
            return res.status(400).json({ error: 'path is required' });
        // Save as a single config key so it persists in DB via configService
        yield configService_1.configService.setSettings({ 'report-logo-path': String(logoPath) });
        return res.json({ success: true, path: logoPath });
    }
    catch (e) {
        console.error('[report/logo] error', e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || 'internal' });
    }
}));
app.get('/api/report/logo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const val = yield configService_1.configService.getSetting('report-logo-path');
        return res.json({ path: val !== null && val !== void 0 ? val : null });
    }
    catch (e) {
        console.error('[report/logo:get] error', e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || 'internal' });
    }
}));
app.post("/api/relatorio/paginate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // quero que seja pro GET e POST
    try {
        // Parse and validate pagination params to avoid passing NaN/invalid values to TypeORM
        const pageRaw = req.body.page;
        const pageSizeRaw = req.body.pageSize;
        const returnAll = req.body && (req.body.all === true || String(req.body.all || '').toLowerCase() === 'true');
        const pageNum = (() => {
            const n = Number(pageRaw);
            return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
        })();
        const pageSizeNum = (() => {
            const n = Number(pageSizeRaw);
            return Number.isFinite(n) && n > 0 ? Math.floor(n) : 100;
        })();
        // Separate filters: `codigo` (Form1 generated by IHM) and `numero` (Form2 provided by user)
        const codigoRaw = (_a = req.body.codigo) !== null && _a !== void 0 ? _a : null;
        const numeroRaw = (_b = req.body.numero) !== null && _b !== void 0 ? _b : null;
        const dataInicio = (_c = req.body.dataInicio) !== null && _c !== void 0 ? _c : null;
        const dataFim = (_d = req.body.dataFim) !== null && _d !== void 0 ? _d : null;
        const normDataInicioBody = normalizeDateParam(dataInicio) || null;
        const normDataFimBody = normalizeDateParam(dataFim) || null;
        const sortBy = String(req.body.sortBy || "Dia");
        const sortDir = String(req.body.sortDir || "DESC");
        const includeProducts = String(req.body.includeProducts || "true") === "true"; // Default to true for values
        try {
            yield dbService_1.dbService.init();
        }
        catch (dbError) {
            console.error("[relatorio/paginate] Database initialization failed:", dbError);
            return res.status(500).json({
                error: "Database connection failed",
                details: dbError === null || dbError === void 0 ? void 0 : dbError.message,
            });
        }
        const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio);
        const qb = repo.createQueryBuilder("r");
        // Apply separate numeric filters when provided
        if (codigoRaw != null && codigoRaw !== "") {
            const c = Number(codigoRaw);
            if (!Number.isNaN(c)) {
                qb.andWhere("r.Form1 = :c", { c });
            }
            else {
                // if codigo is not numeric, ignore it (Form1 is numeric generated by IHM)
            }
        }
        if (numeroRaw != null && numeroRaw !== "") {
            const num = Number(numeroRaw);
            if (!Number.isNaN(num)) {
                qb.andWhere("r.Form2 = :num", { num });
            }
            else {
                // if numero is not numeric, ignore it
            }
        }
        if (normDataInicioBody)
            qb.andWhere("r.Dia >= :ds", { ds: normDataInicioBody });
        if (normDataFimBody) {
            const parts = normDataFimBody.split("-");
            let dePlus = normDataFimBody;
            try {
                const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                dt.setDate(dt.getDate() + 1);
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, "0");
                const d = String(dt.getDate()).padStart(2, "0");
                dePlus = `${y}-${m}-${d}`;
            }
            catch (e) {
                dePlus = normDataFimBody;
            }
            qb.andWhere("r.Dia < :dePlus", { dePlus });
        }
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
        let rows = [];
        let total = 0;
        try {
            if (returnAll) {
                rows = yield qb.getMany();
                total = rows.length;
            }
            else {
                [rows, total] = yield qb.skip(offset).take(take).getManyAndCount();
            }
        }
        catch (queryError) {
            console.error("[relatorio/paginate] Query execution failed:", queryError);
            return res
                .status(500)
                .json({ error: "Database query failed", details: queryError === null || queryError === void 0 ? void 0 : queryError.message });
        }
        // Map rows to include values array from Prod_1 to Prod_40
        // Normalize product values according to MateriaPrima.measure (grams->kg)
        const materiasPost = yield materiaPrimaService_1.materiaPrimaService.getAll();
        const materiasByNumPost = {};
        for (const m of materiasPost) {
            const n = typeof m.num === "number" ? m.num : Number(m.num);
            if (!Number.isNaN(n))
                materiasByNumPost[n] = m;
        }
        const mappedRows = rows.map((row) => {
            var _a, _b;
            const values = [];
            for (let i = 1; i <= 40; i++) {
                const prodValue = row[`Prod_${i}`];
                let v = typeof prodValue === "number"
                    ? prodValue
                    : prodValue != null
                        ? Number(prodValue)
                        : 0;
                const materia = materiasByNumPost[i];
                if (materia && Number(materia.medida) === 0 && v) {
                    v = v / 1000;
                }
                values.push(v);
            }
            return {
                Dia: row.Dia || "",
                Hora: row.Hora || "",
                Nome: row.Nome || "",
                Codigo: (_a = row.Form1) !== null && _a !== void 0 ? _a : 0,
                Numero: (_b = row.Form2) !== null && _b !== void 0 ? _b : 0,
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
    }
    catch (e) {
        console.error("[relatorio/paginate] Unexpected error:", e);
        return res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || "internal" });
    }
}));
app.get("/api/db/listBatches", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbService_1.dbService.init();
        const repo = dbService_1.AppDataSource.getRepository(entities_1.Batch);
        const [items, total] = yield repo.findAndCount({
            take: 50,
            order: { fileTimestamp: "DESC" },
        });
        return res.json({ items, total, page: 1, pageSize: 50 });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
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
app.post("/api/db/setupMateriaPrima", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield dbService_1.dbService.init();
        const items = Array.isArray(req.body.items) ? req.body.items : [];
        // Sanitize and validate items
        const processedItems = items
            .map((item) => ({
            num: item.num,
            produto: typeof item.produto === "string" ? item.produto : "",
            medida: item.medida === 0 ? 0 : 1, // 0 = gramas, 1 = kilos
        }))
            .filter((it) => {
            const n = Number(it.num);
            if (!Number.isFinite(n)) {
                console.warn("[setupMateriaPrima] skipping invalid item (num not numeric):", it);
                return false;
            }
            return true;
        });
        try {
            const saved = yield materiaPrimaService_1.materiaPrimaService.saveMany(processedItems);
            return res.json(saved);
        }
        catch (err) {
            console.error("[setupMateriaPrima] saveMany error", (err === null || err === void 0 ? void 0 : err.message) || err);
            if ((err === null || err === void 0 ? void 0 : err.code) === "ER_DUP_ENTRY" ||
                ((_a = err === null || err === void 0 ? void 0 : err.driverError) === null || _a === void 0 ? void 0 : _a.code) === "ER_DUP_ENTRY") {
                return res.status(400).json({
                    error: "duplicate_num",
                    message: 'One or more provided "num" values already exist',
                });
            }
            return res.status(500).json({ error: "internal" });
        }
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/db/getMateriaPrima", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield materiaPrimaService_1.materiaPrimaService.getAll();
        return res.json(items);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/db/syncLocalToMain", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbService_1.dbService.init();
        const limit = Number(req.query.limit || 1000);
        const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio);
        const rows = yield repo.find({ take: Number(limit) });
        if (!rows || rows.length === 0)
            return res.json({ synced: 0 });
        const inserted = yield dbService_1.dbService.insertRelatorioRows(rows, "local-backup-sync");
        return res.json({
            synced: Array.isArray(inserted) ? inserted.length : rows.length,
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/resumo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const areaId = req.query.areaId ? String(req.query.areaId) : null;
        const formula = req.query.formula ? String(req.query.formula) : null;
        const nomeFormula = req.query.nomeFormula
            ? String(req.query.nomeFormula)
            : null;
        const codigo = req.query.codigo != null ? Number(String(req.query.codigo)) : null;
        const numero = req.query.numero != null ? Number(String(req.query.numero)) : null;
        const dataInicio = req.query.dataInicio
            ? String(req.query.dataInicio)
            : null;
        const dataFim = req.query.dataFim ? String(req.query.dataFim) : null;
        const normDataInicioResumo = normalizeDateParam(dataInicio) || null;
        const normDataFimResumo = normalizeDateParam(dataFim) || null;
        // If nomeFormula looks like a number, prefer numeric formula filtering
        let numericFormula = null;
        if (nomeFormula != null && nomeFormula !== "") {
            const nf = Number(nomeFormula);
            if (Number.isFinite(nf))
                numericFormula = nf;
        }
        const result = yield resumoService_1.resumoService.getResumo({
            areaId,
            formula: numericFormula != null
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
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/unidades/converter", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const valor = Number(req.query.valor);
        const de = Number(req.query.de);
        const para = Number(req.query.para);
        if (isNaN(valor) || isNaN(de) || isNaN(para))
            return res.status(400).json({ error: "valor,de,para are required" });
        return res.json({
            original: valor,
            convertido: unidadesService_1.unidadesService.converterUnidades(Number(valor), Number(de), Number(para)),
            de,
            para,
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({});
    }
}));
app.post("/api/unidades/normalizarParaKg", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { valores, unidades } = req.body;
        if (!valores || !unidades)
            return res.status(400).json({ error: "valores and unidades required" });
        return res.json({
            valoresOriginais: valores,
            valoresNormalizados: unidadesService_1.unidadesService.normalizarParaKg(valores, unidades),
            unidades,
        });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({});
    }
}));
app.post("/api/db/populate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tipo = "relatorio", quantidade = 10, config = {} } = req.body || {};
        if (tipo === "relatorio") {
            const result = yield dataPopulationService_1.dataPopulationService.populateRelatorio(Math.min(Math.max(1, Number(quantidade)), 1000), config);
            return res.json(result);
        }
        return res.status(400).json({ error: "tipo not supported" });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({});
    }
}));
app.get("/api/collector/start", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield startCollector();
        return res.json(result);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/collector/stop", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield stopCollector();
        return res.json(result);
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/collector/status", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.json(getCollectorStatus());
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
app.get("/api/relatorioPdf", (req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
app.get("/api/filtrosAvaliable", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Optional date filters to scope the available values
        const dateStart = req.query.dateStart ? String(req.query.dateStart) : null;
        const dateEnd = req.query.dateEnd ? String(req.query.dateEnd) : null;
        const normDateStartFiltros = normalizeDateParam(dateStart) || null;
        const normDateEndFiltros = normalizeDateParam(dateEnd) || null;
        // Use resumoService to compute formulas used in the given period
        const resumo = yield resumoService_1.resumoService.getResumo({ dateStart, dateEnd });
        const formulasObj = resumo.formulasUtilizadas || {};
        const formulasAll = Object.values(formulasObj).map((f) => ({
            nome: f.nome,
            codigo: Number(f.numero),
        }));
        const formulas = formulasAll.filter((f) => !Number.isNaN(f.codigo));
        // Extract unique codigos (Form1) from formulas
        const codigosSet = new Set();
        formulas.forEach((f) => codigosSet.add(f.codigo));
        const codigos = Array.from(codigosSet).sort((a, b) => a - b);
        // For numeros (Form2) we need to query DB for distinct Form2 values within date range
        yield dbService_1.dbService.init();
        const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio);
        const qb = repo
            .createQueryBuilder("r")
            .select("DISTINCT r.Form2", "numero");
        if (normDateStartFiltros)
            qb.andWhere("r.Dia >= :ds", { ds: normDateStartFiltros });
        if (normDateEndFiltros) {
            const parts = normDateEndFiltros.split("-");
            let dePlus = normDateEndFiltros;
            try {
                const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                dt.setDate(dt.getDate() + 1);
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, "0");
                const d = String(dt.getDate()).padStart(2, "0");
                dePlus = `${y}-${m}-${d}`;
            }
            catch (e) {
                dePlus = normDateEndFiltros;
            }
            qb.andWhere("r.Dia < :dePlus", { dePlus });
        }
        const raw = yield qb.getRawMany();
        const numeros = raw
            .map((r) => (r && r.numero != null ? Number(r.numero) : null))
            .filter((v) => v != null && !Number.isNaN(v))
            .sort((a, b) => a - b);
        return res.json({ formulas, codigos, numeros });
    }
    catch (e) {
        console.error("[filtrosAvaliable] Error:", e);
        return res.status(500).json({ error: "internal", details: e === null || e === void 0 ? void 0 : e.message });
    }
}));
// Additional endpoints for Processador HTTP compatibility
app.post("/api/file/processContent", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
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
        const r = yield fileProcessorService_1.fileProcessorService.processFile(tempPath);
        // Clean up temp file
        try {
            fs.unlinkSync(tempPath);
        }
        catch (_a) { }
        return res.json({ meta: r.meta, rowsCount: r.parsed.rowsCount });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "internal" });
    }
}));
// envie a config inteira
app.get("/api/config/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const config = yield configService_1.configService.getAllSettings();
        // Try to normalize stored string values into JSON/objects when possible
        const normalized = {};
        for (const k of Object.keys(config || {})) {
            const raw = config[k];
            if (raw == null) {
                normalized[k] = raw;
                continue;
            }
            // If it's already an object (shouldn't happen here) just pass through
            if (typeof raw !== 'string') {
                normalized[k] = raw;
                continue;
            }
            // Try normal JSON parse
            let out = raw;
            try {
                out = JSON.parse(raw);
            }
            catch (e) {
                // parsing failed; attempt to handle common double-encoded or numeric-indexed maps
                try {
                    // Attempt to unescape and parse
                    const unescaped = raw.replace(/\\"/g, '"');
                    out = JSON.parse(unescaped);
                }
                catch (e2) {
                    // As a last resort try to eval (should be safe as data is from DB)
                    try {
                        // eslint-disable-next-line no-eval
                        out = eval('(' + raw + ')');
                    }
                    catch (e3) {
                        out = raw;
                    }
                }
            }
            // If out looks like a numeric index -> char map, reconstruct string
            if (out && typeof out === 'object' && !Array.isArray(out)) {
                const numericKeys = Object.keys(out).filter((x) => /^\d+$/.test(x));
                // Only reconstruct when ALL keys are numeric-indexed (indicates a char map)
                if (numericKeys.length > 0 && numericKeys.length === Object.keys(out).length) {
                    // Build string from numeric keys in order
                    const chars = [];
                    numericKeys
                        .map((n) => Number(n))
                        .sort((a, b) => a - b)
                        .forEach((i) => {
                        const v = out[String(i)];
                        if (typeof v === 'string')
                            chars.push(v);
                    });
                    if (chars.length > 0) {
                        const joined = chars.join('');
                        // try parse joined as json to recover nested object
                        try {
                            normalized[k] = JSON.parse(joined);
                            continue;
                        }
                        catch (_c) {
                            normalized[k] = joined;
                            continue;
                        }
                    }
                }
            }
            normalized[k] = out;
        }
        // Provide sensible defaults and ensure common keys are present separately
        const defaults = {
            'admin-config': '',
            'db-config': '',
            'general-config': '',
            'ihm-config': {
                nomeCliente: '',
                ip: String((_b = (_a = (0, runtimeConfig_1.getRuntimeConfig)('ihm_ip')) !== null && _a !== void 0 ? _a : process.env.IHM_IP) !== null && _b !== void 0 ? _b : ''),
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
                batchDumpDir: ''
            },
            'produtosInfo': {}
        };
        // Merge defaults for missing keys to ensure separation (do not overwrite existing)
        for (const k of Object.keys(defaults)) {
            if (normalized[k] === undefined)
                normalized[k] = defaults[k];
        }
        res.json(normalized);
    }
    catch (e) {
        console.error("Failed to get config", e);
        res.status(500).json({ error: "internal" });
    }
}));
// Return a separated default config structure (frontend can use this to initialize forms)
app.get('/api/config/defaults', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const defaults = {
            'admin-config': '',
            'db-config': '',
            'general-config': '',
            'ihm-config': {
                nomeCliente: '',
                ip: String((_b = (_a = (0, runtimeConfig_1.getRuntimeConfig)('ihm_ip')) !== null && _a !== void 0 ? _a : process.env.IHM_IP) !== null && _b !== void 0 ? _b : ''),
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
                batchDumpDir: ''
            },
            'produtosInfo': {}
        };
        res.json(defaults);
    }
    catch (e) {
        console.error('[config/defaults] error', e);
        res.status(500).json({ error: 'internal' });
    }
}));
// Accept a combined config object and persist each top-level key as separate settings
app.post('/api/config/split', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const configObj = req.body;
        if (!configObj || typeof configObj !== 'object' || Array.isArray(configObj)) {
            return res.status(400).json({ error: 'Request body must be an object with top-level config keys' });
        }
        // Persist each top-level key as a separate Setting row
        yield configService_1.configService.setSettings(configObj);
        try {
            (0, runtimeConfig_1.setRuntimeConfigs)(configObj);
        }
        catch (e) { /* ignore */ }
        return res.json({ success: true, saved: Object.keys(configObj) });
    }
    catch (e) {
        console.error('[config/split] Failed to split/save settings', e);
        return res.status(500).json({ error: 'internal' });
    }
}));
app.get("/api/config/:key", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const key = req.params.key;
        if (!key) {
            return res.status(400).json({ error: "Key parameter is required" });
        }
        const raw = yield configService_1.configService.getSetting(key);
        // Known defaults for frontend topics
        const knownDefaults = {
            'admin-config': '',
            'db-config': '',
            'general-config': '',
            'ihm-config': {
                nomeCliente: '',
                ip: String((_b = (_a = (0, runtimeConfig_1.getRuntimeConfig)('ihm_ip')) !== null && _a !== void 0 ? _a : process.env.IHM_IP) !== null && _b !== void 0 ? _b : ''),
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
                batchDumpDir: ''
            },
            'produtosInfo': {}
        };
        if (raw === null) {
            // Return the known default structure if available
            if (knownDefaults[key] !== undefined)
                return res.json({ key, value: knownDefaults[key] });
            return res.json({ key, value: {} });
        }
        // Parse/normalize the stored value similarly to the bulk endpoint
        let out = raw;
        if (typeof raw === 'string') {
            try {
                out = JSON.parse(raw);
            }
            catch (e) {
                try {
                    const unescaped = raw.replace(/\\"/g, '"');
                    out = JSON.parse(unescaped);
                }
                catch (e2) {
                    try {
                        // eslint-disable-next-line no-eval
                        out = eval('(' + raw + ')');
                    }
                    catch (e3) {
                        out = raw;
                    }
                }
            }
        }
        // Reconstruct numeric-index char map if appropriate
        if (out && typeof out === 'object' && !Array.isArray(out)) {
            const numericKeys = Object.keys(out).filter((x) => /^\d+$/.test(x));
            if (numericKeys.length > 0 && numericKeys.length === Object.keys(out).length) {
                const chars = [];
                numericKeys.map(n => Number(n)).sort((a, b) => a - b).forEach(i => {
                    const v = out[String(i)];
                    if (typeof v === 'string')
                        chars.push(v);
                });
                if (chars.length > 0) {
                    const joined = chars.join('');
                    try {
                        out = JSON.parse(joined);
                    }
                    catch (_f) {
                        out = joined;
                    }
                }
            }
        }
        // If the client asked for only input fields (e.g. ?inputs=true), filter
        // the returned object to only the input-relevant keys for known topics.
        const onlyInputs = String(((_c = req.query) === null || _c === void 0 ? void 0 : _c.inputs) || '').toLowerCase() === 'true';
        if (onlyInputs && out && typeof out === 'object' && !Array.isArray(out)) {
            const inputsMap = {
                'ihm-config': ['ip', 'user', 'password'],
                'general-config': ['nomeCliente', 'localCSV', 'metodoCSV', 'habilitarCSV', 'serverDB', 'database', 'userDB', 'passwordDB', 'mySqlDir', 'dumpDir', 'batchDumpDir'],
                'admin-config': [],
                'db-config': [],
                'produtosInfo': []
            };
            if (Object.prototype.hasOwnProperty.call(inputsMap, key)) {
                if (key === 'produtosInfo') {
                    // For produtosInfo return only nome and unidade per column
                    const filtered = {};
                    for (const col of Object.keys(out)) {
                        const item = out[col] || {};
                        filtered[col] = { nome: (_d = item.nome) !== null && _d !== void 0 ? _d : '', unidade: (_e = item.unidade) !== null && _e !== void 0 ? _e : '' };
                    }
                    out = filtered;
                }
                else {
                    const fields = inputsMap[key];
                    const filtered = {};
                    for (const f of fields) {
                        // prefer value in parsed object, otherwise fallback to knownDefaults if present
                        filtered[f] = out[f] !== undefined ? out[f] : (knownDefaults[key] && knownDefaults[key][f] !== undefined ? knownDefaults[key][f] : '');
                    }
                    out = filtered;
                }
            }
        }
        // If known default exists and parsed out is empty, return default
        if ((out === null || out === '' || (typeof out === 'object' && Object.keys(out).length === 0)) && knownDefaults[key] !== undefined) {
            return res.json({ key, value: knownDefaults[key] });
        }
        return res.json({ key, value: out });
    }
    catch (e) {
        console.error("Failed to get setting", e);
        res.status(500).json({ error: "internal" });
    }
}));
app.post("/api/config", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const configObj = req.body;
        if (!configObj ||
            typeof configObj !== "object" ||
            Array.isArray(configObj)) {
            return res
                .status(400)
                .json({
                error: "Request body must be a JSON object with config keys/values",
            });
        }
        const keys = Object.keys(configObj);
        if (keys.length === 0) {
            return res.status(400).json({ error: "No config keys provided" });
        }
        // Salva todas as configurações de uma vez e atualiza runtime
        yield configService_1.configService.setSettings(configObj);
        try {
            (0, runtimeConfig_1.setRuntimeConfigs)(configObj);
        }
        catch (e) {
            /* ignore */
        }
        res.json({ success: true, saved: keys });
    }
    catch (e) {
        console.error("Failed to set settings", e);
        res.status(500).json({ error: "internal" });
    }
}));
// Provide chart-oriented data for frontend dashboards
app.get("/api/chartdata", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield dbService_1.dbService.init();
        const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio);
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
        if (limit && Number.isFinite(limit) && limit > 0)
            qb.take(limit);
        if (normDateStartChart)
            qb.andWhere("r.Dia >= :ds", { ds: normDateStartChart });
        if (normDateEndChart) {
            const parts = normDateEndChart.split("-");
            let dePlus = normDateEndChart;
            try {
                const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                dt.setDate(dt.getDate() + 1);
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, "0");
                const d = String(dt.getDate()).padStart(2, "0");
                dePlus = `${y}-${m}-${d}`;
            }
            catch (e) {
                dePlus = normDateEndChart;
            }
            qb.andWhere("r.Dia < :dePlus", { dePlus });
        }
        const rows = yield qb.getMany();
        // Load materia prima units
        const materias = yield materiaPrimaService_1.materiaPrimaService.getAll();
        const materiasByNum = {};
        for (const m of materias) {
            const n = typeof m.num === "number" ? m.num : Number(m.num);
            if (!Number.isNaN(n))
                materiasByNum[n] = m;
        }
        const mapped = rows.map((r) => {
            var _a, _b;
            const values = [];
            const units = {};
            for (let i = 1; i <= 40; i++) {
                const v = typeof r[`Prod_${i}`] === "number"
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
            return Object.assign({ Nome: r.Nome || "", values, Dia: r.Dia || "", Hora: r.Hora || "", Form1: (_a = r.Form1) !== null && _a !== void 0 ? _a : null, Form2: (_b = r.Form2) !== null && _b !== void 0 ? _b : null }, units);
        });
        return res.json({
            rows: mapped,
            total: mapped.length,
            ts: new Date().toISOString(),
        });
    }
    catch (e) {
        console.error("[api/chartdata] error", e);
        return res.status(500).json({ error: "internal" });
    }
}));
// Start HTTP server (prefer runtime-config 'http_port' then env vars)
const HTTP_PORT = Number((_g = (_f = (_e = (0, runtimeConfig_1.getRuntimeConfig)("http_port")) !== null && _e !== void 0 ? _e : process.env.FRONTEND_API_PORT) !== null && _f !== void 0 ? _f : process.env.PORT) !== null && _g !== void 0 ? _g : 3000);
// Setup file processor observer for notifications (simplified without WebSocket)
fileProcessorService_1.fileProcessorService.addObserver({
    update: (p) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("[File processed]", p);
    }),
});
// Load saved config into runtime store before starting
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ensureDatabaseConnection();
        const all = yield configService_1.configService.getAllSettings();
        (0, runtimeConfig_1.setRuntimeConfigs)(all);
        console.log("[Server] Loaded runtime configs from DB:", Object.keys(all).length);
    }
    catch (e) {
        console.warn("[Server] Could not load runtime configs at startup:", String(e));
    }
    app.listen(HTTP_PORT, () => console.log(`[Server] API server running on port ${HTTP_PORT}`));
}))();
//# sourceMappingURL=index.js.map