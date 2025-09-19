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
define(["require", "exports", "typeorm", "path", "../core/baseService", "../entities/index", "reflect-metadata"], function (require, exports, typeorm_1, path_1, baseService_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cacheService = exports.CacheService = void 0;
    path_1 = __importDefault(path_1);
    class CacheService extends baseService_1.BaseService {
        constructor() {
            super('CacheService');
            const dbPath = process.env.CACHE_SQLITE_PATH || 'cache.sqlite';
            const absPath = path_1.default.isAbsolute(dbPath) ? dbPath : path_1.default.resolve(process.cwd(), dbPath);
            this.ds = new typeorm_1.DataSource({ type: 'sqlite', database: absPath, synchronize: true, logging: false, entities: [index_1.CacheFile] });
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () { if (!this.ds.isInitialized)
                yield this.ds.initialize(); });
        }
        getByName(originalName) {
            return __awaiter(this, void 0, void 0, function* () { yield this.init(); return this.ds.getRepository(index_1.CacheFile).findOne({ where: { originalName } }); });
        }
        upsert(rec) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.init();
                const repo = this.ds.getRepository(index_1.CacheFile);
                const existing = yield repo.findOne({ where: { originalName: rec.originalName } });
                if (existing) {
                    Object.assign(existing, rec);
                    return repo.save(existing);
                }
                return repo.save(repo.create(rec));
            });
        }
        recordBackupMeta(meta, st) {
            return __awaiter(this, void 0, void 0, function* () {
                const mtime = (st === null || st === void 0 ? void 0 : st.mtime) ? new Date(st.mtime).toISOString() : null;
                yield this.upsert({ originalName: meta.originalName, lastHash: meta.hash || null, lastSize: meta.size || null, lastMTime: mtime, lastProcessedAt: meta.createdAt });
            });
        }
    }
    exports.CacheService = CacheService;
    exports.cacheService = new CacheService();
});
