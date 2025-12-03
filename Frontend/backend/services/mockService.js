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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockService = void 0;
const WebSocketBridge_1 = require("../websocket/WebSocketBridge");
const Relatorio_1 = require("../entities/Relatorio");
const MateriaPrima_1 = require("../entities/MateriaPrima");
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
/**
 * Service to manage mock data functionality
 */
class MockService {
    constructor() {
        this.mockEnabled = false;
        this.mockConfig = {
            enableAutoPopulate: false,
            mockRelatorioCount: 50,
            mockMateriaPrimaCount: 10
        };
        // Cache de dados mock gerados
        this.mockRelatorioCache = null;
        this.mockMateriaPrimaCache = null;
        // Register WebSocket commands
        this.registerHandlers();
    }
    /**
     * Register WebSocket handlers for mock data control
     */
    registerHandlers() {
        // Get mock status
        WebSocketBridge_1.wsbridge.register('mock.getStatus', () => __awaiter(this, void 0, void 0, function* () {
            return {
                enabled: this.mockEnabled,
                config: this.mockConfig
            };
        }));
        // Enable or disable mock mode
        WebSocketBridge_1.wsbridge.register('mock.setStatus', (payload) => __awaiter(this, void 0, void 0, function* () {
            this.mockEnabled = payload.enabled;
            // Broadcast change event to all clients
            WebSocketBridge_1.wsbridge.sendEvent('mock.statusChanged', { enabled: this.mockEnabled });
            return { success: true, enabled: this.mockEnabled };
        }));
        // Configure specific mock settings
        WebSocketBridge_1.wsbridge.register('mock.configure', (payload) => __awaiter(this, void 0, void 0, function* () {
            this.mockConfig = Object.assign(Object.assign({}, this.mockConfig), payload);
            // Limpar cache se houver mudança na configuração que afeta os dados
            if (payload.mockRelatorioCount || payload.mockMateriaPrimaCount) {
                this.clearCache();
            }
            return { success: true, config: this.mockConfig };
        }));
        // Obter dados mock de relatório
        WebSocketBridge_1.wsbridge.register('mock.getRelatorios', (params) => __awaiter(this, void 0, void 0, function* () {
            if (!this.mockEnabled) {
                return { error: 'Mock mode is disabled', status: 400 };
            }
            // Página e tamanho da página
            const page = (params === null || params === void 0 ? void 0 : params.page) || 1;
            const pageSize = (params === null || params === void 0 ? void 0 : params.pageSize) || 10;
            // Filtros
            const formula = params === null || params === void 0 ? void 0 : params.formula;
            const dateStart = params === null || params === void 0 ? void 0 : params.dateStart;
            const dateEnd = params === null || params === void 0 ? void 0 : params.dateEnd;
            // Gerar ou usar cache
            const relatorios = this.getMockRelatorios();
            // Aplicar filtros
            let filtered = [...relatorios];
            if (formula) {
                const formulaNum = Number(formula);
                if (!isNaN(formulaNum)) {
                    filtered = filtered.filter(r => Math.abs((r.Form1 || 0) - formulaNum) < 0.1 ||
                        Math.abs((r.Form2 || 0) - formulaNum) < 0.1);
                }
                else {
                    filtered = filtered.filter(r => (r.Nome || '').includes(formula) ||
                        (r.processedFile || '').includes(formula));
                }
            }
            if (dateStart) {
                filtered = filtered.filter(r => (r.Dia || '') >= dateStart);
            }
            if (dateEnd) {
                filtered = filtered.filter(r => (r.Dia || '') <= dateEnd);
            }
            // Calcular total e paginar
            const total = filtered.length;
            const startIndex = (page - 1) * pageSize;
            const rows = filtered.slice(startIndex, startIndex + pageSize);
            return { rows, total, page, pageSize };
        }));
        // Obter dados mock de matéria prima
        WebSocketBridge_1.wsbridge.register('mock.getMateriasPrimas', () => __awaiter(this, void 0, void 0, function* () {
            if (!this.mockEnabled) {
                return { error: 'Mock mode is disabled', status: 400 };
            }
            return this.getMockMateriasPrimas();
        }));
    }
    /**
     * Gera dados mock de relatório
     */
    generateMockRelatorios(count = 50) {
        const relatorios = [];
        const dataAtual = new Date();
        const areas = ['A1', 'A2', 'B1', 'B2', 'C1'];
        // Obter matérias-primas para consultar unidades
        const materiasPrimas = this.getMockMateriasPrimas();
        for (let i = 0; i < count; i++) {
            // Data entre hoje e 30 dias atrás
            const dias = Math.floor(Math.random() * 30);
            const data = new Date(dataAtual.getTime() - dias * 24 * 60 * 60 * 1000);
            const dia = data.toISOString().split('T')[0];
            // Hora aleatória
            const hora = [
                String(Math.floor(Math.random() * 24)).padStart(2, '0'),
                String(Math.floor(Math.random() * 60)).padStart(2, '0'),
                String(Math.floor(Math.random() * 60)).padStart(2, '0')
            ].join(':');
            // Área aleatória
            const areaIndex = Math.floor(Math.random() * areas.length);
            const area = areas[areaIndex];
            // Fórmulas com pequenas variações
            const form1Base = 1 + Math.floor(Math.random() * 3);
            const form2Base = 2 + Math.floor(Math.random() * 3);
            const form1Variation = (Math.random() * 0.4) - 0.2; // Entre -0.2 e 0.2
            const form2Variation = (Math.random() * 0.4) - 0.2; // Entre -0.2 e 0.2
            // Criar relatório
            const relatorio = new Relatorio_1.Relatorio();
            relatorio.id = (0, uuid_1.v4)();
            relatorio.Dia = dia;
            relatorio.Hora = hora;
            relatorio.Nome = `Mock_${i + 1}`;
            relatorio.Form1 = form1Base + form1Variation;
            relatorio.Form2 = form2Base + form2Variation;
            relatorio.Area = area;
            relatorio.AreaDescricao = `Área ${area}`;
            relatorio.processedFile = `mock_data_${(0, crypto_1.createHash)('md5').update(String(i)).digest('hex').substring(0, 8)}.csv`;
            // Adicionar produtos com suas unidades (gramas ou kg)
            const numProdutos = Math.floor(Math.random() * 10) + 5; // Entre 5 e 15 produtos
            for (let j = 1; j <= 40; j++) {
                if (j <= numProdutos) {
                    // Valor aleatório para o produto
                    const valor = Math.random() * 100 + 10; // Entre 10 e 110
                    relatorio[`Prod_${j}`] = valor;
                    // Atribuir a unidade com base na matéria-prima correspondente
                    // Se não houver matéria-prima correspondente, alterna aleatoriamente
                    const materiaPrima = materiasPrimas.find(mp => mp.num === j);
                    if (materiaPrima) {
                        relatorio[`Unidade_${j}`] = materiaPrima.medida === 0 ? 'g' : 'kg';
                    }
                    else {
                        relatorio[`Unidade_${j}`] = Math.random() > 0.5 ? 'g' : 'kg';
                    }
                }
                else {
                    relatorio[`Prod_${j}`] = 0;
                    relatorio[`Unidade_${j}`] = 'kg'; // Valor padrão para produtos vazios
                }
            }
            relatorios.push(relatorio);
        }
        return relatorios;
    }
    /**
     * Gera dados mock de matéria prima
     */
    generateMockMateriasPrimas(count = 10) {
        const materias = [];
        for (let i = 0; i < count; i++) {
            const materiaPrima = new MateriaPrima_1.MateriaPrima();
            materiaPrima.id = (0, uuid_1.v4)();
            materiaPrima.num = i + 1;
            materiaPrima.produto = `Produto Mock ${i + 1}`;
            materiaPrima.medida = Math.random() > 0.5 ? 1 : 0; // 50% chance de kg ou g
            materias.push(materiaPrima);
        }
        return materias;
    }
    /**
     * Limpa o cache de dados mock
     */
    clearCache() {
        this.mockRelatorioCache = null;
        this.mockMateriaPrimaCache = null;
    }
    /**
     * Obtém relatórios mock (do cache ou gerando novos)
     */
    getMockRelatorios() {
        if (!this.mockRelatorioCache) {
            this.mockRelatorioCache = this.generateMockRelatorios(this.mockConfig.mockRelatorioCount || 50);
        }
        return this.mockRelatorioCache;
    }
    /**
     * Obtém matérias primas mock (do cache ou gerando novas)
     */
    getMockMateriasPrimas() {
        if (!this.mockMateriaPrimaCache) {
            this.mockMateriaPrimaCache = this.generateMockMateriasPrimas(this.mockConfig.mockMateriaPrimaCount || 10);
        }
        return this.mockMateriaPrimaCache;
    }
    /**
     * Check if mock mode is enabled
     */
    isMockEnabled() {
        return this.mockEnabled;
    }
    /**
     * Get mock configuration
     */
    getMockConfig() {
        return Object.assign({}, this.mockConfig);
    }
    /**
     * Enable or disable mock mode
     */
    toggleMockMode(enable) {
        this.mockEnabled = enable;
        WebSocketBridge_1.wsbridge.sendEvent('mock.statusChanged', { enabled: this.mockEnabled });
        return { enabled: this.mockEnabled };
    }
}
// Create singleton instance
exports.mockService = new MockService();
//# sourceMappingURL=mockService.js.map