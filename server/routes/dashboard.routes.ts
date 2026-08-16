import { Router } from 'express';
import { dbStore } from '../db/store.js';
import { AppRequest } from '../types/index.js';

export const dashboardRouter = Router();

// GET /api/dashboard/executive - Aggregated Executive Overview
dashboardRouter.get('/executive', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const summary = await dbStore.getExecutiveDashboard(workspaceId);
    res.json({ data: summary });
  } catch (error) {
    next(error);
  }
});
