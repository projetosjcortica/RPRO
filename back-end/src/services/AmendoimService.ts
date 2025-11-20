import { Amendoim } from "../entities/Amendoim";
import { parse } from "csv-parse/sync";
import { AppDataSource } from "./dbService";

/**
 * Service para processar arquivos CSV de amendoim.
 * Formato esperado: Data,Hora,,,CódigoProduto,NomeProduto,,,Peso,,Balanca
 * Exemplo: 10/11/25,14:15:03,,,456,,Amendoim,,,2210,,1
 * 
 * MUDANÇA 2025: Sistema de código de caixa foi descontinuado.
 * O que antes era "Código de Caixa" (coluna 5) agora é "Código de Produto".
 * 
 * REGRA DE NEGÓCIO:
 * - Balanças 1 e 2 = ENTRADA (pré-debulhamento)
 * - Balança 3 = SAÍDA (pós-debulhamento)
 */
export class AmendoimService {
  /**
   * Determina o tipo (entrada/saida) baseado no número da balança
   * @param balanca Número da balança (string)
   * @returns 'entrada' para balanças 1 e 2, 'saida' para balança 3
   */
  private static determinarTipoPorBalanca(balanca?: string): "entrada" | "saida" {
    if (!balanca) return "entrada"; // Fallback: sem balança = entrada
    
    const numBalanca = parseInt(balanca.trim(), 10);
    
    if (numBalanca === 1 || numBalanca === 2) {
      return "entrada";
    } else if (numBalanca === 3) {
      return "saida";
    }
    
    // Fallback para balanças desconhecidas
    return "entrada";
  }

  /**
   * Processa um arquivo CSV de amendoim e salva no banco de dados.
   * O tipo (entrada/saida) é determinado AUTOMATICAMENTE pela balança:
   * - Balanças 1 e 2 = entrada
   * - Balança 3 = saída
   * 
   * @param csvContent Conteúdo do arquivo CSV como string
   * @returns Número de registros processados e salvos
   */
  static async processarCSV(
    csvContent: string,
    options?: { forceSaveAll?: boolean; sourceIhm?: string }
  ): Promise<{
    rawSaved: number;
    processados: number;
    salvos: number;
    erros: string[];
    entradasSalvas: number;
    saidasSalvas: number;
    duplicatasInternas?: number;
    duplicatasDB?: number;
  }> {
    const erros: string[] = [];
    let processados = 0;
    let salvos = 0;
    let entradasSalvas = 0;
    let saidasSalvas = 0;
    let rawSaved = 0;

    try {
      // Parse CSV sem header
      // Caracteres Diferentes tem que ser processados evitar acontecer 
      // manter sempre "Amendoim Exportação" nunca "Amendoim Exporta��o"
      const records = parse(csvContent, {
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
      });

      const repo = AppDataSource.getRepository(Amendoim);
      const registrosParaSalvar: Amendoim[] = [];
      // For forceSaveAll mode, also collect raw rows to persist in amendoim_raw
      const rawRows: any[] = [];

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        processados++;

        try {
          // Validar se a linha tem o mínimo de colunas necessárias
          if (!row || row.length < 10) {
            erros.push(`Linha ${i + 1}: Formato inválido (colunas insuficientes)`);
            continue;
          }

          // Formato novo: Data,Hora,Col2,Col3,CódigoProduto(antigo CódigoCaixa),CódigoProduto(vazio),NomeProduto,Col7,Col8,Peso,Col10,Balanca
          // Exemplo: 10/11/25,14:15:03,,,456,1,Amendoim,,,2210,,1
          // MUDANÇA: Coluna 4 (antiga CódigoCaixa) agora é CódigoProduto
          const [
            data,          // 0: Data (DD/MM/YY)
            hora,          // 1: Hora (HH:MM:SS)
            _col2,         // 2: Vazio
            _col3,         // 3: Vazio
            _obsoleto4,    // 4: Vazio (era código auxiliar)
            codigoProduto, // 5: Código do produto (ANTES era código da caixa, agora é código do produto)
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
            // Se modo forceSaveAll, não pular — apenas marcar como Sem nome
            if (!options?.forceSaveAll) {
              // Linha sem produto, pular silenciosamente (pode ser teste da balança)
              continue;
            }
          }

          if (!peso || isNaN(Number(peso))) {
            if (!options?.forceSaveAll) {
              erros.push(`Linha ${i + 1}: Peso inválido (${peso})`);
              continue;
            }
            // forceSaveAll: set peso zero quando inválido
          }

          // Criar registro
          const registro = new Amendoim();
          
          // ⚡ DETERMINAR TIPO BASEADO NA BALANÇA
          const tipoRegistro = this.determinarTipoPorBalanca(balanca ? String(balanca).trim() : undefined);
          registro.tipo = tipoRegistro;
          
          registro.dia = diaStr;
          registro.hora = horaStr;
          // MUDANÇA: codigoProduto agora vem da coluna 5 (antes era codigoCaixa)
          registro.codigoProduto = codigoProduto ? this.fixEncoding(String(codigoProduto).trim()) : ""; 
          registro.codigoCaixa = "";
          
          // Log de debug: formato de data sendo salvo
          if (i === 0) {
            console.log(`[AmendoimService] 🔍 Formato de data SALVO: "${diaStr}" | Hora: "${horaStr}" | Tipo: ${tipoRegistro} (Balança: ${balanca})`);
          }
          
          // Fallback para nome do produto vazio — normalizar texto recebido da IHM
          const nomeProcessado = this.fixEncoding(nomeProduto ? String(nomeProduto).trim() : "");
          registro.nomeProduto = nomeProcessado || "Sem nome";
          registro.peso = Number(peso) || 0;
          registro.balanca = balanca ? this.fixEncoding(String(balanca).trim()) : undefined;

          registrosParaSalvar.push(registro);

          if (options?.forceSaveAll) {
            rawRows.push({
              tipo: registro.tipo,
              dia: registro.dia,
              hora: registro.hora,
              codigoProduto: registro.codigoProduto,
              codigoCaixa: registro.codigoCaixa,
              nomeProduto: registro.nomeProduto,
              peso: registro.peso,
              balanca: registro.balanca,
              sourceIhm: options.sourceIhm,
              rawLine: this.fixEncoding(row.join(','))
            });
          }
        } catch (err: any) {
          erros.push(`Linha ${i + 1}: ${err.message}`);
        }
      }

      // Salvar em lote com PROTEÇÃO TRIPLA contra duplicatas
      let duplicatasInternas = 0;
      let duplicatasDB = 0;

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
        duplicatasInternas = registrosParaSalvar.length - registrosSemDuplicatasInternas.length;

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

        duplicatasDB = registrosSemDuplicatasInternas.length - registrosNovos.length;
        
        if (duplicatasDB > 0) {
          console.log(`[AmendoimService] ⚠️ PROTEÇÃO NÍVEL 2: ${duplicatasDB} duplicatas já existem no banco de dados`);
        }

        // PROTEÇÃO NÍVEL 3: Save com tratamento de erro de constraint unique
        if (registrosNovos.length > 0) {
          try {
            // Usar insert em massa com IGNORE para MySQL (evita ER_DUP_ENTRY)
            // Isso gera um INSERT IGNORE ... que ignora chaves duplicadas e continua
            const insertResult: any = await AppDataSource.createQueryBuilder()
              .insert()
              .into(Amendoim)
              .values(registrosNovos)
              .orIgnore() // Gera INSERT IGNORE em MySQL
              .execute();

            // Tentar inferir quantos foram realmente inseridos
            const affected = (insertResult?.raw && (insertResult.raw.affectedRows ?? insertResult.raw.affectedRows === 0))
              ? insertResult.raw.affectedRows
              : (insertResult?.generatedMaps ? insertResult.generatedMaps.length : undefined);

            if (typeof affected === 'number') salvos = affected;
            else salvos = registrosNovos.length; // fallback conservador

            // Contar entradas/saidas com base nos registrosNovos (salvos pode incluir ignorados)
            entradasSalvas = registrosNovos.filter(r => r.tipo === 'entrada').length;
            saidasSalvas = registrosNovos.filter(r => r.tipo === 'saida').length;

            console.log(`[AmendoimService] ✅ Tentativa de inserção em lote: ${registrosNovos.length} registros (salvos estimados: ${salvos})`);
          } catch (err: any) {
            // Em caso de falha inesperada, tentar inserir individualmente com IGNORE
            console.log(`[AmendoimService] ⚠️ PROTEÇÃO NÍVEL 3: Erro no insert em lote (${err?.message}), tentando insert individual com ignore...`);

            let duplicatasConstraint = 0;

            for (const registro of registrosNovos) {
              try {
                const singleResult: any = await AppDataSource.createQueryBuilder()
                  .insert()
                  .into(Amendoim)
                  .values(registro)
                  .orIgnore()
                  .execute();

                const singleAffected = (singleResult?.raw && (singleResult.raw.affectedRows ?? singleResult.raw.affectedRows === 0))
                  ? singleResult.raw.affectedRows
                  : (singleResult?.generatedMaps ? singleResult.generatedMaps.length : undefined);

                if (singleAffected === 1) {
                  salvos++;
                  if (registro.tipo === 'entrada') entradasSalvas++; else saidasSalvas++;
                } else {
                  // provavelmente foi ignorado por duplicate
                  duplicatasConstraint++;
                }
              } catch (saveErr: any) {
                // Não falhar toda a importação por causa de um registro
                console.error(`[AmendoimService] ❌ Erro ao inserir individualmente (ignorando registro):`, saveErr?.message || saveErr);
                erros.push(`Erro ao inserir registro: ${saveErr?.message || saveErr}`);
              }
            }

            console.log(`[AmendoimService] ✅ ${salvos} registros salvos individualmente (${duplicatasConstraint} duplicatas bloqueadas por constraint)`);
            console.log(`[AmendoimService]    📥 ENTRADA: ${entradasSalvas} | 📤 SAÍDA: ${saidasSalvas}`);
          }
          
          const totalDuplicatas = duplicatasInternas + duplicatasDB;
          if (totalDuplicatas > 0) {
            console.log(`[AmendoimService] 🛡️ TOTAL DE DUPLICATAS BLOQUEADAS: ${totalDuplicatas}`);
          }
        } else {
          console.log(`[AmendoimService] ℹ️ Todos os ${registrosParaSalvar.length} registros já existem (100% duplicados)`);
        }
      }

      // Se modo forceSaveAll estiver ativo, persistir também os rawRows em amendoim_raw
      if (options?.forceSaveAll) {
        try {
          const { AmendoimRaw } = await Promise.resolve().then(() => require('../entities').then ? require('../entities') : require('../entities'));
        } catch (e) {
          // fallback - require directly
        }
          try {
            const repoRaw = AppDataSource.getRepository((await Promise.resolve().then(() => require('../entities'))).AmendoimRaw);
            if (rawRows.length > 0) {
              await repoRaw.save(rawRows);
              rawSaved = rawRows.length;
              console.log(`[AmendoimService] ✅ ${rawRows.length} linhas salvas em amendoim_raw (forceSaveAll)`);
            }
        } catch (errRaw: any) {
          console.warn('[AmendoimService] ⚠️ Erro ao salvar rawRows em amendoim_raw:', errRaw?.message || errRaw);
        }

        // NOTE: In forceSaveAll mode we persist raw rows to `amendoim_raw` for audit, but
        // we AVOID re-inserting the same registrosParaSalvar into `amendoim` here to
        // prevent double-insertion and duplicated `salvos` counters. The main insert
        // flow above already attempted to save new records; forceSaveAll's responsibility
        // is only to persist rawRows for traceability.
        console.log(`[AmendoimService] ℹ️ forceSaveAll: rawRows persisted (${rawRows.length}), skipping re-insert to amendoim to avoid duplicates`);
      }

      console.log(`[AmendoimService] 📊 RESUMO FINAL - Processados: ${processados} | Salvos: ${salvos} | RawSaved: ${rawSaved || 0} | ENTRADA: ${entradasSalvas} | SAÍDA: ${saidasSalvas} | DuplicatasInternas: ${duplicatasInternas} | DuplicatasDB: ${duplicatasDB}`);
      return { processados, salvos, erros, entradasSalvas, saidasSalvas, duplicatasInternas, duplicatasDB, rawSaved: rawSaved || 0 } as any;
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
    sortBy?: string;
    sortDir?: "ASC" | "DESC";
  }): Promise<{
    rows: Amendoim[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const repo = AppDataSource.getRepository(Amendoim);
    const page = params.page || 1;
    const pageSize = params.pageSize || 100;
    const sortBy = params.sortBy || 'dia';
    const sortDir = params.sortDir || 'DESC';

    const qb = repo.createQueryBuilder("amendoim");

    // Filtros
    if (params.tipo) {
      qb.andWhere("amendoim.tipo = :tipo", { tipo: params.tipo });
    }

    if (params.dataInicio) {
      // Normalizar data para YYYY-MM-DD e converter para DD/MM/YY
      const normData = this.normalizeDateToISOFormat(params.dataInicio);
      if (normData) {
        const dbData = this.convertISODateToDBFormat(normData);
        console.log('[AmendoimService.buscarRegistros] 📅 dataInicio - Original:', params.dataInicio, '→ ISO:', normData, '→ DB:', dbData);
        // CORREÇÃO: Usar STR_TO_DATE com formato correto (barras) para comparação cronológica
        qb.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dbData });
      }
    }

    if (params.dataFim) {
      // Normalizar data para YYYY-MM-DD e calcular próximo dia para comparação inclusiva
      const normData = this.normalizeDateToISOFormat(params.dataFim);
      if (normData) {
        // Calcular próximo dia (para fazer comparação inclusiva)
        const proximoDia = this.calcularProximoDia(normData);
        const dbProximoDia = this.convertISODateToDBFormat(proximoDia);
        console.log('[AmendoimService.buscarRegistros] 📅 dataFim - Original:', params.dataFim, '→ ISO:', normData, '→ Próximo dia para compare <:', dbProximoDia);
        // CORREÇÃO: Usar STR_TO_DATE com formato correto (barras) para comparação cronológica
        qb.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dbProximoDia });
      }
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

    // Ordenação dinâmica baseada no sortBy
    switch (sortBy) {
      case 'dia':
        // Ordenação cronológica correta usando STR_TO_DATE
        qb.orderBy("STR_TO_DATE(amendoim.dia, '%d/%m/%y')", sortDir);
        qb.addOrderBy("amendoim.hora", sortDir);
        break;
      case 'hora':
        qb.orderBy("amendoim.hora", sortDir);
        qb.addOrderBy("STR_TO_DATE(amendoim.dia, '%d/%m/%y')", sortDir);
        break;
      case 'codigoProduto':
        qb.orderBy("amendoim.codigoProduto", sortDir);
        break;
      case 'balanca':
        qb.orderBy("amendoim.balanca", sortDir);
        break;
      case 'nomeProduto':
        qb.orderBy("amendoim.nomeProduto", sortDir);
        break;
      case 'peso':
        qb.orderBy("CAST(amendoim.peso AS DECIMAL(10,3))", sortDir);
        break;
      case 'tipo':
        qb.orderBy("amendoim.tipo", sortDir);
        break;
      default:
        // Fallback para ordenação padrão
        qb.orderBy("STR_TO_DATE(amendoim.dia, '%d/%m/%y')", "DESC");
        qb.addOrderBy("amendoim.hora", "DESC");
    }

    // Paginação
    const total = await qb.getCount();
    const rows = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    console.log('[AmendoimService.buscarRegistros] ✅ Total encontrado:', total, '| Retornando:', rows.length, 'registros (página', page, ') | Sort:', sortBy, sortDir);
    if (rows.length > 0) {
      console.log('[AmendoimService.buscarRegistros] 📊 Primeira data:', rows[0].dia, '| Última:', rows[rows.length - 1].dia);
    }

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
      const normData = this.normalizeDateToISOFormat(params.dataInicio);
      if (normData) {
        const dbData = this.convertISODateToDBFormat(normData);
        // CORREÇÃO: Usar STR_TO_DATE com formato correto (barras) para comparação cronológica
        qb.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dbData });
      }
    }

    if (params.dataFim) {
      const normData = this.normalizeDateToISOFormat(params.dataFim);
      if (normData) {
        const proximoDia = this.calcularProximoDia(normData);
        const dbProximoDia = this.convertISODateToDBFormat(proximoDia);
        // CORREÇÃO: Usar STR_TO_DATE com formato correto (barras) para comparação cronológica
        qb.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dbProximoDia });
      }
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

    // Buscar primeira e última data/hora
    const primeiroRegistro = await qb
      .clone()
      .orderBy("STR_TO_DATE(amendoim.dia, '%d/%m/%y')", "ASC")
      .addOrderBy("amendoim.hora", "ASC")
      .select(["amendoim.dia", "amendoim.hora"])
      .limit(1)
      .getOne();

    const ultimoRegistro = await qb
      .clone()
      .orderBy("STR_TO_DATE(amendoim.dia, '%d/%m/%y')", "DESC")
      .addOrderBy("amendoim.hora", "DESC")
      .select(["amendoim.dia", "amendoim.hora"])
      .limit(1)
      .getOne();

    return {
      totalRegistros,
      pesoTotal: Number(pesoResult?.total || 0),
      produtosUnicos: Number(produtosResult?.count || 0),
      primeiraData: primeiroRegistro?.dia,
      ultimaData: ultimoRegistro?.dia,
      primeiraHora: primeiroRegistro?.hora,
      ultimaHora: ultimoRegistro?.hora,
    };
  }

  /**
   * Normaliza qualquer formato de data para ISO YYYY-MM-DD
   * Aceita: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, DD-MM-YY, DD/MM/YY
   */
  private static normalizeDateToISOFormat(dateStr: string): string | null {
    if (!dateStr) return null;
    
    const s = String(dateStr).trim();
    if (!s) return null;
    
    // Se já está em ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return s;
    }
    
    // Se está em DD-MM-YYYY com hífen
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
      const parts = s.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    // Se está em DD/MM/YYYY com barra
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const parts = s.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    // Se está em DD-MM-YY (2 dígitos) - assume século 20/21
    if (/^\d{2}-\d{2}-\d{2}$/.test(s)) {
      const parts = s.split('-');
      const year = Number(parts[2]);
      const century = year < 50 ? 2000 : 1900;
      return `${century + year}-${parts[1]}-${parts[0]}`;
    }
    
    // Se está em DD/MM/YY (2 dígitos com barra)
    if (/^\d{2}\/\d{2}\/\d{2}$/.test(s)) {
      const parts = s.split('/');
      const year = Number(parts[2]);
      const century = year < 50 ? 2000 : 1900;
      return `${century + year}-${parts[1]}-${parts[0]}`;
    }
    
    // Tentar Date parser fallback
    try {
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        const y = dt.getFullYear();
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const d = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch (e) {
      // Fallback falhou
    }
    
    return null;
  }

  /**
   * Converte data ISO YYYY-MM-DD para formato do banco DD/MM/YY
   */
  private static convertISODateToDBFormat(isoDate: string): string {
    if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return isoDate;
    }
    
    const parts = isoDate.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const shortYear = year.slice(-2);
    
    return `${day}/${month}/${shortYear}`;
  }

  /**
   * Calcula o próximo dia a partir de uma data ISO YYYY-MM-DD
   */
  private static calcularProximoDia(isoDate: string): string {
    if (!isoDate || !isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return isoDate;
    }
    
    const parts = isoDate.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    
    const dt = new Date(year, month - 1, day);
    dt.setDate(dt.getDate() + 1);
    
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    
    return `${y}-${m}-${d}`;
  }

  /**
   * Converte data de qualquer formato para DD-MM-YY (formato do banco para comparação)
   * Aceita: YYYY-MM-DD, DD-MM-YY, DD/MM/YY
   */
  private static convertDateToDBFormat(dateStr: string): string {
    if (!dateStr) return dateStr;
    
    // Se já está em formato DD-MM-YY com hífen, retornar como está
    if (/^\d{2}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Se está em formato DD/MM/YY com barra (formato do banco), converter para hífen
    if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateStr)) {
      return dateStr.replace(/\//g, '-');
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
   * Normalize and attempt to repair text received from IHM so DB stores coherent UTF-8.
   * Strategies:
   * - NFC normalization
   * - If replacement characters or common latin1->utf8 garble is detected,
   *   try re-decoding from latin1 to utf8 and a reverse attempt as fallback.
   */
  private static fixEncoding(text?: string): string {
    if (!text) return "";
    let s = String(text);

    try { s = s.normalize('NFC'); } catch (e) { /* ignore if not supported */ }

    // Quick heuristics for garbled sequences or replacement char
    const hasReplacement = s.includes('\uFFFD') || s.indexOf('�') !== -1;
    const likelyLatin1Garble = /Ã|Â|Ã©|Ã¡|Ã£|Ã§|Ãª|Ãµ|Ãº/.test(s);

    if (hasReplacement || likelyLatin1Garble) {
      try {
        const attempt = Buffer.from(s, 'latin1').toString('utf8');
        if (attempt && !attempt.includes('\uFFFD')) s = attempt;
      } catch (e) { /* ignore */ }

      if (s.includes('\uFFFD') || s.indexOf('�') !== -1) {
        try {
          const attempt2 = Buffer.from(s, 'utf8').toString('latin1');
          if (attempt2 && !attempt2.includes('\uFFFD')) s = attempt2;
        } catch (e) { /* ignore */ }
      }
    }

    // Remove any leftover replacement chars and trim
    s = s.replace(/\uFFFD/g, '').replace(/�/g, '').trim();
    return s;
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
      console.log('[AmendoimService.obterDadosAnalise] Total de registros no banco:', totalRegistros);
      
      if (totalRegistros === 0) {
        console.log('[AmendoimService.obterDadosAnalise] Sem registros no banco, retornando estrutura vazia');
        return this.getEmptyAnaliseStructure();
      }

    // Converter datas para formato do banco (DD/MM/YY)
    const dataInicioDB = params.dataInicio ? this.convertISODateToDBFormat(this.normalizeDateToISOFormat(params.dataInicio) || '') : undefined;
    let dataFimDB: string | undefined = undefined;
    if (params.dataFim) {
      const normFim = this.normalizeDateToISOFormat(params.dataFim);
      if (normFim) {
        const proximoDia = this.calcularProximoDia(normFim);
        dataFimDB = this.convertISODateToDBFormat(proximoDia);
      }
    }

      console.log('[AmendoimService.obterDadosAnalise] Filtros recebidos:', params);
      console.log('[AmendoimService.obterDadosAnalise] Filtros convertidos:', { dataInicioDB, dataFimDB });

    // Query para dados agrupados por hora (extrair apenas HH da hora)
    let qbHora = repo.createQueryBuilder("amendoim")
      .select("CAST(SUBSTR(amendoim.hora, 1, 2) AS UNSIGNED)", "hora")
      .addSelect("amendoim.tipo", "tipo")
      .addSelect("CAST(SUM(amendoim.peso) AS DECIMAL(10,2))", "peso");

    if (dataInicioDB) qbHora.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dataInicioDB });
    if (dataFimDB) qbHora.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dataFimDB });

    const dadosHora = await qbHora.groupBy("hora, amendoim.tipo").getRawMany();
    console.log('[AmendoimService.obterDadosAnalise] dadosHora resultado:', dadosHora.length, 'registros');
    if (dadosHora.length > 0) {
      console.log('[AmendoimService.obterDadosAnalise] dadosHora sample:', JSON.stringify(dadosHora.slice(0, 5)));
    }

    // Query para dados agrupados por dia
    let qbDia = repo.createQueryBuilder("amendoim")
      .select("amendoim.dia", "dia")
      .addSelect("amendoim.tipo", "tipo")
      .addSelect("CAST(SUM(amendoim.peso) AS DECIMAL(10,2))", "peso");

    if (dataInicioDB) qbDia.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dataInicioDB });
    if (dataFimDB) qbDia.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dataFimDB });

    const dadosDia = await qbDia.groupBy("amendoim.dia, amendoim.tipo").orderBy("STR_TO_DATE(amendoim.dia, '%d/%m/%y')", "ASC").getRawMany();
    console.log('[AmendoimService.obterDadosAnalise] dadosDia resultado:', dadosDia.length, 'registros');

    // Query para dia da semana (MySQL: DAYOFWEEK retorna 1=domingo, 2=segunda, etc.)
    // Subtraímos 1 para obter índice 0-6
    let qbSemana = repo.createQueryBuilder("amendoim")
      .select("DAYOFWEEK(STR_TO_DATE(amendoim.dia, '%d/%m/%y')) - 1", "diaSemana")
      .addSelect("amendoim.tipo", "tipo")
      .addSelect("CAST(SUM(amendoim.peso) AS DECIMAL(10,2))", "peso");

    if (dataInicioDB) qbSemana.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dataInicioDB });
    if (dataFimDB) qbSemana.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dataFimDB });

    const dadosSemana = await qbSemana.groupBy("diaSemana, amendoim.tipo").getRawMany();
    console.log('[AmendoimService.obterDadosAnalise] dadosSemana resultado:', dadosSemana.length, 'registros');

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
      const entrada = dadosSemana.find((s: any) => Number(s.diaSemana) === d && s.tipo === "entrada")?.peso || 0;
      const saida = dadosSemana.find((s: any) => Number(s.diaSemana) === d && s.tipo === "saida")?.peso || 0;
      fluxoSemanal.push({ diaSemana: diasSemanaLabels[d], entrada: Number(entrada), saida: Number(saida) });
    }
    console.log('[AmendoimService.obterDadosAnalise] fluxoSemanal processado:', fluxoSemanal.filter(f => f.entrada > 0 || f.saida > 0).length, 'dias com dados');

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
        entrada += Number(dadosHora.find((d: any) => Number(d.hora) === h && d.tipo === "entrada")?.peso || 0);
        saida += Number(dadosHora.find((d: any) => Number(d.hora) === h && d.tipo === "saida")?.peso || 0);
      }
      const rendimento = entrada > 0 ? (saida / entrada) * 100 : 0;
      eficienciaPorTurno.push({ turno: nome, entrada, saida, rendimento: Number(rendimento.toFixed(2)) });
    });
    console.log('[AmendoimService.obterDadosAnalise] eficienciaPorTurno processado:', eficienciaPorTurno.filter(t => t.entrada > 0 || t.saida > 0).length, 'turnos com dados');

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

    // Converter datas para formato do banco (DD/MM/YY)
    const dataInicioDB = params.dataInicio ? this.convertDateToDBFormat(params.dataInicio).replace(/-/g, '/') : undefined;
    const dataFimDB = params.dataFim ? this.convertDateToDBFormat(params.dataFim).replace(/-/g, '/') : undefined;

    // Buscar peso de entrada
    const qbEntrada = repo.createQueryBuilder("amendoim");
    qbEntrada.andWhere("amendoim.tipo = :tipo", { tipo: "entrada" });
    
    if (dataInicioDB) {
      qbEntrada.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dataInicioDB });
    }
    if (dataFimDB) {
      qbEntrada.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dataFimDB });
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
    
    if (dataInicioDB) {
      qbSaida.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dataInicioDB });
    }
    if (dataFimDB) {
      qbSaida.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dataFimDB });
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
    
    if (dataInicioDB) {
      qbPeriodo.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dataInicioDB });
    }
    if (dataFimDB) {
      qbPeriodo.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dataFimDB });
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
      .orderBy("STR_TO_DATE(amendoim.dia, '%d/%m/%y')", "ASC")
      .addOrderBy("amendoim.hora", "ASC")
      .select(["amendoim.dia", "amendoim.hora"])
      .limit(1)
      .getOne();

    const ultimoRegistro = await qbPeriodo
      .clone()
      .orderBy("STR_TO_DATE(amendoim.dia, '%d/%m/%y')", "DESC")
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

    // Converter datas para formato do banco (DD/MM/YY)
    const dataInicioDB = params.dataInicio ? this.convertDateToDBFormat(params.dataInicio).replace(/-/g, '/') : undefined;
    const dataFimDB = params.dataFim ? this.convertDateToDBFormat(params.dataFim).replace(/-/g, '/') : undefined;

    // Filtros
    if (params.tipo) {
      qb.andWhere("amendoim.tipo = :tipo", { tipo: params.tipo });
    }

    if (dataInicioDB) {
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dataInicioDB });
    }

    if (dataFimDB) {
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dataFimDB });
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
   * @deprecated Sistema de caixas foi descontinuado. Use getChartDataProdutos() ao invés.
   * Mantido por compatibilidade temporária - redireciona para produtos.
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
    // Redirecionar para produtos
    return this.getChartDataProdutos(params);
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

    // Converter datas para formato do banco (DD/MM/YY)
    const dataInicioDB = params.dataInicio ? this.convertISODateToDBFormat(this.normalizeDateToISOFormat(params.dataInicio) || '') : undefined;
    let dataFimDB: string | undefined = undefined;
    if (params.dataFim) {
      const normFim = this.normalizeDateToISOFormat(params.dataFim);
      if (normFim) {
        const proximoDia = this.calcularProximoDia(normFim);
        dataFimDB = this.convertISODateToDBFormat(proximoDia);
      }
    }

    // Filtros
    if (params.tipo) {
      qb.andWhere("amendoim.tipo = :tipo", { tipo: params.tipo });
    }

    if (dataInicioDB) {
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') >= STR_TO_DATE(:dataInicio, '%d/%m/%y')", { dataInicio: dataInicioDB });
    }

    if (dataFimDB) {
      qb.andWhere("STR_TO_DATE(amendoim.dia, '%d/%m/%y') < STR_TO_DATE(:dataFim, '%d/%m/%y')", { dataFim: dataFimDB });
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
