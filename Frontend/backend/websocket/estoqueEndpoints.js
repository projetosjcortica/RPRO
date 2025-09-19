var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../services/estoqueService", "../entities/MovimentacaoEstoque"], function (require, exports, estoqueService_1, MovimentacaoEstoque_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.configureEstoqueEndpoints = configureEstoqueEndpoints;
    /**
     * Configuração dos endpoints WebSocket para o serviço de estoque
     */
    function configureEstoqueEndpoints(wsb) {
        // Listar todo o estoque
        wsb.register('estoque/listar', (payload) => __awaiter(this, void 0, void 0, function* () {
            const incluirInativos = (payload === null || payload === void 0 ? void 0 : payload.incluirInativos) || false;
            const estoque = yield estoqueService_1.estoqueService.listarEstoque(incluirInativos);
            return estoque;
        }));
        // Obter estoque de um produto específico
        wsb.register('estoque/obter', (payload) => __awaiter(this, void 0, void 0, function* () {
            const { materiaPrimaId } = payload;
            if (!materiaPrimaId) {
                throw new Error('ID da matéria-prima é obrigatório');
            }
            const estoque = yield estoqueService_1.estoqueService.obterEstoque(materiaPrimaId);
            return estoque;
        }));
        // Adicionar ao estoque
        wsb.register('estoque/adicionar', (payload) => __awaiter(this, void 0, void 0, function* () {
            const { materiaPrimaId, quantidade, observacoes, responsavel, documentoReferencia } = payload;
            if (!materiaPrimaId) {
                throw new Error('ID da matéria-prima é obrigatório');
            }
            if (!quantidade || quantidade <= 0) {
                throw new Error('Quantidade deve ser maior que zero');
            }
            const estoque = yield estoqueService_1.estoqueService.adicionarEstoque(materiaPrimaId, quantidade, observacoes, responsavel, documentoReferencia);
            // Envia evento de atualização para todos os clientes
            wsb.sendEvent('estoque/atualizado', { materiaPrimaId, novaQuantidade: estoque.quantidade });
            return estoque;
        }));
        // Remover do estoque
        wsb.register('estoque/remover', (payload) => __awaiter(this, void 0, void 0, function* () {
            const { materiaPrimaId, quantidade, observacoes, responsavel, documentoReferencia } = payload;
            if (!materiaPrimaId) {
                throw new Error('ID da matéria-prima é obrigatório');
            }
            if (!quantidade || quantidade <= 0) {
                throw new Error('Quantidade deve ser maior que zero');
            }
            const estoque = yield estoqueService_1.estoqueService.removerEstoque(materiaPrimaId, quantidade, observacoes, responsavel, documentoReferencia);
            // Envia evento de atualização para todos os clientes
            wsb.sendEvent('estoque/atualizado', { materiaPrimaId, novaQuantidade: estoque.quantidade });
            return estoque;
        }));
        // Ajustar estoque (inventário)
        wsb.register('estoque/ajustar', (payload) => __awaiter(this, void 0, void 0, function* () {
            const { materiaPrimaId, quantidade, observacoes, responsavel } = payload;
            if (!materiaPrimaId) {
                throw new Error('ID da matéria-prima é obrigatório');
            }
            if (quantidade === undefined || quantidade < 0) {
                throw new Error('Quantidade deve ser maior ou igual a zero');
            }
            const estoque = yield estoqueService_1.estoqueService.ajustarEstoque(materiaPrimaId, quantidade, observacoes, responsavel);
            // Envia evento de atualização para todos os clientes
            wsb.sendEvent('estoque/atualizado', { materiaPrimaId, novaQuantidade: estoque.quantidade });
            return estoque;
        }));
        // Atualizar limites de estoque
        wsb.register('estoque/limites', (payload) => __awaiter(this, void 0, void 0, function* () {
            const { materiaPrimaId, minimo, maximo } = payload;
            if (!materiaPrimaId) {
                throw new Error('ID da matéria-prima é obrigatório');
            }
            if (minimo === undefined || minimo < 0) {
                throw new Error('Quantidade mínima deve ser maior ou igual a zero');
            }
            if (maximo === undefined || maximo < minimo) {
                throw new Error('Quantidade máxima deve ser maior ou igual à quantidade mínima');
            }
            const estoque = yield estoqueService_1.estoqueService.atualizarLimites(materiaPrimaId, minimo, maximo);
            return estoque;
        }));
        // Listar movimentações
        wsb.register('estoque/movimentacoes', (payload) => __awaiter(this, void 0, void 0, function* () {
            const { materiaPrimaId, tipo, dataInicial, dataFinal } = payload || {};
            let tipoMovimentacao = null;
            if (tipo && Object.values(MovimentacaoEstoque_1.TipoMovimentacao).includes(tipo)) {
                tipoMovimentacao = tipo;
            }
            let dataInicialObj = null;
            if (dataInicial) {
                dataInicialObj = new Date(dataInicial);
            }
            let dataFinalObj = null;
            if (dataFinal) {
                dataFinalObj = new Date(dataFinal);
            }
            const movimentacoes = yield estoqueService_1.estoqueService.listarMovimentacoes(materiaPrimaId, tipoMovimentacao, dataInicialObj || undefined, dataFinalObj || undefined);
            return movimentacoes;
        }));
        // Listar produtos com estoque abaixo do mínimo
        wsb.register('estoque/baixo', () => __awaiter(this, void 0, void 0, function* () {
            return yield estoqueService_1.estoqueService.listarEstoqueBaixo();
        }));
        // Inicializar estoque para uma matéria-prima
        wsb.register('estoque/inicializar', (payload) => __awaiter(this, void 0, void 0, function* () {
            const { materiaPrimaId, quantidade, minimo, maximo } = payload;
            if (!materiaPrimaId) {
                throw new Error('ID da matéria-prima é obrigatório');
            }
            const estoque = yield estoqueService_1.estoqueService.inicializarEstoque(materiaPrimaId, quantidade || 0, minimo || 0, maximo || 0);
            return estoque;
        }));
    }
});
