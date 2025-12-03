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
exports.parserService = exports.ParserService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const baseService_1 = require("../core/baseService");
const utils_1 = require("../core/utils");
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
            console.log(`Processing file: ${filePath}`);
            const buffer = fs_1.default.readFileSync(filePath);
            // Try UTF-8 first. If the decoded text contains replacement chars, fall back to latin1.
            let raw = buffer.toString('utf8');
            if (raw.includes('\uFFFD')) {
                console.warn('UTF-8 decoding produced replacement characters, falling back to latin1');
                raw = buffer.toString('latin1');
            }
            // Strip common BOMs and normalize
            if (raw.charCodeAt(0) === 0xfeff)
                raw = raw.slice(1);
            try {
                raw = raw.normalize('NFC');
            }
            catch (e) { /* ignore if not supported */ }
            // Remove control characters except common whitespace (tab, LF, CR)
            raw = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
            console.log('Raw file content (first 500 chars):', raw.slice(0, 500));
            const delim = this.detectDelimiter(raw);
            console.log('Detected delimiter:', delim);
            const lines = raw.split(/\r?\n/).filter(Boolean);
            console.log('Total lines in file:', lines.length);
            const rows = [];
            // The system does not use headers — accept the first line as data.
            for (let i = 0; i < lines.length; i++) {
                const parts = lines[i].split(delim).map((s) => s.trim());
                const row = this.parseRow(parts);
                if (row) {
                    rows.push(row);
                }
                else {
                    console.warn(`Skipped invalid row at line ${i + 1}`);
                }
            }
            // If caller provided a sinceTs, filter out rows older or equal to that timestamp
            const since = (opts === null || opts === void 0 ? void 0 : opts.sinceTs) ? new Date(String(opts.sinceTs)) : null;
            let rowsToReturn = rows;
            if (since && !isNaN(since.getTime())) {
                const beforeCount = rows.length;
                rowsToReturn = rows.filter((r) => {
                    const dt = (0, utils_1.parseRowDateTime)({ date: r.date, time: r.time });
                    if (!dt)
                        return false;
                    return dt.getTime() > since.getTime();
                });
                console.log(`Parsed ${rows.length} rows, ${rowsToReturn.length} after sinceTs filter (removed ${beforeCount - rowsToReturn.length})`);
            }
            const processedPath = path_1.default.join(this.processedDir, path_1.default.basename(filePath) + '.json');
            fs_1.default.writeFileSync(processedPath, JSON.stringify({ rows: rowsToReturn }, null, 2));
            console.log(`Processed file saved to: ${processedPath}`);
            console.log(`Parsed ${rows.length} rows, returning ${rowsToReturn.length} rows after filtering.`);
            return { processedPath, rowsCount: rowsToReturn.length, rows: rowsToReturn };
        });
    }
    parseRow(parts) {
        try {
            const sanitize = (s) => {
                if (s === undefined || s === null)
                    return null;
                let t = String(s);
                t = t.replace(/\uFFFD/g, ''); // remove replacement chars
                t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // control chars
                t = t.trim();
                return t.length ? t : null;
            };
            const safeNumber = (s) => {
                if (s === undefined || s === null)
                    return null;
                const n = Number(s);
                return Number.isFinite(n) ? n : null;
            };
            const date = sanitize(parts[0]);
            const time = sanitize(parts[1]);
            const label = sanitize(parts[2]);
            const form1 = safeNumber(parts[3]);
            const form2 = safeNumber(parts[4]);
            const values = parts.slice(5, 45).map((v) => {
                const n = Number(v);
                return Number.isFinite(n) ? n : 0;
            }); // Map Prod_1 to Prod_40
            return { date, time, label, form1, form2, values };
        }
        catch (error) {
            console.error('Error parsing row:', parts, error);
            return null;
        }
    }
}
exports.ParserService = ParserService;
exports.parserService = new ParserService();
//# sourceMappingURL=parserService.js.map