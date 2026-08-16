import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOpportunitySchema, updateOpportunitySchema, uuidParamSchema } from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';
import { applyPagination } from '../utils/pagination.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

router.get('/', async (req: Request, res: Response) => {
  try {
    const list = await dbStore.listOpportunities(req.workspaceId!);
    const paginated = applyPagination(list, req.query.page, req.query.limit);
    res.json({ success: true, ...paginated });
  } catch (err) {
    handleRouteError(res, err, 'ListOpportunities');
  }
});

router.post('/', requireRole(['owner', 'admin', 'member']), validate({ body: createOpportunitySchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.createOpportunity(req.workspaceId!, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'CreateOpportunity');
  }
});

router.get('/:id', validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.getOpportunityById(req.workspaceId!, req.params.id as string);
    if (!item) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Oportunidade não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'GetOpportunity');
  }
});

router.patch('/:id', requireRole(['owner', 'admin', 'member']), validate({ params: uuidParamSchema, body: updateOpportunitySchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.updateOpportunity(req.workspaceId!, req.params.id as string, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'UpdateOpportunity');
  }
});

export const opportunityRouter = router;
