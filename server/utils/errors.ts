import { Response } from 'express';

export class BusinessRuleError extends Error {
  public readonly statusCode: number = 400;
  public readonly errorCode: string = 'BAD_REQUEST';

  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
    Object.setPrototypeOf(this, BusinessRuleError.prototype);
  }
}

export class NotFoundError extends Error {
  public readonly statusCode: number = 404;
  public readonly errorCode: string = 'NOT_FOUND';

  constructor(message: string = 'Recurso não encontrado.') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ForbiddenError extends Error {
  public readonly statusCode: number = 403;
  public readonly errorCode: string = 'FORBIDDEN';

  constructor(message: string = 'Acesso não autorizado a este recurso.') {
    super(message);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class UnauthorizedError extends Error {
  public readonly statusCode: number = 401;
  public readonly errorCode: string = 'UNAUTHORIZED';

  constructor(message: string = 'Autenticação necessária.') {
    super(message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Known business error messages that are safe to return to the client with status 400
 */
const SAFE_BUSINESS_ERROR_PREFIXES = [
  'A pesquisa de referência',
  'Pesquisa não encontrada',
  'Uma ou mais evidências',
  'Evidência não encontrada',
  'Problema não encontrado',
  'Um ou mais problemas',
  'Oportunidade não encontrada',
  'A oportunidade de referência',
  'Hipótese não encontrada',
  'A hipótese informada',
  'A hipótese é obrigatória',
  'Experimento não encontrado',
  'Experimento concluído não pode',
  'Experimento cancelado não pode',
  'Transição de draft direto',
  'O resultado só pode ser informado',
  'O aprendizado só pode ser informado',
  'O resultado é obrigatório',
  'Resultado inválido',
  'O aprendizado é obrigatório',
  'Critério de sucesso',
  'Conflito de concorrência detectado',
  'Apenas proprietários',
  'Administradores não possuem',
  'A pergunta deve ter',
  'A pergunta não pode exceder',
];

export function isSafeBusinessMessage(message: string): boolean {
  return SAFE_BUSINESS_ERROR_PREFIXES.some((prefix) => message.startsWith(prefix));
}

/**
 * Standardized API Route Error Handler
 * Ensures internal details (SQL, stack trace, host, db internals) NEVER leak to the client.
 */
export function handleRouteError(
  res: Response,
  error: unknown,
  contextMessage?: string
): void {
  const err = error instanceof Error ? error : new Error(String(error));

  // 1. Handled known domain/business errors
  if (error instanceof BusinessRuleError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.errorCode,
      message: error.message,
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.errorCode,
      message: error.message,
    });
    return;
  }

  if (error instanceof ForbiddenError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.errorCode,
      message: error.message,
    });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.errorCode,
      message: error.message,
    });
    return;
  }

  // 2. Check if the error message is a known safe business rule message
  if (isSafeBusinessMessage(err.message)) {
    res.status(400).json({
      success: false,
      error: 'BAD_REQUEST',
      message: err.message,
    });
    return;
  }

  // 3. Fallback for all unexpected/internal errors (Postgres, network, SDKs, syntax, etc.)
  // Log full error securely on the server only
  console.error(`[Internal Server Error - ${contextMessage || 'API'}]:`, err.message);

  // Return strictly standardized client-safe 500 response
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Não foi possível concluir a operação.',
  });
}
