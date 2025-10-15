import { Express, Request, Response, NextFunction } from 'express';

/**
 * Middleware para garantir que o banco de dados está conectado
 */
export async function ensureDatabaseConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const { dbService } = await import('../services/dbService');
    await dbService.init();
    next();
  } catch (e) {
    console.warn('[DB] ensureDatabaseConnection failed:', String(e));
    res.status(503).json({ error: 'Database connection failed', details: String(e) });
  }
}

/**
 * Middleware de tratamento de erros global
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error Handler]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Middleware de CORS configurado
 */
export function setupCors(app: Express) {
  const cors = require('cors');
  
  // Allow CORS from any origin during development
  app.use(cors());
  
  // Explicitly respond to OPTIONS preflight for all routes
  app.options('*', cors());

  // Extra safety: ensure the common CORS headers are present on all responses
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
  });
}
