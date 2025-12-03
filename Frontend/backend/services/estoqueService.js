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
exports.estoqueService = exports.EstoqueService = void 0;
const baseService_1 = require("../core/baseService");
const dbService_1 = require("./dbService");
const Estoque_1 = require("../entities/Estoque");
const MovimentacaoEstoque_1 = require("../entities/MovimentacaoEstoque");
const MateriaPrima_1 = require("../entities/MateriaPrima");
/**
 * Serviço de gerenciamento de estoque.
 * Responsável por gerenciar o estoque de matérias-primas.
 */
class EstoqueService extends baseService_1.BaseService {
    constructor() {
        super('EstoqueService');
        this.estoqueRepo = dbService_1.AppDataSource.getRepository(Estoque_1.Estoque);
        this.movimentacaoRepo = dbService_1.AppDataSource.getRepository(MovimentacaoEstoque_1.MovimentacaoEstoque);
        this.materiaPrimaRepo = dbService_1.AppDataSource.getRepository(MateriaPrima_1.MateriaPrima);
    }
    /**
     * Inicializa o estoque para uma matéria-prima
     */
    inicializarEstoque(materiaPrimaId_1) {
        return __awaiter(this, arguments, void 0, function* (materiaPrimaId, quantidadeInicial = 0, minimo = 0, maximo = 0) {
            // Verifica se já existe estoque para essa matéria-prima
            const estoqueExistente = yield this.estoqueRepo.findOne({
                where: { materia_prima_id: materiaPrimaId }
            });
            if (estoqueExistente) {
                return estoqueExistente;
            }
            // Verifica se a matéria-prima existe
            const materiaPrima = yield this.materiaPrimaRepo.findOne({
                where: { id: materiaPrimaId }
            });
            if (!materiaPrima) {
                throw new Error(`Matéria-prima com ID ${materiaPrimaId} não encontrada`);
            }
            // Cria um novo estoque
            const novoEstoque = this.estoqueRepo.create({
                materia_prima_id: materiaPrimaId,
                quantidade: quantidadeInicial,
                quantidade_minima: minimo,
                quantidade_maxima: maximo,
                materiaPrima: materiaPrima
            });
            yield this.estoqueRepo.save(novoEstoque);
            // Registra a movimentação inicial se houver quantidade
            if (quantidadeInicial > 0) {
                yield this.registrarMovimentacao(materiaPrimaId, MovimentacaoEstoque_1.TipoMovimentacao.ENTRADA, quantidadeInicial, 0, quantidadeInicial, 'Estoque inicial', 'Sistema');
            }
            return novoEstoque;
        });
    }
    /**
     * Registra uma movimentação de estoque
     */
    registrarMovimentacao(materiaPrimaId, tipo, quantidade, quantidadeAnterior, quantidadeAtual, observacoes, responsavel, documentoReferencia) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verifica se a matéria-prima existe
            const materiaPrima = yield this.materiaPrimaRepo.findOne({
                where: { id: materiaPrimaId }
            });
            if (!materiaPrima) {
                throw new Error(`Matéria-prima com ID ${materiaPrimaId} não encontrada`);
            }
            // Cria a movimentação
            const movimentacao = this.movimentacaoRepo.create({
                materia_prima_id: materiaPrimaId,
                tipo,
                quantidade,
                quantidade_anterior: quantidadeAnterior,
                quantidade_atual: quantidadeAtual,
                observacoes,
                responsavel,
                documento_referencia: documentoReferencia,
                materiaPrima
            });
            return this.movimentacaoRepo.save(movimentacao);
        });
    }
    /**
     * Adiciona quantidade ao estoque
     */
    adicionarEstoque(materiaPrimaId, quantidade, observacoes, responsavel, documentoReferencia) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verifica se existe estoque para essa matéria-prima
            let estoque = yield this.estoqueRepo.findOne({
                where: { materia_prima_id: materiaPrimaId }
            });
            // Se não existe, inicializa
            if (!estoque) {
                estoque = yield this.inicializarEstoque(materiaPrimaId);
            }
            const quantidadeAnterior = estoque.quantidade;
            const quantidadeAtual = quantidadeAnterior + quantidade;
            // Atualiza o estoque
            estoque.quantidade = quantidadeAtual;
            yield this.estoqueRepo.save(estoque);
            // Registra a movimentação
            yield this.registrarMovimentacao(materiaPrimaId, MovimentacaoEstoque_1.TipoMovimentacao.ENTRADA, quantidade, quantidadeAnterior, quantidadeAtual, observacoes, responsavel, documentoReferencia);
            return estoque;
        });
    }
    /**
     * Remove quantidade do estoque
     */
    removerEstoque(materiaPrimaId, quantidade, observacoes, responsavel, documentoReferencia) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verifica se existe estoque para essa matéria-prima
            let estoque = yield this.estoqueRepo.findOne({
                where: { materia_prima_id: materiaPrimaId }
            });
            // Se não existe, inicializa
            if (!estoque) {
                estoque = yield this.inicializarEstoque(materiaPrimaId);
            }
            const quantidadeAnterior = estoque.quantidade;
            // Verifica se há estoque suficiente
            if (quantidadeAnterior < quantidade) {
                throw new Error(`Estoque insuficiente para a matéria-prima. Disponível: ${quantidadeAnterior}, Solicitado: ${quantidade}`);
            }
            const quantidadeAtual = quantidadeAnterior - quantidade;
            // Atualiza o estoque
            estoque.quantidade = quantidadeAtual;
            yield this.estoqueRepo.save(estoque);
            // Registra a movimentação
            yield this.registrarMovimentacao(materiaPrimaId, MovimentacaoEstoque_1.TipoMovimentacao.SAIDA, quantidade, quantidadeAnterior, quantidadeAtual, observacoes, responsavel, documentoReferencia);
            return estoque;
        });
    }
    /**
     * Ajusta a quantidade em estoque (inventário)
     */
    ajustarEstoque(materiaPrimaId, novaQuantidade, observacoes, responsavel) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verifica se existe estoque para essa matéria-prima
            let estoque = yield this.estoqueRepo.findOne({
                where: { materia_prima_id: materiaPrimaId }
            });
            // Se não existe, inicializa
            if (!estoque) {
                estoque = yield this.inicializarEstoque(materiaPrimaId, novaQuantidade);
                return estoque;
            }
            const quantidadeAnterior = estoque.quantidade;
            const quantidade = novaQuantidade - quantidadeAnterior; // Pode ser positivo ou negativo
            // Atualiza o estoque
            estoque.quantidade = novaQuantidade;
            yield this.estoqueRepo.save(estoque);
            // Registra a movimentação
            yield this.registrarMovimentacao(materiaPrimaId, MovimentacaoEstoque_1.TipoMovimentacao.AJUSTE, Math.abs(quantidade), quantidadeAnterior, novaQuantidade, observacoes || 'Ajuste de inventário', responsavel);
            return estoque;
        });
    }
    /**
     * Obtém o estoque atual de uma matéria-prima
     */
    obterEstoque(materiaPrimaId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.estoqueRepo.findOne({
                where: { materia_prima_id: materiaPrimaId },
                relations: ['materiaPrima']
            });
        });
    }
    /**
     * Lista todo o estoque
     */
    listarEstoque() {
        return __awaiter(this, arguments, void 0, function* (incluirInativos = false) {
            const where = {};
            if (!incluirInativos) {
                where.ativo = true;
            }
            return this.estoqueRepo.find({
                where,
                relations: ['materiaPrima'],
                order: {
                    materiaPrima: {
                        produto: 'ASC'
                    }
                }
            });
        });
    }
    /**
     * Lista o histórico de movimentações de uma matéria-prima
     */
    listarMovimentacoes(materiaPrimaId, tipo, dataInicial, dataFinal) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (materiaPrimaId) {
                where.materia_prima_id = materiaPrimaId;
            }
            if (tipo) {
                where.tipo = tipo;
            }
            if (dataInicial || dataFinal) {
                where.data_movimentacao = {};
                if (dataInicial) {
                    where.data_movimentacao.gte = dataInicial;
                }
                if (dataFinal) {
                    where.data_movimentacao.lte = dataFinal;
                }
            }
            return this.movimentacaoRepo.find({
                where,
                relations: ['materiaPrima'],
                order: {
                    data_movimentacao: 'DESC'
                }
            });
        });
    }
    /**
     * Lista produtos com estoque abaixo do mínimo
     */
    listarEstoqueBaixo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.estoqueRepo
                .createQueryBuilder('estoque')
                .innerJoinAndSelect('estoque.materiaPrima', 'materiaPrima')
                .where('estoque.quantidade < estoque.quantidade_minima')
                .andWhere('estoque.ativo = :ativo', { ativo: true })
                .orderBy('materiaPrima.produto', 'ASC')
                .getMany();
        });
    }
    /**
     * Atualiza os limites de estoque (mínimo e máximo)
     */
    atualizarLimites(materiaPrimaId, minimo, maximo) {
        return __awaiter(this, void 0, void 0, function* () {
            let estoque = yield this.estoqueRepo.findOne({
                where: { materia_prima_id: materiaPrimaId }
            });
            if (!estoque) {
                estoque = yield this.inicializarEstoque(materiaPrimaId, 0, minimo, maximo);
            }
            else {
                estoque.quantidade_minima = minimo;
                estoque.quantidade_maxima = maximo;
                yield this.estoqueRepo.save(estoque);
            }
            return estoque;
        });
    }
}
exports.EstoqueService = EstoqueService;
exports.estoqueService = new EstoqueService();
//# sourceMappingURL=estoqueService.js.map