import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createResearchSchema, uuidParamSchema, approveAnalysisSchema } from '../schemas/index.js';
import { handleRouteError } from '../utils/errors.js';
import { applyPagination } from '../utils/pagination.js';
import { analyzeResearchWithAI } from '../services/gemini.service.js';

const router = Router();

router.use(authenticate);
router.use(requireWorkspace);

router.get('/', async (req: Request, res: Response) => {
  try {
    const list = await dbStore.listResearches(req.workspaceId!);
    const paginated = applyPagination(list, req.query.page, req.query.limit);
    res.json({ success: true, ...paginated });
  } catch (err) {
    handleRouteError(res, err, 'ListResearches');
  }
});

router.post('/', requireRole(['owner', 'admin', 'member']), validate({ body: createResearchSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.createResearch(req.workspaceId!, req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'CreateResearch');
  }
});

router.get('/:id', validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    const item = await dbStore.getResearchById(req.workspaceId!, req.params.id as string);
    if (!item) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Pesquisa não encontrada' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    handleRouteError(res, err, 'GetResearch');
  }
});

router.post('/:id/analyze', requireRole(['owner', 'admin', 'member']), validate({ params: uuidParamSchema }), async (req: Request, res: Response) => {
  try {
    const research = await dbStore.getResearchById(req.workspaceId!, req.params.id as string);
    if (!research) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Pesquisa não encontrada' });
      return;
    }

    if (!research.raw_notes) {
      res.status(400).json({ error: 'BAD_REQUEST', message: 'A pesquisa não contém anotações brutas' });
      return;
    }

    await dbStore.updateResearch(req.workspaceId!, research.id, { analysis_status: 'analyzing' });

    try {
      const aiResult = await analyzeResearchWithAI(research.raw_notes);
      const updated = await dbStore.updateResearch(req.workspaceId!, research.id, {
        key_findings: aiResult.key_findings || [],
        suggested_problems: aiResult.suggested_problems || [],
        analysis_status: 'completed',
      });
      res.json({ success: true, data: updated });
    } catch (aiErr) {
      await dbStore.updateResearch(req.workspaceId!, research.id, { analysis_status: 'error' });
      throw aiErr;
    }
  } catch (err) {
    handleRouteError(res, err, 'AnalyzeResearch');
  }
});

router.post('/:id/approve-analysis', requireRole(['owner', 'admin', 'member']), validate({ params: uuidParamSchema, body: approveAnalysisSchema }), async (req: Request, res: Response) => {
  try {
    const research = await dbStore.getResearchById(req.workspaceId!, req.params.id as string);
    if (!research) {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Pesquisa não encontrada' });
      return;
    }

    const { problemsToCreate } = req.body;
    const createdProblems = [];

    if (problemsToCreate && Array.isArray(problemsToCreate)) {
      for (const p of problemsToCreate) {
        const ev = await dbStore.createEvidence(req.workspaceId!, {
          research_id: research.id,
          content: p.evidence,
          source: `Pesquisa: ${research.title}`,
        });

        const prob = await dbStore.createProblem(req.workspaceId!, {
          title: p.title,
          description: p.description,
          impact: p.impact,
          frequency: 'occasional',
          evidence_ids: [ev.id],
        });

        createdProblems.push(prob);
      }
    }

    const updated = await dbStore.updateResearch(req.workspaceId!, research.id, { status: 'analyzed' });

    res.json({
      success: true,
      data: {
        research: updated,
        createdProblems,
      },
    });
  } catch (err) {
    handleRouteError(res, err, 'ApproveAnalysis');
  }
});

export const researchRouter = router;
