import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberSchema,
  uuidParamSchema,
  userIdParamSchema,
} from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  try {
    const workspaces = await dbStore.listUserWorkspaces(req.user!.uid);
    res.json({ success: true, data: workspaces });
  } catch (err) {
    handleRouteError(res, err, 'ListWorkspaces');
  }
});

router.post('/', validate({ body: createWorkspaceSchema }), async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const workspace = await dbStore.createWorkspace(name, req.user!.uid, description);
    res.status(201).json({ success: true, data: workspace });
  } catch (err) {
    handleRouteError(res, err, 'CreateWorkspace');
  }
});

router.get('/members', requireWorkspace, async (req: Request, res: Response) => {
  try {
    const members = await dbStore.listWorkspaceMembers(req.workspaceId!);
    res.json({ success: true, data: members });
  } catch (err) {
    handleRouteError(res, err, 'ListMembers');
  }
});

router.post(
  '/members',
  requireWorkspace,
  requireRole(['owner', 'admin']),
  validate({ body: addWorkspaceMemberSchema }),
  async (req: Request, res: Response) => {
    try {
      const { user_id, role } = req.body;
      const member = await dbStore.addWorkspaceMember(req.workspaceId!, user_id, role);
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      handleRouteError(res, err, 'AddMember');
    }
  }
);

router.patch(
  '/members/:userId',
  requireWorkspace,
  requireRole(['owner', 'admin']),
  validate({ body: updateWorkspaceMemberSchema }),
  async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      const member = await dbStore.updateMemberRole(req.workspaceId!, req.params.userId as string, role);
      res.json({ success: true, data: member });
    } catch (err) {
      handleRouteError(res, err, 'UpdateMemberRole');
    }
  }
);

router.delete(
  '/members/:userId',
  requireWorkspace,
  requireRole(['owner', 'admin']),
  async (req: Request, res: Response) => {
    try {
      await dbStore.removeMember(req.workspaceId!, req.params.userId as string);
      res.json({ success: true, message: 'Membro removido com sucesso' });
    } catch (err) {
      handleRouteError(res, err, 'RemoveMember');
    }
  }
);

export const workspaceRouter = router;
