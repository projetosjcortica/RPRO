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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopCollector = stopCollector;
exports.startCollector = startCollector;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const IHMService_1 = require("../services/IHMService");
const runtimeConfig_1 = require("../core/runtimeConfig");
const promises_1 = require("timers/promises");
const backupService_1 = require("../services/backupService");
const fileProcessorService_1 = require("../services/fileProcessorService");
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
const TMP_DIR = path_1.default.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
if (!fs_1.default.existsSync(TMP_DIR))
    fs_1.default.mkdirSync(TMP_DIR, { recursive: true });
let STOP = false;
function stopCollector() {
    STOP = true;
}
// Prefer runtime-config topic 'ihm-config' if present (ip, user, password)
const ihmCfg = (0, runtimeConfig_1.getRuntimeConfig)('ihm-config') || {};
const resolvedIp = (_c = (_b = (_a = ihmCfg.ip) !== null && _a !== void 0 ? _a : (0, runtimeConfig_1.getRuntimeConfig)('ip')) !== null && _b !== void 0 ? _b : process.env.IHM_IP) !== null && _c !== void 0 ? _c : '192.168.5.252';
const resolvedUser = (_f = (_e = (_d = ihmCfg.user) !== null && _d !== void 0 ? _d : (0, runtimeConfig_1.getRuntimeConfig)('user')) !== null && _e !== void 0 ? _e : process.env.IHM_USER) !== null && _f !== void 0 ? _f : 'anonymous';
const resolvedPassword = (_j = (_h = (_g = ihmCfg.password) !== null && _g !== void 0 ? _g : (0, runtimeConfig_1.getRuntimeConfig)('pass')) !== null && _h !== void 0 ? _h : process.env.IHM_PASSWORD) !== null && _j !== void 0 ? _j : '';
if (!resolvedIp)
    console.warn('[Collector] No IHM IP configured; using default fallback');
const ihmService = new IHMService_1.IHMService(String(resolvedIp), String(resolvedUser), String(resolvedPassword));
class Collector {
    constructor(ihmService) {
        this.ihmService = ihmService;
        this.fileProcessor = fileProcessorService_1.fileProcessorService;
        this.backup = new backupService_1.BackupService();
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('[Collector] Iniciando ciclo de coleta...');
                const downloaded = yield this.ihmService.findAndDownloadNewFiles(TMP_DIR);
                if (downloaded.length === 0) {
                    console.log('[Collector] Nenhum arquivo novo encontrado');
                    return;
                }
                console.log(`[Collector] ${downloaded.length} arquivos novos baixados.`);
                for (const f of downloaded) {
                    if (STOP)
                        break;
                    console.log(`[Collector] Processando arquivo: ${f.name} -> ${f.localPath}`);
                    try {
                        const result = yield this.fileProcessor.processFile(f.localPath);
                        yield this.backup.backupFile({
                            originalname: f.name,
                            path: f.localPath,
                            mimetype: 'text/csv',
                            size: fs_1.default.statSync(f.localPath).size,
                        });
                        console.log(`[Collector] Arquivo ${f.name} processado com sucesso:`, {
                            rowsProcessed: result.parsed.rowsCount,
                            fileSize: f.size
                        });
                    }
                    catch (fileError) {
                        console.error(`[Collector] Erro ao processar arquivo ${f.name}:`, fileError);
                    }
                }
                console.log('[Collector] Ciclo de coleta concluído com sucesso.');
            }
            catch (error) {
                console.error('[Collector] Erro durante o processo de coleta:', error);
                throw error;
            }
        });
    }
}
const collector = new Collector(new IHMService_1.IHMService(((0, runtimeConfig_1.getRuntimeConfig)('ihm-config') || {}).ip || process.env.IHM_IP || '192.168.5.252', ((0, runtimeConfig_1.getRuntimeConfig)('ihm-config') || {}).user || process.env.IHM_USER || 'anonymous', ((0, runtimeConfig_1.getRuntimeConfig)('ihm-config') || {}).password || process.env.IHM_PASS || ''));
function startCollector() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[Collector] Starting collector with ${POLL_INTERVAL}ms interval`);
        while (!STOP) {
            try {
                yield collector.start();
            }
            catch (error) {
                console.error('[Collector] Error during collection cycle:', error);
            }
            if (!STOP) {
                console.log(`[Collector] Waiting ${POLL_INTERVAL}ms before next cycle...`);
                yield (0, promises_1.setTimeout)(POLL_INTERVAL);
            }
        }
        console.log('[Collector] Coletor encerrado.');
    });
}
//# sourceMappingURL=index.js.map