import { Request, Response, NextFunction } from 'express';

/**
 * Middleware central de tratamento de erros.
 * Comentários e mensagens em Português (Brasil).
 * Registra o erro no console e retorna um JSON com o status e a mensagem ao cliente.
 */
// Middleware para tratamento de erros
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  // Log detalhado no servidor (stack quando disponível)
  // eslint-disable-next-line no-console
  console.error('[errorHandler] ', err);
  // tente extrair um status e mensagem amigáveis
  // @ts-ignore - alguns erros personalizados podem ter 'status' e 'message'
  const status = (err as any)?.status || 500;
  const message = (err as any)?.message || 'Erro interno do servidor';
  res.status(status).json({ error: message });
};

export default errorHandler;
