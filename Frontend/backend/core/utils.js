var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "crypto", "http", "https"], function (require, exports, crypto_1, http_1, https_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hashBufferHex = hashBufferHex;
    exports.postJson = postJson;
    exports.parseRowDateTime = parseRowDateTime;
    crypto_1 = __importDefault(crypto_1);
    http_1 = __importDefault(http_1);
    https_1 = __importDefault(https_1);
    function hashBufferHex(buffer, alg = 'sha256') {
        const h = crypto_1.default.createHash(alg);
        h.update(buffer);
        return h.digest('hex');
    }
    function postJson(url, body, token) {
        return new Promise((resolve, reject) => {
            try {
                const parsed = new URL(url);
                const lib = parsed.protocol === 'https:' ? https_1.default : http_1.default;
                const data = JSON.stringify(body);
                const headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data).toString(),
                };
                if (token)
                    headers['Authorization'] = `Bearer ${token}`;
                const opts = {
                    hostname: parsed.hostname,
                    port: parsed.port ? Number(parsed.port) : parsed.protocol === 'https:' ? 443 : 80,
                    path: parsed.pathname + parsed.search,
                    method: 'POST',
                    headers,
                };
                const req = lib.request(opts, (res) => {
                    const chunks = [];
                    res.on('data', (c) => chunks.push(c));
                    res.on('end', () => {
                        const buf = Buffer.concat(chunks).toString('utf8');
                        try {
                            resolve(JSON.parse(buf));
                        }
                        catch (_a) {
                            resolve(buf);
                        }
                    });
                });
                req.on('error', reject);
                req.write(data);
                req.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    function parseRowDateTime(row) {
        try {
            if (!row)
                return null;
            if (row.datetime)
                return new Date(row.datetime);
            const d = row.date || row.Dia || null;
            const t = row.time || row.Hora || null;
            if (!d || !t)
                return null;
            if (/\//.test(d)) {
                const [dd = '01', mm = '01', yy = String(new Date().getFullYear())] = String(d).split('/');
                const day = dd.padStart(2, '0');
                const mon = mm.padStart(2, '0');
                const yr = yy.length === 2 ? '20' + yy : yy;
                return new Date(`${yr}-${mon}-${day}T${t}`);
            }
            return new Date(`${d}T${t}`);
        }
        catch (_a) {
            return null;
        }
    }
});
