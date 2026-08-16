import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createEvidenceSchema, batchCreateEvidenceSchema } from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';
import { applyPagination } from '../utils/pagination.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

router.get('/', async (req: Request, res: Response) => {
  try {
    const researchId = req.query.research_id ? String(req.query.research_id) : undefined;
    const list = await dbStore.listEvidences(req.workspaceId!, researchId);
    const paginated = applyPagination(list, req.query.page, req.query.limit);
    res.json({ success: true, ...paginated });
  } catch (err) {
    handleRouteError(res, err, 'ListEvidences');
  }
});

router.post('/', requireRole(['owner', 'admin', 'member']), validate({ body: createEvidenceSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.createEvidence(req.workspaceId!, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'CreateEvidence');
  }
});

router.post('/batch', requireRole(['owner', 'admin', 'member']), validate({ body: batchCreateEvidenceSchema }), async (req: Request, res: Response) => {
  try {
    const items = await dbStore.batchCreateEvidences(req.workspaceId!, req.body.evidences);
    res.status(201).json({ success: true, data: items });
  } catch (err) {
    handleRouteError(res, err, 'BatchCreateEvidence');
  }
});

export const evidenceRouter = router;
