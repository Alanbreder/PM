import { Response } from 'express';

export class BusinessRuleError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'BusinessRuleError';
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Autenticação necessária') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Acesso negado') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Recurso não encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export function handleRouteError(res: Response, error: any, contextLabel: string) {
  if (error instanceof BusinessRuleError) {
    res.status(400).json({
      success: false,
      error: 'BUSINESS_RULE_VIOLATION',
      message: error.message,
    });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: error.message,
    });
    return;
  }

  if (error instanceof ForbiddenError) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: error.message,
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: error.message,
    });
    return;
  }

  console.error(`[${contextLabel}] Internal Server Error:`, error instanceof Error ? error.stack : error);

  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Ocorreu um erro interno no servidor. Por favor, tente novamente.',
  });
}
