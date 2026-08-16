import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createHypothesisSchema, uuidParamSchema } from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';
import { applyPagination } from '../utils/pagination.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

router.get('/', async (req: Request, res: Response) => {
  try {
    const opportunityId = req.query.opportunity_id ? String(req.query.opportunity_id) : undefined;
    const list = await dbStore.listHypotheses(req.workspaceId!, opportunityId);
    const paginated = applyPagination(list, req.query.page, req.query.limit);
    res.json({ success: true, ...paginated });
  } catch (err) {
    handleRouteError(res, err, 'ListHypotheses');
  }
});

router.post('/', requireRole(['owner', 'admin', 'member']), validate({ body: createHypothesisSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.createHypothesis(req.workspaceId!, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'CreateHypothesis');
  }
});

export const hypothesisRouter = router;
