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
exports.AppDataSource = exports.dbService = exports.DBService = void 0;
require("reflect-metadata");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
const baseService_1 = require("../core/baseService");
const index_1 = require("../entities/index");
const runtimeConfig_1 = require("../core/runtimeConfig");
class DBService extends baseService_1.BaseService {
    constructor() {
        super('DBService');
        // Do not create DataSource here. We'll initialize it lazily inside init()
        // so runtime-provided 'db-config' values (loaded at server startup) are used.
        // Initialize ds with a placeholder; real DataSource will be created in init().
        // @ts-ignore - assign later in init
        this.ds = {};
        this.useMysql = process.env.USE_SQLITE !== 'true';
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            // If ds already initialized, skip
            // @ts-ignore
            if ((this.ds && this.ds.isInitialized))
                return;
            // Read runtime DB config (frontend may have saved 'db-config')
            const runtimeDb = (0, runtimeConfig_1.getRuntimeConfig)('db-config') || {};
            const finalHost = (_b = (_a = runtimeDb.serverDB) !== null && _a !== void 0 ? _a : process.env.MYSQL_HOST) !== null && _b !== void 0 ? _b : 'localhost';
            const finalPort = Number((_d = (_c = runtimeDb.port) !== null && _c !== void 0 ? _c : process.env.MYSQL_PORT) !== null && _d !== void 0 ? _d : 3306);
            const finalUser = (_f = (_e = runtimeDb.userDB) !== null && _e !== void 0 ? _e : process.env.MYSQL_USER) !== null && _f !== void 0 ? _f : 'root';
            const finalPass = (_h = (_g = runtimeDb.passwordDB) !== null && _g !== void 0 ? _g : process.env.MYSQL_PASSWORD) !== null && _h !== void 0 ? _h : 'root';
            const finalDb = (_k = (_j = runtimeDb.database) !== null && _j !== void 0 ? _j : process.env.MYSQL_DB) !== null && _k !== void 0 ? _k : 'cadastro';
            try {
                if (this.useMysql) {
                    this.ds = new typeorm_1.DataSource({
                        type: 'mysql',
                        host: finalHost,
                        port: finalPort,
                        username: finalUser,
                        password: finalPass,
                        database: finalDb,
                        synchronize: true,
                        logging: false,
                        entities: [index_1.Relatorio, index_1.MateriaPrima, index_1.Batch, index_1.Row, index_1.Estoque, index_1.MovimentacaoEstoque, index_1.CacheFile, index_1.Setting, index_1.User],
                    });
                }
                else {
                    const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
                    const absPath = path_1.default.isAbsolute(dbPath) ? dbPath : path_1.default.resolve(process.cwd(), dbPath);
                    this.sqlitePath = absPath;
                    const shouldSync = !fs_1.default.existsSync(absPath) || process.env.FORCE_SQLITE_SYNC === 'true';
                    this.ds = new typeorm_1.DataSource({
                        type: 'sqlite',
                        database: absPath,
                        synchronize: shouldSync,
                        logging: false,
                        entities: [index_1.Relatorio, index_1.MateriaPrima, index_1.Batch, index_1.Row, index_1.Estoque, index_1.MovimentacaoEstoque, index_1.CacheFile, index_1.Setting, index_1.User],
                    });
                }
                yield this.ds.initialize();
                return;
            }
            catch (err) {
                console.warn('[DBService] DataSource initialization failed:', String(err));
                if (this.useMysql) {
                    try {
                        const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
                        const absPath = path_1.default.isAbsolute(dbPath) ? dbPath : path_1.default.resolve(process.cwd(), dbPath);
                        this.sqlitePath = absPath;
                        const shouldSync = !fs_1.default.existsSync(absPath) || process.env.FORCE_SQLITE_SYNC === 'true';
                        this.ds = new typeorm_1.DataSource({
                            type: 'sqlite',
                            database: absPath,
                            synchronize: true,
                            logging: false,
                            entities: [index_1.Relatorio, index_1.MateriaPrima, index_1.Batch, index_1.Row, index_1.Estoque, index_1.MovimentacaoEstoque, index_1.CacheFile, index_1.Setting, index_1.User],
                        });
                        yield this.ds.initialize();
                        this.useMysql = false;
                        console.info('[DBService] Fell back to SQLite at', absPath);
                        return;
                    }
                    catch (err2) {
                        console.error('[DBService] SQLite fallback initialization failed:', err2);
                        throw err2;
                    }
                }
                throw err;
            }
        });
    }
    insertRelatorioRows(rows, processedFile) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const repo = this.ds.getRepository(index_1.Relatorio);
            // Helper to normalize a variety of incoming date string formats to YYYY-MM-DD
            const normalizeDateString = (s) => {
                if (s === undefined || s === null)
                    return null;
                const str = String(s).trim();
                if (!str)
                    return null;
                // Already ISO
                if (/^\d{4}-\d{2}-\d{2}$/.test(str))
                    return str;
                // DD-MM-YYYY or DD/MM/YYYY
                const m1 = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
                if (m1) {
                    let [_, dd, mm, yy] = m1;
                    dd = dd.padStart(2, '0');
                    mm = mm.padStart(2, '0');
                    if (yy.length === 2)
                        yy = '20' + yy;
                    return `${yy}-${mm}-${dd}`;
                }
                // Fallback to Date parse
                const dt = new Date(str);
                if (!isNaN(dt.getTime())) {
                    const yy = dt.getFullYear();
                    const mm = String(dt.getMonth() + 1).padStart(2, '0');
                    const dd = String(dt.getDate()).padStart(2, '0');
                    return `${yy}-${mm}-${dd}`;
                }
                return null;
            };
            const mapped = rows.map((r) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103, _104;
                return ({
                    Dia: (_b = (_a = normalizeDateString(r.Dia)) !== null && _a !== void 0 ? _a : r.Dia) !== null && _b !== void 0 ? _b : null,
                    Hora: (_c = r.Hora) !== null && _c !== void 0 ? _c : null,
                    Nome: (_e = (_d = r.Nome) !== null && _d !== void 0 ? _d : r.label) !== null && _e !== void 0 ? _e : null,
                    Form1: (_g = (_f = r.Form1) !== null && _f !== void 0 ? _f : r.form1) !== null && _g !== void 0 ? _g : null,
                    Form2: (_j = (_h = r.Form2) !== null && _h !== void 0 ? _h : r.form2) !== null && _j !== void 0 ? _j : null,
                    processedFile,
                    Prod_1: (_m = (_k = r.Prod_1) !== null && _k !== void 0 ? _k : (_l = r.values) === null || _l === void 0 ? void 0 : _l[0]) !== null && _m !== void 0 ? _m : null,
                    Prod_2: (_q = (_o = r.Prod_2) !== null && _o !== void 0 ? _o : (_p = r.values) === null || _p === void 0 ? void 0 : _p[1]) !== null && _q !== void 0 ? _q : null,
                    Prod_3: (_t = (_r = r.Prod_3) !== null && _r !== void 0 ? _r : (_s = r.values) === null || _s === void 0 ? void 0 : _s[2]) !== null && _t !== void 0 ? _t : null,
                    Prod_4: (_w = (_u = r.Prod_4) !== null && _u !== void 0 ? _u : (_v = r.values) === null || _v === void 0 ? void 0 : _v[3]) !== null && _w !== void 0 ? _w : null,
                    Prod_5: (_z = (_x = r.Prod_5) !== null && _x !== void 0 ? _x : (_y = r.values) === null || _y === void 0 ? void 0 : _y[4]) !== null && _z !== void 0 ? _z : null,
                    Prod_6: (_2 = (_0 = r.Prod_6) !== null && _0 !== void 0 ? _0 : (_1 = r.values) === null || _1 === void 0 ? void 0 : _1[5]) !== null && _2 !== void 0 ? _2 : null,
                    Prod_7: (_5 = (_3 = r.Prod_7) !== null && _3 !== void 0 ? _3 : (_4 = r.values) === null || _4 === void 0 ? void 0 : _4[6]) !== null && _5 !== void 0 ? _5 : null,
                    Prod_8: (_8 = (_6 = r.Prod_8) !== null && _6 !== void 0 ? _6 : (_7 = r.values) === null || _7 === void 0 ? void 0 : _7[7]) !== null && _8 !== void 0 ? _8 : null,
                    Prod_9: (_11 = (_9 = r.Prod_9) !== null && _9 !== void 0 ? _9 : (_10 = r.values) === null || _10 === void 0 ? void 0 : _10[8]) !== null && _11 !== void 0 ? _11 : null,
                    Prod_10: (_14 = (_12 = r.Prod_10) !== null && _12 !== void 0 ? _12 : (_13 = r.values) === null || _13 === void 0 ? void 0 : _13[9]) !== null && _14 !== void 0 ? _14 : null,
                    Prod_11: (_17 = (_15 = r.Prod_11) !== null && _15 !== void 0 ? _15 : (_16 = r.values) === null || _16 === void 0 ? void 0 : _16[10]) !== null && _17 !== void 0 ? _17 : null,
                    Prod_12: (_20 = (_18 = r.Prod_12) !== null && _18 !== void 0 ? _18 : (_19 = r.values) === null || _19 === void 0 ? void 0 : _19[11]) !== null && _20 !== void 0 ? _20 : null,
                    Prod_13: (_23 = (_21 = r.Prod_13) !== null && _21 !== void 0 ? _21 : (_22 = r.values) === null || _22 === void 0 ? void 0 : _22[12]) !== null && _23 !== void 0 ? _23 : null,
                    Prod_14: (_26 = (_24 = r.Prod_14) !== null && _24 !== void 0 ? _24 : (_25 = r.values) === null || _25 === void 0 ? void 0 : _25[13]) !== null && _26 !== void 0 ? _26 : null,
                    Prod_15: (_29 = (_27 = r.Prod_15) !== null && _27 !== void 0 ? _27 : (_28 = r.values) === null || _28 === void 0 ? void 0 : _28[14]) !== null && _29 !== void 0 ? _29 : null,
                    Prod_16: (_32 = (_30 = r.Prod_16) !== null && _30 !== void 0 ? _30 : (_31 = r.values) === null || _31 === void 0 ? void 0 : _31[15]) !== null && _32 !== void 0 ? _32 : null,
                    Prod_17: (_35 = (_33 = r.Prod_17) !== null && _33 !== void 0 ? _33 : (_34 = r.values) === null || _34 === void 0 ? void 0 : _34[16]) !== null && _35 !== void 0 ? _35 : null,
                    Prod_18: (_38 = (_36 = r.Prod_18) !== null && _36 !== void 0 ? _36 : (_37 = r.values) === null || _37 === void 0 ? void 0 : _37[17]) !== null && _38 !== void 0 ? _38 : null,
                    Prod_19: (_41 = (_39 = r.Prod_19) !== null && _39 !== void 0 ? _39 : (_40 = r.values) === null || _40 === void 0 ? void 0 : _40[18]) !== null && _41 !== void 0 ? _41 : null,
                    Prod_20: (_44 = (_42 = r.Prod_20) !== null && _42 !== void 0 ? _42 : (_43 = r.values) === null || _43 === void 0 ? void 0 : _43[19]) !== null && _44 !== void 0 ? _44 : null,
                    Prod_21: (_47 = (_45 = r.Prod_21) !== null && _45 !== void 0 ? _45 : (_46 = r.values) === null || _46 === void 0 ? void 0 : _46[20]) !== null && _47 !== void 0 ? _47 : null,
                    Prod_22: (_50 = (_48 = r.Prod_22) !== null && _48 !== void 0 ? _48 : (_49 = r.values) === null || _49 === void 0 ? void 0 : _49[21]) !== null && _50 !== void 0 ? _50 : null,
                    Prod_23: (_53 = (_51 = r.Prod_23) !== null && _51 !== void 0 ? _51 : (_52 = r.values) === null || _52 === void 0 ? void 0 : _52[22]) !== null && _53 !== void 0 ? _53 : null,
                    Prod_24: (_56 = (_54 = r.Prod_24) !== null && _54 !== void 0 ? _54 : (_55 = r.values) === null || _55 === void 0 ? void 0 : _55[23]) !== null && _56 !== void 0 ? _56 : null,
                    Prod_25: (_59 = (_57 = r.Prod_25) !== null && _57 !== void 0 ? _57 : (_58 = r.values) === null || _58 === void 0 ? void 0 : _58[24]) !== null && _59 !== void 0 ? _59 : null,
                    Prod_26: (_62 = (_60 = r.Prod_26) !== null && _60 !== void 0 ? _60 : (_61 = r.values) === null || _61 === void 0 ? void 0 : _61[25]) !== null && _62 !== void 0 ? _62 : null,
                    Prod_27: (_65 = (_63 = r.Prod_27) !== null && _63 !== void 0 ? _63 : (_64 = r.values) === null || _64 === void 0 ? void 0 : _64[26]) !== null && _65 !== void 0 ? _65 : null,
                    Prod_28: (_68 = (_66 = r.Prod_28) !== null && _66 !== void 0 ? _66 : (_67 = r.values) === null || _67 === void 0 ? void 0 : _67[27]) !== null && _68 !== void 0 ? _68 : null,
                    Prod_29: (_71 = (_69 = r.Prod_29) !== null && _69 !== void 0 ? _69 : (_70 = r.values) === null || _70 === void 0 ? void 0 : _70[28]) !== null && _71 !== void 0 ? _71 : null,
                    Prod_30: (_74 = (_72 = r.Prod_30) !== null && _72 !== void 0 ? _72 : (_73 = r.values) === null || _73 === void 0 ? void 0 : _73[29]) !== null && _74 !== void 0 ? _74 : null,
                    Prod_31: (_77 = (_75 = r.Prod_31) !== null && _75 !== void 0 ? _75 : (_76 = r.values) === null || _76 === void 0 ? void 0 : _76[30]) !== null && _77 !== void 0 ? _77 : null,
                    Prod_32: (_80 = (_78 = r.Prod_32) !== null && _78 !== void 0 ? _78 : (_79 = r.values) === null || _79 === void 0 ? void 0 : _79[31]) !== null && _80 !== void 0 ? _80 : null,
                    Prod_33: (_83 = (_81 = r.Prod_33) !== null && _81 !== void 0 ? _81 : (_82 = r.values) === null || _82 === void 0 ? void 0 : _82[32]) !== null && _83 !== void 0 ? _83 : null,
                    Prod_34: (_86 = (_84 = r.Prod_34) !== null && _84 !== void 0 ? _84 : (_85 = r.values) === null || _85 === void 0 ? void 0 : _85[33]) !== null && _86 !== void 0 ? _86 : null,
                    Prod_35: (_89 = (_87 = r.Prod_35) !== null && _87 !== void 0 ? _87 : (_88 = r.values) === null || _88 === void 0 ? void 0 : _88[34]) !== null && _89 !== void 0 ? _89 : null,
                    Prod_36: (_92 = (_90 = r.Prod_36) !== null && _90 !== void 0 ? _90 : (_91 = r.values) === null || _91 === void 0 ? void 0 : _91[35]) !== null && _92 !== void 0 ? _92 : null,
                    Prod_37: (_95 = (_93 = r.Prod_37) !== null && _93 !== void 0 ? _93 : (_94 = r.values) === null || _94 === void 0 ? void 0 : _94[36]) !== null && _95 !== void 0 ? _95 : null,
                    Prod_38: (_98 = (_96 = r.Prod_38) !== null && _96 !== void 0 ? _96 : (_97 = r.values) === null || _97 === void 0 ? void 0 : _97[37]) !== null && _98 !== void 0 ? _98 : null,
                    Prod_39: (_101 = (_99 = r.Prod_39) !== null && _99 !== void 0 ? _99 : (_100 = r.values) === null || _100 === void 0 ? void 0 : _100[38]) !== null && _101 !== void 0 ? _101 : null,
                    Prod_40: (_104 = (_102 = r.Prod_40) !== null && _102 !== void 0 ? _102 : (_103 = r.values) === null || _103 === void 0 ? void 0 : _103[39]) !== null && _104 !== void 0 ? _104 : null,
                });
            });
            // Perform upsert-like behavior: for each mapped row, try to find an existing
            // row by (Dia, Hora, Nome, processedFile). If found, replace/update it;
            // otherwise insert a new record. Return the number of inserted rows.
            let inserted = 0;
            for (const row of mapped) {
                try {
                    const existing = yield repo.findOne({ where: { Dia: row.Dia, Hora: row.Hora, Nome: row.Nome, processedFile: row.processedFile } });
                    if (existing) {
                        // Update existing record with new values
                        Object.assign(existing, row);
                        yield repo.save(existing);
                    }
                    else {
                        try {
                            yield repo.save(repo.create(row));
                            inserted++;
                        }
                        catch (errInsert) {
                            // If insert failed due to race condition / unique constraint, attempt to fetch and update
                            console.warn('[DBService] Insert failed, attempting fetch+update (possible race):', String(errInsert));
                            const maybeExisting = yield repo.findOne({ where: { Dia: row.Dia, Hora: row.Hora, Nome: row.Nome, processedFile: row.processedFile } });
                            if (maybeExisting) {
                                Object.assign(maybeExisting, row);
                                yield repo.save(maybeExisting);
                            }
                            else {
                                // Re-throw if we couldn't resolve
                                throw errInsert;
                            }
                        }
                    }
                }
                catch (err) {
                    // Log and continue processing other rows
                    console.error('[DBService] Failed to upsert relatorio row:', err, row);
                }
            }
            return inserted;
        });
    }
    getLastRelatorioTimestamp(processedFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield this.init();
            const qb = this.ds.getRepository(index_1.Relatorio).createQueryBuilder('r');
            if (processedFile)
                qb.where('r.processedFile = :pf', { pf: processedFile });
            qb.orderBy('r.Dia', 'DESC').addOrderBy('r.Hora', 'DESC').limit(1);
            const last = yield qb.getOne();
            return last ? `${(_a = last.Dia) !== null && _a !== void 0 ? _a : ''}T${(_b = last.Hora) !== null && _b !== void 0 ? _b : ''}` : null;
        });
    }
}
exports.DBService = DBService;
exports.dbService = new DBService();
// Export a runtime proxy that forwards to the current dbService.ds instance.
// This keeps existing imports like `AppDataSource.getRepository(...)` working
// even if we swap datasources at runtime (MySQL -> SQLite fallback).
exports.AppDataSource = new Proxy({}, {
    get(_target, prop) {
        const ds = exports.dbService.ds;
        if (!ds)
            throw new Error('DataSource not available yet');
        // @ts-ignore
        const val = ds[prop];
        if (typeof val === 'function')
            return val.bind(ds);
        return val;
    },
    set(_target, prop, value) {
        const ds = exports.dbService.ds;
        if (!ds)
            throw new Error('DataSource not available yet');
        // @ts-ignore
        ds[prop] = value;
        return true;
    }
});
//# sourceMappingURL=dbService.js.map