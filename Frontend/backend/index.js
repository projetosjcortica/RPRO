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
define(["require", "exports", "fs", "path", "./services/dbService", "./services/backupService", "./services/parserService", "./services/fileProcessorService", "./services/IHMService", "./services/materiaPrimaService", "./services/mockService", "./services/resumoService", "./services/dataPopulationService", "./services/unidadesService", "./entities", "./core/utils", "./websocket/WebSocketBridge", "./websocket/estoqueEndpoints", "reflect-metadata"], function (require, exports, fs_1, path_1, dbService_1, backupService_1, parserService_1, fileProcessorService_1, IHMService_1, materiaPrimaService_1, mockService_1, resumoService_1, dataPopulationService_1, unidadesService_1, entities_1, utils_1, WebSocketBridge_1, estoqueEndpoints_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wsbridge = exports.WebSocketBridge = void 0;
    exports.stopCollector = stopCollector;
    exports.startCollector = startCollector;
    fs_1 = __importDefault(fs_1);
    path_1 = __importDefault(path_1);
    Object.defineProperty(exports, "WebSocketBridge", { enumerable: true, get: function () { return WebSocketBridge_1.WebSocketBridge; } });
    Object.defineProperty(exports, "wsbridge", { enumerable: true, get: function () { return WebSocketBridge_1.wsbridge; } });
    // Collector
    const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
    const TMP_DIR = path_1.default.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
    const rawServer = process.env.INGEST_URL || process.env.SERVER_URL || 'http://192.168.5.200';
    const SERVER_URL = /^(?:https?:)\/\//i.test(rawServer) ? rawServer : `http://${rawServer}`;
    const INGEST_TOKEN = process.env.INGEST_TOKEN;
    if (!fs_1.default.existsSync(TMP_DIR))
        fs_1.default.mkdirSync(TMP_DIR, { recursive: true });
    let STOP = false;
    function stopCollector() { STOP = true; }
    function startCollector() {
        return __awaiter(this, void 0, void 0, function* () {
            const ihm = new IHMService_1.IHMService(process.env.IHM_IP || '127.0.0.1', process.env.IHM_USER || 'anonymous', process.env.IHM_PASS || '');
            const collector = { cycle() {
                    return __awaiter(this, void 0, void 0, function* () {
                        const downloaded = yield ihm.findAndDownloadNewFiles(TMP_DIR);
                        for (const f of downloaded) {
                            const res = yield fileProcessorService_1.fileProcessorService.processFile(f.localPath);
                            if (process.env.INGEST_URL) {
                                try {
                                    yield (0, utils_1.postJson)(`${SERVER_URL}/api/ingest`, { meta: res.meta, count: res.parsed.rowsCount }, INGEST_TOKEN);
                                }
                                catch (_a) { }
                            }
                        }
                    });
                } };
            STOP = false;
            while (!STOP) {
                try {
                    yield collector.cycle();
                }
                catch (e) {
                    console.error('[collector cycle error]', e);
                }
                yield new Promise((r) => setTimeout(r, POLL_INTERVAL));
            }
        });
    }
    // Heartbeat loop for WebSocket (optional)
    let WS_LOOP = false;
    let WS_INTERVAL = null;
    function startWsLoop(periodMs = Number(process.env.WS_HEARTBEAT_MS || '10000')) {
        if (WS_LOOP)
            return { running: true, periodMs };
        WS_LOOP = true;
        WS_INTERVAL = setInterval(() => {
            const payload = { port: WebSocketBridge_1.wsbridge.getPort(), clients: WebSocketBridge_1.wsbridge.getClientCount(), ts: new Date().toISOString() };
            WebSocketBridge_1.wsbridge.sendEvent('heartbeat', payload);
        }, periodMs);
        return { running: true, periodMs };
    }
    function stopWsLoop() {
        if (WS_INTERVAL)
            clearInterval(WS_INTERVAL);
        WS_INTERVAL = null;
        WS_LOOP = false;
        return { stopped: true };
    }
    // Register WebSocket commands
    WebSocketBridge_1.wsbridge.register('ping', () => __awaiter(void 0, void 0, void 0, function* () { return ({ pong: true, ts: new Date().toISOString() }); }));
    WebSocketBridge_1.wsbridge.register('backup.list', () => __awaiter(void 0, void 0, void 0, function* () { return backupService_1.backupSvc.listBackups(); }));
    WebSocketBridge_1.wsbridge.register('file.process', (_a) => __awaiter(void 0, [_a], void 0, function* ({ filePath }) {
        if (!filePath)
            throw Object.assign(new Error('filePath é obrigatório'), { status: 400 });
        const r = yield fileProcessorService_1.fileProcessorService.processFile(filePath);
        return { meta: r.meta, rowsCount: r.parsed.rowsCount };
    }));
    WebSocketBridge_1.wsbridge.register('ihm.fetchLatest', (_a) => __awaiter(void 0, [_a], void 0, function* ({ ip, user = 'anonymous', password = '' }) {
        if (!ip)
            throw Object.assign(new Error('IP do IHM é obrigatório'), { status: 400 });
        const tmpDir = path_1.default.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
        if (!fs_1.default.existsSync(tmpDir))
            fs_1.default.mkdirSync(tmpDir, { recursive: true });
        const ihm = new IHMService_1.IHMService(ip, user, password);
        const downloaded = yield ihm.findAndDownloadNewFiles(tmpDir);
        if (!downloaded || downloaded.length === 0)
            return { ok: true, message: 'Nenhum CSV novo encontrado' };
        const result = downloaded[0];
        if (!result)
            return { ok: true, message: 'Nenhum CSV novo encontrado' };
        const fileStat = fs_1.default.statSync(result.localPath);
        const fileObj = { originalname: result.name, path: result.localPath, mimetype: 'text/csv', size: fileStat.size };
        const meta = yield backupService_1.backupSvc.backupFile(fileObj);
        const processed = yield parserService_1.parserService.processFile(meta.workPath || meta.backupPath);
        return { meta, processed };
    }));
    WebSocketBridge_1.wsbridge.register('relatorio.paginate', (_a) => __awaiter(void 0, [_a], void 0, function* ({ page = 1, pageSize = 50, formula = null, dateStart = null, dateEnd = null, sortBy = 'Dia', sortDir = 'DESC' }) {
        // Se o modo mock estiver habilitado, usar dados mock
        if (mockService_1.mockService.isMockEnabled()) {
            return yield WebSocketBridge_1.wsbridge.executeCommand('mock.getRelatorios', {
                page,
                pageSize,
                formula,
                dateStart,
                dateEnd
            });
        }
        // Caso contrário, usar dados reais do banco
        yield dbService_1.dbService.init();
        const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio);
        const qb = repo.createQueryBuilder('r');
        if (formula) {
            const f = String(formula);
            const n = Number(f);
            if (!Number.isNaN(n))
                qb.andWhere('(r.Form1 = :n OR r.Form2 = :n)', { n });
            else
                qb.andWhere('(r.Nome LIKE :f OR r.processedFile LIKE :f)', { f: `%${f}%` });
        }
        if (dateStart)
            qb.andWhere('r.Dia >= :ds', { ds: dateStart });
        if (dateEnd)
            qb.andWhere('r.Dia <= :de', { de: dateEnd });
        const allowed = new Set(['Dia', 'Hora', 'Nome', 'Form1', 'Form2', 'processedFile']);
        const sb = allowed.has(sortBy) ? sortBy : 'Dia';
        const sd = sortDir === 'ASC' ? 'ASC' : 'DESC';
        qb.orderBy(`r.${sb}`, sd);
        const total = yield qb.getCount();
        const rows = yield qb.offset((Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize))).limit(Math.max(1, Number(pageSize))).getMany();
        return { rows, total, page, pageSize };
    }));
    WebSocketBridge_1.wsbridge.register('db.listBatches', () => __awaiter(void 0, void 0, void 0, function* () { yield dbService_1.dbService.init(); const repo = dbService_1.AppDataSource.getRepository(entities_1.Batch); const [items, total] = yield repo.findAndCount({ take: 50, order: { fileTimestamp: 'DESC' } }); return { items, total, page: 1, pageSize: 50 }; }));
    WebSocketBridge_1.wsbridge.register('db.setupMateriaPrima', (_a) => __awaiter(void 0, [_a], void 0, function* ({ items }) {
        yield dbService_1.dbService.init();
        // Filtra apenas os campos necessários e aplica as regras de negócio
        const processedItems = Array.isArray(items) ? items.map(item => {
            // Garante que apenas medida é utilizada para identificar g ou kg
            // e ignora categoria (será removida no serviço)
            return {
                id: item.id,
                num: item.num,
                produto: item.produto,
                medida: item.medida === 0 ? 0 : 1 // 0 = gramas, 1 = kg
            };
        }) : [];
        return yield materiaPrimaService_1.materiaPrimaService.saveMany(processedItems);
    }));
    WebSocketBridge_1.wsbridge.register('db.getMateriaPrima', () => __awaiter(void 0, void 0, void 0, function* () {
        // Se o modo mock estiver habilitado, usar dados mock
        if (mockService_1.mockService.isMockEnabled()) {
            return yield WebSocketBridge_1.wsbridge.executeCommand('mock.getMateriasPrimas', {});
        }
        // Caso contrário, usar dados reais
        return yield materiaPrimaService_1.materiaPrimaService.getAll();
    }));
    WebSocketBridge_1.wsbridge.register('sync.localToMain', (_a) => __awaiter(void 0, [_a], void 0, function* ({ limit = 500 }) { yield dbService_1.dbService.init(); const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio); const rows = yield repo.find({ take: Number(limit) }); if (!rows || rows.length === 0)
        return { synced: 0 }; const inserted = yield dbService_1.dbService.insertRelatorioRows(rows, 'local-backup-sync'); return { synced: Array.isArray(inserted) ? inserted.length : rows.length }; }));
    // Registrar endpoints do serviço de resumo
    WebSocketBridge_1.wsbridge.register('resumo.get', (_a) => __awaiter(void 0, [_a], void 0, function* ({ areaId = null, formula = null, dateStart = null, dateEnd = null }) {
        // Se o modo mock estiver habilitado, usar dados mock
        if (mockService_1.mockService.isMockEnabled()) {
            // Obter dados mock filtrados
            const mockData = yield WebSocketBridge_1.wsbridge.executeCommand('mock.getRelatorios', {
                formula,
                dateStart,
                dateEnd
            });
            // Processar resumo com os dados mock
            return resumoService_1.resumoService.processResumo(mockData.rows, areaId);
        }
        // Caso contrário, usar dados reais
        return yield resumoService_1.resumoService.getResumo({ areaId, formula, dateStart, dateEnd });
    }));
    // Alternância automática entre resumos
    let timerResumoId = null;
    WebSocketBridge_1.wsbridge.register('resumo.alternarComTimer', (_a) => __awaiter(void 0, [_a], void 0, function* ({ areaId, tempoExibicaoSegundos = 5, formula = null, dateStart = null, dateEnd = null }) {
        if (!areaId)
            throw Object.assign(new Error('areaId é obrigatório'), { status: 400 });
        // Limpar timer anterior se existir
        if (timerResumoId) {
            clearInterval(timerResumoId);
            timerResumoId = null;
        }
        // Parâmetros de filtro
        const filtros = { formula, dateStart, dateEnd };
        // Função para alternar entre os resumos
        const alternarResumos = () => __awaiter(void 0, void 0, void 0, function* () {
            // Verificar qual resumo está sendo exibido atualmente (pelo último evento enviado)
            const ultimoTipoResumo = WebSocketBridge_1.wsbridge.getMetadata('ultimoTipoResumo') || 'geral';
            if (ultimoTipoResumo === 'geral') {
                // Enviar resumo da área
                let resumoArea;
                if (mockService_1.mockService.isMockEnabled()) {
                    // Usar dados mock
                    const mockData = yield WebSocketBridge_1.wsbridge.executeCommand('mock.getRelatorios', filtros);
                    resumoArea = resumoService_1.resumoService.processResumo(mockData.rows, areaId);
                }
                else {
                    // Usar dados reais
                    resumoArea = yield resumoService_1.resumoService.getResumo(Object.assign(Object.assign({}, filtros), { areaId }));
                }
                WebSocketBridge_1.wsbridge.sendEvent('resumo.atualizado', {
                    tipo: 'area',
                    dados: resumoArea
                });
                WebSocketBridge_1.wsbridge.setMetadata('ultimoTipoResumo', 'area');
            }
            else {
                // Enviar resumo geral
                let resumoGeral;
                if (mockService_1.mockService.isMockEnabled()) {
                    // Usar dados mock
                    const mockData = yield WebSocketBridge_1.wsbridge.executeCommand('mock.getRelatorios', filtros);
                    resumoGeral = resumoService_1.resumoService.processResumo(mockData.rows);
                }
                else {
                    // Usar dados reais
                    resumoGeral = yield resumoService_1.resumoService.getResumo(filtros);
                }
                WebSocketBridge_1.wsbridge.sendEvent('resumo.atualizado', {
                    tipo: 'geral',
                    dados: resumoGeral
                });
                WebSocketBridge_1.wsbridge.setMetadata('ultimoTipoResumo', 'geral');
            }
        });
        // Iniciar com o resumo da área
        let resumoArea;
        if (mockService_1.mockService.isMockEnabled()) {
            // Usar dados mock
            const mockData = yield WebSocketBridge_1.wsbridge.executeCommand('mock.getRelatorios', filtros);
            resumoArea = resumoService_1.resumoService.processResumo(mockData.rows, areaId);
        }
        else {
            // Usar dados reais
            resumoArea = yield resumoService_1.resumoService.getResumo(Object.assign(Object.assign({}, filtros), { areaId }));
        }
        WebSocketBridge_1.wsbridge.sendEvent('resumo.atualizado', {
            tipo: 'area',
            dados: resumoArea
        });
        WebSocketBridge_1.wsbridge.setMetadata('ultimoTipoResumo', 'area');
        // Configurar o intervalo para alternar os resumos
        timerResumoId = setInterval(alternarResumos, tempoExibicaoSegundos * 1000);
        return { success: true, message: `Timer configurado para ${tempoExibicaoSegundos} segundos` };
    }));
    // Mock services
    WebSocketBridge_1.wsbridge.register('mock.toggle', (_a) => __awaiter(void 0, [_a], void 0, function* ({ enabled }) {
        return mockService_1.mockService.toggleMockMode(enabled);
    }));
    WebSocketBridge_1.wsbridge.register('mock.status', () => __awaiter(void 0, void 0, void 0, function* () {
        return { enabled: mockService_1.mockService.isMockEnabled() };
    }));
    // Registrar endpoints do serviço de unidades
    WebSocketBridge_1.wsbridge.register('unidades.converter', (_a) => __awaiter(void 0, [_a], void 0, function* ({ valor, de, para }) {
        if (valor === undefined || de === undefined || para === undefined) {
            throw Object.assign(new Error('Parâmetros incompletos. Necessário: valor, de, para'), { status: 400 });
        }
        return {
            original: valor,
            convertido: unidadesService_1.unidadesService.converterUnidades(Number(valor), Number(de), Number(para)),
            de: Number(de),
            para: Number(para)
        };
    }));
    WebSocketBridge_1.wsbridge.register('unidades.normalizarParaKg', (_a) => __awaiter(void 0, [_a], void 0, function* ({ valores, unidades }) {
        if (!valores || !unidades || typeof valores !== 'object' || typeof unidades !== 'object') {
            throw Object.assign(new Error('Parâmetros inválidos. Necessário: valores (objeto), unidades (objeto)'), { status: 400 });
        }
        return {
            valoresOriginais: valores,
            valoresNormalizados: unidadesService_1.unidadesService.normalizarParaKg(valores, unidades),
            unidades
        };
    }));
    // Endpoint para popular o banco com dados de teste
    WebSocketBridge_1.wsbridge.register('db.populate', (_a) => __awaiter(void 0, [_a], void 0, function* ({ tipo = 'relatorio', quantidade = 10, config = {} }) {
        // Por enquanto, só suporta população de relatórios
        if (tipo === 'relatorio') {
            return yield dataPopulationService_1.dataPopulationService.populateRelatorio(Math.min(Math.max(1, quantidade), 1000), // Limitar entre 1 e 1000
            config);
        }
        throw Object.assign(new Error(`Tipo de população não suportado: ${tipo}`), { status: 400 });
    }));
    WebSocketBridge_1.wsbridge.register('collector.start', () => __awaiter(void 0, void 0, void 0, function* () { startCollector(); return { started: true }; }));
    WebSocketBridge_1.wsbridge.register('collector.stop', () => __awaiter(void 0, void 0, void 0, function* () { stopCollector(); return { stopped: true }; }));
    WebSocketBridge_1.wsbridge.register('ws.loop.start', (_a) => __awaiter(void 0, [_a], void 0, function* ({ periodMs }) { return startWsLoop(Number(periodMs || process.env.WS_HEARTBEAT_MS || 10000)); }));
    WebSocketBridge_1.wsbridge.register('ws.loop.stop', () => __awaiter(void 0, void 0, void 0, function* () { return stopWsLoop(); }));
    WebSocketBridge_1.wsbridge.register('ws.status', () => __awaiter(void 0, void 0, void 0, function* () { return ({ port: WebSocketBridge_1.wsbridge.getPort(), clients: WebSocketBridge_1.wsbridge.getClientCount(), loop: WS_LOOP }); }));
    // Registrar endpoints de estoque
    (0, estoqueEndpoints_1.configureEstoqueEndpoints)(WebSocketBridge_1.wsbridge);
    // Auto-start when forked from Electron main
    if (typeof (process === null || process === void 0 ? void 0 : process.send) === 'function') {
        WebSocketBridge_1.wsbridge
            .start()
            .then((port) => {
            if (typeof (process === null || process === void 0 ? void 0 : process.send) === 'function') {
                process.send({ type: 'websocket-port', port });
                console.log(`Backend WebSocket started on port ${port}`);
            }
            fileProcessorService_1.fileProcessorService.addObserver({ update: (p) => __awaiter(void 0, void 0, void 0, function* () { return WebSocketBridge_1.wsbridge.sendEvent('file.processed', p); }) });
            if (process.env.WS_LOOP_AUTO_START === 'true')
                startWsLoop();
        })
            .catch((err) => {
            console.error('[Backend] Failed to start WebSocket server:', err);
            process.exit(1);
        });
    }
    // If not forked (running standalone during development), start the WebSocket bridge
    if (typeof (process === null || process === void 0 ? void 0 : process.send) !== 'function') {
        WebSocketBridge_1.wsbridge
            .start()
            .then((port) => {
            console.log(`[Backend] WebSocket started (standalone) on port ${port}`);
            fileProcessorService_1.fileProcessorService.addObserver({ update: (p) => __awaiter(void 0, void 0, void 0, function* () { return WebSocketBridge_1.wsbridge.sendEvent('file.processed', p); }) });
            if (process.env.WS_LOOP_AUTO_START === 'true')
                startWsLoop();
        })
            .catch((err) => {
            console.error('[Backend] Failed to start WebSocket server (standalone):', err);
        });
    }
    // If parent process sends messages (when forked), route commands to wsbridge handlers
    if (typeof (process === null || process === void 0 ? void 0 : process.on) === 'function') {
        try {
            const sendFn = process.send;
            process.on('message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
                if (!msg || typeof msg !== 'object')
                    return;
                // simple RPC: { type: 'cmd', id, cmd, payload }
                if (msg.type === 'cmd' && msg.id && msg.cmd) {
                    try {
                        const result = yield WebSocketBridge_1.wsbridge.executeCommand(msg.cmd, msg.payload);
                        if (typeof sendFn === 'function')
                            sendFn({ id: msg.id, ok: true, data: result });
                    }
                    catch (err) {
                        if (typeof sendFn === 'function')
                            sendFn({ id: msg.id, ok: false, error: { message: (err === null || err === void 0 ? void 0 : err.message) || String(err), status: err === null || err === void 0 ? void 0 : err.status } });
                    }
                }
            }));
        }
        catch (e) {
            // ignore
        }
    }
});
