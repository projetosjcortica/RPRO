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
exports.IHMService = void 0;
const baseService_1 = require("../core/baseService");
const basic_ftp_1 = require("basic-ftp");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cacheService_1 = require("./cacheService");
const dbService_1 = require("./dbService");
const console_1 = require("console");
class IHMService extends baseService_1.BaseService {
    constructor(ip, user = 'anonymous', password = '') {
        super('IHMService');
        this.ip = ip;
        this.user = user;
        this.password = password;
        this.cache = new Map(); // mapa para armazenar o cache e identificar arquivos novos
        this.originalNames = new Map();
        // Initialize cache DB and then load saved cache entries into memory so
        // we can compare remote file sizes across restarts.
        cacheService_1.cacheService
            .init()
            .then(() => cacheService_1.cacheService.getAllCache())
            .then((entries) => {
            for (const e of entries) {
                try {
                    // store cache by lower-case name to avoid case-sensitivity issues
                    const key = String(e.name).toLowerCase();
                    this.cache.set(key, Number(e.size) || 0);
                    this.originalNames.set(key, e.name);
                }
                catch (err) {
                    console.warn('[IHMService] failed to load cache entry', e, err);
                }
            }
            if (entries.length > 0) {
                console.log('[IHMService] loaded cache entries from DB:', entries.length);
            }
        })
            .catch((e) => {
            console.warn('[IHMService] failed to initialize cacheService:', String(e));
        });
    }
    salvarCacheNoDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Persist cache using original-casing when available
                const cacheEntries = Array.from(this.cache.entries()).map(([key, size]) => {
                    const original = this.originalNames.get(key) || key;
                    return { name: original, size };
                });
                yield cacheService_1.cacheService.saveCache(cacheEntries);
            }
            catch (error) {
                console.error('Error saving cache to database:', error);
            }
        });
    }
    filterNewFiles() {
        return (f) => {
            (0, console_1.log)(`[IHMService] Checking file: ${f.name}, size: ${f.size}`);
            if (!f.name.toLowerCase().endsWith('.csv')) {
                (0, console_1.log)(`[IHMService] Skipping non-CSV file: ${f.name}`);
                return false;
            }
            if (f.name.toLowerCase().includes('_sys')) {
                (0, console_1.log)(`[IHMService] Skipping system file: ${f.name}`);
                return false;
            }
            const sizeNum = typeof f.size === 'number' ? f.size : Number(f.size || 0);
            if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
                (0, console_1.log)(`[IHMService] Skipping file with invalid size: ${f.name}`);
                return false;
            }
            // normalize key to lower-case to compare against cache (avoid case mismatch)
            const key = String(f.name).toLowerCase();
            const cachedSize = this.cache.get(key);
            if (cachedSize != null && cachedSize === sizeNum) {
                (0, console_1.log)(`[IHMService] File ${f.name} unchanged (size: ${sizeNum}), skipping`);
                return false;
            }
            // update cache and remember original-casing name
            this.cache.set(key, sizeNum);
            this.originalNames.set(key, f.name);
            (0, console_1.log)(`[IHMService] File ${f.name} is new or changed (old size: ${cachedSize}, new size: ${sizeNum})`);
            return true;
        };
    }
    findAndDownloadNewFiles(localDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new basic_ftp_1.Client();
            try {
                (0, console_1.log)(`[IHMService] Connecting to FTP server: ${this.ip}`);
                yield client.access({ host: this.ip, user: this.user, password: this.password, secure: false });
                yield client.useDefaultSettings();
                yield client.cd('/InternalStorage/data/');
                const list = yield client.list();
                (0, console_1.log)(`[IHMService] Found ${list.length} files on FTP server`);
                if (list.length === 0) {
                    (0, console_1.log)('[IHMService] No files found on FTP server.');
                    return [];
                }
                const csvs = list.filter((f) => f.isFile && f.name.toLowerCase().endsWith('.csv'));
                (0, console_1.log)(`[IHMService] Found ${csvs.length} CSV files: ${csvs.map(f => f.name).join(', ')}`);
                const newFiles = csvs.filter(this.filterNewFiles());
                (0, console_1.log)(`[IHMService] ${newFiles.length} files to download: ${newFiles.map(f => f.name).join(', ')}`);
                const results = [];
                for (const f of newFiles) {
                    const local = path_1.default.join(localDir, f.name);
                    (0, console_1.log)(`[IHMService] Downloading ${f.name} to ${local}`);
                    yield client.downloadTo(local, f.name, 0);
                    const stat = fs_1.default.statSync(local);
                    results.push({ name: f.name, localPath: local, size: stat.size });
                    (0, console_1.log)(`[IHMService] Downloaded ${f.name} (${stat.size} bytes)`);
                }
                yield this.salvarCacheNoDB();
                (0, console_1.log)(`[IHMService] Download completed, ${results.length} files processed`);
                return results;
            }
            catch (error) {
                (0, console_1.log)(`[IHMService] Error during FTP operation: ${error}`);
                throw error;
            }
            finally {
                client.close();
            }
        });
    }
    processAndSaveToDB(files) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const file of files) {
                try {
                    console.log(`Processing file: ${file.name}`);
                    const result = yield dbService_1.dbService.insertRelatorioRows([], file.localPath);
                    console.log(`Inserted ${result} rows from ${file.name}`);
                }
                catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                }
            }
        });
    }
}
exports.IHMService = IHMService;
//# sourceMappingURL=IHMService.js.map