import { Router } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';
import { AppRequest } from '../types/index.js';

export const prdRouter = Router();

const userStorySchema = z.object({
  id: z.string(),
  asA: z.string(),
  iWant: z.string(),
  soThat: z.string(),
  acceptanceCriteria: z.array(z.string()),
  status: z.enum(['draft', 'ready', 'in_progress', 'done']).optional(),
});

const createPRDSchema = z.object({
  roadmap_item_id: z.string().optional(),
  title: z.string().min(3, 'O título da PRD deve ter no mínimo 3 caracteres').max(255),
  summary: z.string().optional(),
  problem_statement: z.string().optional(),
  goals: z.array(z.string()).optional(),
  non_goals: z.array(z.string()).optional(),
  user_stories: z.array(userStorySchema).optional(),
  technical_notes: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  definition_of_done: z.array(z.string()).optional(),
  status: z.enum(['draft', 'in_review', 'approved', 'in_delivery', 'delivered', 'archived']).optional(),
});

const updatePRDSchema = createPRDSchema.partial();

// GET /api/prds
prdRouter.get('/', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const list = await dbStore.listPRDs(workspaceId);
    res.json({ data: list });
  } catch (error) {
    next(error);
  }
});

// GET /api/prds/:id
prdRouter.get('/:id', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const prd = await dbStore.getPRDById(workspaceId, req.params.id as string);
    if (!prd) {
      return res.status(404).json({ error: { message: 'PRD não encontrada' } });
    }
    res.json({ data: prd });
  } catch (error) {
    next(error);
  }
});

// POST /api/prds (member+)
prdRouter.post('/', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = createPRDSchema.parse(req.body);
    const created = await dbStore.createPRD(workspaceId, validated as any);

    await dbStore.logActivity(workspaceId, {
      entity_type: 'prd',
      entity_id: created.id,
      action: 'created',
      actor: { uid: req.user!.uid, email: req.user!.email, name: req.user!.name },
      details: { title: created.title },
    });

    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

// PUT /api/prds/:id (member+)
prdRouter.put('/:id', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = updatePRDSchema.parse(req.body);
    const updated = await dbStore.updatePRD(workspaceId, req.params.id as string, validated as any);
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/prds/:id (admin+)
prdRouter.delete('/:id', requireRole(['owner', 'admin']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    await dbStore.deletePRD(workspaceId, req.params.id as string);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});
