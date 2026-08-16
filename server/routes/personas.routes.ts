import { Router } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';
import { AppRequest } from '../types/index.js';

export const personasRouter = Router();

const createPersonaSchema = z.object({
  name: z.string().min(2, 'O nome da persona deve ter no mínimo 2 caracteres').max(100),
  role_title: z.string().default('Geral'),
  segment: z.string().optional(),
  description: z.string().optional(),
  jobs_to_be_done: z.array(z.string()).optional(),
  pains: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  behaviors: z.array(z.string()).optional(),
});

const createSegmentSchema = z.object({
  name: z.string().min(2, 'O nome do segmento deve ter no mínimo 2 caracteres').max(100),
  type: z.enum(['b2b', 'b2c', 'enterprise', 'smb']).default('b2b'),
  description: z.string().optional(),
  criteria: z.array(z.string()).optional(),
});

const linkEntityPersonaSchema = z.object({
  persona_id: z.string().uuid('ID da persona inválido'),
  entity_type: z.enum(['research', 'evidence', 'problem', 'opportunity', 'hypothesis', 'decision']),
  entity_id: z.string().min(1, 'ID da entidade é obrigatório'),
});

// GET /api/personas
personasRouter.get('/', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const list = await dbStore.listPersonas(workspaceId);
    res.json({ data: list });
  } catch (error) {
    next(error);
  }
});

// POST /api/personas (member+)
personasRouter.post('/', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = createPersonaSchema.parse(req.body);
    const created = await dbStore.createPersona(workspaceId, validated);
    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/personas/:id (admin+)
personasRouter.delete('/:id', requireRole(['owner', 'admin']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    await dbStore.deletePersona(workspaceId, req.params.id as string);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// GET /api/personas/segments
personasRouter.get('/segments', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const list = await dbStore.listCustomerSegments(workspaceId);
    res.json({ data: list });
  } catch (error) {
    next(error);
  }
});

// POST /api/personas/segments (member+)
personasRouter.post('/segments', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = createSegmentSchema.parse(req.body);
    const created = await dbStore.createCustomerSegment(workspaceId, validated);
    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

// POST /api/personas/link (member+)
personasRouter.post('/link', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = linkEntityPersonaSchema.parse(req.body);
    await dbStore.linkEntityPersona(workspaceId, validated.persona_id, validated.entity_type, validated.entity_id);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});
