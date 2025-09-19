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
define(["require", "exports", "fs", "path", "typeorm", "../core/baseService", "../entities/index", "reflect-metadata"], function (require, exports, fs_1, path_1, typeorm_1, baseService_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppDataSource = exports.dbService = exports.DBService = void 0;
    fs_1 = __importDefault(fs_1);
    path_1 = __importDefault(path_1);
    class DBService extends baseService_1.BaseService {
        constructor(host = process.env.MYSQL_HOST || 'localhost', port = Number(process.env.MYSQL_PORT || 3306), username = process.env.MYSQL_USER || 'root', password = process.env.MYSQL_PASSWORD || 'root', database = process.env.MYSQL_DB || 'cadastro') {
            super('DBService');
            const useMysql = process.env.USE_SQLITE !== 'true';
            if (useMysql) {
                this.ds = new typeorm_1.DataSource({
                    type: 'mysql',
                    host,
                    port,
                    username,
                    password,
                    database,
                    synchronize: true,
                    logging: false,
                    entities: [index_1.Relatorio, index_1.MateriaPrima, index_1.Batch, index_1.Row, index_1.Estoque, index_1.MovimentacaoEstoque]
                });
            }
            else {
                const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
                const absPath = path_1.default.isAbsolute(dbPath) ? dbPath : path_1.default.resolve(process.cwd(), dbPath);
                const shouldSync = !fs_1.default.existsSync(absPath) || process.env.FORCE_SQLITE_SYNC === 'true';
                this.ds = new typeorm_1.DataSource({
                    type: 'sqlite',
                    database: absPath,
                    synchronize: shouldSync,
                    logging: false,
                    entities: [index_1.Relatorio, index_1.MateriaPrima, index_1.Batch, index_1.Row, index_1.Estoque, index_1.MovimentacaoEstoque]
                });
            }
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () { if (!this.ds.isInitialized)
                yield this.ds.initialize(); });
        }
        insertRelatorioRows(rows, processedFile) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.init();
                const repo = this.ds.getRepository(index_1.Relatorio);
                const mapped = rows.map((r) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103;
                    return ({
                        Dia: (_a = r.Dia) !== null && _a !== void 0 ? _a : null,
                        Hora: (_b = r.Hora) !== null && _b !== void 0 ? _b : null,
                        Nome: (_d = (_c = r.Nome) !== null && _c !== void 0 ? _c : r.label) !== null && _d !== void 0 ? _d : null,
                        Form1: (_f = (_e = r.Form1) !== null && _e !== void 0 ? _e : r.form1) !== null && _f !== void 0 ? _f : null,
                        Form2: (_h = (_g = r.Form2) !== null && _g !== void 0 ? _g : r.form2) !== null && _h !== void 0 ? _h : null,
                        processedFile,
                        Prod_1: (_l = (_j = r.Prod_1) !== null && _j !== void 0 ? _j : (_k = r.values) === null || _k === void 0 ? void 0 : _k[0]) !== null && _l !== void 0 ? _l : null,
                        Prod_2: (_p = (_m = r.Prod_2) !== null && _m !== void 0 ? _m : (_o = r.values) === null || _o === void 0 ? void 0 : _o[1]) !== null && _p !== void 0 ? _p : null,
                        Prod_3: (_s = (_q = r.Prod_3) !== null && _q !== void 0 ? _q : (_r = r.values) === null || _r === void 0 ? void 0 : _r[2]) !== null && _s !== void 0 ? _s : null,
                        Prod_4: (_v = (_t = r.Prod_4) !== null && _t !== void 0 ? _t : (_u = r.values) === null || _u === void 0 ? void 0 : _u[3]) !== null && _v !== void 0 ? _v : null,
                        Prod_5: (_y = (_w = r.Prod_5) !== null && _w !== void 0 ? _w : (_x = r.values) === null || _x === void 0 ? void 0 : _x[4]) !== null && _y !== void 0 ? _y : null,
                        Prod_6: (_1 = (_z = r.Prod_6) !== null && _z !== void 0 ? _z : (_0 = r.values) === null || _0 === void 0 ? void 0 : _0[5]) !== null && _1 !== void 0 ? _1 : null,
                        Prod_7: (_4 = (_2 = r.Prod_7) !== null && _2 !== void 0 ? _2 : (_3 = r.values) === null || _3 === void 0 ? void 0 : _3[6]) !== null && _4 !== void 0 ? _4 : null,
                        Prod_8: (_7 = (_5 = r.Prod_8) !== null && _5 !== void 0 ? _5 : (_6 = r.values) === null || _6 === void 0 ? void 0 : _6[7]) !== null && _7 !== void 0 ? _7 : null,
                        Prod_9: (_10 = (_8 = r.Prod_9) !== null && _8 !== void 0 ? _8 : (_9 = r.values) === null || _9 === void 0 ? void 0 : _9[8]) !== null && _10 !== void 0 ? _10 : null,
                        Prod_10: (_13 = (_11 = r.Prod_10) !== null && _11 !== void 0 ? _11 : (_12 = r.values) === null || _12 === void 0 ? void 0 : _12[9]) !== null && _13 !== void 0 ? _13 : null,
                        Prod_11: (_16 = (_14 = r.Prod_11) !== null && _14 !== void 0 ? _14 : (_15 = r.values) === null || _15 === void 0 ? void 0 : _15[10]) !== null && _16 !== void 0 ? _16 : null,
                        Prod_12: (_19 = (_17 = r.Prod_12) !== null && _17 !== void 0 ? _17 : (_18 = r.values) === null || _18 === void 0 ? void 0 : _18[11]) !== null && _19 !== void 0 ? _19 : null,
                        Prod_13: (_22 = (_20 = r.Prod_13) !== null && _20 !== void 0 ? _20 : (_21 = r.values) === null || _21 === void 0 ? void 0 : _21[12]) !== null && _22 !== void 0 ? _22 : null,
                        Prod_14: (_25 = (_23 = r.Prod_14) !== null && _23 !== void 0 ? _23 : (_24 = r.values) === null || _24 === void 0 ? void 0 : _24[13]) !== null && _25 !== void 0 ? _25 : null,
                        Prod_15: (_28 = (_26 = r.Prod_15) !== null && _26 !== void 0 ? _26 : (_27 = r.values) === null || _27 === void 0 ? void 0 : _27[14]) !== null && _28 !== void 0 ? _28 : null,
                        Prod_16: (_31 = (_29 = r.Prod_16) !== null && _29 !== void 0 ? _29 : (_30 = r.values) === null || _30 === void 0 ? void 0 : _30[15]) !== null && _31 !== void 0 ? _31 : null,
                        Prod_17: (_34 = (_32 = r.Prod_17) !== null && _32 !== void 0 ? _32 : (_33 = r.values) === null || _33 === void 0 ? void 0 : _33[16]) !== null && _34 !== void 0 ? _34 : null,
                        Prod_18: (_37 = (_35 = r.Prod_18) !== null && _35 !== void 0 ? _35 : (_36 = r.values) === null || _36 === void 0 ? void 0 : _36[17]) !== null && _37 !== void 0 ? _37 : null,
                        Prod_19: (_40 = (_38 = r.Prod_19) !== null && _38 !== void 0 ? _38 : (_39 = r.values) === null || _39 === void 0 ? void 0 : _39[18]) !== null && _40 !== void 0 ? _40 : null,
                        Prod_20: (_43 = (_41 = r.Prod_20) !== null && _41 !== void 0 ? _41 : (_42 = r.values) === null || _42 === void 0 ? void 0 : _42[19]) !== null && _43 !== void 0 ? _43 : null,
                        Prod_21: (_46 = (_44 = r.Prod_21) !== null && _44 !== void 0 ? _44 : (_45 = r.values) === null || _45 === void 0 ? void 0 : _45[20]) !== null && _46 !== void 0 ? _46 : null,
                        Prod_22: (_49 = (_47 = r.Prod_22) !== null && _47 !== void 0 ? _47 : (_48 = r.values) === null || _48 === void 0 ? void 0 : _48[21]) !== null && _49 !== void 0 ? _49 : null,
                        Prod_23: (_52 = (_50 = r.Prod_23) !== null && _50 !== void 0 ? _50 : (_51 = r.values) === null || _51 === void 0 ? void 0 : _51[22]) !== null && _52 !== void 0 ? _52 : null,
                        Prod_24: (_55 = (_53 = r.Prod_24) !== null && _53 !== void 0 ? _53 : (_54 = r.values) === null || _54 === void 0 ? void 0 : _54[23]) !== null && _55 !== void 0 ? _55 : null,
                        Prod_25: (_58 = (_56 = r.Prod_25) !== null && _56 !== void 0 ? _56 : (_57 = r.values) === null || _57 === void 0 ? void 0 : _57[24]) !== null && _58 !== void 0 ? _58 : null,
                        Prod_26: (_61 = (_59 = r.Prod_26) !== null && _59 !== void 0 ? _59 : (_60 = r.values) === null || _60 === void 0 ? void 0 : _60[25]) !== null && _61 !== void 0 ? _61 : null,
                        Prod_27: (_64 = (_62 = r.Prod_27) !== null && _62 !== void 0 ? _62 : (_63 = r.values) === null || _63 === void 0 ? void 0 : _63[26]) !== null && _64 !== void 0 ? _64 : null,
                        Prod_28: (_67 = (_65 = r.Prod_28) !== null && _65 !== void 0 ? _65 : (_66 = r.values) === null || _66 === void 0 ? void 0 : _66[27]) !== null && _67 !== void 0 ? _67 : null,
                        Prod_29: (_70 = (_68 = r.Prod_29) !== null && _68 !== void 0 ? _68 : (_69 = r.values) === null || _69 === void 0 ? void 0 : _69[28]) !== null && _70 !== void 0 ? _70 : null,
                        Prod_30: (_73 = (_71 = r.Prod_30) !== null && _71 !== void 0 ? _71 : (_72 = r.values) === null || _72 === void 0 ? void 0 : _72[29]) !== null && _73 !== void 0 ? _73 : null,
                        Prod_31: (_76 = (_74 = r.Prod_31) !== null && _74 !== void 0 ? _74 : (_75 = r.values) === null || _75 === void 0 ? void 0 : _75[30]) !== null && _76 !== void 0 ? _76 : null,
                        Prod_32: (_79 = (_77 = r.Prod_32) !== null && _77 !== void 0 ? _77 : (_78 = r.values) === null || _78 === void 0 ? void 0 : _78[31]) !== null && _79 !== void 0 ? _79 : null,
                        Prod_33: (_82 = (_80 = r.Prod_33) !== null && _80 !== void 0 ? _80 : (_81 = r.values) === null || _81 === void 0 ? void 0 : _81[32]) !== null && _82 !== void 0 ? _82 : null,
                        Prod_34: (_85 = (_83 = r.Prod_34) !== null && _83 !== void 0 ? _83 : (_84 = r.values) === null || _84 === void 0 ? void 0 : _84[33]) !== null && _85 !== void 0 ? _85 : null,
                        Prod_35: (_88 = (_86 = r.Prod_35) !== null && _86 !== void 0 ? _86 : (_87 = r.values) === null || _87 === void 0 ? void 0 : _87[34]) !== null && _88 !== void 0 ? _88 : null,
                        Prod_36: (_91 = (_89 = r.Prod_36) !== null && _89 !== void 0 ? _89 : (_90 = r.values) === null || _90 === void 0 ? void 0 : _90[35]) !== null && _91 !== void 0 ? _91 : null,
                        Prod_37: (_94 = (_92 = r.Prod_37) !== null && _92 !== void 0 ? _92 : (_93 = r.values) === null || _93 === void 0 ? void 0 : _93[36]) !== null && _94 !== void 0 ? _94 : null,
                        Prod_38: (_97 = (_95 = r.Prod_38) !== null && _95 !== void 0 ? _95 : (_96 = r.values) === null || _96 === void 0 ? void 0 : _96[37]) !== null && _97 !== void 0 ? _97 : null,
                        Prod_39: (_100 = (_98 = r.Prod_39) !== null && _98 !== void 0 ? _98 : (_99 = r.values) === null || _99 === void 0 ? void 0 : _99[38]) !== null && _100 !== void 0 ? _100 : null,
                        Prod_40: (_103 = (_101 = r.Prod_40) !== null && _101 !== void 0 ? _101 : (_102 = r.values) === null || _102 === void 0 ? void 0 : _102[39]) !== null && _103 !== void 0 ? _103 : null,
                    });
                });
                return repo.save(mapped);
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
    exports.AppDataSource = exports.dbService.ds;
});
