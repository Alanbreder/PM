import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { handleRouteError } from '../utils/errors.js';

const router = Router();

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
