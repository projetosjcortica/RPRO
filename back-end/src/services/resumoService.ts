import { AppDataSource, dbService } from './dbService';
import { Relatorio, MateriaPrima } from '../entities';
import { materiaPrimaService } from './materiaPrimaService';

export interface FormulaInfo {
    numero: number;
    nome: string;
    quantidade: number;
    porcentagem: number;
    somatoriaTotal?: number;
}

export interface ResumoTotal {
    // totalRegistros: number;
    periodoInicio: string | null;
    periodoFim: string | null;
    // Informações sobre fórmulas utilizadas
    formulasUtilizadas: Record<string, FormulaInfo>;
    // Campos adicionais para consumo de produtos
    totalPesos: number;
    batitdasTotais: number;
    horaInicial: string | null;
    horaFinal: string | null;
    usosPorProduto: Record<string, { quantidade: number; label: string; unidade: string; }>;
    // Horário do primeiro e último dia (primeira batida e última batida daquele dia)
    firstDayRange?: { date: string | null; firstTime: string | null; lastTime: string | null };
    lastDayRange?: { date: string | null; firstTime: string | null; lastTime: string | null };
    // Optional debug metadata (not used by UI by default)
    _appliedFilters?: any;
    _matchedRows?: number;
}

export interface ResumoAreaSelecionada extends ResumoTotal {
    areaId: string;
    areaDescricao: string;
}

export class ResumoService {
    /**
     * Aplica filtro de fórmula ao query builder
     */
    private applyFormulaFilter(qb: any, formula: number | null) {
        // Accept 0 and any finite numeric formula
        if (formula != null) {
            const f = Number(formula);
            if (Number.isFinite(f)) {
                qb.andWhere('(r.Form1 = :formula OR r.Form2 = :formula)', { formula: f });
            }
        }
    }

    /**
     * Aplica todos os filtros ao query builder
     */
    private applyFilters(qb: any, filtros?: {
        formula?: number | null;
        formulaName?: string | null;
        codigo?: number | null;
        numero?: number | null;
        dateStart?: string | null;
        dateEnd?: string | null;
        areaId?: string | null;
    }) {
        if (filtros?.areaId) {
            qb.andWhere('r.Area = :areaId', { areaId: filtros.areaId });
        }

        // If explicit codigo (Form1) filter provided, apply it
        if (filtros?.codigo != null) {
            const c = Number(filtros.codigo);
            if (Number.isFinite(c)) qb.andWhere('r.Form1 = :c', { c });
        }

        // If explicit numero (Form2) filter provided, apply it
        if (filtros?.numero != null) {
            const n = Number(filtros.numero);
            if (Number.isFinite(n)) qb.andWhere('r.Form2 = :n', { n });
        }

        // If numeric formula was provided (including 0), apply previous behavior (Form1 OR Form2)
        if (filtros?.formula != null) {
            this.applyFormulaFilter(qb, filtros.formula);
        }

        // If a textual formula filter (name) was provided, match by Nome (case-insensitive)
        if (filtros?.formulaName) {
            const fStr = String(filtros.formulaName).toLowerCase();
            qb.andWhere('LOWER(r.Nome) LIKE :fStr', { fStr: `%${fStr}%` });
        }

        if (filtros?.dateStart) {
            qb.andWhere('r.Dia >= :dateStart', { dateStart: filtros.dateStart });
        }

        if (filtros?.dateEnd) {
            // Use exclusive upper bound by comparing with next day so dateEnd is inclusive
            try {
                const parts = String(filtros.dateEnd).split('-');
                const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                dt.setDate(dt.getDate() + 1);
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, '0');
                const d = String(dt.getDate()).padStart(2, '0');
                const dateEndPlus = `${y}-${m}-${d}`;
                qb.andWhere('r.Dia < :dateEndPlus', { dateEndPlus });
            } catch (e) {
                qb.andWhere('r.Dia <= :dateEnd', { dateEnd: filtros.dateEnd });
            }
        }
    }

    /**
     * Gera um resumo dos dados com filtros aplicados
     */
    async getResumo(filtros?: {
        formula?: number | null;
        formulaName?: string | null;
        codigo?: number | null;
        numero?: number | null;
        dateStart?: string | null;
        dateEnd?: string | null;
        areaId?: string | null;
    }, advancedFilters?: any): Promise<ResumoTotal | ResumoAreaSelecionada> {
        await dbService.init();
        const repo = AppDataSource.getRepository(Relatorio);
        
        // Buscar materias para permitir mapeamento nomes->nums quando aplicarmos advancedFilters
        const materiasPrimasAll = await materiaPrimaService.getAll();
        const materiasByNum: Record<number, any> = {};
        materiasPrimasAll.forEach((m) => { if (m && m.num) materiasByNum[Number(m.num)] = m; });

        // Criar query builder base para estatísticas
        const qb = repo.createQueryBuilder('r');
        this.applyFilters(qb, filtros);

        // Aplicar filtros avançados (include/exclude produtos e fórmulas) se fornecidos
        if (advancedFilters && typeof advancedFilters === 'object') {
            const asNums = (arr: any[]) => Array.from(
                new Set((arr || []).map((x: any) => Number(x)).filter(n => Number.isFinite(n) && n >= 1 && n <= 65))
            ).slice(0, 200);

            const excludeCodes = asNums(advancedFilters.excludeProductCodes || []);
            if (excludeCodes.length) {
                const conditions = excludeCodes.map(n => `r.Prod_${n} > 0`).join(' OR ');
                qb.andWhere(`NOT (${conditions})`);
            }

            const includeCodes = asNums(advancedFilters.includeProductCodes || []);
            if (includeCodes.length) {
                const conditions = includeCodes.map(n => `r.Prod_${n} > 0`).join(' OR ');
                qb.andWhere(`(${conditions})`);
            }

            const matchMode = advancedFilters.matchMode === 'exact' ? 'exact' : 'contains';
            const mapNamesToNums = (names: any[]) => {
                if (!names || !names.length) return [] as number[];
                const searchTerms = names.map((s: any) => String(s).toLowerCase().trim());
                const nums: number[] = [];
                Object.entries(materiasByNum).forEach(([k, v]: any) => {
                    const prodName = String(v.produto || v.nome || '').toLowerCase();
                    for (const term of searchTerms) {
                        if (!term) continue;
                        if (matchMode === 'exact') {
                            if (prodName === term) nums.push(Number(k));
                        } else {
                            if (prodName.includes(term)) nums.push(Number(k));
                        }
                    }
                });
                return Array.from(new Set(nums)).slice(0, 200);
            };

            const includeNameCodes = mapNamesToNums(advancedFilters.includeProductNames || []);
            if (includeNameCodes.length) {
                const conditions = includeNameCodes.map(n => `r.Prod_${n} > 0`).join(' OR ');
                qb.andWhere(`(${conditions})`);
            }

            const excludeNameCodes = mapNamesToNums(advancedFilters.excludeProductNames || []);
            if (excludeNameCodes.length) {
                const conditions = excludeNameCodes.map(n => `r.Prod_${n} > 0`).join(' OR ');
                qb.andWhere(`NOT (${conditions})`);
            }

            if (Array.isArray(advancedFilters.includeFormulas) && advancedFilters.includeFormulas.length) {
                const formulas = advancedFilters.includeFormulas.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n));
                if (formulas.length) qb.andWhere('r.Form1 IN (:...arrIncludeFormulas)', { arrIncludeFormulas: formulas });
            }
            if (Array.isArray(advancedFilters.excludeFormulas) && advancedFilters.excludeFormulas.length) {
                const formulas = advancedFilters.excludeFormulas.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n));
                if (formulas.length) qb.andWhere('r.Form1 NOT IN (:...arrExcludeFormulas)', { arrExcludeFormulas: formulas });
            }

            if (Array.isArray(advancedFilters.includeFormulaNames) && advancedFilters.includeFormulaNames.length) {
                const formulaNames = (advancedFilters.includeFormulaNames || []).map((s: any) => String(s).toLowerCase().trim()).filter(Boolean);
                if (formulaNames.length) {
                    const conditions = formulaNames.map((_: string, i: number) => `LOWER(r.Nome) LIKE :includeFormulaName${i}`).join(' OR ');
                    qb.andWhere(`(${conditions})`);
                    formulaNames.forEach((name: string, i: number) => qb.setParameter(`includeFormulaName${i}`, `%${name}%`));
                }
            }

            if (Array.isArray(advancedFilters.excludeFormulaNames) && advancedFilters.excludeFormulaNames.length) {
                const formulaNames = (advancedFilters.excludeFormulaNames || []).map((s: any) => String(s).toLowerCase().trim()).filter(Boolean);
                if (formulaNames.length) {
                    const conditions = formulaNames.map((_: string, i: number) => `LOWER(r.Nome) NOT LIKE :excludeFormulaName${i}`).join(' AND ');
                    qb.andWhere(`(${conditions})`);
                    formulaNames.forEach((name: string, i: number) => qb.setParameter(`excludeFormulaName${i}`, `%${name}%`));
                }
            }
        }
        
        // Selecionar dados para o resumo
        const result = await qb
            .select([
                'COUNT(r.id) as totalRegistros',
                'MIN(r.Dia) as periodoInicio',
                'MAX(r.Dia) as periodoFim',
                'MIN(r.Hora) as horaInicial',
                'MAX(r.Hora) as horaFinal'
            ])
            .getRawOne();
        
        // Buscar todos os registros para calcular consumo de produtos e fórmulas
        const qbFull = repo.createQueryBuilder('r');
        this.applyFilters(qbFull, filtros);
        const allRows = await qbFull.getMany();
        
        // Buscar informações completas dos produtos da MateriaPrima
        const materiasPrimas = await materiaPrimaService.getAll();
        const infosProdutos: Record<string, { label: string; materia: MateriaPrima }> = {};
        
        for (const mp of materiasPrimas) {
            // ⚠️ Ignorar produtos desativados ou marcados para ignorar cálculos
            if (mp.num && mp.produto && mp.ativo !== false && mp.ignorarCalculos !== true) {
                infosProdutos[`Produto_${mp.num}`] = {
                    label: mp.produto,
                    materia: mp
                };
            }
        }
        
        // Calcular consumo total por produto e fórmulas utilizadas
        const usosPorProduto: Record<string, { quantidade: number; label: string; unidade: string; }> = {};
        const formulasUtilizadas: Record<string, FormulaInfo> = {};
        let totalPesos = 0;
        
        for (const row of allRows) {
            // Contar fórmulas baseado no Nome (que é único para cada fórmula)
            if (row.Nome && row.Form1 != null) {
                const formulaKey = row.Nome; // Usar o nome da fórmula como chave
                if (!formulasUtilizadas[formulaKey]) {
                    formulasUtilizadas[formulaKey] = { 
                        numero: row.Form1, 
                        nome: row.Nome,
                        quantidade: 0, 
                        porcentagem: 0,
                        somatoriaTotal: 0
                    };
                }
                formulasUtilizadas[formulaKey].quantidade++;
            }
            
            // Calcular consumo de produtos com conversão baseada na configuração
            // accumulate per-row total in normalized kg (to attribute to the formula)
            let rowTotalKg = 0;
            for (let i = 1; i <= 65; i++) {
                const prodValue = (row as any)[`Prod_${i}`];
                const valueOriginal = typeof prodValue === 'number' ? prodValue : (prodValue != null ? Number(prodValue) : 0);
                
                if (valueOriginal > 0) {
                    const prodKey = `Produto_${i}`;
                    const info = infosProdutos[prodKey];
                    
                    // ⚠️ FILTRO: Se produto não está em infosProdutos, significa que está inativo - pular
                    if (!info) {
                        continue;
                    }
                    
                    // Converter valor baseado na configuração do produto
                    // Keep display quantity in the product's original unit (g or kg)
                    // but accumulate totalPesos in normalized kg
                    let valueForTotalKg = valueOriginal;
                    let displayQuantity = valueOriginal;
                    let unidade = 'kg';

                    if (info && info.materia) {
                        if (info.materia.medida === 0) {
                            // stored in grams in DB -> valueOriginal is grams
                            // For total, convert to kg
                            valueForTotalKg = valueOriginal / 1000;
                            displayQuantity = valueOriginal; // keep grams
                            unidade = 'g';
                        } else {
                            // already in kg
                            valueForTotalKg = valueOriginal;
                            displayQuantity = valueOriginal;
                            unidade = 'kg';
                        }
                    }

                    const label = info ? info.label : `Produto ${i}`;

                    if (!usosPorProduto[prodKey]) {
                        // Inicializar com valor formatado (string) e unidade
                        usosPorProduto[prodKey] = { 
                            quantidade: 0, 
                            quantidadeFormatada: '0.000',
                            label, 
                            unidade 
                        } as any;
                    }
                    // Acumular valor real (kg) para totais internos
                    usosPorProduto[prodKey].quantidade += valueForTotalKg;
                    
                    // Formatar valor com 3 casas decimais baseado na unidade original
                    if (info && info.materia && info.materia.medida === 0) {
                        // Gramas: converter para kg e formatar (ex: 800g -> "0.800")
                        const kgValue = (usosPorProduto[prodKey].quantidade);
                        (usosPorProduto[prodKey] as any).quantidadeFormatada = kgValue.toFixed(3);
                    } else {
                        // Kg: manter valor e formatar (ex: 1.234kg -> "1.234")
                        (usosPorProduto[prodKey] as any).quantidadeFormatada = usosPorProduto[prodKey].quantidade.toFixed(3);
                    }
                    
                    totalPesos += valueForTotalKg; // accumulate normalized kg for totals
                    rowTotalKg += valueForTotalKg; // accumulate per-row for formula attribution
                }
            }
            // After summing products for this row, attribute the row total to the formula if present
            if (row.Nome && row.Form1 != null) {
                const fk = row.Nome;
                if (formulasUtilizadas[fk]) {
                    formulasUtilizadas[fk].somatoriaTotal = (formulasUtilizadas[fk].somatoriaTotal || 0) + rowTotalKg;
                }
            }
        }
        
        // Calcular porcentagens das fórmulas
        const totalRegistros = Number(result.totalRegistros) || 0;
        Object.values(formulasUtilizadas).forEach(formula => {
            formula.porcentagem = totalRegistros > 0 ? (formula.quantidade / totalRegistros) * 100 : 0;
        });
        
        // Se solicitado para uma área específica, buscar informações adicionais
        if (filtros?.areaId) {
            // Buscar descrição da área se existir
            const areaInfo = await repo.findOne({ 
                where: { Area: filtros.areaId }, 
                select: ['AreaDescricao'] 
            });
            
            // Retornar com informações da área
            return {
                // totalRegistros: Number(result.totalRegistros) || 0,
                batitdasTotais: allRows.length,
                periodoInicio: result.periodoInicio,
                periodoFim: result.periodoFim,
                horaInicial: result.horaInicial,
                horaFinal: result.horaFinal,
                formulasUtilizadas,
                totalPesos,
                usosPorProduto,
                firstDayRange: (() => {
                    try {
                        const start = result.periodoInicio;
                        if (!start) return { date: null, firstTime: null, lastTime: null };
                        const rowsForStart = allRows.filter(r => r.Dia === start && r.Hora);
                        if (!rowsForStart.length) return { date: start, firstTime: null, lastTime: null };
                        const times = rowsForStart.map(r => r.Hora).sort();
                        return { date: start, firstTime: times[0], lastTime: times[times.length-1] };
                    } catch (e) { return { date: null, firstTime: null, lastTime: null }; }
                })(),
                lastDayRange: (() => {
                    try {
                        const end = result.periodoFim;
                        if (!end) return { date: null, firstTime: null, lastTime: null };
                        const rowsForEnd = allRows.filter(r => r.Dia === end && r.Hora);
                        if (!rowsForEnd.length) return { date: end, firstTime: null, lastTime: null };
                        const times = rowsForEnd.map(r => r.Hora).sort();
                        return { date: end, firstTime: times[0], lastTime: times[times.length-1] };
                    } catch (e) { return { date: null, firstTime: null, lastTime: null }; }
                })(),
                areaId: filtros.areaId,
                areaDescricao: areaInfo?.AreaDescricao || `Área ${filtros.areaId}`
            };
        }
        
        // Retornar formato padrão (inclui metadata para debugging)
        const baseResumo: ResumoTotal = {
            // totalRegistros: Number(result.totalRegistros) || 0,
            batitdasTotais: allRows.length,
            periodoInicio: result.periodoInicio,
            periodoFim: result.periodoFim,
            horaInicial: result.horaInicial,
            horaFinal: result.horaFinal,
            formulasUtilizadas,
            totalPesos,
            usosPorProduto,
            _appliedFilters: filtros || {},
            _matchedRows: allRows.length
        };

        // compute first/last day ranges
        try {
            const start = result.periodoInicio;
            const end = result.periodoFim;
            baseResumo.firstDayRange = start ? (() => {
                const rowsForStart = allRows.filter(r => r.Dia === start && r.Hora);
                if (!rowsForStart.length) return { date: start, firstTime: null, lastTime: null };
                const times = rowsForStart.map(r => r.Hora).sort();
                return { date: start, firstTime: times[0], lastTime: times[times.length-1] };
            })() : { date: null, firstTime: null, lastTime: null };

            baseResumo.lastDayRange = end ? (() => {
                const rowsForEnd = allRows.filter(r => r.Dia === end && r.Hora);
                if (!rowsForEnd.length) return { date: end, firstTime: null, lastTime: null };
                const times = rowsForEnd.map(r => r.Hora).sort();
                return { date: end, firstTime: times[0], lastTime: times[times.length-1] };
            })() : { date: null, firstTime: null, lastTime: null };
        } catch (e) {
            baseResumo.firstDayRange = { date: null, firstTime: null, lastTime: null };
            baseResumo.lastDayRange = { date: null, firstTime: null, lastTime: null };
        }

        return baseResumo;
    }

    /**
     * Processa um conjunto de relatórios para gerar um resumo
     * Processa dados do CSV
     */
    async processResumo(relatorios: Relatorio[], areaId?: string | null): Promise<ResumoTotal | ResumoAreaSelecionada> {
        if (!relatorios || relatorios.length === 0) {
            // Retornar resumo vazio
            const resumoVazio = {
                totalRegistros: 0,
                periodoInicio: null,
                periodoFim: null,
                formulasUtilizadas: {},
                totalPesos: 0,
                batitdasTotais: 0,
                horaInicial: null,
                horaFinal: null,
                usosPorProduto: {}
            };

            if (areaId) {
                return {
                    ...resumoVazio,
                    areaId,
                    areaDescricao: `Área ${areaId}`
                };
            }
            
            return resumoVazio;
        }

        // Filtrar por área se necessário
        let dadosFiltrados = relatorios;
        if (areaId) {
            dadosFiltrados = relatorios.filter(r => r.Area === areaId);
        }

        // Calcular métricas
        let periodoInicio: string | null = null;
        let periodoFim: string | null = null;
        let horaInicial: string | null = null;
        let horaFinal: string | null = null;
        let areaDescricao = '';
        
        // Calcular consumo total por produto e fórmulas
        const usosPorProduto: Record<string, { quantidade: number; label: string; unidade: string; }> = {};
        const formulasUtilizadas: Record<string, FormulaInfo> = {};
        let totalPesos = 0;

        // Buscar informações completas dos produtos da MateriaPrima para normalizar unidades (g->kg)
        const materiasPrimas = await materiaPrimaService.getAll();
        const infosProdutos: Record<string, { label: string; materia: MateriaPrima }> = {};
        for (const mp of materiasPrimas) {
            // ⚠️ Ignorar produtos desativados ou marcados para ignorar cálculos
            if (mp.num && mp.produto && mp.ativo !== false && mp.ignorarCalculos !== true) {
                infosProdutos[`Produto_${mp.num}`] = { label: mp.produto, materia: mp };
            }
        }

        for (const relatorio of dadosFiltrados) {
            // Contar fórmulas baseado no Nome (que é único para cada fórmula)
            if (relatorio.Nome && relatorio.Form1 != null) {
                const formulaKey = relatorio.Nome; // Usar o nome da fórmula como chave
                if (!formulasUtilizadas[formulaKey]) {
                    formulasUtilizadas[formulaKey] = { 
                        numero: relatorio.Form1, 
                        nome: relatorio.Nome,
                        quantidade: 0, 
                        porcentagem: 0,
                        somatoriaTotal: 0
                    };
                }
                formulasUtilizadas[formulaKey].quantidade++;
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

            // Horas
            if (relatorio.Hora) {
                if (!horaInicial || relatorio.Hora < horaInicial) {
                    horaInicial = relatorio.Hora;
                }
                if (!horaFinal || relatorio.Hora > horaFinal) {
                    horaFinal = relatorio.Hora;
                }
            }

            // Descrição da área (para o primeiro registro que corresponder)
            if (areaId && relatorio.Area === areaId && !areaDescricao && relatorio.AreaDescricao) {
                areaDescricao = relatorio.AreaDescricao;
            }
            
            // Calcular consumo de produtos (normalizando g->kg quando necessário)
            let rowTotalKg = 0;
            for (let i = 1; i <= 65; i++) {
                const prodValue = (relatorio as any)[`Prod_${i}`];
                const rawValue = typeof prodValue === 'number' ? prodValue : (prodValue != null ? Number(prodValue) : 0);

                if (rawValue > 0) {
                    const prodKey = `Produto_${i}`;
                    const info = infosProdutos[prodKey];
                    
                    // ⚠️ FILTRO: Se produto não está em infosProdutos, significa que está inativo - pular
                    if (!info) {
                        continue;
                    }
                    
                    // Skip products marked to ignore calculations
                    if (info && info.materia && info.materia.ignorarCalculos) {
                        continue; // Skip products marked to ignore calculations
                    }
                    const label = info ? info.label : `Produto ${i}`;
                    let unidade = 'kg';
                    let valueForTotalKg = rawValue;
                    let displayQuantity = rawValue;

                    if (info && info.materia) {
                        if (info.materia.medida === 0) {
                            // stored in grams in DB -> convert to kg for totals
                            valueForTotalKg = rawValue / 1000;
                            displayQuantity = rawValue; // keep grams for display
                            unidade = 'g';
                        } else {
                            valueForTotalKg = rawValue;
                            unidade = 'kg';
                        }
                    }

                    if (!usosPorProduto[prodKey]) {
                        usosPorProduto[prodKey] = { quantidade: 0, label, unidade };
                    }
                    usosPorProduto[prodKey].quantidade += displayQuantity;
                    totalPesos += valueForTotalKg;
                    rowTotalKg += valueForTotalKg;
                }
            }
            // After summing this relatorio's products, add to formula somatoriaTotal if applicable
            if (relatorio.Nome && relatorio.Form1 != null) {
                const fk = relatorio.Nome;
                if (formulasUtilizadas[fk]) {
                    formulasUtilizadas[fk].somatoriaTotal = (formulasUtilizadas[fk].somatoriaTotal || 0) + rowTotalKg;
                }
            }
        }

        // Calcular porcentagens das fórmulas
        const totalRegistros = dadosFiltrados.length;
        Object.values(formulasUtilizadas).forEach(formula => {
            formula.porcentagem = totalRegistros > 0 ? (formula.quantidade / totalRegistros) * 100 : 0;
        });

        // Resumo básico
        const resumo: ResumoTotal = {
            batitdasTotais: totalRegistros,
            periodoInicio,
            periodoFim,
            horaInicial,
            horaFinal,
            formulasUtilizadas,
            totalPesos,
            usosPorProduto
        };

        // Se for para área específica, adicionar info da área
        if (areaId) {
            return {
                ...resumo,
                areaId,
                areaDescricao: areaDescricao || `Área ${areaId}`
            };
        }

        return resumo;
    }
}

// Criar instância singleton
export const resumoService = new ResumoService();