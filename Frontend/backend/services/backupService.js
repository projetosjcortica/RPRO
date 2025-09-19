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
define(["require", "exports", "fs", "path", "../core/baseService", "../core/utils", "./CacheService"], function (require, exports, fs_1, path_1, baseService_1, utils_1, CacheService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.backupSvc = exports.BackupService = void 0;
    fs_1 = __importDefault(fs_1);
    path_1 = __importDefault(path_1);
    const DEFAULT_BACKUP_DIR = path_1.default.resolve(process.cwd(), 'backups');
    const ENV_WORK_DIR = process.env.BACKUP_WORKDIR ? path_1.default.resolve(process.cwd(), process.env.BACKUP_WORKDIR) : null;
    const BACKUP_WRITE_FILES = process.env.BACKUP_WRITE_FILES !== 'false';
    if (BACKUP_WRITE_FILES && !fs_1.default.existsSync(DEFAULT_BACKUP_DIR))
        fs_1.default.mkdirSync(DEFAULT_BACKUP_DIR, { recursive: true });
    if (BACKUP_WRITE_FILES && ENV_WORK_DIR && !fs_1.default.existsSync(ENV_WORK_DIR))
        fs_1.default.mkdirSync(ENV_WORK_DIR, { recursive: true });
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
                    fs_1.default.writeFileSync(backupPath, buffer);
                    if (ENV_WORK_DIR)
                        fs_1.default.writeFileSync(workPath, buffer);
                }
                const meta = { id, originalName: name, backupPath, workPath: ENV_WORK_DIR ? workPath : undefined, size: fileObj.size || buffer.length, createdAt: new Date().toISOString(), hash };
                this.metas.push(meta);
                try {
                    yield CacheService_1.cacheService.recordBackupMeta(meta, fs_1.default.statSync(fileObj.path));
                }
                catch (_a) { }
                return meta;
            });
        }
    }
    exports.BackupService = BackupService;
    exports.backupSvc = new BackupService();
});
