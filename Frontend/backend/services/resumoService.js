var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./dbService", "../entities"], function (require, exports, dbService_1, entities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resumoService = exports.ResumoService = void 0;
    class ResumoService {
        /**
         * Gera um resumo dos dados com filtros aplicados
         */
        getResumo(filtros) {
            return __awaiter(this, void 0, void 0, function* () {
                yield dbService_1.dbService.init();
                const repo = dbService_1.AppDataSource.getRepository(entities_1.Relatorio);
                // Criar query builder base
                const qb = repo.createQueryBuilder('r');
                // Aplicar filtro de área se fornecido
                if (filtros === null || filtros === void 0 ? void 0 : filtros.areaId) {
                    qb.andWhere('r.Area = :areaId', { areaId: filtros.areaId });
                }
                // Aplicar filtros
                if (filtros === null || filtros === void 0 ? void 0 : filtros.formula) {
                    const formula = Number(filtros.formula);
                    if (!Number.isNaN(formula)) {
                        qb.andWhere('(r.Form1 = :formula OR r.Form2 = :formula)', { formula });
                    }
                }
                if (filtros === null || filtros === void 0 ? void 0 : filtros.dateStart) {
                    qb.andWhere('r.Dia >= :dateStart', { dateStart: filtros.dateStart });
                }
                if (filtros === null || filtros === void 0 ? void 0 : filtros.dateEnd) {
                    qb.andWhere('r.Dia <= :dateEnd', { dateEnd: filtros.dateEnd });
                }
                // Selecionar dados para o resumo
                const result = yield qb
                    .select([
                    'COUNT(r.id) as totalRegistros',
                    'AVG(r.Form1) as mediaForm1',
                    'AVG(r.Form2) as mediaForm2',
                    'MIN(r.Form1) as minForm1',
                    'MAX(r.Form1) as maxForm1',
                    'MIN(r.Form2) as minForm2',
                    'MAX(r.Form2) as maxForm2',
                    'MIN(r.Dia) as periodoInicio',
                    'MAX(r.Dia) as periodoFim'
                ])
                    .getRawOne();
                // Se solicitado para uma área específica, buscar informações adicionais
                if (filtros === null || filtros === void 0 ? void 0 : filtros.areaId) {
                    // Buscar descrição da área se existir
                    const areaInfo = yield repo.findOne({
                        where: { Area: filtros.areaId },
                        select: ['AreaDescricao']
                    });
                    // Retornar com informações da área
                    return {
                        totalRegistros: Number(result.totalRegistros) || 0,
                        mediaForm1: Number(result.mediaForm1) || 0,
                        mediaForm2: Number(result.mediaForm2) || 0,
                        minForm1: Number(result.minForm1) || 0,
                        maxForm1: Number(result.maxForm1) || 0,
                        minForm2: Number(result.minForm2) || 0,
                        maxForm2: Number(result.maxForm2) || 0,
                        periodoInicio: result.periodoInicio,
                        periodoFim: result.periodoFim,
                        areaId: filtros.areaId,
                        areaDescricao: (areaInfo === null || areaInfo === void 0 ? void 0 : areaInfo.AreaDescricao) || `Área ${filtros.areaId}`
                    };
                }
                // Retornar formato padrão
                return {
                    totalRegistros: Number(result.totalRegistros) || 0,
                    mediaForm1: Number(result.mediaForm1) || 0,
                    mediaForm2: Number(result.mediaForm2) || 0,
                    minForm1: Number(result.minForm1) || 0,
                    maxForm1: Number(result.maxForm1) || 0,
                    minForm2: Number(result.minForm2) || 0,
                    maxForm2: Number(result.maxForm2) || 0,
                    periodoInicio: result.periodoInicio,
                    periodoFim: result.periodoFim
                };
            });
        }
        /**
         * Processa um conjunto de relatórios para gerar um resumo
         * Utilizado principalmente para processar dados mock
         */
        processResumo(relatorios, areaId) {
            if (!relatorios || relatorios.length === 0) {
                // Retornar resumo vazio
                const resumoVazio = {
                    totalRegistros: 0,
                    mediaForm1: 0,
                    mediaForm2: 0,
                    minForm1: 0,
                    maxForm1: 0,
                    minForm2: 0,
                    maxForm2: 0,
                    periodoInicio: null,
                    periodoFim: null
                };
                if (areaId) {
                    return Object.assign(Object.assign({}, resumoVazio), { areaId, areaDescricao: `Área ${areaId}` });
                }
                return resumoVazio;
            }
            // Filtrar por área se necessário
            let dadosFiltrados = relatorios;
            if (areaId) {
                dadosFiltrados = relatorios.filter(r => r.Area === areaId);
            }
            // Calcular métricas
            let minForm1 = Number.MAX_VALUE;
            let maxForm1 = Number.MIN_VALUE;
            let minForm2 = Number.MAX_VALUE;
            let maxForm2 = Number.MIN_VALUE;
            let somaForm1 = 0;
            let somaForm2 = 0;
            let periodoInicio = null;
            let periodoFim = null;
            let areaDescricao = '';
            for (const relatorio of dadosFiltrados) {
                // Form1
                const form1 = Number(relatorio.Form1 || 0);
                if (!isNaN(form1)) {
                    somaForm1 += form1;
                    if (form1 < minForm1)
                        minForm1 = form1;
                    if (form1 > maxForm1)
                        maxForm1 = form1;
                }
                // Form2
                const form2 = Number(relatorio.Form2 || 0);
                if (!isNaN(form2)) {
                    somaForm2 += form2;
                    if (form2 < minForm2)
                        minForm2 = form2;
                    if (form2 > maxForm2)
                        maxForm2 = form2;
                }
                // Período
                if (relatorio.Dia) {
                    if (!periodoInicio || relatorio.Dia < periodoInicio) {
                        periodoInicio = relatorio.Dia;
                    }
                    if (!periodoFim || relatorio.Dia > periodoFim) {
                        periodoFim = relatorio.Dia;
                    }
                }
                // Descrição da área (para o primeiro registro que corresponder)
                if (areaId && relatorio.Area === areaId && !areaDescricao && relatorio.AreaDescricao) {
                    areaDescricao = relatorio.AreaDescricao;
                }
            }
            // Calcular médias
            const totalRegistros = dadosFiltrados.length;
            const mediaForm1 = totalRegistros > 0 ? somaForm1 / totalRegistros : 0;
            const mediaForm2 = totalRegistros > 0 ? somaForm2 / totalRegistros : 0;
            // Ajustar para caso de nenhum dado
            if (minForm1 === Number.MAX_VALUE)
                minForm1 = 0;
            if (maxForm1 === Number.MIN_VALUE)
                maxForm1 = 0;
            if (minForm2 === Number.MAX_VALUE)
                minForm2 = 0;
            if (maxForm2 === Number.MIN_VALUE)
                maxForm2 = 0;
            // Resumo básico
            const resumo = {
                totalRegistros,
                mediaForm1,
                mediaForm2,
                minForm1,
                maxForm1,
                minForm2,
                maxForm2,
                periodoInicio,
                periodoFim
            };
            // Se for para área específica, adicionar info da área
            if (areaId) {
                return Object.assign(Object.assign({}, resumo), { areaId, areaDescricao: areaDescricao || `Área ${areaId}` });
            }
            return resumo;
        }
    }
    exports.ResumoService = ResumoService;
    // Criar instância singleton
    exports.resumoService = new ResumoService();
});
