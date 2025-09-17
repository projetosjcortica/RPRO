import "reflect-metadata";
import { DataSource } from "typeorm";
import { Relatorio } from "../entities/Relatorio";
import BaseService from "./BaseService";
import { TableData } from "../types/interfaces";

// Atualizar essa flag conforme ambiente (variável de ambiente seria melhor)
const useMysql = true;
const DB_PATH = process.env.DATABASE_PATH || "data.sqlite";
const MYSQL_HOST = process.env.MYSQL_HOST || "localhost"; // Garantir localhost como padrão

/**
 * Serviço responsável pela conexão e operações com o banco de dados.
 * Usa TypeORM; suporta MySQL (padrão atual) ou SQLite como fallback.
 */
export class DBService extends BaseService {
  public ds: DataSource;
  // defaults
  /**
   *
   * @param host [localhost]
   * @param port [3306]
   * @param username [root]
   * @param password [root]
   * @param database [cadastro]
   */
  constructor(
    host = "localhost",
    port = 3306,
    username = "root",
    password = "root",
    database = "cadastro"
  ) {
    super("DBService");
    this.ds = new DataSource({
      type: "mysql",
      host: host,
      port: Number(port),
      username: username,
      password: password,
      database: database,
      synchronize: true,
      logging: false,
      entities: [Relatorio],
    });
  }

  /**
   * Consulta linhas da tabela Relatorio com paginação e filtros.
   * @param page Página atual
   * @param pageSize Tamanho da página
   * @param filters Filtros de consulta
   */
  async queryDbRows(
    page: number,
    pageSize: number,
    filters: {
      formula?: string | null;
      dateStart?: string | null;
      dateEnd?: string | null;
      sortBy?: string | null;
      sortDir?: "ASC" | "DESC";
    }
  ): Promise<{ rows: any[]; total: number }> {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);

    const allowedSortColumns = new Set([
      "Dia",
      "Hora",
      "Nome",
      "Form1",
      "Form2",
      "processedFile",
    ]);
    const sortBy =
      filters.sortBy && allowedSortColumns.has(filters.sortBy)
        ? filters.sortBy
        : "Dia";
    const sortDir = filters.sortDir === "ASC" ? "ASC" : "DESC";

    const qb = repo.createQueryBuilder("r");
    if (filters.formula) {
      const f = filters.formula.trim();
      qb.andWhere("r.Nome LIKE :q", { q: `%${f}%` });
    }
    if (filters.dateStart) {
      qb.andWhere("r.Dia >= :ds", { ds: filters.dateStart });
    }
    if (filters.dateEnd) {
      qb.andWhere("r.Dia <= :de", { de: filters.dateEnd });
    }
    qb.orderBy(`r.${sortBy}`, sortDir).addOrderBy("r.Hora", sortDir);
    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    const rows = items.map((it: any) => {
      const values: Array<number | null> = [];
      for (let i = 1; i <= 40; i++) {
        const v = (it as any)[`Prod_${i}`];
        values.push(v == null ? null : Number(v));
      }
      return {
        Dia: it.Dia || null,
        Hora: it.Hora || null,
        Nome: it.Nome || null,
        Form1: it.Form1 != null ? Number(it.Form1) : null,
        Form2: it.Form2 != null ? Number(it.Form2) : null,
        values,
        processedFile: (it as any).processedFile || null,
      };
    });
    return { rows, total };
  }

  /** Inicializa a conexão com o banco, se necessário. */
  async init(): Promise<void> {
    if (!this.ds.isInitialized) {
      try {
        await this.ds.initialize();
        console.log("Conexão com o banco estabelecida com sucesso.");
      } catch (error) {
        console.error("Falha ao conectar ao banco de dados:", error);
        throw new Error(
          "Erro na conexão com o banco de dados. Verifique a configuração."
        );
      }
    }
  }

  async destroy(): Promise<void> {
    if (this.ds.isInitialized) await this.ds.destroy();
  }

  /**
   * Insere várias linhas na tabela Relatorio.
   * Aceita objetos que contenham propriedades no formato usado pelo parser/mapRow.
   */
  async insertRelatorioRows(rows: any[], processedFile: string) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    const entities = rows.map((r) => {
      const base: any = {
        Dia: r.Dia || r.date || null,
        Hora: r.Hora || r.time || null,
        Nome: r.Nome || r.label || null,
        // aceita múltiplas variações de nomes vindas do parser/mapRow
        Form1:
          r.Form1 != null
            ? Number(r.Form1)
            : r.Form1 != null
            ? Number(r.Form1)
            : r.Form2 != null
            ? Number(r.Form2)
            : null,
        Form2:
          r.Form2 != null
            ? Number(r.Form2)
            : r.Form2 != null
            ? Number(r.Form2)
            : r.Form2 != null
            ? Number(r.Form2)
            : null,
        processedFile,
      };
      for (let i = 1; i <= 40; i++) {
        const key = `Prod_${i}`;
        base[key] = r[key] != null ? Number(r[key]) : null;
      }
      return base as any;
    });
    return repo.save(entities as any[]);
  }

  async countRelatorioByFile(processedFile: string) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    return repo.count({ where: { processedFile } });
  }

  async getLastRelatorioTimestamp(processedFile: string) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    const qb = repo
      .createQueryBuilder("r")
      .where("r.processedFile = :f", { f: processedFile })
      .orderBy("r.Dia", "DESC")
      .addOrderBy("r.Hora", "DESC")
      .limit(1);
    const found = await qb.getOne();
    if (!found) return null;
    return { Dia: found.Dia || null, Hora: found.Hora || null };
  }

  async deleteRelatorioByFile(processedFile: string) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    const items = await repo.find({ where: { processedFile } });
    if (items.length === 0) return 0;
    const ids = items.map((i: any) => i.id);
    await repo.delete(ids);
    return ids.length;
  }

  async syncSchema(): Promise<void> {
    await this.init();
    console.log("Sincronizando esquema do banco...");
    await this.ds.synchronize();
    console.log("Esquema do banco sincronizado.");
  }

  static insertRelatorioRows(data: any, additionalData: any): void {
    // Implementação fictícia
  }
}

const dbService = new DBService();

// exports compatíveis
export const AppDataSource = dbService.ds;

export async function insertRelatorioRows(rows: any[], processedFile: string) {
  return dbService.insertRelatorioRows(rows, processedFile);
}
export async function countRelatorioByFile(processedFile: string) {
  return dbService.countRelatorioByFile(processedFile);
}
export async function getLastRelatorioTimestamp(processedFile: string) {
  return dbService.getLastRelatorioTimestamp(processedFile);
}
export async function deleteRelatorioByFile(processedFile: string) {
  return dbService.deleteRelatorioByFile(processedFile);
}
export function isMysqlConfigured() {
  return useMysql;
}
export default dbService;
