import { Router } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';
import { AppRequest } from '../types/index.js';

export const toolkitRouter = Router();

const saveCanvasSchema = z.object({
  tool_key: z.enum([
    'lean_canvas',
    'opportunity_solution_tree',
    'customer_journey_map',
    'empathy_map',
    'value_proposition_canvas',
    'story_mapping',
    'swot_analysis',
  ]),
  title: z.string().min(2, 'O título do canvas deve ter no mínimo 2 caracteres').max(200),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  canvas_data: z.record(z.any()),
});

// GET /api/toolkit/canvases - List saved canvases
toolkitRouter.get('/canvases', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const canvases = await dbStore.listToolkitCanvases(workspaceId);
    res.json({ data: canvases });
  } catch (error) {
    next(error);
  }
});

// GET /api/toolkit/canvases/:toolKey
toolkitRouter.get('/canvases/:toolKey', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const entityId = req.query.entity_id as string | undefined;
    const canvas = await dbStore.getToolkitCanvasByKey(workspaceId, req.params.toolKey as string, entityId);
    res.json({ data: canvas });
  } catch (error) {
    next(error);
  }
});

// POST /api/toolkit/canvases - Save or update canvas (member+)
toolkitRouter.post('/canvases', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = saveCanvasSchema.parse(req.body);
    const saved = await dbStore.saveToolkitCanvas(workspaceId, validated as any);

    await dbStore.logActivity(workspaceId, {
      entity_type: 'toolkit_canvas',
      entity_id: saved.id,
      action: 'saved',
      actor: { uid: req.user!.uid, email: req.user!.email, name: req.user!.name },
      details: { tool_key: saved.tool_key, title: saved.title },
    });

    res.status(200).json({ data: saved });
  } catch (error) {
    next(error);
  }
});
