import { Router, Request, Response } from 'express';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { intelligenceService } from '../services/intelligence.service.ts';
import { updateInsightStatusSchema } from '../schemas/intelligence.schema.js';
import { handleRouteError } from '../utils/errors.js';
import { InsightStatus } from '../types/index.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

// GET /api/workspaces/:workspaceId/intelligence/health
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await intelligenceService.getHealthMetrics(req.workspaceId!);
    res.json({ success: true, data: health });
  } catch (err) {
    handleRouteError(res, err, 'GetDiscoveryHealth');
  }
});

// GET /api/workspaces/:workspaceId/intelligence/insights
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const status = req.query.status ? (String(req.query.status) as InsightStatus) : undefined;
    const insights = await intelligenceService.getInsights(req.workspaceId!, status);
    res.json({ success: true, data: insights });
  } catch (err) {
    handleRouteError(res, err, 'ListProductInsights');
  }
});

// POST /api/workspaces/:workspaceId/intelligence/generate
router.post(
  '/generate',
  requireRole(['owner', 'admin', 'member']),
  async (req: Request, res: Response) => {
    try {
      const insights = await intelligenceService.generateInsights(req.workspaceId!);
      res.json({ success: true, data: insights });
    } catch (err) {
      handleRouteError(res, err, 'GenerateProductInsights');
    }
  }
);

// PATCH /api/workspaces/:workspaceId/intelligence/insights/:id
router.patch(
  '/insights/:id',
  requireRole(['owner', 'admin', 'member']),
  validate({ body: updateInsightStatusSchema }),
  async (req: Request, res: Response) => {
    try {
      const insightId = String(req.params.id);
      const { status, feedback_notes } = req.body;
      const updated = await intelligenceService.updateInsightStatus(
        req.workspaceId!,
        insightId,
        status,
        feedback_notes
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      handleRouteError(res, err, 'UpdateInsightStatus');
    }
  }
);

export const intelligenceRouter = router;
