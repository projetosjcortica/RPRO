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
exports.cacheService = exports.CacheService = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const baseService_1 = require("../core/baseService");
const index_1 = require("../entities/index");
class CacheService extends baseService_1.BaseService {
    constructor() {
        super('CacheService');
        const dbPath = process.env.CACHE_SQLITE_PATH || 'cache.sqlite';
        const absPath = path_1.default.isAbsolute(dbPath) ? dbPath : path_1.default.resolve(process.cwd(), dbPath);
        this.ds = new typeorm_1.DataSource({ type: 'sqlite', database: absPath, synchronize: true, logging: false, entities: [index_1.CacheFile] });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // If already initialized, return
            if ((_a = this.ds) === null || _a === void 0 ? void 0 : _a.isInitialized)
                return;
            // If an initialization is in-flight, wait for it
            if (this.initPromise)
                return this.initPromise;
            // Otherwise start initialization and store promise so concurrent callers wait
            this.initPromise = (() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    if (!((_a = this.ds) === null || _a === void 0 ? void 0 : _a.isInitialized))
                        yield this.ds.initialize();
                }
                catch (err) {
                    // reset promise so subsequent attempts can retry
                    this.initPromise = null;
                    throw err;
                }
            }))();
            return this.initPromise;
        });
    }
    getByName(originalName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const repo = this.ds.getRepository(index_1.CacheFile);
            // case-insensitive search to avoid duplicate entries differing only by case
            const lowerName = String(originalName).toLowerCase();
            const qb = repo.createQueryBuilder('c').where('lower(c.originalName) = :n', { n: lowerName }).limit(1);
            return yield qb.getOne();
        });
    }
    upsert(rec) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const repo = this.ds.getRepository(index_1.CacheFile);
            const lowerName = String(rec.originalName).toLowerCase();
            const existing = yield repo.createQueryBuilder('c').where('lower(c.originalName) = :n', { n: lowerName }).getOne();
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
    saveCache(entries) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const repo = this.ds.getRepository(index_1.CacheFile);
            for (const entry of entries) {
                // case-insensitive lookup
                const existing = yield repo.createQueryBuilder('c').where('lower(c.originalName) = :n', { n: String(entry.name).toLowerCase() }).getOne();
                if (existing) {
                    existing.lastSize = entry.size;
                    yield repo.save(existing);
                }
                else {
                    const newRecord = repo.create({ originalName: entry.name, lastSize: entry.size });
                    yield repo.save(newRecord);
                }
            }
        });
    }
    getAllCache() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const repo = this.ds.getRepository(index_1.CacheFile);
            const all = yield repo.find();
            return all.map((c) => ({ name: c.originalName, size: c.lastSize || 0 }));
        });
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
//# sourceMappingURL=cacheService.js.map