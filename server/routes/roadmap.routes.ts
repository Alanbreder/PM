import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRoadmapItemSchema, updateRoadmapItemSchema, uuidParamSchema } from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';
import { applyPagination } from '../utils/pagination.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

// List roadmap items with optional timeframe and status filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const timeframe = req.query.timeframe ? String(req.query.timeframe) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const list = await dbStore.listRoadmapItems(req.workspaceId!, timeframe, status);
    const paginated = applyPagination(list, req.query.page, req.query.limit);
    res.json({ success: true, ...paginated });
  } catch (err) {
    handleRouteError(res, err, 'ListRoadmapItems');
  }
});

// Create a new roadmap item
router.post(
  '/',
  requireRole(['owner', 'admin', 'member']),
  validate({ body: createRoadmapItemSchema }),
  async (req: Request, res: Response) => {
    try {
      const item = await dbStore.createRoadmapItem(req.workspaceId!, req.body);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      handleRouteError(res, err, 'CreateRoadmapItem');
    }
  }
);

// Get single roadmap item by ID
router.get('/:id', validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.getRoadmapItemById(req.workspaceId!, req.params.id as string);
    if (!item) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Iniciativa de Roadmap não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'GetRoadmapItem');
  }
});

// Get discovery lineage for a roadmap item (End-to-End Traceability)
router.get('/:id/lineage', validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    const lineage = await dbStore.getRoadmapItemLineage(req.workspaceId!, req.params.id as string);
    res.json({ success: true, data: lineage });
  } catch (err) {
    handleRouteError(res, err, 'GetRoadmapLineage');
  }
});

// Update roadmap item
router.patch(
  '/:id',
  requireRole(['owner', 'admin', 'member']),
  validate({ params: uuidParamSchema, body: updateRoadmapItemSchema }),
  async (req: Request, res: Response) => {
    try {
      const item = await dbStore.updateRoadmapItem(req.workspaceId!, req.params.id as string, req.body);
      res.json({ success: true, data: item });
    } catch (err) {
      handleRouteError(res, err, 'UpdateRoadmapItem');
    }
  }
);

// Delete roadmap item
router.delete(
  '/:id',
  requireRole(['owner', 'admin']),
  validate({ params: uuidParamSchema }),
  async (req: Request, res: Response) => {
    try {
      await dbStore.deleteRoadmapItem(req.workspaceId!, req.params.id as string);
      res.json({ success: true, message: 'Iniciativa de Roadmap removida com sucesso' });
    } catch (err) {
      handleRouteError(res, err, 'DeleteRoadmapItem');
    }
  }
);

export const roadmapRouter = router;
