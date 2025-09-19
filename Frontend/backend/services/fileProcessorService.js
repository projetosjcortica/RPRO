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
define(["require", "exports", "fs", "path", "../core/baseService", "../core/utils", "./backupService", "./parserService", "./dbService", "./CacheService"], function (require, exports, fs_1, path_1, baseService_1, utils_1, backupService_1, parserService_1, dbService_1, CacheService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fileProcessorService = exports.FileProcessorService = void 0;
    fs_1 = __importDefault(fs_1);
    path_1 = __importDefault(path_1);
    class Subject {
        constructor() {
            this.observers = [];
        }
        attach(o) { if (!this.observers.includes(o))
            this.observers.push(o); }
        detach(o) { this.observers = this.observers.filter((x) => x !== o); }
        notify(payload) {
            return __awaiter(this, void 0, void 0, function* () { for (const o of this.observers)
                yield o.update(payload); });
        }
    }
    class FileProcessorService extends baseService_1.BaseService {
        constructor() {
            super('FileProcessorService');
            this.subject = new Subject();
        }
        addObserver(o) {
            this.subject.attach({ update: (p) => __awaiter(this, void 0, void 0, function* () { yield Promise.resolve(o.update(p)); }) });
        }
        processFile(fullPath) {
            return __awaiter(this, void 0, void 0, function* () {
                const st = fs_1.default.statSync(fullPath);
                const originalName = path_1.default.basename(fullPath);
                const buffer = fs_1.default.readFileSync(fullPath);
                const hash = (0, utils_1.hashBufferHex)(buffer);
                const cacheRec = yield CacheService_1.cacheService.getByName(originalName);
                const lastTs = (cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowTimestamp) || (yield dbService_1.dbService.getLastRelatorioTimestamp(originalName));
                if (cacheRec && cacheRec.lastHash === hash && cacheRec.lastSize === st.size) {
                    return { meta: { originalName, size: st.size, hash }, parsed: { rowsCount: 0, rows: [] } };
                }
                const meta = yield backupService_1.backupSvc.backupFile({ originalname: originalName, path: fullPath, size: st.size });
                const parsed = yield parserService_1.parserService.processFile(fullPath, lastTs ? { sinceTs: lastTs } : undefined);
                const newRows = parsed.rows;
                if (newRows.length > 0) {
                    const fileTag = originalName;
                    const mappedRows = newRows.map((r) => {
                        var _a, _b, _c;
                        return ({
                            Dia: r.datetime.substring(0, 10),
                            Hora: r.datetime.substring(11, 19),
                            Nome: (_a = r.label) !== null && _a !== void 0 ? _a : null,
                            Form1: (_b = r.form1) !== null && _b !== void 0 ? _b : null,
                            Form2: (_c = r.form2) !== null && _c !== void 0 ? _c : null,
                            values: r.values,
                        });
                    });
                    yield dbService_1.dbService.insertRelatorioRows(mappedRows, fileTag);
                    const lastRow = newRows[newRows.length - 1];
                    yield CacheService_1.cacheService.upsert({
                        originalName,
                        lastHash: hash,
                        lastSize: st.size,
                        lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null,
                        lastRowDia: lastRow ? lastRow.datetime.substring(0, 10) : (cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowDia) || null,
                        lastRowHora: lastRow ? lastRow.datetime.substring(11, 19) : (cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowHora) || null,
                        lastRowTimestamp: lastRow ? lastRow.datetime : (cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowTimestamp) || null,
                        lastRowCount: ((cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowCount) || 0) + newRows.length,
                        lastProcessedAt: new Date().toISOString(),
                        ingestedRows: ((cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.ingestedRows) || 0) + newRows.length,
                    });
                }
                else {
                    yield CacheService_1.cacheService.upsert({ originalName, lastHash: hash, lastSize: st.size, lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null, lastProcessedAt: new Date().toISOString() });
                }
                yield this.subject.notify({ filename: originalName, lastProcessedAt: new Date().toISOString(), rowCount: newRows.length });
                return { meta, parsed: { processedPath: parsed.processedPath, rowsCount: newRows.length, rows: newRows } };
            });
        }
    }
    exports.FileProcessorService = FileProcessorService;
    exports.fileProcessorService = new FileProcessorService();
});
