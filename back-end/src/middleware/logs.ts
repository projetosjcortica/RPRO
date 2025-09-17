import { Request, Response, NextFunction } from 'express';

/**
 * Middleware simples de logs das requisições.
 * Registra método, URL e timestamp no console.
 */
const logsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

export default logsMiddleware;
