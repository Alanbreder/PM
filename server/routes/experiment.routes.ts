import { Router, Request, Response } from 'express';
import { authenticate, requireWorkspace } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createExperimentSchema, updateExperimentSchema } from '../schemas/index.js';
import { dbStore } from '../db/store.js';
import { applyPagination } from '../utils/pagination.js';

export const experimentRouter = Router();

// GET /api/experiments - List experiments
experimentRouter.get(
  '/experiments',
  authenticate,
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const hypothesisId = req.query.hypothesis_id as string | undefined;

    try {
      const allExperiments = await dbStore.listExperiments(workspaceId, hypothesisId);
      const { data, pagination } = applyPagination(allExperiments, req.query.page, req.query.limit);

      res.json({
        experiments: data,
        pagination,
      });
    } catch (error: any) {
      console.error('Error listing experiments:', error instanceof Error ? error.message : 'Erro interno');
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao listar experimentos.',
      });
    }
  }
);

// GET /api/experiments/:id - Get single experiment
experimentRouter.get(
  '/experiments/:id',
  authenticate,
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { id } = req.params;

    try {
      const experiment = await dbStore.getExperimentById(workspaceId, id);
      if (!experiment) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Experimento não encontrado neste workspace.',
        });
      }
      res.json({ experiment });
    } catch (error: any) {
      console.error('Error getting experiment:', error instanceof Error ? error.message : 'Erro interno');
      res.status(500).json({
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro ao buscar experimento.',
      });
    }
  }
);

// POST /api/experiments - Create new experiment
experimentRouter.post(
  '/experiments',
  authenticate,
  requireWorkspace,
  validate({ body: createExperimentSchema }),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { hypothesis_id, title, description, method, success_criteria } = req.body;

    try {
      const experiment = await dbStore.createExperiment(workspaceId, {
        hypothesis_id,
        title,
        description,
        method,
        success_criteria,
      });
      res.status(201).json({ experiment });
    } catch (error: any) {
      console.error('Error creating experiment:', error instanceof Error ? error.message : 'Erro ao criar');
      res.status(400).json({
        success: false,
        error: 'BAD_REQUEST',
        message: error instanceof Error ? error.message : 'Erro ao criar experimento.',
      });
    }
  }
);

// PATCH /api/experiments/:id - Update experiment
experimentRouter.patch(
  '/experiments/:id',
  authenticate,
  requireWorkspace,
  validate({ body: updateExperimentSchema }),
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { id } = req.params;

    try {
      const updated = await dbStore.updateExperiment(workspaceId, id, req.body);
      res.json({ experiment: updated });
    } catch (error: any) {
      console.error('Error updating experiment:', error instanceof Error ? error.message : 'Erro ao atualizar');
      const isNotFound = error?.message?.includes('não encontrado');
      res.status(isNotFound ? 404 : 400).json({
        success: false,
        error: isNotFound ? 'NOT_FOUND' : 'BAD_REQUEST',
        message: error instanceof Error ? error.message : 'Erro ao atualizar experimento.',
      });
    }
  }
);

// DELETE /api/experiments/:id - Delete experiment
experimentRouter.delete(
  '/experiments/:id',
  authenticate,
  requireWorkspace,
  async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { id } = req.params;

    try {
      await dbStore.deleteExperiment(workspaceId, id);
      res.json({ success: true, message: 'Experimento excluído com sucesso.' });
    } catch (error: any) {
      console.error('Error deleting experiment:', error instanceof Error ? error.message : 'Erro ao excluir');
      const isNotFound = error?.message?.includes('não encontrado');
      res.status(isNotFound ? 404 : 400).json({
        success: false,
        error: isNotFound ? 'NOT_FOUND' : 'BAD_REQUEST',
        message: error instanceof Error ? error.message : 'Erro ao excluir experimento.',
      });
    }
  }
);
