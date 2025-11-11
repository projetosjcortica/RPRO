import { Amendoim } from "../entities/Amendoim";
import { parse } from "csv-parse/sync";
import { AppDataSource } from "./dbService";

/**
 * Service para processar arquivos CSV de amendoim.
 * Formato esperado: Data,Hora,,CódigoProduto,CódigoCaixa,NomeProduto,,,Peso,,Balanca
 * Exemplo: 10/11/25,14:15:03,,,1,456,Amendoim,,,2210,,1
 * Sistema suporta entrada (pré-debulhamento) e saída (pós-debulhamento)
 */
export class AmendoimService {
  /**
   * Processa um arquivo CSV de amendoim e salva no banco de dados.
   * @param csvContent Conteúdo do arquivo CSV como string
   * @param tipo Tipo de registro: 'entrada' (pré-debulhamento) ou 'saida' (pós-debulhamento)
   * @returns Número de registros processados e salvos
   */
  static async processarCSV(
    csvContent: string,
    tipo: "entrada" | "saida" = "entrada"
  ): Promise<{
    processados: number;
    salvos: number;
    erros: string[];
  }> {
    const erros: string[] = [];
    let processados = 0;
    let salvos = 0;

    try {
      // Parse CSV sem header
      const records = parse(csvContent, {
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
      });

      const repo = AppDataSource.getRepository(Amendoim);
      const registrosParaSalvar: Amendoim[] = [];

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        processados++;

        try {
          // Validar se a linha tem o mínimo de colunas necessárias
          if (!row || row.length < 10) {
            erros.push(`Linha ${i + 1}: Formato inválido (colunas insuficientes)`);
            continue;
          }

          // Formato novo: Data,Hora,Col2,Col3,CódigoProduto,CódigoCaixa,NomeProduto,Col7,Col8,Peso,Col10,Balanca
          // Exemplo: 10/11/25,14:15:03,,,1,456,Amendoim,,,2210,,1
          const [
            data,          // 0: Data (DD/MM/YY)
            hora,          // 1: Hora (HH:MM:SS)
            _col2,         // 2: Vazio
            _col3,         // 3: Vazio
            codigoProduto, // 4: Código do produto
            codigoCaixa,   // 5: Código da caixa
            nomeProduto,   // 6: Nome do produto
            _col7,         // 7: Vazio
            _col8,         // 8: Vazio
            peso,          // 9: Peso
            _col10,        // 10: Vazio
            balanca,       // 11: Identificador da balança
          ] = row;

          // Validações básicas
          const diaStr = String(data || "").trim();
          const horaStr = String(hora || "").trim();
          
          if (!diaStr || !horaStr) {
            erros.push(`Linha ${i + 1}: Data ou hora ausente`);
            continue;
          }

          // Validar se há produto (nome ou código)
          const hasProduto = nomeProduto && String(nomeProduto).trim() !== "";
          const hasCodigo = codigoProduto && String(codigoProduto).trim() !== "";
          
          if (!hasProduto && !hasCodigo) {
            // Linha sem produto, pular silenciosamente (pode ser teste da balança)
            continue;
          }

          if (!peso || isNaN(Number(peso))) {
            erros.push(`Linha ${i + 1}: Peso inválido (${peso})`);
            continue;
          }

          // Criar registro
          const registro = new Amendoim();
          registro.tipo = tipo; // Define o tipo (entrada ou saida)
          registro.dia = diaStr;
          registro.hora = horaStr;
          registro.codigoProduto = codigoProduto ? String(codigoProduto).trim() : "";
          registro.codigoCaixa = codigoCaixa ? String(codigoCaixa).trim() : "";
          
          // Log de debug: formato de data sendo salvo
          if (i === 0) {
            console.log(`[AmendoimService] 🔍 Formato de data SALVO: "${diaStr}" | Hora: "${horaStr}" | Tipo: ${tipo}`);
          }
          
          // Fallback para nome do produto vazio
          const nomeProcessado = nomeProduto ? String(nomeProduto).trim() : "";
          registro.nomeProduto = nomeProcessado || "Sem nome";
          
          registro.peso = Number(peso);
          registro.balanca = balanca ? String(balanca).trim() : undefined;

          registrosParaSalvar.push(registro);
        } catch (err: any) {
          erros.push(`Linha ${i + 1}: ${err.message}`);
        }
      }

      // Salvar em lote com PROTEÇÃO TRIPLA contra duplicatas
      if (registrosParaSalvar.length > 0) {
        console.log(`[AmendoimService] 🛡️ Iniciando proteção anti-duplicatas para ${registrosParaSalvar.length} registros...`);
        
        // PROTEÇÃO NÍVEL 1: Verificação por hash único composto
        // Gera hash MD5 de: tipo+dia+hora+codigoProduto+peso
        const crypto = require('crypto');
        const hashMap = new Map<string, Amendoim>();
        
        for (const registro of registrosParaSalvar) {
          const hashKey = crypto
            .createHash('md5')
            .update(`${registro.tipo}|${registro.dia}|${registro.hora}|${registro.codigoProduto}|${registro.peso}`)
            .digest('hex');
          
          // Só adiciona se não existir hash duplicado no próprio lote
          if (!hashMap.has(hashKey)) {
            hashMap.set(hashKey, registro);
          }
        }
        
        const registrosSemDuplicatasInternas = Array.from(hashMap.values());
        const duplicatasInternas = registrosParaSalvar.length - registrosSemDuplicatasInternas.length;
        
        if (duplicatasInternas > 0) {
          console.log(`[AmendoimService] ⚠️ PROTEÇÃO NÍVEL 1: ${duplicatasInternas} duplicatas encontradas no próprio lote`);
        }

        // PROTEÇÃO NÍVEL 2: Verificação no banco de dados
        // Busca registros que correspondam aos critérios únicos
        const existentes = await repo
          .createQueryBuilder("amendoim")
          .where(
            registrosSemDuplicatasInternas
              .map((_, idx) => 
                `(amendoim.tipo = :tipo${idx} AND amendoim.dia = :dia${idx} AND amendoim.hora = :hora${idx} AND amendoim.codigoProduto = :codigoProduto${idx} AND amendoim.peso = :peso${idx})`
              )
              .join(" OR ")
          )
          .setParameters(
            registrosSemDuplicatasInternas.reduce((params, r, idx) => {
              params[`tipo${idx}`] = r.tipo;
              params[`dia${idx}`] = r.dia;
              params[`hora${idx}`] = r.hora;
              params[`codigoProduto${idx}`] = r.codigoProduto;
              params[`peso${idx}`] = r.peso;
              return params;
            }, {} as any)
          )
          .getMany();

        // Filtrar apenas registros verdadeiramente novos
        const registrosNovos = registrosSemDuplicatasInternas.filter(novo => {
          return !existentes.some(existente => 
            existente.dia === novo.dia &&
            existente.hora === novo.hora &&
            existente.tipo === novo.tipo &&
            existente.peso === novo.peso &&
            existente.codigoProduto === novo.codigoProduto
          );
        });

        const duplicatasDB = registrosSemDuplicatasInternas.length - registrosNovos.length;
        
        if (duplicatasDB > 0) {
          console.log(`[AmendoimService] ⚠️ PROTEÇÃO NÍVEL 2: ${duplicatasDB} duplicatas já existem no banco de dados`);
        }

        // PROTEÇÃO NÍVEL 3: Save com tratamento de erro de constraint unique
        if (registrosNovos.length > 0) {
          try {
            await repo.save(registrosNovos);
            salvos = registrosNovos.length;
            console.log(`[AmendoimService] ✅ ${salvos} registros salvos com sucesso`);
          } catch (err: any) {
            // Se houver erro de constraint unique, tentar salvar um por um
            if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('unique')) {
              console.log(`[AmendoimService] ⚠️ PROTEÇÃO NÍVEL 3: Detectado conflito unique, salvando individualmente...`);
              
              for (const registro of registrosNovos) {
                try {
                  await repo.save(registro);
                  salvos++;
                } catch (saveErr: any) {
                  if (saveErr.code === 'ER_DUP_ENTRY' || saveErr.message?.includes('unique')) {
                    // Duplicata detectada, ignorar silenciosamente
                    continue;
                  }
                  // Outro erro, registrar
                  erros.push(`Erro ao salvar registro: ${saveErr.message}`);
                }
              }
              
              console.log(`[AmendoimService] ✅ ${salvos} registros salvos individualmente (${registrosNovos.length - salvos} duplicatas bloqueadas por constraint)`);
            } else {
              throw err; // Re-throw se não for erro de duplicata
            }
          }
          
          const totalDuplicatas = duplicatasInternas + duplicatasDB + (registrosNovos.length - salvos);
          if (totalDuplicatas > 0) {
            console.log(`[AmendoimService] 🛡️ TOTAL DE DUPLICATAS BLOQUEADAS: ${totalDuplicatas}`);
          }
        } else {
          console.log(`[AmendoimService] ℹ️ Todos os ${registrosParaSalvar.length} registros já existem (100% duplicados)`);
        }
      }

      return { processados, salvos, erros };
    } catch (err: any) {
      throw new Error(`Erro ao processar CSV: ${err.message}`);
    }
  }

  /**
   * Busca registros de amendoim com paginação e filtros.
   */
  static async buscarRegistros(params: {
    page?: number;
    pageSize?: number;
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    nomeProduto?: string;
    tipo?: "entrada" | "saida";
  }): Promise<{
    rows: Amendoim[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const page = params.page || 1;
    const pageSize = params.pageSize || 100;

    const qb = repo.createQueryBuilder("amendoim");

    // Filtros
    if (params.tipo) {
      qb.andWhere("amendoim.tipo = :tipo", { tipo: params.tipo });
    }

    if (params.dataInicio) {
      // Converter formato YYYY-MM-DD para DD-MM-YY antes de comparar
      const dataInicioDB = this.convertDateToDBFormat(params.dataInicio);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    }

    if (params.dataFim) {
      // Converter formato YYYY-MM-DD para DD-MM-YY antes de comparar
      const dataFimDB = this.convertDateToDBFormat(params.dataFim);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });
    }

    if (params.codigoProduto) {
      qb.andWhere("amendoim.codigoProduto = :codigoProduto", {
        codigoProduto: params.codigoProduto,
      });
    }

    if (params.nomeProduto) {
      qb.andWhere("amendoim.nomeProduto LIKE :nomeProduto", {
        nomeProduto: `%${params.nomeProduto}%`,
      });
    }

    // Ordenação usando conversão de data (DD-MM-YY -> data real)
    qb.orderBy("STR_TO_DATE(amendoim.dia, '%d-%m-%y')", "DESC");
    qb.addOrderBy("amendoim.hora", "DESC");

    // Paginação
    const total = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return { rows, total, page, pageSize };
  }

  /**
   * Retorna estatísticas dos registros de amendoim.
   */
  static async obterEstatisticas(params: {
    dataInicio?: string;
    dataFim?: string;
    tipo?: "entrada" | "saida";
    codigoProduto?: string;
    nomeProduto?: string;
  }): Promise<{
    totalRegistros: number;
    pesoTotal: number;
    produtosUnicos: number;
    caixasUtilizadas: number;
    primeiraData?: string;
    ultimaData?: string;
    primeiraHora?: string;
    ultimaHora?: string;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("amendoim");

    if (params.tipo) {
      qb.andWhere("amendoim.tipo = :tipo", { tipo: params.tipo });
    }

    if (params.dataInicio) {
      const dataInicioDB = this.convertDateToDBFormat(params.dataInicio);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    }

    if (params.dataFim) {
      const dataFimDB = this.convertDateToDBFormat(params.dataFim);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });
    }

    if (params.codigoProduto) {
      qb.andWhere("amendoim.codigoProduto LIKE :codigoProduto", {
        codigoProduto: `%${params.codigoProduto}%`,
      });
    }

    if (params.nomeProduto) {
      qb.andWhere("amendoim.nomeProduto LIKE :nomeProduto", {
        nomeProduto: `%${params.nomeProduto}%`,
      });
    }

    const totalRegistros = await qb.getCount();

    const pesoResult = await qb
      .select("SUM(amendoim.peso)", "total")
      .getRawOne();

    const produtosResult = await qb
      .select("COUNT(DISTINCT amendoim.codigoProduto)", "count")
      .getRawOne();

    const caixasResult = await qb
      .select("COUNT(DISTINCT amendoim.codigoCaixa)", "count")
      .getRawOne();

    // Buscar primeira e última data/hora
    const primeiroRegistro = await qb
      .clone()
      .orderBy("STR_TO_DATE(amendoim.dia, '%d-%m-%y')", "ASC")
      .addOrderBy("amendoim.hora", "ASC")
      .select(["amendoim.dia", "amendoim.hora"])
      .limit(1)
      .getOne();

    const ultimoRegistro = await qb
      .clone()
      .orderBy("STR_TO_DATE(amendoim.dia, '%d-%m-%y')", "DESC")
      .addOrderBy("amendoim.hora", "DESC")
      .select(["amendoim.dia", "amendoim.hora"])
      .limit(1)
      .getOne();

    return {
      totalRegistros,
      pesoTotal: Number(pesoResult?.total || 0),
      produtosUnicos: Number(produtosResult?.count || 0),
      caixasUtilizadas: Number(caixasResult?.count || 0),
      primeiraData: primeiroRegistro?.dia,
      ultimaData: ultimoRegistro?.dia,
      primeiraHora: primeiroRegistro?.hora,
      ultimaHora: ultimoRegistro?.hora,
    };
  }

  /**
   * Converte data de YYYY-MM-DD para DD-MM-YY (formato do banco)
   */
  private static convertDateToDBFormat(dateStr: string): string {
    // Se já está em formato DD-MM-YY, retornar como está
    if (/^\d{2}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Converter YYYY-MM-DD para DD-MM-YY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      const shortYear = year.slice(-2);
      return `${day}-${month}-${shortYear}`;
    }
    
    return dateStr;
  }

  /**
   * Retorna dados de análise pré-processados para gráficos.
   * Robusto e tolerante a falhas - sempre retorna estrutura completa mesmo sem dados.
   */
  static async obterDadosAnalise(params: {
    dataInicio?: string;
    dataFim?: string;
  }): Promise<{
    entradaSaidaPorHorario: Array<{ hora: number; entrada: number; saida: number }>;
    rendimentoPorDia: Array<{ dia: string; entrada: number; saida: number; rendimento: number }>;
    fluxoSemanal: Array<{ diaSemana: string; entrada: number; saida: number }>;
    eficienciaPorTurno: Array<{ turno: string; entrada: number; saida: number; rendimento: number }>;
    perdaAcumulada: Array<{ dia: string; perdaDiaria: number; perdaAcumulada: number }>;
  }> {
    try {
      const repo = AppDataSource.getRepository(Amendoim);

      // Verificar se há dados no banco antes de processar
      const totalRegistros = await repo.count();
      if (totalRegistros === 0) {
        console.log('[AmendoimService.obterDadosAnalise] Sem registros no banco, retornando estrutura vazia');
        return this.getEmptyAnaliseStructure();
      }

      // Converter datas para formato do banco (DD-MM-YY)
      const dataInicioDB = params.dataInicio ? this.convertDateToDBFormat(params.dataInicio) : undefined;
      const dataFimDB = params.dataFim ? this.convertDateToDBFormat(params.dataFim) : undefined;

      console.log('[AmendoimService.obterDadosAnalise] Filtros recebidos:', params);
      console.log('[AmendoimService.obterDadosAnalise] Filtros convertidos:', { dataInicioDB, dataFimDB });

    // Query para dados agrupados por hora (compatível MySQL e SQLite)
    let qbHora = repo.createQueryBuilder("amendoim")
      .select("CAST(SUBSTR(amendoim.hora, 1, 2) AS UNSIGNED)", "hora")
      .addSelect("amendoim.tipo", "tipo")
      .addSelect("SUM(amendoim.peso)", "peso");

    if (dataInicioDB) qbHora.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    if (dataFimDB) qbHora.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });

    const dadosHora = await qbHora.groupBy("hora, amendoim.tipo").getRawMany();
    console.log('[AmendoimService.obterDadosAnalise] dadosHora resultado:', dadosHora.length, 'registros');
    if (dadosHora.length > 0) console.log('[AmendoimService.obterDadosAnalise] dadosHora sample:', dadosHora.slice(0, 3));

    // Query para dados agrupados por dia
    let qbDia = repo.createQueryBuilder("amendoim")
      .select("amendoim.dia", "dia")
      .addSelect("amendoim.tipo", "tipo")
      .addSelect("SUM(amendoim.peso)", "peso");

    if (dataInicioDB) qbDia.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    if (dataFimDB) qbDia.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });

    const dadosDia = await qbDia.groupBy("amendoim.dia, amendoim.tipo").orderBy("amendoim.dia", "ASC").getRawMany();

    // Query para dia da semana (MySQL: DAYOFWEEK 1=domingo, 2=segunda, ...)
    // Converte DD-MM-YY para data válida usando STR_TO_DATE
    let qbSemana = repo.createQueryBuilder("amendoim")
      .select("DAYOFWEEK(STR_TO_DATE(amendoim.dia, '%d-%m-%y')) - 1", "diaSemana")
      .addSelect("amendoim.tipo", "tipo")
      .addSelect("SUM(amendoim.peso)", "peso");

    if (dataInicioDB) qbSemana.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    if (dataFimDB) qbSemana.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });

    const dadosSemana = await qbSemana.groupBy("diaSemana, amendoim.tipo").getRawMany();

    // Processar dados por horário (0-23)
    const entradaSaidaPorHorario: Array<{ hora: number; entrada: number; saida: number }> = [];
    for (let h = 0; h < 24; h++) {
      const entrada = dadosHora.find((d: any) => d.hora === h && d.tipo === "entrada")?.peso || 0;
      const saida = dadosHora.find((d: any) => d.hora === h && d.tipo === "saida")?.peso || 0;
      entradaSaidaPorHorario.push({ hora: h, entrada: Number(entrada), saida: Number(saida) });
    }

    // Processar dados por dia
    const diasUnicos = [...new Set(dadosDia.map((d: any) => d.dia))].sort();
    const rendimentoPorDia: Array<{ dia: string; entrada: number; saida: number; rendimento: number }> = [];
    const perdaAcumulada: Array<{ dia: string; perdaDiaria: number; perdaAcumulada: number }> = [];
    let perdaTotal = 0;

    diasUnicos.forEach((dia) => {
      const entrada = Number(dadosDia.find((d: any) => d.dia === dia && d.tipo === "entrada")?.peso || 0);
      const saida = Number(dadosDia.find((d: any) => d.dia === dia && d.tipo === "saida")?.peso || 0);
      const rendimento = entrada > 0 ? (saida / entrada) * 100 : 0;
      const perdaDiaria = entrada - saida;
      perdaTotal += perdaDiaria;

      rendimentoPorDia.push({ dia, entrada, saida, rendimento: Number(rendimento.toFixed(2)) });
      perdaAcumulada.push({ dia, perdaDiaria: Number(perdaDiaria.toFixed(2)), perdaAcumulada: Number(perdaTotal.toFixed(2)) });
    });

    // Processar dados por dia da semana
    const diasSemanaLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const fluxoSemanal: Array<{ diaSemana: string; entrada: number; saida: number }> = [];
    for (let d = 0; d < 7; d++) {
      const entrada = dadosSemana.find((s: any) => s.diaSemana === d && s.tipo === "entrada")?.peso || 0;
      const saida = dadosSemana.find((s: any) => s.diaSemana === d && s.tipo === "saida")?.peso || 0;
      fluxoSemanal.push({ diaSemana: diasSemanaLabels[d], entrada: Number(entrada), saida: Number(saida) });
    }

    // Processar por turno (baseado na hora)
    const turnos = [
      { nome: "Madrugada", inicio: 0, fim: 5 },
      { nome: "Manhã", inicio: 6, fim: 11 },
      { nome: "Tarde", inicio: 12, fim: 17 },
      { nome: "Noite", inicio: 18, fim: 23 },
    ];
    const eficienciaPorTurno: Array<{ turno: string; entrada: number; saida: number; rendimento: number }> = [];
    
    turnos.forEach(({ nome, inicio, fim }) => {
      let entrada = 0, saida = 0;
      for (let h = inicio; h <= fim; h++) {
        entrada += Number(dadosHora.find((d: any) => d.hora === h && d.tipo === "entrada")?.peso || 0);
        saida += Number(dadosHora.find((d: any) => d.hora === h && d.tipo === "saida")?.peso || 0);
      }
      const rendimento = entrada > 0 ? (saida / entrada) * 100 : 0;
      eficienciaPorTurno.push({ turno: nome, entrada, saida, rendimento: Number(rendimento.toFixed(2)) });
    });

      return {
        entradaSaidaPorHorario,
        rendimentoPorDia,
        fluxoSemanal,
        eficienciaPorTurno,
        perdaAcumulada,
      };
    } catch (error) {
      console.error('[AmendoimService.obterDadosAnalise] Erro ao processar:', error);
      return this.getEmptyAnaliseStructure();
    }
  }

  /**
   * Retorna estrutura vazia para análise quando não há dados ou ocorre erro.
   */
  private static getEmptyAnaliseStructure() {
    const entradaSaidaPorHorario: Array<{ hora: number; entrada: number; saida: number }> = [];
    for (let h = 0; h < 24; h++) {
      entradaSaidaPorHorario.push({ hora: h, entrada: 0, saida: 0 });
    }

    const diasSemanaLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const fluxoSemanal = diasSemanaLabels.map(dia => ({ diaSemana: dia, entrada: 0, saida: 0 }));

    const eficienciaPorTurno = [
      { turno: "Madrugada", entrada: 0, saida: 0, rendimento: 0 },
      { turno: "Manhã", entrada: 0, saida: 0, rendimento: 0 },
      { turno: "Tarde", entrada: 0, saida: 0, rendimento: 0 },
      { turno: "Noite", entrada: 0, saida: 0, rendimento: 0 },
    ];

    return {
      entradaSaidaPorHorario,
      rendimentoPorDia: [],
      fluxoSemanal,
      eficienciaPorTurno,
      perdaAcumulada: [],
    };
  }

  /**
   * Calcula métricas de rendimento (entrada vs saída).
   */
  static async calcularMetricasRendimento(params: {
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    nomeProduto?: string;
  }): Promise<{
    pesoEntrada: number;
    pesoSaida: number;
    rendimentoPercentual: number;
    perda: number;
    perdaPercentual: number;
    primeiraData?: string;
    ultimaData?: string;
    primeiraHora?: string;
    ultimaHora?: string;
  } | null> {
    const repo = AppDataSource.getRepository(Amendoim);

    // Buscar peso de entrada
    const qbEntrada = repo.createQueryBuilder("amendoim");
    qbEntrada.andWhere("amendoim.tipo = :tipo", { tipo: "entrada" });
    
    if (params.dataInicio) {
      const dataInicioDB = this.convertDateToDBFormat(params.dataInicio);
      qbEntrada.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    }
    if (params.dataFim) {
      const dataFimDB = this.convertDateToDBFormat(params.dataFim);
      qbEntrada.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });
    }
    if (params.codigoProduto) {
      qbEntrada.andWhere("amendoim.codigoProduto LIKE :codigoProduto", {
        codigoProduto: `%${params.codigoProduto}%`,
      });
    }
    if (params.nomeProduto) {
      qbEntrada.andWhere("amendoim.nomeProduto LIKE :nomeProduto", {
        nomeProduto: `%${params.nomeProduto}%`,
      });
    }

    const entradaResult = await qbEntrada
      .select("SUM(amendoim.peso)", "total")
      .getRawOne();
    const pesoEntrada = Number(entradaResult?.total || 0);

    // Buscar peso de saída
    const qbSaida = repo.createQueryBuilder("amendoim");
    qbSaida.andWhere("amendoim.tipo = :tipo", { tipo: "saida" });
    
    if (params.dataInicio) {
      const dataInicioDB = this.convertDateToDBFormat(params.dataInicio);
      qbSaida.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    }
    if (params.dataFim) {
      const dataFimDB = this.convertDateToDBFormat(params.dataFim);
      qbSaida.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });
    }
    if (params.codigoProduto) {
      qbSaida.andWhere("amendoim.codigoProduto LIKE :codigoProduto", {
        codigoProduto: `%${params.codigoProduto}%`,
      });
    }
    if (params.nomeProduto) {
      qbSaida.andWhere("amendoim.nomeProduto LIKE :nomeProduto", {
        nomeProduto: `%${params.nomeProduto}%`,
      });
    }

    const saidaResult = await qbSaida
      .select("SUM(amendoim.peso)", "total")
      .getRawOne();
    const pesoSaida = Number(saidaResult?.total || 0);

    // Buscar primeira e última data/hora de TODO o período (entrada + saída)
    const qbPeriodo = repo.createQueryBuilder("amendoim");
    
    if (params.dataInicio) {
      const dataInicioDB = this.convertDateToDBFormat(params.dataInicio);
      qbPeriodo.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    }
    if (params.dataFim) {
      const dataFimDB = this.convertDateToDBFormat(params.dataFim);
      qbPeriodo.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });
    }
    if (params.codigoProduto) {
      qbPeriodo.andWhere("amendoim.codigoProduto LIKE :codigoProduto", {
        codigoProduto: `%${params.codigoProduto}%`,
      });
    }
    if (params.nomeProduto) {
      qbPeriodo.andWhere("amendoim.nomeProduto LIKE :nomeProduto", {
        nomeProduto: `%${params.nomeProduto}%`,
      });
    }

    const primeiroRegistro = await qbPeriodo
      .clone()
      .orderBy("STR_TO_DATE(amendoim.dia, '%d-%m-%y')", "ASC")
      .addOrderBy("amendoim.hora", "ASC")
      .select(["amendoim.dia", "amendoim.hora"])
      .limit(1)
      .getOne();

    const ultimoRegistro = await qbPeriodo
      .clone()
      .orderBy("STR_TO_DATE(amendoim.dia, '%d-%m-%y')", "DESC")
      .addOrderBy("amendoim.hora", "DESC")
      .select(["amendoim.dia", "amendoim.hora"])
      .limit(1)
      .getOne();

    // Calcular métricas
    const perda = pesoEntrada - pesoSaida;
    const rendimentoPercentual = pesoEntrada > 0 ? (pesoSaida / pesoEntrada) * 100 : 0;
    const perdaPercentual = pesoEntrada > 0 ? (perda / pesoEntrada) * 100 : 0;

    // Retornar null se não houver dados suficientes (entrada e saída zerados)
    if (pesoEntrada === 0 && pesoSaida === 0) {
      return null as any;
    }

    return {
      pesoEntrada,
      pesoSaida,
      rendimentoPercentual: Number(rendimentoPercentual.toFixed(2)),
      perda,
      perdaPercentual: Number(perdaPercentual.toFixed(2)),
      primeiraData: primeiroRegistro?.dia,
      ultimaData: ultimoRegistro?.dia,
      primeiraHora: primeiroRegistro?.hora,
      ultimaHora: ultimoRegistro?.hora,
    };
  }

  /**
   * Retorna dados para gráfico de produtos (top produtos por peso).
   */
  static async getChartDataProdutos(params: {
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    tipo?: "entrada" | "saida";
    limit?: number;
  }): Promise<{
    chartData: Array<{ name: string; value: number; count: number }>;
    total: number;
    totalRecords: number;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("amendoim");

    // Filtros
    if (params.tipo) {
      qb.andWhere("amendoim.tipo = :tipo", { tipo: params.tipo });
    }

    if (params.dataInicio) {
      const dataInicioDB = this.convertDateToDBFormat(params.dataInicio);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    }

    if (params.dataFim) {
      const dataFimDB = this.convertDateToDBFormat(params.dataFim);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });
    }

    if (params.codigoProduto) {
      qb.andWhere("amendoim.codigoProduto = :codigoProduto", {
        codigoProduto: params.codigoProduto,
      });
    }

    // Agregar por produto
    const results = await qb
      .select("amendoim.nomeProduto", "name")
      .addSelect("SUM(amendoim.peso)", "value")
      .addSelect("COUNT(*)", "count")
      .groupBy("amendoim.nomeProduto")
      .orderBy("value", "DESC")
      .limit(params.limit || 20)
      .getRawMany();

    // Total geral
    const totalResult = await repo
      .createQueryBuilder("amendoim")
      .select("SUM(amendoim.peso)", "total")
      .addSelect("COUNT(*)", "count")
      .getRawOne();

    return {
      chartData: results.map((r) => ({
        name: r.name || "Sem nome",
        value: Number(r.value || 0),
        count: Number(r.count || 0),
      })),
      total: Number(totalResult?.total || 0),
      totalRecords: Number(totalResult?.count || 0),
    };
  }

  /**
   * Retorna dados para gráfico de caixas (distribuição por caixa).
   */
  static async getChartDataCaixas(params: {
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    tipo?: "entrada" | "saida";
    limit?: number;
  }): Promise<{
    chartData: Array<{ name: string; value: number; count: number }>;
    total: number;
    totalRecords: number;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("amendoim");

    // Filtros
    if (params.tipo) {
      qb.andWhere("amendoim.tipo = :tipo", { tipo: params.tipo });
    }

    if (params.dataInicio) {
      const dataInicioDB = this.convertDateToDBFormat(params.dataInicio);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    }

    if (params.dataFim) {
      const dataFimDB = this.convertDateToDBFormat(params.dataFim);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });
    }

    if (params.codigoProduto) {
      qb.andWhere("amendoim.codigoProduto = :codigoProduto", {
        codigoProduto: params.codigoProduto,
      });
    }

    // Agregar por caixa
    const results = await qb
      .select("amendoim.codigoCaixa", "name")
      .addSelect("SUM(amendoim.peso)", "value")
      .addSelect("COUNT(*)", "count")
      .groupBy("amendoim.codigoCaixa")
      .orderBy("value", "DESC")
      .limit(params.limit || 20)
      .getRawMany();

    // Total geral
    const totalResult = await repo
      .createQueryBuilder("amendoim")
      .select("SUM(amendoim.peso)", "total")
      .addSelect("COUNT(*)", "count")
      .getRawOne();

    return {
      chartData: results.map((r) => ({
        name: `Caixa ${r.name || "?"}`,
        value: Number(r.value || 0),
        count: Number(r.count || 0),
      })),
      total: Number(totalResult?.total || 0),
      totalRecords: Number(totalResult?.count || 0),
    };
  }

  /**
   * Retorna dados para gráfico de horários (distribuição por hora do dia).
   */
  static async getChartDataHorarios(params: {
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    tipo?: "entrada" | "saida";
  }): Promise<{
    chartData: Array<{ name: string; value: number; count: number; average: number }>;
    total: number;
    totalRecords: number;
    peakHour: string;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("amendoim");

    // Filtros
    if (params.tipo) {
      qb.andWhere("amendoim.tipo = :tipo", { tipo: params.tipo });
    }

    if (params.dataInicio) {
      const dataInicioDB = this.convertDateToDBFormat(params.dataInicio);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') >= STR_TO_DATE(:dataInicio, '%d-%m-%y')", { dataInicio: dataInicioDB });
    }

    if (params.dataFim) {
      const dataFimDB = this.convertDateToDBFormat(params.dataFim);
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d-%m-%y') <= STR_TO_DATE(:dataFim, '%d-%m-%y')", { dataFim: dataFimDB });
    }

    if (params.codigoProduto) {
      qb.andWhere("amendoim.codigoProduto = :codigoProduto", {
        codigoProduto: params.codigoProduto,
      });
    }

    // Buscar todos os registros e agrupar por hora no código
    const allRecords = await qb.select(["amendoim.hora", "amendoim.peso"]).getRawMany();

    // Agrupar por hora (extrair primeira parte HH)
    const hourGroups: Record<string, { total: number; count: number }> = {};

    allRecords.forEach((record) => {
      const hora = String(record.amendoim_hora || "").substring(0, 2);
      if (!hora || hora.length < 2) return;

      const hour = `${hora}h`;
      if (!hourGroups[hour]) {
        hourGroups[hour] = { total: 0, count: 0 };
      }

      hourGroups[hour].total += Number(record.amendoim_peso || 0);
      hourGroups[hour].count += 1;
    });

    // Converter para array e ordenar
    const chartData = Object.entries(hourGroups)
      .map(([name, data]) => ({
        name,
        value: data.total,
        count: data.count,
        average: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => {
        const hourA = parseInt(a.name.replace("h", ""));
        const hourB = parseInt(b.name.replace("h", ""));
        return hourA - hourB;
      });

    // Horário de pico
    const peakHour =
      chartData.reduce((max, curr) => (curr.value > max.value ? curr : max), chartData[0])?.name ||
      "N/A";

    // Total geral
    const totalResult = await repo
      .createQueryBuilder("amendoim")
      .select("SUM(amendoim.peso)", "total")
      .addSelect("COUNT(*)", "count")
      .getRawOne();

    return {
      chartData,
      total: Number(totalResult?.total || 0),
      totalRecords: Number(totalResult?.count || 0),
      peakHour,
    };
  }
}
