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
exports.fileProcessorService = exports.FileProcessorService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const baseService_1 = require("../core/baseService");
const utils_1 = require("../core/utils");
const backupService_1 = require("./backupService");
const parserService_1 = require("./parserService");
const dbService_1 = require("./dbService");
const cacheService_1 = require("./cacheService");
class Subject {
    constructor() {
        this.observers = [];
    }
    attach(o) {
        if (!this.observers.includes(o))
            this.observers.push(o);
    }
    detach(o) {
        this.observers = this.observers.filter((x) => x !== o);
    }
    notify(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const o of this.observers)
                yield o.update(payload);
        });
    }
}
class FileProcessorService extends baseService_1.BaseService {
    constructor() {
        super("FileProcessorService");
        this.subject = new Subject();
    }
    addObserver(o) {
        this.subject.attach({
            update: (p) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.resolve(o.update(p));
            }),
        });
    }
    processFile(fullPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const st = fs_1.default.statSync(fullPath);
            const originalName = path_1.default.basename(fullPath);
            const buffer = fs_1.default.readFileSync(fullPath);
            const hash = (0, utils_1.hashBufferHex)(buffer);
            const cacheRec = yield cacheService_1.cacheService.getByName(originalName);
            // Determine sinceTs: prefer cache's lastRowTimestamp, otherwise query DB.
            // Normalize to full ISO-like timestamp 'YYYY-MM-DDTHH:MM:SS' so parser can compare properly.
            let lastTs = (cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowTimestamp) || (yield dbService_1.dbService.getLastRelatorioTimestamp(originalName));
            if (lastTs) {
                // Some older code saved as 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DDT HH:MM:SS', normalize to 'YYYY-MM-DDTHH:MM:SS'
                lastTs = String(lastTs).replace(/\s+/, 'T').replace(/T\s+/, 'T');
            }
            if (cacheRec &&
                cacheRec.lastHash === hash &&
                cacheRec.lastSize === st.size) {
                return {
                    meta: { originalName, size: st.size, hash },
                    parsed: { rowsCount: 0, rows: [] },
                };
            }
            const meta = yield backupService_1.backupSvc.backupFile({
                originalname: originalName,
                path: fullPath,
                size: st.size,
            });
            const parsed = yield parserService_1.parserService.processFile(fullPath, lastTs ? { sinceTs: lastTs } : undefined);
            const newRows = parsed.rows;
            if (newRows.length > 0) {
                const fileTag = originalName;
                const mappedRows = newRows.map((r) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19;
                    const sanitizedNome = r.label
                        ? r.label.normalize("NFC").replace(/[\x00-\x1F\x7F-\x9F]/g, "")
                        : "Desconhecido"; // Default to 'Desconhecido' if Nome is null or empty
                    return {
                        Dia: (_a = r.date) !== null && _a !== void 0 ? _a : null, // Use separate date field
                        Hora: (_b = r.time) !== null && _b !== void 0 ? _b : null, // Use separate time field
                        Nome: sanitizedNome, // Use sanitized or default name
                        Form1: (_c = r.form1) !== null && _c !== void 0 ? _c : null,
                        Form2: (_d = r.form2) !== null && _d !== void 0 ? _d : null,
                        Prod_1: (_e = r.values[0]) !== null && _e !== void 0 ? _e : 0,
                        Prod_2: (_f = r.values[1]) !== null && _f !== void 0 ? _f : 0,
                        Prod_3: (_g = r.values[2]) !== null && _g !== void 0 ? _g : 0,
                        Prod_4: (_h = r.values[3]) !== null && _h !== void 0 ? _h : 0,
                        Prod_5: (_j = r.values[4]) !== null && _j !== void 0 ? _j : 0,
                        Prod_6: (_k = r.values[5]) !== null && _k !== void 0 ? _k : 0,
                        Prod_7: (_l = r.values[6]) !== null && _l !== void 0 ? _l : 0,
                        Prod_8: (_m = r.values[7]) !== null && _m !== void 0 ? _m : 0,
                        Prod_9: (_o = r.values[8]) !== null && _o !== void 0 ? _o : 0,
                        Prod_10: (_p = r.values[9]) !== null && _p !== void 0 ? _p : 0,
                        Prod_11: (_q = r.values[10]) !== null && _q !== void 0 ? _q : 0,
                        Prod_12: (_r = r.values[11]) !== null && _r !== void 0 ? _r : 0,
                        Prod_13: (_s = r.values[12]) !== null && _s !== void 0 ? _s : 0,
                        Prod_14: (_t = r.values[13]) !== null && _t !== void 0 ? _t : 0,
                        Prod_15: (_u = r.values[14]) !== null && _u !== void 0 ? _u : 0,
                        Prod_16: (_v = r.values[15]) !== null && _v !== void 0 ? _v : 0,
                        Prod_17: (_w = r.values[16]) !== null && _w !== void 0 ? _w : 0,
                        Prod_18: (_x = r.values[17]) !== null && _x !== void 0 ? _x : 0,
                        Prod_19: (_y = r.values[18]) !== null && _y !== void 0 ? _y : 0,
                        Prod_20: (_z = r.values[19]) !== null && _z !== void 0 ? _z : 0,
                        Prod_21: (_0 = r.values[20]) !== null && _0 !== void 0 ? _0 : 0,
                        Prod_22: (_1 = r.values[21]) !== null && _1 !== void 0 ? _1 : 0,
                        Prod_23: (_2 = r.values[22]) !== null && _2 !== void 0 ? _2 : 0,
                        Prod_24: (_3 = r.values[23]) !== null && _3 !== void 0 ? _3 : 0,
                        Prod_25: (_4 = r.values[24]) !== null && _4 !== void 0 ? _4 : 0,
                        Prod_26: (_5 = r.values[25]) !== null && _5 !== void 0 ? _5 : 0,
                        Prod_27: (_6 = r.values[26]) !== null && _6 !== void 0 ? _6 : 0,
                        Prod_28: (_7 = r.values[27]) !== null && _7 !== void 0 ? _7 : 0,
                        Prod_29: (_8 = r.values[28]) !== null && _8 !== void 0 ? _8 : 0,
                        Prod_30: (_9 = r.values[29]) !== null && _9 !== void 0 ? _9 : 0,
                        Prod_31: (_10 = r.values[30]) !== null && _10 !== void 0 ? _10 : 0,
                        Prod_32: (_11 = r.values[31]) !== null && _11 !== void 0 ? _11 : 0,
                        Prod_33: (_12 = r.values[32]) !== null && _12 !== void 0 ? _12 : 0,
                        Prod_34: (_13 = r.values[33]) !== null && _13 !== void 0 ? _13 : 0,
                        Prod_35: (_14 = r.values[34]) !== null && _14 !== void 0 ? _14 : 0,
                        Prod_36: (_15 = r.values[35]) !== null && _15 !== void 0 ? _15 : 0,
                        Prod_37: (_16 = r.values[36]) !== null && _16 !== void 0 ? _16 : 0,
                        Prod_38: (_17 = r.values[37]) !== null && _17 !== void 0 ? _17 : 0,
                        Prod_39: (_18 = r.values[38]) !== null && _18 !== void 0 ? _18 : 0,
                        Prod_40: (_19 = r.values[39]) !== null && _19 !== void 0 ? _19 : 0,
                        processedFile: fileTag,
                    };
                });
                try {
                    yield dbService_1.dbService.insertRelatorioRows(mappedRows, fileTag);
                }
                catch (err) {
                    console.error('Failed to insert relatorio rows into DB:', err);
                    try {
                        const errDir = path_1.default.join(path_1.default.dirname(fullPath), 'errors');
                        if (!fs_1.default.existsSync(errDir))
                            fs_1.default.mkdirSync(errDir, { recursive: true });
                        const errPath = path_1.default.join(errDir, path_1.default.basename(fullPath) + '.error.json');
                        const dump = {
                            error: String(err),
                            file: originalName,
                            sampleRows: mappedRows.slice(0, 20),
                        };
                        fs_1.default.writeFileSync(errPath, JSON.stringify(dump, null, 2), 'utf8');
                        console.log(`Wrote error dump to: ${errPath}`);
                    }
                    catch (fsErr) {
                        console.error('Failed to write error dump:', fsErr);
                    }
                    // Rethrow so higher-level caller is aware, or optionally continue
                    throw err;
                }
                const lastRow = newRows[newRows.length - 1];
                const lastRowTimestamp = lastRow && lastRow.date && lastRow.time
                    ? `${lastRow.date}T${lastRow.time}`
                    : (cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowTimestamp) || null;
                yield cacheService_1.cacheService.upsert({
                    originalName,
                    lastHash: hash,
                    lastSize: st.size,
                    lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null,
                    lastRowDia: lastRow ? lastRow.date : (cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowDia) || null,
                    lastRowHora: lastRow ? lastRow.time : (cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowHora) || null,
                    lastRowTimestamp: lastRowTimestamp,
                    lastRowCount: ((cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.lastRowCount) || 0) + newRows.length,
                    lastProcessedAt: new Date().toISOString(),
                    ingestedRows: ((cacheRec === null || cacheRec === void 0 ? void 0 : cacheRec.ingestedRows) || 0) + newRows.length,
                });
            }
            else {
                yield cacheService_1.cacheService.upsert({
                    originalName,
                    lastHash: hash,
                    lastSize: st.size,
                    lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null,
                    lastProcessedAt: new Date().toISOString(),
                });
            }
            yield this.subject.notify({
                filename: originalName,
                lastProcessedAt: new Date().toISOString(),
                rowCount: newRows.length,
            });
            return {
                meta,
                parsed: {
                    processedPath: parsed.processedPath,
                    rowsCount: newRows.length,
                    rows: newRows,
                },
            };
        });
    }
}
exports.FileProcessorService = FileProcessorService;
exports.fileProcessorService = new FileProcessorService();
//# sourceMappingURL=fileProcessorService.js.map