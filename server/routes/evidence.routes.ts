import { Router, Request, Response } from 'express';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createEvidenceSchema, batchCreateEvidenceSchema } from '../schemas/index.js';
import { dbStore } from '../db/store.js';
import { applyPagination } from '../utils/pagination.js';
import { handleRouteError } from '../utils/errors.js';

export const evidenceRouter = Router();

// List evidences in workspace with pagination
evidenceRouter.get(
  '/evidences',
  authenticate,
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const researchId = req.query.research_id as string | undefined;

    try {
      const allEvidences = await dbStore.listEvidences(workspaceId, researchId);
      const { data, pagination } = applyPagination(allEvidences, req.query.page, req.query.limit);

      res.json({
        evidences: data,
        pagination,
      });
    } catch (error: any) {
      handleRouteError(res, error, 'listEvidences');
    }
  }
);

// Create single evidence
evidenceRouter.post(
  '/evidences',
  authenticate,
  requireWorkspace,
  requireRole(['owner', 'admin', 'member']),
  validate({ body: createEvidenceSchema }),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { research_id, quote, context, confidence_level, tags } = req.body;

    try {
      const evidence = await dbStore.createEvidence(workspaceId, {
        research_id,
        quote,
        context,
        confidence_level,
        tags,
      });
      res.status(201).json({ evidence });
    } catch (error: any) {
      handleRouteError(res, error, 'createEvidence');
    }
  }
);

// Batch create evidences
evidenceRouter.post(
  '/evidences/batch',
  authenticate,
  requireWorkspace,
  requireRole(['owner', 'admin', 'member']),
  validate({ body: batchCreateEvidenceSchema }),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { research_id, evidences } = req.body;

    try {
      const created = [];
      for (const e of evidences) {
        const resEvidence = await dbStore.createEvidence(workspaceId, {
          research_id,
          quote: e.quote,
          context: e.context || null,
          confidence_level: e.confidence_level || 'medium',
          tags: e.tags || [],
        });
        created.push(resEvidence);
      }
      res.status(201).json({ evidences: created });
    } catch (error: any) {
      handleRouteError(res, error, 'batchCreateEvidence');
    }
  }
);

