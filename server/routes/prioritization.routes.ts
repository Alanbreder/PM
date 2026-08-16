import { Router } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';
import { AppRequest } from '../types/index.js';

export const prioritizationRouter = Router();

const createPrioritizationSchema = z.object({
  opportunity_id: z.string().min(1, 'ID da oportunidade é obrigatório'),
  framework: z.enum(['rice', 'ice', 'wsjf', 'value_effort', 'impact_effort', 'moscow', 'kano']),
  reach: z.number().min(0).optional(),
  impact: z.number().min(1).max(5).optional(),
  confidence: z.number().min(0).max(100).optional(),
  effort: z.number().min(1).max(5).optional(),
  ice_impact: z.number().min(1).max(10).optional(),
  ice_confidence: z.number().min(1).max(10).optional(),
  ice_ease: z.number().min(1).max(10).optional(),
  user_business_value: z.number().min(1).max(10).optional(),
  time_criticality: z.number().min(1).max(10).optional(),
  risk_reduction: z.number().min(1).max(10).optional(),
  job_size: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  evaluator_name: z.string().optional(),
});

// GET /api/prioritization - List all opportunity prioritizations
prioritizationRouter.get('/', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const list = await dbStore.listPrioritizations(workspaceId);
    res.json({ data: list });
  } catch (error) {
    next(error);
  }
});

// POST /api/prioritization - Evaluate & Score Opportunity (member+)
prioritizationRouter.post('/', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = createPrioritizationSchema.parse(req.body);
    const created = await dbStore.createPrioritization(workspaceId, validated as any);

    await dbStore.logActivity(workspaceId, {
      entity_type: 'opportunity',
      entity_id: validated.opportunity_id,
      action: 'prioritized',
      actor: { uid: req.user!.uid, email: req.user!.email, name: req.user!.name },
      details: { framework: validated.framework, score: created.score },
    });

    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/prioritization/:id - Delete prioritization evaluation (admin+)
prioritizationRouter.delete('/:id', requireRole(['owner', 'admin']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    await dbStore.deletePrioritization(workspaceId, req.params.id as string);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});
