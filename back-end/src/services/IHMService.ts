import { Client, FileType as FTPFileType } from 'basic-ftp';
import * as path from 'path';
import * as fs from 'fs';
import backupService from './backupService';
import { computeHashSync } from '../utils/hash';

/**
 * Serviço responsável por interagir com o sistema IHM via FTP.
 * Permite listar, baixar e gerenciar arquivos CSV remotos.
 */
export default class IHMService {
  private IP: string;
  private user: string;
  private password: string;
  private client: Client;

  // Cache e padrões de exclusão
  private static compiledPatterns: RegExp[] | null = null;
  private static memoizedExcluded: Map<string, boolean> = new Map();
  private static fileCache: Map<string, { size: number; hash?: string }> = new Map();

  /**
   * @param {string} IP Endereço IP do servidor FTP.
   * @param {string} user Nome de usuário para autenticação.
   * @param {string} password Senha para autenticação.
   */
  constructor(IP: string, user: string, password: string) {
    this.IP = IP;
    this.user = user;
    this.password = password;
    this.client = new Client();
    this.client.ftp.verbose = true;
  }

   /**
   * Lista os nomes dos arquivos CSV disponíveis no diretório remoto, aplicando filtros de exclusão.
   * @returns {Promise<string[]>} Lista de nomes de arquivos CSV.
   */
  async listFiles(): Promise<string[]> {
    const remoteDir = '/InternalStorage/data/';
    try {
      await this.connectToFtp();
      const fileList = await this.client.list(remoteDir);
      const csvFiles = fileList
        .filter(file => file.type === FTPFileType.File && file.name.toLowerCase().endsWith('.csv'))
        .filter(file => !IHMService.isExcludedFile(file.name));
      return csvFiles.map(file => file.name);
    } catch (error: any) {
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    } finally {
      this.client.close();
    }
  }

  /**
   * Define padrões de exclusão para arquivos remotos.
   * @param {string | null} rawPatterns Padrões de exclusão em formato de string (separados por vírgula).
   */
  static setExcludePatterns(rawPatterns: string | null): void {
    if (!rawPatterns) {
      this.compiledPatterns = null;
      this.memoizedExcluded.clear();
      return;
    }

    const userPatterns = rawPatterns
      .split(',')
      .map(pattern => pattern.trim())
      .filter(Boolean)
      .map(pattern => {
        try {
          return new RegExp(pattern, 'i');
        } catch {
          return null;
        }
      })
      .filter(Boolean) as RegExp[];

    const defaultPatterns: RegExp[] = [
      /^Relatorio_(\d{4}_\d{2}_sys|2)\.csv$/mig,
    ];

    this.compiledPatterns = [...userPatterns, ...defaultPatterns];
    this.memoizedExcluded.clear();
  }

  /**
   * Verifica se um arquivo remoto deve ser excluído com base nos padrões definidos.
     * @param {string} fileName Nome do arquivo remoto.
   * @returns {boolean} Verdadeiro se o arquivo deve ser excluído, falso caso contrário.
   */
  static isExcludedFile(fileName: string): boolean {
    /**
     * Verifica se o arquivo deve ser excluído com base nos padrões definidos.
     * Utiliza cache para acelerar verificações repetidas.
     * @param {string} fileName Nome do arquivo remoto.
     * @returns {boolean} Verdadeiro se o arquivo deve ser excluído, falso caso contrário.
     */
    if (this.memoizedExcluded.has(fileName)) {
      return this.memoizedExcluded.get(fileName)!;
    }

    // Garante que os padrões estejam compilados
    if (!this.compiledPatterns) {
      this.setExcludePatterns(process.env.IHM_EXCLUDE_REGEX || '');
    }

    // Testa todos os padrões contra o nome do arquivo
    const isExcluded = (this.compiledPatterns || []).some(pattern => pattern.test(fileName));
    this.memoizedExcluded.set(fileName, isExcluded);
    return isExcluded;
  }

  /**
   * Realiza a conexão com o servidor FTP.
   * @throws {Error} Lança erro caso a conexão falhe.
   */
  private async connectToFtp(): Promise<void> {
    try {
      await this.client.access({
        host: this.IP,
        user: this.user,
        password: this.password
      });
    } catch (error: any) {
      this.handleFtpError(error);
    }
  }

  /**
   * Trata erros comuns de FTP e lança mensagens normalizadas.
   * @param {any} error Erro capturado.
   * @throws {Error} Erro normalizado.
   */
  private handleFtpError(error: any): void {
    if (error.code === 'ETIMEDOUT') {
      throw new Error('Conexão com o servidor FTP expirou (timeout).');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Conexão recusada pelo servidor FTP.');
    } else {
      throw new Error(`Erro inesperado: ${error.message || String(error)}`);
    }
  }

  /**
   * Lista arquivos CSV no diretório remoto, aplicando filtros de exclusão.
   * @param {string} remoteDir Diretório remoto.
   * @returns {Promise<Array<FileInfo>>} Lista de arquivos filtrados.
   */
  private async listCsvFiles(remoteDir: string): Promise<Array<FileInfo>> {
    const fileList = await this.client.list(remoteDir);
    return fileList
      .filter(file => file.type === FTPFileType.File && file.name.toLowerCase().endsWith('.csv'))
      .filter(file => !IHMService.isExcludedFile(file.name));
  }

  /**
   * Baixa um arquivo remoto para o diretório local.
   * @param {string} fileName Nome do arquivo remoto.
   * @param {string} localDir Diretório local onde o arquivo será salvo.
   * @returns {Promise<string>} Caminho local do arquivo baixado.
   */
  private async downloadFile(fileName: string, localDir: string): Promise<string> {
    const localPath = path.join(localDir, fileName);
    await this.client.downloadTo(localPath, fileName);
    return localPath;
  }

  /**
   * Encontra e baixa novos arquivos CSV do diretório remoto.
   * @param {string} localDir Diretório local para salvar os arquivos.
   * @param {Set<string>} [processedSet] Conjunto de arquivos já processados.
   * @returns {Promise<Array<{ name: string; localPath: string }>>} Arquivos baixados.
   */
  async findAndDownloadNewFiles(localDir: string, processedSet?: Set<string>): Promise<Array<{ name: string; localPath: string }>> {
    const remoteDir = '/InternalStorage/data/';
    const downloadedFiles: Array<{ name: string; localPath: string }> = [];

    try {
      await this.connectToFtp();
      const csvFiles = await this.listCsvFiles(remoteDir);

      for (const file of csvFiles) {
        if (processedSet?.has(file.name)) {
          continue;
        }

        const localPath = await this.downloadFile(file.name, localDir);
        downloadedFiles.push({ name: file.name, localPath });
      }
    } catch (error: any) {
      throw new Error(`Erro ao buscar e baixar arquivos: ${error.message}`);
    } finally {
      this.client.close();
    }

    return downloadedFiles;
  }

  /**
   * Retorna o arquivo mais recente baixado para `tmpDir` no formato esperado pelos testes.
   * Se não houver arquivo, retorna `null`.
   * @param tmpDir Diretório temporário para download
   */
  async getArc(tmpDir: string): Promise<{ localPath: string; file: string } | null> {
    const files = await this.findAndDownloadNewFiles(tmpDir);
    if (!files || files.length === 0) return null;
    const f = files[0]!;
    return { localPath: f.localPath, file: f.name };
  }
}

/**
 * Tipos auxiliares para informações de arquivos.
 */
interface FileInfo {
  name: string;
  type: FTPFileType;
  size?: number;
}

enum FileType {
  File = '-'
}