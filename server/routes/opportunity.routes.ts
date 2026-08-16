import { Router, Request, Response } from 'express';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  linkOpportunityProblemsSchema,
  uuidParamSchema,
  uuidSchema,
} from '../schemas/index.js';
import { dbStore } from '../db/store.js';
import { z } from 'zod';
import { applyPagination } from '../utils/pagination.js';
import { handleRouteError } from '../utils/errors.js';

export const opportunityRouter = Router();

// List opportunities with connected problems and pagination
opportunityRouter.get(
  '/opportunities',
  authenticate,
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;

    try {
      const allOpps = await dbStore.listOpportunities(workspaceId);
      const { data, pagination } = applyPagination(allOpps, req.query.page, req.query.limit);

      res.json({
        opportunities: data,
        pagination,
      });
    } catch (error: any) {
      handleRouteError(res, error, 'listOpportunities');
    }
  }
);

// Get single opportunity by ID
opportunityRouter.get(
  '/opportunities/:id',
  authenticate,
  validate({ params: uuidParamSchema }),
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const opportunityId = req.params.id;

    try {
      const opportunity = await dbStore.getOpportunityById(workspaceId, opportunityId);
      if (!opportunity) {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Oportunidade não encontrada neste workspace.',
        });
        return;
      }
      res.json({ opportunity });
    } catch (error: any) {
      handleRouteError(res, error, 'getOpportunityById');
    }
  }
);

// Create opportunity
opportunityRouter.post(
  '/opportunities',
  authenticate,
  requireWorkspace,
  requireRole(['owner', 'admin', 'member']),
  validate({ body: createOpportunitySchema }),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { title, description, status, problem_ids } = req.body;

    try {
      const opportunity = await dbStore.createOpportunity(
        workspaceId,
        { title, description, status },
        problem_ids
      );
      res.status(201).json({ opportunity });
    } catch (error: any) {
      handleRouteError(res, error, 'createOpportunity');
    }
  }
);

// Update opportunity
opportunityRouter.patch(
  '/opportunities/:id',
  authenticate,
  validate({ params: uuidParamSchema, body: updateOpportunitySchema }),
  requireWorkspace,
  requireRole(['owner', 'admin', 'member']),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const opportunityId = req.params.id;
    const { title, description, status, problem_ids } = req.body;

    try {
      const updated = await dbStore.updateOpportunity(
        workspaceId,
        opportunityId,
        { title, description, status },
        problem_ids
      );
      res.json({ opportunity: updated });
    } catch (error: any) {
      handleRouteError(res, error, 'updateOpportunity');
    }
  }
);

// Delete opportunity
opportunityRouter.delete(
  '/opportunities/:id',
  authenticate,
  validate({ params: uuidParamSchema }),
  requireWorkspace,
  requireRole(['owner', 'admin', 'member']),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const opportunityId = req.params.id;

    try {
      await dbStore.deleteOpportunity(workspaceId, opportunityId);
      res.json({ success: true, message: 'Oportunidade removida com sucesso.' });
    } catch (error: any) {
      handleRouteError(res, error, 'deleteOpportunity');
    }
  }
);

// Link problems to opportunity
opportunityRouter.post(
  '/opportunities/:id/link-problems',
  authenticate,
  validate({ params: uuidParamSchema, body: linkOpportunityProblemsSchema }),
  requireWorkspace,
  requireRole(['owner', 'admin', 'member']),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const opportunityId = req.params.id;
    const { problem_ids } = req.body;

    try {
      const links = await dbStore.linkProblemsToOpportunity(workspaceId, opportunityId, problem_ids);
      res.json({ success: true, links });
    } catch (error: any) {
      handleRouteError(res, error, 'linkProblemsToOpportunity');
    }
  }
);

// Unlink a problem from an opportunity
const unlinkParamsSchema = z.object({
  id: uuidSchema,
  problemId: uuidSchema,
});

opportunityRouter.delete(
  '/opportunities/:id/problems/:problemId',
  authenticate,
  validate({ params: unlinkParamsSchema }),
  requireWorkspace,
  requireRole(['owner', 'admin', 'member']),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { id: opportunityId, problemId } = req.params;

    try {
      await dbStore.unlinkProblemFromOpportunity(workspaceId, opportunityId, problemId);
      res.json({ success: true, message: 'Problema desvinculado com sucesso.' });
    } catch (error: any) {
      handleRouteError(res, error, 'unlinkProblemFromOpportunity');
    }
  }
);
