import { Router, Request, Response } from 'express';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createHypothesisSchema } from '../schemas/index.js';
import { dbStore } from '../db/store.js';
import { applyPagination } from '../utils/pagination.js';
import { handleRouteError } from '../utils/errors.js';

export const hypothesisRouter = Router();

// List hypotheses in workspace with pagination
hypothesisRouter.get(
  '/hypotheses',
  authenticate,
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const opportunityId = req.query.opportunity_id as string | undefined;

    try {
      const allHypotheses = await dbStore.listHypotheses(workspaceId, opportunityId);
      const { data, pagination } = applyPagination(allHypotheses, req.query.page, req.query.limit);

      res.json({
        hypotheses: data,
        pagination,
      });
    } catch (error: any) {
      handleRouteError(res, error, 'listHypotheses');
    }
  }
);

// Create hypothesis
hypothesisRouter.post(
  '/hypotheses',
  authenticate,
  requireWorkspace,
  requireRole(['owner', 'admin', 'member']),
  validate({ body: createHypothesisSchema }),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { opportunity_id, statement, metric_target, confidence_score, status } = req.body;

    try {
      const hypothesis = await dbStore.createHypothesis(workspaceId, {
        opportunity_id,
        statement,
        metric_target,
        confidence_score,
        status,
      });
      res.status(201).json({ hypothesis });
    } catch (error: any) {
      handleRouteError(res, error, 'createHypothesis');
    }
  }
);

