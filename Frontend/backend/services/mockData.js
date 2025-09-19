/**
 * Backend mock data - moved from frontend
 * This provides mock data for development and testing
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mockMovimentacoes = exports.mockEstoque = exports.mockMateriasPrimas = exports.mockReportRows = void 0;
    // Mock report data
    exports.mockReportRows = [
        {
            "Dia": "01/09/2025",
            "Hora": "08:15:22",
            "Nome": "Formula 1",
            "Codigo": 1,
            "Numero": 0,
            "values": [923, 12, 45, 88, 21, 10, 55, 142, 50, 11, 7, 0, 5, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
            "Dia": "02/09/2025",
            "Hora": "09:22:11",
            "Nome": "Formula 2",
            "Codigo": 2,
            "Numero": 2,
            "values": [1100, 33, 22, 0, 12, 0, 55, 80, 24, 0, 0, 0, 9, 7, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
            "Dia": "03/09/2025",
            "Hora": "10:35:09",
            "Nome": "Formula 1",
            "Codigo": 1,
            "Numero": 0,
            "values": [754, 5, 12, 60, 43, 17, 55, 22, 10, 15, 8, 2, 5, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
            "Dia": "04/09/2025",
            "Hora": "11:48:55",
            "Nome": "Formula 1",
            "Codigo": 1,
            "Numero": 0,
            "values": [1320, 2025, 13, 42, 11, 0, 55, 74, 22, 15, 10, 0, 6, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
            "Dia": "05/09/2025",
            "Hora": "14:12:03",
            "Nome": "Formula 1",
            "Codigo": 1,
            "Numero": 2,
            "values": [880, 14, 5, 7, 9, 0, 0, 43, 10, 20, 11, 0, 8, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    ];
    // Mock matérias-primas
    exports.mockMateriasPrimas = [
        { id: '1', num: 1, produto: 'Milho', medida: 1, categoria: 'Grãos' },
        { id: '2', num: 2, produto: 'Farelo de Soja', medida: 1, categoria: 'Proteínas' },
        { id: '3', num: 3, produto: 'Óleo de Soja', medida: 0, categoria: 'Óleos' },
        { id: '4', num: 4, produto: 'Calcário', medida: 1, categoria: 'Minerais' },
        { id: '5', num: 5, produto: 'Sal', medida: 1, categoria: 'Minerais' }
    ];
    // Mock estoque
    exports.mockEstoque = [
        {
            id: '1',
            materia_prima_id: '1',
            quantidade: 5000,
            quantidade_minima: 1000,
            quantidade_maxima: 10000,
            unidade: 'kg',
            ativo: true,
            localizacao: 'Armazém A',
            criado_em: '2025-09-01T10:00:00',
            atualizado_em: '2025-09-10T14:30:00',
            materiaPrima: exports.mockMateriasPrimas[0]
        },
        {
            id: '2',
            materia_prima_id: '2',
            quantidade: 2500,
            quantidade_minima: 500,
            quantidade_maxima: 5000,
            unidade: 'kg',
            ativo: true,
            localizacao: 'Armazém B',
            criado_em: '2025-09-01T10:05:00',
            atualizado_em: '2025-09-12T09:15:00',
            materiaPrima: exports.mockMateriasPrimas[1]
        },
        {
            id: '3',
            materia_prima_id: '3',
            quantidade: 350,
            quantidade_minima: 100,
            quantidade_maxima: 1000,
            unidade: 'g',
            ativo: true,
            localizacao: 'Armazém B',
            criado_em: '2025-09-02T11:30:00',
            atualizado_em: '2025-09-15T16:45:00',
            materiaPrima: exports.mockMateriasPrimas[2]
        },
        {
            id: '4',
            materia_prima_id: '4',
            quantidade: 800,
            quantidade_minima: 200,
            quantidade_maxima: 2000,
            unidade: 'kg',
            ativo: true,
            localizacao: 'Armazém C',
            criado_em: '2025-09-05T09:20:00',
            atualizado_em: '2025-09-16T10:00:00',
            materiaPrima: exports.mockMateriasPrimas[3]
        },
        {
            id: '5',
            materia_prima_id: '5',
            quantidade: 150,
            quantidade_minima: 50,
            quantidade_maxima: 300,
            unidade: 'kg',
            ativo: true,
            localizacao: 'Armazém C',
            criado_em: '2025-09-05T09:25:00',
            atualizado_em: '2025-09-16T10:05:00',
            materiaPrima: exports.mockMateriasPrimas[4]
        }
    ];
    // Mock movimentações de estoque
    exports.mockMovimentacoes = [
        {
            id: '1',
            materia_prima_id: '1',
            tipo: 'entrada',
            quantidade: 1000,
            quantidade_anterior: 4000,
            quantidade_atual: 5000,
            unidade: 'kg',
            documento_referencia: 'NF-001',
            responsavel: 'João',
            data_movimentacao: '2025-09-10T14:30:00',
            materiaPrima: exports.mockMateriasPrimas[0]
        },
        {
            id: '2',
            materia_prima_id: '2',
            tipo: 'entrada',
            quantidade: 500,
            quantidade_anterior: 2000,
            quantidade_atual: 2500,
            unidade: 'kg',
            documento_referencia: 'NF-002',
            responsavel: 'Maria',
            data_movimentacao: '2025-09-12T09:15:00',
            materiaPrima: exports.mockMateriasPrimas[1]
        },
        {
            id: '3',
            materia_prima_id: '1',
            tipo: 'saida',
            quantidade: 200,
            quantidade_anterior: 5200,
            quantidade_atual: 5000,
            unidade: 'kg',
            documento_referencia: 'REQ-001',
            responsavel: 'Carlos',
            data_movimentacao: '2025-09-14T11:00:00',
            materiaPrima: exports.mockMateriasPrimas[0]
        },
        {
            id: '4',
            materia_prima_id: '3',
            tipo: 'ajuste',
            quantidade: 50,
            quantidade_anterior: 300,
            quantidade_atual: 350,
            unidade: 'g',
            responsavel: 'Ana',
            observacoes: 'Correção após inventário',
            data_movimentacao: '2025-09-15T16:45:00',
            materiaPrima: exports.mockMateriasPrimas[2]
        },
        {
            id: '5',
            materia_prima_id: '4',
            tipo: 'inventario',
            quantidade: 800,
            quantidade_anterior: 750,
            quantidade_atual: 800,
            unidade: 'kg',
            responsavel: 'Pedro',
            observacoes: 'Inventário mensal',
            data_movimentacao: '2025-09-16T10:00:00',
            materiaPrima: exports.mockMateriasPrimas[3]
        }
    ];
});
