/**
 * Inicialização do servidor Express e registro das rotas principais.
 * Contém apenas endpoints essenciais e middlewares de segurança/erro.
 */

import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import errorHandler from './middleware/errorHandler';
import logs from './middleware/logs';
import dbController from './controllers/dbController';
import fileController from './controllers/fileController';
import ihmController from './controllers/ihmController';
import paginateController from './controllers/paginateController';
import syncController from './controllers/syncController';
import Contexto from './index';

import multer from 'multer';
const upload = multer({ dest: 'tmp/processed/' });

import configService from './utils/config';
// Cria a aplicação Express
const app = express();
const port = Number(process.env.PORT || 3000);

// Recebe o config 
process.on('message', async (message: any) => {
  if (message && typeof message === 'object' && message.type === 'config') {
    console.log('Configuração recebida do pai:', message.data);
    // Atualiza a configuração do servidor
    let data = message.data;
    // configService.processData(data) // Commented out since method doesn't exist

  }
});


// Middlewares de segurança, parsing e logs
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('combined'));
app.use(logs);

// Health check simples para monitoramento
app.get('/health', (req: Request, res: Response) => res.json({ status: 'ok' }));

// Root endpoint usado pelos testes
app.get('/', (_req: Request, res: Response) => res.json({ message: 'ok' }));

// Instancia Contexto para rotas que precisam de acesso a DB/collector
const contexto = new (Contexto as any)();

// Expor endpoint de tabela compatível com frontend
app.get('/api/data', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.max(1, Number(req.query.pageSize || 300));
    const filters = {
      formula: (req.query.formula as string) || null,
      dateStart: (req.query.dateStart as string) || null,
      dateEnd: (req.query.dateEnd as string) || null,
      sortBy: (req.query.sortBy as string) || null,
      sortDir: ((req.query.sortDir as string) === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC'
    };
    const data = await contexto.getTableData(page, pageSize, filters);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message || String(err) });
  }
});

// Expor endpoint de chart com agregação
app.get('/api/chart', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.max(1, Number(req.query.pageSize || 300));
    const filters = {
      formula: (req.query.formula as string) || null,
      dateStart: (req.query.dateStart as string) || null,
      dateEnd: (req.query.dateEnd as string) || null,
      sortBy: (req.query.sortBy as string) || null,
      sortDir: ((req.query.sortDir as string) === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC'
    };
    const chart = await contexto.getChartData(page, pageSize, filters);
    res.json(chart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message || String(err) });
  }
});

// Rotas principais (mapeamento explícito para funções dos controllers)
app.get('/api/db/batches', dbController.listBatches);
app.post('/api/files/upload', upload.single('file'), fileController.uploadFile);
app.post('/api/ihm/fetch', ihmController.fetchLatestFromIHM);
app.get('/api/ihm/list', ihmController.list);
app.get('/api/relatorio', paginateController.paginate);
// app.get('/api/relatorio/files', paginateController.listFiles);
// app.get('/api/relatorio/count', paginateController.countFile);
app.post('/api/sync/local-to-main', syncController.syncLocalToMain);
app.post('/api/materiaprima', dbController.setupMateriaPrima);
// Middleware de tratamento de erros (sempre por último)
app.use(errorHandler);

// Inicia o servidor quando este arquivo for executado diretamente
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

// Exportação da aplicação para testes ou uso externo
export default app;
