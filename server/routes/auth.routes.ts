import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { handleRouteError } from '../utils/errors.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Sync Authenticated Firebase User profile into database
router.post('/sync-user', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.uid) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Usuário não autenticado' });
      return;
    }

    const { name } = req.body;
    const uid = req.user.uid;
    const email = req.user.email || req.body.email || '';

    if (!email) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'Email é obrigatório' });
      return;
    }

    const user = await dbStore.findOrCreateUser(uid, email, name);

    // Ensure user has at least one default workspace if they have none
    const userWorkspaces = await dbStore.listUserWorkspaces(uid);
    if (userWorkspaces.length === 0) {
      const existingWs = await dbStore.getWorkspaceById('ws_demo_001');
      if (existingWs) {
        try {
          await dbStore.addWorkspaceMember(existingWs.id, uid, 'owner');
        } catch {
          // Ignore if already member
        }
      } else {
        await dbStore.createWorkspace('Workspace Principal', uid, 'Workspace Padrão');
      }
    }

    res.json({ success: true, data: user });
  } catch (err) {
    handleRouteError(res, err, 'SyncUser');
  }
});

export const authRouter = router;
