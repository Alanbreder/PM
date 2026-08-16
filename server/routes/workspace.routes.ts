import { Router, Request, Response } from 'express';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberSchema,
  uuidParamSchema,
  userIdParamSchema,
} from '../schemas/index.js';
import { dbStore } from '../db/store.js';
import { handleRouteError } from '../utils/errors.js';

export const workspaceRouter = Router();

// List Workspaces for Authenticated User
workspaceRouter.get(
  '/workspaces',
  authenticate,
  async (req: Request, res: Response) => {
    const user = req.user!;

    try {
      const workspaces = await dbStore.listWorkspacesForUser(user.id);
      res.json({ workspaces });
    } catch (error: any) {
      handleRouteError(res, error, 'listWorkspacesForUser');
    }
  }
);

// Create new Workspace
workspaceRouter.post(
  '/workspaces',
  authenticate,
  validate({ body: createWorkspaceSchema }),
  async (req: Request, res: Response) => {
    const { name, slug } = req.body;
    const user = req.user!;

    try {
      const ws = await dbStore.createWorkspace(name, slug, user.id);
      res.status(201).json({ workspace: ws });
    } catch (error: any) {
      handleRouteError(res, error, 'createWorkspace');
    }
  }
);

// Get specific Workspace
workspaceRouter.get(
  '/workspaces/:id',
  authenticate,
  validate({ params: uuidParamSchema }),
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.params.id;

    try {
      const ws = await dbStore.getWorkspaceById(workspaceId);
      if (!ws) {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Workspace não encontrado.',
        });
        return;
      }
      res.json({ workspace: ws, userRole: req.workspaceRole });
    } catch (error: any) {
      handleRouteError(res, error, 'getWorkspaceById');
    }
  }
);

// List workspace members
workspaceRouter.get(
  '/workspaces/:id/members',
  authenticate,
  validate({ params: uuidParamSchema }),
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.params.id;

    try {
      const members = await dbStore.listWorkspaceMembers(workspaceId);
      res.json({ members });
    } catch (error: any) {
      handleRouteError(res, error, 'listWorkspaceMembers');
    }
  }
);

// Add member to workspace (Owner/Admin only)
workspaceRouter.post(
  '/workspaces/:id/members',
  authenticate,
  validate({ params: uuidParamSchema, body: addWorkspaceMemberSchema }),
  requireWorkspace,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    const callerRole = req.workspaceRole;
    const workspaceId = req.params.id;
    const { user_id, role } = req.body;

    // Regra estrita: Administradores NÃO podem promover ou convidar usuários como "owner"
    if (callerRole === 'admin' && role === 'owner') {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Administradores não possuem permissão para atribuir o papel de proprietário.',
      });
      return;
    }

    try {
      const member = await dbStore.addMember(workspaceId, user_id, role);
      res.status(201).json({ member });
    } catch (error: any) {
      handleRouteError(res, error, 'addMember');
    }
  }
);

// Update member role (Owner/Admin only)
workspaceRouter.patch(
  '/workspaces/:id/members/:userId',
  authenticate,
  validate({ params: userIdParamSchema, body: updateWorkspaceMemberSchema }),
  requireWorkspace,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    const callerRole = req.workspaceRole;
    const workspaceId = req.params.id;
    const targetUserId = req.params.userId;
    const { role: newRole } = req.body;

    if (callerRole === 'admin' && newRole === 'owner') {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Administradores não possuem permissão para atribuir o papel de proprietário.',
      });
      return;
    }

    try {
      const member = await dbStore.updateMemberRole(workspaceId, targetUserId, newRole);
      res.json({ member });
    } catch (error: any) {
      handleRouteError(res, error, 'updateMemberRole');
    }
  }
);

// Remove member from workspace (Owner/Admin only)
workspaceRouter.delete(
  '/workspaces/:id/members/:userId',
  authenticate,
  validate({ params: userIdParamSchema }),
  requireWorkspace,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    const workspaceId = req.params.id;
    const targetUserId = req.params.userId;

    try {
      await dbStore.removeMember(workspaceId, targetUserId);
      res.json({ success: true, message: 'Membro removido com sucesso do workspace.' });
    } catch (error: any) {
      handleRouteError(res, error, 'removeMember');
    }
  }
);


