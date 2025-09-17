// Este arquivo serve como ponto de entrada para o servidor e exporta as funções principais.

// // Importa o aplicativo Express a partir do arquivo 'server.ts'.
// import app from './server';

// // Exporta o aplicativo para que possa ser utilizado em outros módulos.
// export { app };

import { ConfigData, Batidas, ChartData, TableData } from './types/interfaces';
import { Relatorio } from './entities/Relatorio';
import dbService, { DBService } from './services/dbService';
import IHMService from './services/IHMService';
import { DataSource, Table } from 'typeorm';
import fileProcessorService from './services/fileProcessorService';
import BackupService from './services/backupService';
import path from 'path';
import fs from 'fs';
import { setTimeout as wait } from 'timers/promises';


const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
let STOP = false;

export function stopCollector() {
    STOP = true;
}

class Collector {
    private fileProcessor: typeof fileProcessorService;
    private backup: BackupService;

    constructor(private ihmService: IHMService) {
        this.fileProcessor = fileProcessorService;
        this.backup = new BackupService();
    }

    async start() {
        try {
            console.log('Iniciando o processo de coleta...');
            const downloaded = await this.ihmService.findAndDownloadNewFiles(TMP_DIR);
            console.log(`${downloaded.length} arquivos baixados.`);
            for (const f of downloaded) {
                if (STOP) break;
                console.log(`Processando arquivo: ${f.name} -> ${f.localPath}`);
                const result = await this.fileProcessor.processFile(f.localPath);
                await this.backup.backupFile({ originalname: f.name, path: f.localPath, mimetype: 'text/csv', size: fs.statSync(f.localPath).size });
                console.log('Processado:', result);
            }
            console.log('Processo de coleta concluído com sucesso.');
        } catch (error) {
            console.error('Erro durante o processo de coleta:', error);
        }
    }
}



export async function startCollector(context: Contexto) {
    // await initDb();
    context.collectorInstance.start();
    while (!STOP) {
        await wait(POLL_INTERVAL);
    }
    console.log('Coletor encerrado.');
}

class Contexto {
    public config!: ConfigData;
    public ihmService!: IHMService;
    public dbService!: DBService;
    collectorInstance!: Collector;
    constructor() {
        // this.ihmService = new IHMService(this.config.ip, this.config.user, this.config.password);
        this.dbService = dbService;
        // this.collectorInstance = new Collector(this.ihmService);
        return;
    }


    startIHMService() {
        this.ihmService = new IHMService(this.config.ip, this.config.user, this.config.password);
    }

    startCollector() {
        this.collectorInstance.start();
    }

    // context.getTableData({  dateStart: '2023-01-01', dateEnd: '2023-12-31'  }) // exemplo
    // context.getChartData(1, 300, { formula: 'Form1', dateStart: '2023-01-01', dateEnd: '2023-12-31', sortBy: 'Dia', sortDir: 'DESC' })
    getTableData(page = 1, pageSize = 300, filters: { formula?: string | null; dateStart?: string | null; dateEnd?: string | null; sortBy?: string | null; sortDir?: "ASC" | "DESC"; }): Promise<TableData> {
        return this.dbService.queryDbRows(page, pageSize, filters).then(({ rows, total }) => {
            const pages = Math.ceil(total / pageSize);
            const batidas: Batidas[] = rows as any[];
            const rowsCount = rows.length;
            return {
                total,
                pages,
                currentPage: page,
                pageSize,
                batidas,
                rowsCount
            } as TableData;
        });
    }

    //
    getChartData(page: number, pageSize: number, filters: { formula?: string | null; dateStart?: string | null; dateEnd?: string | null; sortBy?: string | null; sortDir?: "ASC" | "DESC"; }): Promise<ChartData> {
        // não tem implementado no dbservice
        // tem que fazer na mão
        return this.dbService.queryDbRows(page, pageSize, filters).then(({ rows, total }) => {
            // rows já vêm no formato: { Dia, Hora, Nome, Form1, Form2, values: number[] }
            const formulaSums: Record<string, number> = {};
            const productSums: Record<string, number> = {};
            let rowsCount = rows.length;

            for (const r of rows) {
                const nome = r.Nome || 'Desconhecido';
                const values: any[] = Array.isArray(r.values) ? r.values : [];

                // soma por fórmula (usa primeiro valor como representativo, conforme frontend)
                const fval = Number(values[0] ?? r.Form1 ?? 0);
                if (!Number.isNaN(fval) && fval > 0) {
                    formulaSums[nome] = (formulaSums[nome] || 0) + fval;
                }

                // soma por produto: col6..col45 -> values[0]..values[39]
                for (let i = 0; i < values.length && i < 40; i++) {
                    const v = Number(values[i] ?? 0);
                    if (!Number.isNaN(v) && v > 0) {
                        const key = `col${i + 6}`; // manter a mesma chave usada pelo frontend
                        productSums[key] = (productSums[key] || 0) + v;
                    }
                }
            }

            const productData = Object.entries(productSums).map(([name, value]) => ({ name, value }));
            const productTotal = Object.values(productSums).reduce((a, b) => a + b, 0);
            // parsear pro ChartData
            const chartData: ChartData = {
                total,
                series: [
                    {
                        name: 'Fórmula',
                        data: Object.entries(formulaSums).map(([name, value]) => ({ x: name, y: value }))
                    },
                    {
                        name: 'Produto',
                        data: productData.map(({ name, value }) => ({ x: name, y: value }))
                    }
                ]
            };
            return chartData;
        });
        // how to use
        // context.getChartData(1, 300, { formula: 'Form1', dateStart: '2023-01-01', dateEnd: '2023-12-31', sortBy: 'Dia', sortDir: 'DESC' })
        // .then(chartData => console.log(chartData));
        // .catch(err => console.error(err));

    }


    async uploadCSVFile(filePath: string): Promise<void> {
        await fileProcessorService.processFile(filePath);
    }

    async loadSampleData(): Promise<void> {
        console.log('Loading sample data to database...');
        
        // Criar dados de exemplo diretamente no banco
        const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        const sampleData = [
            {
                Dia: today,
                Hora: '08:00',
                Nome: 'Produto A',
                Form1: 100,
                Form2: 80,
                values: [100, 80, 120, 90, 110, 75, 130, 95, 85, 105]
            },
            {
                Dia: today,
                Hora: '09:00',
                Nome: 'Produto B',
                Form1: 150,
                Form2: 120,
                values: [150, 120, 140, 110, 160, 125, 180, 135, 145, 155]
            },
            {
                Dia: today,
                Hora: '10:00',
                Nome: 'Produto C',
                Form1: 200,
                Form2: 180,
                values: [200, 180, 220, 190, 210, 175, 230, 195, 185, 205]
            },
            {
                Dia: today,
                Hora: '11:00',
                Nome: 'Produto D',
                Form1: 120,
                Form2: 100,
                values: [120, 100, 140, 110, 130, 95, 150, 115, 105, 125]
            },
            {
                Dia: today,
                Hora: '12:00',
                Nome: 'Produto E',
                Form1: 80,
                Form2: 60,
                values: [80, 60, 90, 70, 85, 55, 95, 75, 65, 85]
            }
        ];

        // Inserir os dados no banco usando o repositório
        const relatorioRepo = this.getRelatorioRepository();
        
        for (const data of sampleData) {
            const relatorio = new Relatorio();
            relatorio.Dia = (data.Dia || today) as string;
            relatorio.Hora = (data.Hora || '00:00') as string;
            relatorio.Nome = (data.Nome || 'Produto Desconhecido') as string;
            relatorio.Form1 = (data.Form1 || 0) as number;
            relatorio.Form2 = (data.Form2 || 0) as number;
            
            // Adicionar as colunas de valores (col6 a col45)
            for (let i = 0; i < data.values.length && i < 40; i++) {
                const colName = `col${i + 6}` as keyof Relatorio;
                (relatorio as any)[colName] = data.values[i];
            }
            
            await relatorioRepo.save(relatorio);
        }
        
        console.log(`Sample data loaded: ${sampleData.length} records inserted`);
    }

    getConfig(): ConfigData {
        return this.config;
    }

    setConfig(config: ConfigData) {
        this.config = config;
    }

    getDbService(): DBService {
        return dbService;
    }

    async initDb(): Promise<void> {
        await dbService.init();
        await dbService.syncSchema();
    }

    async closeDb(): Promise<void> {
        await dbService.destroy();
    }

    getRelatorioRepository() {
        return dbService.ds.getRepository(Relatorio);
    }
}

class Hermes {
    context: Contexto;
    eventos = ['getChartData', 'getTableData', 'uploadCSVFile', 'loadSampleData', 'getConfig', 'setConfig', 'initDb', 'closeDb', 'getDbService', 'getRelatorioRepository'];
    
    constructor() {
        this.context = new Contexto();
        console.log('Hermes instance created, PID:', process.pid);
    }

    async processMessage(message: any) {
        console.log('Received message:', message?.type || 'unknown');
        
        try {
            if (message.type === 'config') {
                console.log('Configuração recebida do pai:', message.data);
                const data = message.data;
                this.context.setConfig(data);
                this.context.startIHMService();
                this.context.collectorInstance = new Collector(this.context.ihmService);
                
                await this.context.initDb();
                console.log('Banco de dados inicializado.');
                this.context.startCollector();
                
                this.sendResponse('config', { success: true, message: 'Configuration applied successfully' });
                return;
            }
            
            if (message.type === 'stop') {
                console.log('Sinal de parada recebido.');
                stopCollector();
                await this.context.closeDb();
                console.log('Banco de dados fechado.');
                
                this.sendResponse('stop', { success: true, message: 'Shutdown complete' });
                process.exit(0);
            }

            if (this.eventos.includes(message.type)) {
                const fn = (this.context as any)[message.type];
                if (typeof fn === 'function') {
                    const result = await Promise.resolve(fn.apply(this.context, message.args || []));
                    this.sendResponse(message.type, result);
                } else {
                    this.sendError(message.type, `Method ${message.type} not found or not callable`);
                }
            } else {
                this.sendError(message.type, `Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            this.sendError(message.type, error instanceof Error ? error.message : String(error));
        }
    }
    
    private sendResponse(type: string, result: any) {
        if (process.send) {
            process.send({ type: `${type}-response`, result });
        }
    }
    
    private sendError(type: string, error: string) {
        if (process.send) {
            process.send({ type: `${type}-response`, error });
        }
    }
}

// Create single Hermes instance
const hermes = new Hermes();

// Add process event listeners for debugging
process.on('message', async (message: any) => {
    console.log(`[CHILD-${process.pid}] Received message:`, JSON.stringify(message, null, 2));
    await hermes.processMessage(message);
});

process.on('disconnect', () => {
    console.log(`[CHILD-${process.pid}] Parent disconnected`);
});

process.on('exit', (code) => {
    console.log(`[CHILD-${process.pid}] Process exiting with code:`, code);
});

// Send initial ready message
if (process.send) {
    process.send({ type: 'ready', pid: process.pid, message: 'Child process ready' });
}

export default Contexto;