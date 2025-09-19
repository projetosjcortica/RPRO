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
define(["require", "exports", "path", "fs", "../services/IHMService", "../services/dbService"], function (require, exports, path_1, fs_1, IHMService_1, dbService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stopCollector = stopCollector;
    exports.startCollector = startCollector;
    path_1 = __importDefault(path_1);
    fs_1 = __importDefault(fs_1);
    const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
    const TMP_DIR = path_1.default.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
    const rawServer = process.env.INGEST_URL || process.env.SERVER_URL || 'http://192.168.5.200';
    const SERVER_URL = /^(?:https?:)\/\//i.test(rawServer)
        ? rawServer
        : `http://${rawServer}`;
    const INGEST_TOKEN = process.env.INGEST_TOKEN;
    if (!fs_1.default.existsSync(TMP_DIR))
        fs_1.default.mkdirSync(TMP_DIR, { recursive: true });
    let STOP = false;
    function stopCollector() {
        STOP = true;
    }
    const ihmService = new IHMService_1.IHMService(process.env.IHM_IP || '192.168.5.254', process.env.IHM_USER || 'anonymous', process.env.IHM_PASSWORD || '');
    function fetchAndProcessData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newFiles = yield ihmService.findAndDownloadNewFiles(TMP_DIR);
                for (const file of newFiles) {
                    console.log(`Processing file: ${file.name}`);
                    // Process the file and insert data into the database
                    const result = yield dbService_1.dbService.insertRelatorioRows([], file.localPath);
                    console.log(`Inserted ${result} rows from ${file.name}`);
                }
            }
            catch (error) {
                console.error('Error fetching or processing data:', error);
            }
        });
    }
    function startCollector() {
        return __awaiter(this, void 0, void 0, function* () {
            while (!STOP) {
                console.log('Collector running...');
                yield fetchAndProcessData();
                yield new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
            }
        });
    }
});
