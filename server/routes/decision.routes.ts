import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createDecisionSchema, updateDecisionSchema, uuidParamSchema } from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';
import { applyPagination } from '../utils/pagination.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

router.get('/', async (req: Request, res: Response) => {
  try {
    const experimentId = req.query.experiment_id ? String(req.query.experiment_id) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const list = await dbStore.listDecisions(req.workspaceId!, experimentId, status);
    const paginated = applyPagination(list, req.query.page, req.query.limit);
    res.json({ success: true, ...paginated });
  } catch (err) {
    handleRouteError(res, err, 'ListDecisions');
  }
});

router.post('/', requireRole(['owner', 'admin', 'member']), validate({ body: createDecisionSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.createDecision(req.workspaceId!, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'CreateDecision');
  }
});

router.get('/:id', validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.getDecisionById(req.workspaceId!, req.params.id as string);
    if (!item) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Decisão não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'GetDecision');
  }
});

router.patch('/:id', requireRole(['owner', 'admin', 'member']), validate({ params: uuidParamSchema, body: updateDecisionSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.updateDecision(req.workspaceId!, req.params.id as string, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'UpdateDecision');
  }
});

router.delete('/:id', requireRole(['owner', 'admin']), validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    await dbStore.deleteDecision(req.workspaceId!, req.params.id as string);
    res.json({ success: true, message: 'Decisão removida com sucesso' });
  } catch (err) {
    handleRouteError(res, err, 'DeleteDecision');
  }
});

export const decisionRouter = router;
