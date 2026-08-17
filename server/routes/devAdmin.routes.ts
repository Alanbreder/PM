import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { handleRouteError } from '../utils/errors.js';
import crypto from 'crypto';

const router = Router();

// In-memory active session tokens for dev admin (expires in 8 hours)
interface DevAdminSession {
  uid: string;
  email: string;
  name: string;
  expiresAt: number;
}

const devAdminSessions = new Map<string, DevAdminSession>();

export function getDevAdminSession(token: string): DevAdminSession | null {
  // Triple-check environment
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    return null;
  }
  if (process.env.ALLOW_DEV_ADMIN !== 'true') {
    return null;
  }

  const session = devAdminSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    devAdminSessions.delete(token);
    return null;
  }

  return session;
}

// Check dev status endpoint (used by UI to know if Dev Admin button should be rendered)
router.get('/status', (req: Request, res: Response) => {
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV;
  const isEnabled = isDev && process.env.ALLOW_DEV_ADMIN === 'true';
  const requiresKey = Boolean(process.env.DEV_ADMIN_KEY && process.env.DEV_ADMIN_KEY.trim() !== '');

  res.json({
    enabled: isEnabled,
    requiresKey,
    environment: process.env.NODE_ENV || 'development',
  });
});

// DEV Admin Session Request Endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    // 1. Strict Environment Barrier: Only development (or controlled test)
    if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
      res.status(403).json({
        error: 'DEV_ADMIN_DISABLED',
        message: 'Dev Admin Mode é estritamente proibido fora do ambiente de desenvolvimento.',
      });
      return;
    }

    // 2. Explicit Flag Barrier: ALLOW_DEV_ADMIN must be 'true'
    if (process.env.ALLOW_DEV_ADMIN !== 'true') {
      res.status(403).json({
        error: 'DEV_ADMIN_DISABLED',
        message: 'Dev Admin Mode não está habilitado. Configure ALLOW_DEV_ADMIN=true no ambiente.',
      });
      return;
    }

    // 3. Local / Sandbox Environment Check
    const ip = req.ip || req.socket?.remoteAddress || '';
    const isAllowedHost =
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip === '::ffff:127.0.0.1' ||
      ip === 'localhost' ||
      req.hostname === 'localhost' ||
      req.hostname === '127.0.0.1' ||
      (req.hostname && req.hostname.endsWith('.run.app')) ||
      (req.hostname && req.hostname.endsWith('.googleusercontent.com'));

    if (!isAllowedHost) {
      res.status(403).json({
        error: 'FORBIDDEN_ORIGIN',
        message: 'Dev Admin Mode só aceita requisições originadas em ambiente de desenvolvimento.',
      });
      return;
    }

    // 4. Optional secret key verification if DEV_ADMIN_KEY is configured
    const configuredKey = process.env.DEV_ADMIN_KEY;
    if (configuredKey && configuredKey.trim() !== '') {
      const providedKey = (req.headers['x-dev-admin-key'] as string) || (req.body && req.body.dev_admin_key);
      if (!providedKey || providedKey !== configuredKey) {
        res.status(401).json({
          error: 'INVALID_DEV_KEY',
          message: 'Chave de desenvolvimento inválida ou ausente.',
        });
        return;
      }
    }

    // 5. Backend is the sole authority for UID, Email and Role (Ignore any frontend parameters)
    const adminUid = process.env.DEV_ADMIN_UID || 'usr_dev_admin';
    const adminEmail = process.env.DEV_ADMIN_EMAIL || 'dev-admin@local.test';
    const adminName = 'Administrador (Dev Mode)';

    // 6. Ensure user exists in database
    const user = await dbStore.findOrCreateUser(adminUid, adminEmail, adminName);

    // 7. Ensure Dev Admin has owner role on workspace
    const userWorkspaces = await dbStore.listUserWorkspaces(adminUid);
    let targetWsId = userWorkspaces[0]?.id;

    if (!targetWsId) {
      const existingWs = await dbStore.getWorkspaceById('ws_demo_001');
      if (existingWs) {
        try {
          await dbStore.addWorkspaceMember(existingWs.id, adminUid, 'owner');
          targetWsId = existingWs.id;
        } catch {
          targetWsId = existingWs.id;
        }
      } else {
        const newWs = await dbStore.createWorkspace('Workspace de Desenvolvimento', adminUid, 'Workspace do Administrador Dev');
        targetWsId = newWs.id;
      }
    } else {
      // Ensure owner role
      const member = await dbStore.getWorkspaceMember(targetWsId, adminUid);
      if (member && member.role !== 'owner') {
        await dbStore.updateMemberRole(targetWsId, adminUid, 'owner');
      }
    }

    // 8. Generate dynamic cryptographic ephemeral token stored in memory map
    const sessionToken = `dev_admin_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours

    devAdminSessions.set(sessionToken, {
      uid: adminUid,
      email: adminEmail,
      name: adminName,
      expiresAt,
    });

    res.json({
      success: true,
      token: sessionToken,
      user: {
        uid: adminUid,
        email: adminEmail,
        name: adminName,
        role: 'owner',
      },
      workspace_id: targetWsId,
    });
  } catch (err) {
    handleRouteError(res, err, 'DevAdminLogin');
  }
});

export const devAdminRouter = router;
