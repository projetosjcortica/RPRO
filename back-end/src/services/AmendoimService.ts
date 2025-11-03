import { Amendoim } from "../entities/Amendoim";
import { parse } from "csv-parse/sync";
import { AppDataSource } from "./dbService";

/**
 * Service para processar arquivos CSV de amendoim.
 * Formato esperado: Dia, Hora, ?, Código Produto, Código Caixa, Nome Produto, ?, ?, Peso, ?, Número Balança
 */
export class AmendoimService {
  /**
   * Processa um arquivo CSV de amendoim e salva no banco de dados.
   * @param csvContent Conteúdo do arquivo CSV como string
   * @returns Número de registros processados e salvos
   */
  static async processarCSV(csvContent: string): Promise<{
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
            numeroBalanca, // 9: Número da balança
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
          registro.dia = dia.trim();
          registro.hora = hora.trim();
          registro.codigoProduto = String(codigoProduto).trim();
          registro.codigoCaixa = String(codigoCaixa || "").trim();
          registro.nomeProduto = String(nomeProduto).trim();
          registro.peso = Number(peso);
          registro.numeroBalanca = String(numeroBalanca || "").trim();

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
    if (params.dataInicio) {
      qb.andWhere("amendoim.dia >= :dataInicio", { dataInicio: params.dataInicio });
    }

    if (params.dataFim) {
      qb.andWhere("amendoim.dia <= :dataFim", { dataFim: params.dataFim });
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
  }): Promise<{
    totalRegistros: number;
    pesoTotal: number;
    produtosUnicos: number;
    balancasUtilizadas: number;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("amendoim");

    if (params.dataInicio) {
      qb.andWhere("amendoim.dia >= :dataInicio", { dataInicio: params.dataInicio });
    }

    if (params.dataFim) {
      qb.andWhere("amendoim.dia <= :dataFim", { dataFim: params.dataFim });
    }

    const totalRegistros = await qb.getCount();

    const pesoResult = await qb
      .select("SUM(amendoim.peso)", "total")
      .getRawOne();

    const produtosResult = await qb
      .select("COUNT(DISTINCT amendoim.codigoProduto)", "count")
      .getRawOne();

    const balancasResult = await qb
      .select("COUNT(DISTINCT amendoim.numeroBalanca)", "count")
      .getRawOne();

    return {
      totalRegistros,
      pesoTotal: Number(pesoResult?.total || 0),
      produtosUnicos: Number(produtosResult?.count || 0),
      balancasUtilizadas: Number(balancasResult?.count || 0),
    };
  }

  /**
   * Retorna dados para gráfico de produtos (top produtos por peso).
   */
  static async getChartDataProdutos(params: {
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    limit?: number;
  }): Promise<{
    chartData: Array<{ name: string; value: number; count: number }>;
    total: number;
    totalRecords: number;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("amendoim");

    // Filtros
    if (params.dataInicio) {
      qb.andWhere("amendoim.dia >= :dataInicio", { dataInicio: params.dataInicio });
    }

    if (params.dataFim) {
      qb.andWhere("amendoim.dia <= :dataFim", { dataFim: params.dataFim });
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
    limit?: number;
  }): Promise<{
    chartData: Array<{ name: string; value: number; count: number }>;
    total: number;
    totalRecords: number;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("amendoim");

    // Filtros
    if (params.dataInicio) {
      qb.andWhere("amendoim.dia >= :dataInicio", { dataInicio: params.dataInicio });
    }

    if (params.dataFim) {
      qb.andWhere("amendoim.dia <= :dataFim", { dataFim: params.dataFim });
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
  }): Promise<{
    chartData: Array<{ name: string; value: number; count: number; average: number }>;
    total: number;
    totalRecords: number;
    peakHour: string;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const qb = repo.createQueryBuilder("amendoim");

    // Filtros
    if (params.dataInicio) {
      qb.andWhere("amendoim.dia >= :dataInicio", { dataInicio: params.dataInicio });
    }

    if (params.dataFim) {
      qb.andWhere("amendoim.dia <= :dataFim", { dataFim: params.dataFim });
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
