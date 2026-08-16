import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const memoryStore: RateLimitStore = {};

export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}_${req.user?.uid || 'anon'}`;
    const now = Date.now();

    if (!memoryStore[key] || memoryStore[key].resetTime < now) {
      memoryStore[key] = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      return next();
    }

    memoryStore[key].count += 1;

    if (memoryStore[key].count > options.max) {
      res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: options.message || 'Muitas requisições. Por favor, aguarde antes de tentar novamente.',
      });
      return;
    }

    next();
  };
};

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute
  message: 'Limite de chamadas ao assistente de IA excedido. Tente novamente em 1 minuto.',
});
