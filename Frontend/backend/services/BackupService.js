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
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupSvc = exports.BackupService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const baseService_1 = require("../core/baseService");
const utils_1 = require("../core/utils");
const cacheService_1 = require("./cacheService");
const DEFAULT_BACKUP_DIR = path_1.default.resolve(process.cwd(), 'backups');
const ENV_WORK_DIR = process.env.BACKUP_WORKDIR ? path_1.default.resolve(process.cwd(), process.env.BACKUP_WORKDIR) : null;
const BACKUP_WRITE_FILES = process.env.BACKUP_WRITE_FILES !== 'false';
function ensureDirectoryExists(dir) {
    try {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
            console.log(`[BackupService] created directory: ${dir}`);
        }
    }
    catch (err) {
        console.error(`[BackupService] failed to ensure directory ${dir}:`, err);
        throw err;
    }
}
if (BACKUP_WRITE_FILES) {
    ensureDirectoryExists(DEFAULT_BACKUP_DIR);
    if (ENV_WORK_DIR)
        ensureDirectoryExists(ENV_WORK_DIR);
}
class BackupService extends baseService_1.BaseService {
    constructor() {
        super('BackupService');
        this.metas = [];
    }
    createId(name) { const ts = Date.now(); return `${ts}-${name.replace(/[^a-zA-Z0-9_.-]+/g, '_')}`; }
    listBackups() { return [...this.metas]; }
    getLatestBackup(originalName) { const filtered = this.metas.filter((m) => m.originalName === originalName); if (filtered.length === 0)
        return null; return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]; }
    backupFile(fileObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = fileObj.originalname || path_1.default.basename(fileObj.path);
            const id = this.createId(name);
            const backupPath = path_1.default.join(DEFAULT_BACKUP_DIR, id);
            const workDir = ENV_WORK_DIR || DEFAULT_BACKUP_DIR;
            const workPath = path_1.default.join(workDir, id);
            const buffer = fs_1.default.readFileSync(fileObj.path);
            const hash = (0, utils_1.hashBufferHex)(buffer);
            if (BACKUP_WRITE_FILES) {
                // Ensure target directories exist right before writing
                ensureDirectoryExists(path_1.default.dirname(backupPath));
                try {
                    fs_1.default.writeFileSync(backupPath, buffer);
                    if (ENV_WORK_DIR) {
                        ensureDirectoryExists(path_1.default.dirname(workPath));
                        fs_1.default.writeFileSync(workPath, buffer);
                    }
                }
                catch (err) {
                    console.error(`[BackupService] failed to write backup files (backupPath=${backupPath}, workPath=${workPath}):`, err);
                    throw err;
                }
            }
            const meta = { id, originalName: name, backupPath, workPath: ENV_WORK_DIR ? workPath : undefined, size: fileObj.size || buffer.length, createdAt: new Date().toISOString(), hash };
            this.metas.push(meta);
            try {
                yield cacheService_1.cacheService.recordBackupMeta(meta, fs_1.default.statSync(fileObj.path));
            }
            catch (_a) { }
            return meta;
        });
    }
}
exports.BackupService = BackupService;
exports.backupSvc = new BackupService();
//# sourceMappingURL=backupService.js.map