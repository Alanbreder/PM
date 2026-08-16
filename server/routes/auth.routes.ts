import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { handleRouteError } from '../utils/errors.js';
import { createLocalToken } from '../utils/jwt.js';

const router = Router();

// 1. Instant Admin Access (ADM)
router.post('/admin-login', async (req: Request, res: Response) => {
  try {
    const email = req.body.email || 'adm@sip.com';
    const name = req.body.name || 'Administrador (ADM)';
    const uid = 'usr_adm_master';

    // Ensure user exists in database
    const user = await dbStore.findOrCreateUser(uid, email, name);

    // Ensure user is an owner in at least one default workspace
    const userWorkspaces = await dbStore.listUserWorkspaces(uid);
    if (userWorkspaces.length === 0) {
      // Check if any workspace exists
      const existingWs = await dbStore.getWorkspaceById('ws_demo_001');
      if (existingWs) {
        try {
          await dbStore.addWorkspaceMember(existingWs.id, uid, 'owner');
        } catch {
          // Member might already exist
        }
      } else {
        await dbStore.createWorkspace('Workspace Principal', uid, 'Workspace Principal do Administrador');
      }
    }

    const token = createLocalToken({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: 'owner',
    });

    res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: 'owner',
      },
    });
  } catch (err) {
    handleRouteError(res, err, 'AdminLogin');
  }
});

// 2. Direct Email/Password Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'Email é obrigatório' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const uid = `usr_${Buffer.from(cleanEmail).toString('hex').slice(0, 16)}`;
    const name = req.body.name || cleanEmail.split('@')[0];

    const user = await dbStore.findOrCreateUser(uid, cleanEmail, name);

    // Ensure workspace membership
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
        await dbStore.createWorkspace('Meu Workspace', uid, 'Workspace Padrão');
      }
    }

    const token = createLocalToken({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: 'owner',
    });

    res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    handleRouteError(res, err, 'DirectLogin');
  }
});

// 3. Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'Email é obrigatório' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const uid = `usr_${Buffer.from(cleanEmail).toString('hex').slice(0, 16)}`;
    const userName = name || cleanEmail.split('@')[0];

    const user = await dbStore.findOrCreateUser(uid, cleanEmail, userName);

    // Ensure workspace membership
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
        await dbStore.createWorkspace('Meu Workspace', uid, 'Workspace Padrão');
      }
    }

    const token = createLocalToken({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: 'owner',
    });

    res.json({
      success: true,
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    handleRouteError(res, err, 'Register');
  }
});

// 4. Sync User profile
router.post('/sync-user', async (req: Request, res: Response) => {
  try {
    const { uid, email, name } = req.body;
    if (!uid || !email) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'uid e email são obrigatórios' });
      return;
    }

    const user = await dbStore.findOrCreateUser(uid, email, name);
    res.json({ success: true, data: user });
  } catch (err) {
    handleRouteError(res, err, 'SyncUser');
  }
});

export const authRouter = router;

