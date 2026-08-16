import { Router } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';
import { AppRequest } from '../types/index.js';

export const strategyRouter = Router();

const createObjectiveSchema = z.object({
  title: z.string().min(3, 'O título do objetivo deve ter no mínimo 3 caracteres').max(255),
  description: z.string().optional(),
  timeframe: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'draft']).optional(),
  progress: z.number().min(0).max(100).optional(),
  owner_name: z.string().optional(),
});

const updateObjectiveSchema = createObjectiveSchema.partial();

const createKeyResultSchema = z.object({
  objective_id: z.string().uuid('ID do objetivo inválido'),
  title: z.string().min(3, 'O título do KR deve ter no mínimo 3 caracteres').max(255),
  metric_name: z.string().min(1, 'Nome da métrica é obrigatório'),
  initial_value: z.number().optional(),
  target_value: z.number(),
  current_value: z.number().optional(),
  unit: z.string().optional(),
  status: z.enum(['on_track', 'at_risk', 'behind', 'achieved']).optional(),
});

const updateKeyResultSchema = createKeyResultSchema.partial().omit({ objective_id: true });

const linkOpportunitySchema = z.object({
  opportunity_id: z.string().uuid('ID da oportunidade inválido'),
  objective_id: z.string().uuid('ID do objetivo inválido'),
  kr_id: z.string().uuid().optional(),
});

// GET /api/strategy/objectives - List all objectives with KRs and counts
strategyRouter.get('/objectives', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const objectives = await dbStore.listObjectives(workspaceId);
    res.json({ data: objectives });
  } catch (error) {
    next(error);
  }
});

// GET /api/strategy/objectives/:id
strategyRouter.get('/objectives/:id', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const objective = await dbStore.getObjectiveById(workspaceId, req.params.id as string);
    if (!objective) {
      return res.status(404).json({ error: { message: 'Objetivo estratégico não encontrado' } });
    }
    res.json({ data: objective });
  } catch (error) {
    next(error);
  }
});

// POST /api/strategy/objectives - Create objective (member+)
strategyRouter.post('/objectives', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = createObjectiveSchema.parse(req.body);
    const created = await dbStore.createObjective(workspaceId, validated);
    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

// PUT /api/strategy/objectives/:id - Update objective (member+)
strategyRouter.put('/objectives/:id', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = updateObjectiveSchema.parse(req.body);
    const updated = await dbStore.updateObjective(workspaceId, req.params.id as string, validated);
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/strategy/objectives/:id - Delete objective (admin+)
strategyRouter.delete('/objectives/:id', requireRole(['owner', 'admin']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    await dbStore.deleteObjective(workspaceId, req.params.id as string);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// GET /api/strategy/key-results - List KRs
strategyRouter.get('/key-results', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const objectiveId = req.query.objective_id as string | undefined;
    const krs = await dbStore.listKeyResults(workspaceId, objectiveId);
    res.json({ data: krs });
  } catch (error) {
    next(error);
  }
});

// POST /api/strategy/key-results - Create KR (member+)
strategyRouter.post('/key-results', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = createKeyResultSchema.parse(req.body);
    const created = await dbStore.createKeyResult(workspaceId, validated);
    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

// PUT /api/strategy/key-results/:id - Update KR (member+)
strategyRouter.put('/key-results/:id', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = updateKeyResultSchema.parse(req.body);
    const updated = await dbStore.updateKeyResult(workspaceId, req.params.id as string, validated);
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/strategy/key-results/:id - Delete KR (admin+)
strategyRouter.delete('/key-results/:id', requireRole(['owner', 'admin']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    await dbStore.deleteKeyResult(workspaceId, req.params.id as string);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /api/strategy/link-opportunity - Link opportunity to objective/kr
strategyRouter.post('/link-opportunity', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = linkOpportunitySchema.parse(req.body);
    await dbStore.linkOpportunityObjective(workspaceId, validated.opportunity_id, validated.objective_id, validated.kr_id);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});
