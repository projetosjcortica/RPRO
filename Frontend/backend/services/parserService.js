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
define(["require", "exports", "fs", "path", "../core/baseService", "../core/utils"], function (require, exports, fs_1, path_1, baseService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parserService = exports.ParserService = void 0;
    fs_1 = __importDefault(fs_1);
    path_1 = __importDefault(path_1);
    class ParserService extends baseService_1.BaseService {
        constructor() {
            super('ParserService');
            this.tmpDir = path_1.default.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
            this.processedDir = path_1.default.join(this.tmpDir, 'processed');
            if (!fs_1.default.existsSync(this.tmpDir))
                fs_1.default.mkdirSync(this.tmpDir, { recursive: true });
            if (!fs_1.default.existsSync(this.processedDir))
                fs_1.default.mkdirSync(this.processedDir, { recursive: true });
        }
        detectDelimiter(sample) {
            const candidates = [',', ';', '\t'];
            let best = ',', bestScore = -1;
            for (const c of candidates) {
                const counts = sample.split('\n').slice(0, 5).map((l) => (l.match(new RegExp(`\\${c}`, 'g')) || []).length);
                const score = counts.reduce((a, b) => a + b, 0);
                if (score > bestScore) {
                    bestScore = score;
                    best = c;
                }
            }
            return best;
        }
        processFile(filePath, opts) {
            return __awaiter(this, void 0, void 0, function* () {
                const raw = fs_1.default.readFileSync(filePath, 'utf8');
                const delim = this.detectDelimiter(raw);
                const lines = raw.split(/\r?\n/).filter(Boolean);
                let start = 0;
                let headers = null;
                if (lines.length > 0 && /[A-Za-z]/.test(lines[0])) {
                    headers = lines[0].split(delim).map((s) => s.trim());
                    start = 1;
                }
                const rows = [];
                const sinceTs = (opts === null || opts === void 0 ? void 0 : opts.sinceTs) ? new Date(opts.sinceTs).getTime() : null;
                const iterate = (i) => {
                    const parts = lines[i].split(delim).map((s) => s.trim());
                    let datetime = null;
                    let label = null;
                    let form1 = null;
                    let form2 = null;
                    const values = [];
                    if (headers) {
                        const hmap = new Map(headers.map((h, idx) => { var _a; return [h, (_a = parts[idx]) !== null && _a !== void 0 ? _a : '']; }));
                        const dia = (hmap.get('Dia') || hmap.get('date') || '');
                        const hora = (hmap.get('Hora') || hmap.get('time') || '');
                        const dt = (0, utils_1.parseRowDateTime)({ Dia: dia, Hora: hora });
                        datetime = dt ? dt.toISOString() : new Date().toISOString();
                        label = (hmap.get('Nome') || hmap.get('label') || '');
                        form1 = hmap.get('Form1') ? Number(hmap.get('Form1')) : null;
                        form2 = hmap.get('Form2') ? Number(hmap.get('Form2')) : null;
                        for (let p = 1; p <= 40; p++) {
                            const v = hmap.get(`Prod_${p}`);
                            values.push(v != null && v !== '' ? Number(v) : null);
                        }
                    }
                    else {
                        const dia = parts[0] || '';
                        const hora = parts[1] || '';
                        const dt = (0, utils_1.parseRowDateTime)({ Dia: dia, Hora: hora });
                        datetime = dt ? dt.toISOString() : new Date().toISOString();
                        label = parts[2] || null;
                        form1 = parts[3] ? Number(parts[3]) : null;
                        form2 = parts[4] ? Number(parts[4]) : null;
                        for (let p = 5; p < parts.length; p++)
                            values.push(parts[p] ? Number(parts[p]) : null);
                    }
                    return { datetime: datetime, label, form1, form2, values };
                };
                if (sinceTs != null) {
                    const acc = [];
                    for (let i = lines.length - 1; i >= start; i--) {
                        const r = iterate(i);
                        const ts = new Date(r.datetime).getTime();
                        if (ts > sinceTs)
                            acc.push(r);
                        else
                            break;
                    }
                    rows.push(...acc.reverse());
                }
                else {
                    for (let i = start; i < lines.length; i++)
                        rows.push(iterate(i));
                }
                const processedPath = path_1.default.join(this.processedDir, path_1.default.basename(filePath) + '.json');
                fs_1.default.writeFileSync(processedPath, JSON.stringify({ rows }, null, 2));
                return { processedPath, rowsCount: rows.length, rows };
            });
        }
    }
    exports.ParserService = ParserService;
    exports.parserService = new ParserService();
});
