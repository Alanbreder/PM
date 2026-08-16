import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../../src/lib/firebase-admin.js';
import { dbStore } from '../db/store.js';
import { WorkspaceRole } from '../types/index.js';
import { verifyLocalToken } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
      };
      workspaceId?: string;
      workspaceRole?: WorkspaceRole;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Mock auth is ONLY allowed when NODE_ENV === 'test' AND ALLOW_DEV_MOCK_AUTH === 'true'
  // In development, staging, and production, real Firebase Bearer JWT or verified local token is strictly required.
  const isMockAuthAllowed =
    process.env.NODE_ENV === 'test' &&
    process.env.ALLOW_DEV_MOCK_AUTH === 'true';

  if (isMockAuthAllowed && req.headers['x-test-user-id']) {
    req.user = {
      uid: String(req.headers['x-test-user-id']),
      email: String(req.headers['x-test-user-email'] || 'test@example.com'),
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticação não fornecido',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  if (isMockAuthAllowed && token === 'demo-token') {
    req.user = {
      uid: String(req.headers['x-test-user-id'] || 'usr_demo_admin'),
      email: String(req.headers['x-test-user-email'] || 'demo@productos.io'),
    };
    return next();
  }

  // 1. Try local verified cryptographic token
  const localPayload = verifyLocalToken(token);
  if (localPayload) {
    req.user = {
      uid: localPayload.uid,
      email: localPayload.email || '',
    };
    return next();
  }

  // 2. Try Firebase ID Token verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    };
    next();
  } catch (error) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticação inválido ou expirado',
    });
    return;
  }
};

export const requireWorkspace = async (req: Request, res: Response, next: NextFunction) => {
  const workspaceId =
    (req.headers['x-workspace-id'] as string) ||
    (req.params.workspaceId as string) ||
    (req.body && req.body.workspace_id as string);

  if (!workspaceId) {
    res.status(400).json({
      error: 'MISSING_WORKSPACE_HEADER',
      message: 'Cabeçalho x-workspace-id ou parâmetro de workspace é obrigatório',
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Usuário não autenticado',
    });
    return;
  }

  try {
    const member = await dbStore.getWorkspaceMember(workspaceId, req.user.uid);
    if (!member) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Acesso negado a este workspace',
      });
      return;
    }

    req.workspaceId = workspaceId;
    req.workspaceRole = member.role;
    next();
  } catch (error) {
    console.error('requireWorkspace error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Erro ao verificar permissões de workspace',
    });
  }
};

export const requireRole = (allowedRoles: WorkspaceRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.workspaceRole) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Papel no workspace não identificado',
      });
      return;
    }

    if (!allowedRoles.includes(req.workspaceRole)) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Você não tem permissão para realizar esta ação neste workspace',
      });
      return;
    }

    next();
  };
};
