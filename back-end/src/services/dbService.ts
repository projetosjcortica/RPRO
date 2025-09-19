import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { BaseService } from '../core/baseService';
import { Relatorio, MateriaPrima, Batch, Row, Estoque, MovimentacaoEstoque } from '../entities/index';

export class DBService extends BaseService {
  ds: DataSource;
  constructor(
    host = process.env.MYSQL_HOST || 'localhost',
    port = Number(process.env.MYSQL_PORT || 3306),
    username = process.env.MYSQL_USER || 'root',
    password = process.env.MYSQL_PASSWORD || 'root',
    database = process.env.MYSQL_DB || 'cadastro'
  ) {
    super('DBService');
    const useMysql = process.env.USE_SQLITE !== 'true';
    if (useMysql) {
      this.ds = new DataSource({ 
        type: 'mysql', 
        host, 
        port, 
        username, 
        password, 
        database, 
        synchronize: true, 
        logging: false, 
        entities: [Relatorio, MateriaPrima, Batch, Row, Estoque, MovimentacaoEstoque] 
      });
    } else {
      const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
      const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
      const shouldSync = !fs.existsSync(absPath) || process.env.FORCE_SQLITE_SYNC === 'true';
      this.ds = new DataSource({ 
        type: 'sqlite', 
        database: absPath, 
        synchronize: shouldSync, 
        logging: false, 
        entities: [Relatorio, MateriaPrima, Batch, Row, Estoque, MovimentacaoEstoque] 
      });
    }
  }
  async init() { if (!this.ds.isInitialized) await this.ds.initialize(); }
  async insertRelatorioRows(rows: any[], processedFile: string) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    const mapped = rows.map((r: any) => ({
      Dia: r.Dia ?? null,
      Hora: r.Hora ?? null,
      Nome: r.Nome ?? r.label ?? null,
      Form1: r.Form1 ?? r.form1 ?? null,
      Form2: r.Form2 ?? r.form2 ?? null,
      processedFile,
      Prod_1: r.Prod_1 ?? r.values?.[0] ?? null,
      Prod_2: r.Prod_2 ?? r.values?.[1] ?? null,
      Prod_3: r.Prod_3 ?? r.values?.[2] ?? null,
      Prod_4: r.Prod_4 ?? r.values?.[3] ?? null,
      Prod_5: r.Prod_5 ?? r.values?.[4] ?? null,
      Prod_6: r.Prod_6 ?? r.values?.[5] ?? null,
      Prod_7: r.Prod_7 ?? r.values?.[6] ?? null,
      Prod_8: r.Prod_8 ?? r.values?.[7] ?? null,
      Prod_9: r.Prod_9 ?? r.values?.[8] ?? null,
      Prod_10: r.Prod_10 ?? r.values?.[9] ?? null,
      Prod_11: r.Prod_11 ?? r.values?.[10] ?? null,
      Prod_12: r.Prod_12 ?? r.values?.[11] ?? null,
      Prod_13: r.Prod_13 ?? r.values?.[12] ?? null,
      Prod_14: r.Prod_14 ?? r.values?.[13] ?? null,
      Prod_15: r.Prod_15 ?? r.values?.[14] ?? null,
      Prod_16: r.Prod_16 ?? r.values?.[15] ?? null,
      Prod_17: r.Prod_17 ?? r.values?.[16] ?? null,
      Prod_18: r.Prod_18 ?? r.values?.[17] ?? null,
      Prod_19: r.Prod_19 ?? r.values?.[18] ?? null,
      Prod_20: r.Prod_20 ?? r.values?.[19] ?? null,
      Prod_21: r.Prod_21 ?? r.values?.[20] ?? null,
      Prod_22: r.Prod_22 ?? r.values?.[21] ?? null,
      Prod_23: r.Prod_23 ?? r.values?.[22] ?? null,
      Prod_24: r.Prod_24 ?? r.values?.[23] ?? null,
      Prod_25: r.Prod_25 ?? r.values?.[24] ?? null,
      Prod_26: r.Prod_26 ?? r.values?.[25] ?? null,
      Prod_27: r.Prod_27 ?? r.values?.[26] ?? null,
      Prod_28: r.Prod_28 ?? r.values?.[27] ?? null,
      Prod_29: r.Prod_29 ?? r.values?.[28] ?? null,
      Prod_30: r.Prod_30 ?? r.values?.[29] ?? null,
      Prod_31: r.Prod_31 ?? r.values?.[30] ?? null,
      Prod_32: r.Prod_32 ?? r.values?.[31] ?? null,
      Prod_33: r.Prod_33 ?? r.values?.[32] ?? null,
      Prod_34: r.Prod_34 ?? r.values?.[33] ?? null,
      Prod_35: r.Prod_35 ?? r.values?.[34] ?? null,
      Prod_36: r.Prod_36 ?? r.values?.[35] ?? null,
      Prod_37: r.Prod_37 ?? r.values?.[36] ?? null,
      Prod_38: r.Prod_38 ?? r.values?.[37] ?? null,
      Prod_39: r.Prod_39 ?? r.values?.[38] ?? null,
      Prod_40: r.Prod_40 ?? r.values?.[39] ?? null,
    }));
    return repo.save(mapped);
  }
  async getLastRelatorioTimestamp(processedFile?: string) {
    await this.init();
    const qb = this.ds.getRepository(Relatorio).createQueryBuilder('r');
    if (processedFile) qb.where('r.processedFile = :pf', { pf: processedFile });
    qb.orderBy('r.Dia', 'DESC').addOrderBy('r.Hora', 'DESC').limit(1);
    const last = await qb.getOne();
    return last ? `${last.Dia ?? ''}T${last.Hora ?? ''}` : null;
  }
}

export const dbService = new DBService();
export const AppDataSource = dbService.ds;
