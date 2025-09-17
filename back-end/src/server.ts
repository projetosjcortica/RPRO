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

import multer from 'multer';
const upload = multer({ dest: 'tmp/processed/' });

import configService from './utils/config';
// Cria a aplicação Express
const app = express();
const port = Number(process.env.PORT || 3000);

// Recebe o config 
process.on('message', async (message) => {
  if (message.type === 'config') {
    console.log('Configuração recebida do pai:', message.data);
    // Atualiza a configuração do servidor
    let data = message.data;
    configService.processData(data )

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
