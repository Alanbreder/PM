import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../../src/lib/firebase-admin.js';
import { dbStore } from '../db/store.js';
import { WorkspaceRole } from '../types/index.js';

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

  // Check if dev/demo mock auth is enabled or in non-production
  const isDevMockAllowed =
    process.env.ALLOW_DEV_MOCK_AUTH === 'true' ||
    process.env.NODE_ENV !== 'production';

  if (isDevMockAllowed && req.headers['x-test-user-id']) {
    req.user = {
      uid: String(req.headers['x-test-user-id']),
      email: String(req.headers['x-test-user-email'] || 'demo@productos.io'),
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isDevMockAllowed) {
      req.user = {
        uid: 'usr_demo_admin',
        email: 'demo@productos.io',
      };
      return next();
    }
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Token de autenticação não fornecido',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  if (isDevMockAllowed && (token === 'demo-token' || !token)) {
    req.user = {
      uid: String(req.headers['x-test-user-id'] || 'usr_demo_admin'),
      email: String(req.headers['x-test-user-email'] || 'demo@productos.io'),
    };
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
    };
    next();
  } catch (error) {
    if (isDevMockAllowed) {
      req.user = {
        uid: String(req.headers['x-test-user-id'] || 'usr_demo_admin'),
        email: String(req.headers['x-test-user-email'] || 'demo@productos.io'),
      };
      return next();
    }
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
