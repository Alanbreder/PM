import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createExperimentSchema, updateExperimentSchema, uuidParamSchema } from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';
import { applyPagination } from '../utils/pagination.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

router.get('/', async (req: Request, res: Response) => {
  try {
    const hypothesisId = req.query.hypothesis_id ? String(req.query.hypothesis_id) : undefined;
    const list = await dbStore.listExperiments(req.workspaceId!, hypothesisId);
    const paginated = applyPagination(list, req.query.page, req.query.limit);
    res.json({ success: true, ...paginated });
  } catch (err) {
    handleRouteError(res, err, 'ListExperiments');
  }
});

router.post('/', requireRole(['owner', 'admin', 'member']), validate({ body: createExperimentSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.createExperiment(req.workspaceId!, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'CreateExperiment');
  }
});

router.get('/:id', validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.getExperimentById(req.workspaceId!, req.params.id as string);
    if (!item) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Experimento não encontrado' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'GetExperiment');
  }
});

router.patch('/:id', requireRole(['owner', 'admin', 'member']), validate({ params: uuidParamSchema, body: updateExperimentSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.updateExperiment(req.workspaceId!, req.params.id as string, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'UpdateExperiment');
  }
});

export const experimentRouter = router;
