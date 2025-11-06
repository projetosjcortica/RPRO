import { Amendoim } from "../entities/Amendoim";
import { parse } from "csv-parse/sync";
import { AppDataSource } from "./dbService";

/**
 * Service para processar arquivos CSV de amendoim.
 * Formato esperado: Dia, Hora, ?, Código Produto, Código Caixa, Nome Produto, ?, ?, Peso
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

          const [
            dataHora,      // 0: Data e Hora juntas (DD-MM-YY HH:MM:SS)
            _col1,         // 1: Irrelevante
            codigoProduto, // 2: Código do produto
            codigoCaixa,   // 3: Código da caixa
            nomeProduto,   // 4: Nome do produto
            _col5,         // 5: Irrelevante
            _col6,         // 6: Irrelevante
            peso,          // 7: Peso
            _col8,         // 8: Irrelevante
            balanca,       // 9: Identificador da balança
          ] = row;

          // Separar data e hora
          const dataHoraStr = String(dataHora || "").trim();
          const partes = dataHoraStr.split(" ");
          
          if (partes.length < 2) {
            erros.push(`Linha ${i + 1}: Formato de data/hora inválido (${dataHoraStr})`);
            continue;
          }

          const dia = partes[0]; // DD-MM-YY
          const hora = partes[1]; // HH:MM:SS

          // Validações básicas
          if (!dia || !hora) {
            erros.push(`Linha ${i + 1}: Data ou hora ausente`);
            continue;
          }

          if (!codigoProduto || !nomeProduto) {
            erros.push(`Linha ${i + 1}: Código ou nome do produto ausente`);
            continue;
          }

          if (!peso || isNaN(Number(peso))) {
            erros.push(`Linha ${i + 1}: Peso inválido (${peso})`);
            continue;
          }

          // Criar registro
          const registro = new Amendoim();
          registro.tipo = tipo; // Define o tipo (entrada ou saida)
          registro.dia = dia.trim();
          registro.hora = hora.trim();
          registro.codigoProduto = String(codigoProduto).trim();
          registro.codigoCaixa = String(codigoCaixa || "").trim();
          registro.nomeProduto = String(nomeProduto).trim();
          registro.peso = Number(peso);
          registro.balanca = balanca ? String(balanca).trim() : undefined;

          registrosParaSalvar.push(registro);
        } catch (err: any) {
          erros.push(`Linha ${i + 1}: ${err.message}`);
        }
      }

      // Salvar em lote
      if (registrosParaSalvar.length > 0) {
        await repo.save(registrosParaSalvar);
        salvos = registrosParaSalvar.length;
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

    // Ordenação
    qb.orderBy("amendoim.dia", "DESC");
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
  }): Promise<{
    totalRegistros: number;
    pesoTotal: number;
    produtosUnicos: number;
    caixasUtilizadas: number;
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

    return {
      totalRegistros,
      pesoTotal: Number(pesoResult?.total || 0),
      produtosUnicos: Number(produtosResult?.count || 0),
      caixasUtilizadas: Number(caixasResult?.count || 0),
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
  }): Promise<{
    pesoEntrada: number;
    pesoSaida: number;
    rendimentoPercentual: number;
    perda: number;
    perdaPercentual: number;
  }> {
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

    const saidaResult = await qbSaida
      .select("SUM(amendoim.peso)", "total")
      .getRawOne();
    const pesoSaida = Number(saidaResult?.total || 0);

    // Calcular métricas
    const perda = pesoEntrada - pesoSaida;
    const rendimentoPercentual = pesoEntrada > 0 ? (pesoSaida / pesoEntrada) * 100 : 0;
    const perdaPercentual = pesoEntrada > 0 ? (perda / pesoEntrada) * 100 : 0;

    return {
      pesoEntrada,
      pesoSaida,
      rendimentoPercentual: Number(rendimentoPercentual.toFixed(2)),
      perda,
      perdaPercentual: Number(perdaPercentual.toFixed(2)),
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
        name: r.name || "Desconhecido",
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
