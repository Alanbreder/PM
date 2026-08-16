import { Router } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';
import { AppRequest } from '../types/index.js';

export const collaborationRouter = Router();

const createCommentSchema = z.object({
  entity_type: z.enum(['research', 'evidence', 'problem', 'opportunity', 'hypothesis', 'experiment', 'decision', 'roadmap_item', 'objective', 'prd', 'outcome_review']),
  entity_id: z.string().min(1, 'ID da entidade é obrigatório'),
  content: z.string().min(1, 'O comentário não pode ser vazio').max(2000),
});

// GET /api/collaboration/comments
collaborationRouter.get('/comments', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const entityType = req.query.entity_type as string | undefined;
    const entityId = req.query.entity_id as string | undefined;
    const comments = await dbStore.listComments(workspaceId, entityType, entityId);
    res.json({ data: comments });
  } catch (error) {
    next(error);
  }
});

// POST /api/collaboration/comments (viewer+)
collaborationRouter.post('/comments', requireRole(['owner', 'admin', 'member', 'viewer']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const validated = createCommentSchema.parse(req.body);
    const author = {
      uid: req.user!.uid,
      name: req.user!.name,
      email: req.user!.email,
    };
    const created = await dbStore.createComment(workspaceId, author, validated);
    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
});

// GET /api/collaboration/activity - List workspace activity timeline
collaborationRouter.get('/activity', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = await dbStore.listActivityLogs(workspaceId, limit);
    res.json({ data: logs });
  } catch (error) {
    next(error);
  }
});
