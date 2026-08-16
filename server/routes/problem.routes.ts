import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProblemSchema, updateProblemSchema, uuidParamSchema, linkProblemEvidencesSchema } from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';
import { applyPagination } from '../utils/pagination.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

router.get('/', async (req: Request, res: Response) => {
  try {
    const list = await dbStore.listProblems(req.workspaceId!);
    const paginated = applyPagination(list, req.query.page, req.query.limit);
    res.json({ success: true, ...paginated });
  } catch (err) {
    handleRouteError(res, err, 'ListProblems');
  }
});

router.post('/', requireRole(['owner', 'admin', 'member']), validate({ body: createProblemSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.createProblem(req.workspaceId!, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'CreateProblem');
  }
});

router.get('/:id', validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.getProblemById(req.workspaceId!, req.params.id as string);
    if (!item) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Problema não encontrado' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'GetProblem');
  }
});

router.patch('/:id', requireRole(['owner', 'admin', 'member']), validate({ params: uuidParamSchema, body: updateProblemSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.updateProblem(req.workspaceId!, req.params.id as string, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'UpdateProblem');
  }
});

router.post('/:id/evidences', requireRole(['owner', 'admin', 'member']), validate({ params: uuidParamSchema, body: linkProblemEvidencesSchema }), async (req: Request, res: Response) => {
  try {
    await dbStore.linkProblemEvidences(req.workspaceId!, req.params.id as string, req.body.evidence_ids);
    res.json({ success: true, message: 'Evidências vinculadas com sucesso' });
  } catch (err) {
    handleRouteError(res, err, 'LinkProblemEvidences');
  }
});

export const problemRouter = router;
