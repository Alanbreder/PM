import { Router } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { requireRole } from '../middleware/auth.js';
import { AppRequest } from '../types/index.js';
import { evaluateToolWithAICoach } from '../services/gemini.service.js';

export const toolkitRouter = Router();

const validToolKeys = [
  'product_canvas',
  'product_vision_board',
  'opportunity_solution_tree',
  'personas',
  'user_journey_map',
  'jtbd',
  'problem_statement',
  'value_proposition_canvas',
  'rice_prioritization',
  'impact_effort_matrix',
  'assumption_map',
  'experiment_canvas',
  'decision_canvas',
  'story_map',
  'lean_canvas',
  'empathy_map',
  'swot_analysis',
  'customer_journey_map',
  'story_mapping',
] as const;

const saveCanvasSchema = z.object({
  id: z.string().optional(),
  tool_key: z.enum(validToolKeys),
  title: z.string().min(2, 'O título do canvas deve ter no mínimo 2 caracteres').max(200),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  canvas_data: z.record(z.any()),
});

const convertEntitySchema = z.object({
  tool_key: z.enum(validToolKeys),
  target_entity_type: z.enum(['problem', 'hypothesis', 'experiment', 'decision', 'persona', 'opportunity']),
  canvas_data: z.record(z.any()),
});

// GET /api/toolkit/canvases - List saved canvases
toolkitRouter.get('/canvases', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const toolKey = req.query.tool_key as string | undefined;
    const canvases = await dbStore.listToolkitCanvases(workspaceId, toolKey);
    res.json({ data: canvases });
  } catch (error) {
    next(error);
  }
});

// GET /api/toolkit/canvases/:idOrKey - Get by ID or toolKey
toolkitRouter.get('/canvases/:idOrKey', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const idOrKey = req.params.idOrKey as string;
    const entityId = req.query.entity_id as string | undefined;

    // First attempt to find by primary ID
    let canvas = await dbStore.getToolkitCanvasById(workspaceId, idOrKey);
    if (!canvas) {
      // Fallback: search by tool_key
      canvas = await dbStore.getToolkitCanvasByKey(workspaceId, idOrKey, entityId);
    }

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
      action: validated.id ? 'updated' : 'saved',
      actor: { uid: req.user!.uid, email: req.user!.email, name: req.user!.name },
      details: { tool_key: saved.tool_key, title: saved.title },
    });

    res.status(200).json({ data: saved });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/toolkit/canvases/:id - Delete canvas instance
toolkitRouter.delete('/canvases/:id', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const canvasId = req.params.id as string;
    const deleted = await dbStore.deleteToolkitCanvas(workspaceId, canvasId);

    if (deleted) {
      await dbStore.logActivity(workspaceId, {
        entity_type: 'toolkit_canvas',
        entity_id: canvasId,
        action: 'deleted',
        actor: { uid: req.user!.uid, email: req.user!.email, name: req.user!.name },
        details: { canvas_id: canvasId },
      });
    }

    res.json({ success: deleted });
  } catch (error) {
    next(error);
  }
});

// POST /api/toolkit/canvases/:id/duplicate - Duplicate canvas
toolkitRouter.post('/canvases/:id/duplicate', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const canvasId = req.params.id as string;
    const duplicated = await dbStore.duplicateToolkitCanvas(workspaceId, canvasId);

    if (!duplicated) {
      res.status(404).json({ error: 'Canvas não encontrado para duplicação.' });
      return;
    }

    res.status(201).json({ data: duplicated });
  } catch (error) {
    next(error);
  }
});

// POST /api/toolkit/ai-coach - Evaluate tool with AI Coach
toolkitRouter.post('/ai-coach', async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const { tool_key, tool_title, canvas_data } = req.body;

    if (!tool_key || !canvas_data) {
      res.status(400).json({ error: 'tool_key e canvas_data são obrigatórios para a análise.' });
      return;
    }

    // Optional workspace context
    const problems = await dbStore.listProblems(workspaceId);
    const opportunities = await dbStore.listOpportunities(workspaceId);

    const evaluation = await evaluateToolWithAICoach(
      tool_key,
      tool_title || tool_key,
      canvas_data,
      {
        total_problems: problems.length,
        total_opportunities: opportunities.length,
      }
    );

    res.json({ data: evaluation });
  } catch (error) {
    next(error);
  }
});

// POST /api/toolkit/convert-to-entity - Transform canvas into real Product OS entity
toolkitRouter.post('/convert-to-entity', requireRole(['owner', 'admin', 'member']), async (req: AppRequest, res, next) => {
  try {
    const workspaceId = req.workspaceId!;
    const { tool_key, target_entity_type, canvas_data } = convertEntitySchema.parse(req.body);

    let createdEntity: any = null;

    if (target_entity_type === 'problem') {
      // Extract from problem_statement or others
      const title = canvas_data.problem || canvas_data.title || canvas_data.statement || 'Novo Problema do Discovery';
      const description = [
        canvas_data.context ? `Contexto: ${canvas_data.context}` : '',
        canvas_data.impact ? `Impacto: ${canvas_data.impact}` : '',
        canvas_data.frequency ? `Frequência: ${canvas_data.frequency}` : '',
        canvas_data.why_it_matters ? `Por que importa: ${canvas_data.why_it_matters}` : '',
        canvas_data.desired_outcome ? `Resultado esperado: ${canvas_data.desired_outcome}` : '',
      ].filter(Boolean).join('\n\n') || (canvas_data.description || 'Problema derivado de ferramenta de produto.');

      createdEntity = await dbStore.createProblem(workspaceId, {
        title: title.substring(0, 200),
        description: description,
        impact: (canvas_data.impact_level as any) || 'high',
        frequency: (canvas_data.frequency_level as any) || 'frequent',
      });
    } else if (target_entity_type === 'opportunity') {
      const title = canvas_data.title || canvas_data.solution || canvas_data.unique_value || 'Nova Oportunidade';
      const description = canvas_data.description || canvas_data.notes || 'Oportunidade gerada através das ferramentas de produto.';
      createdEntity = await dbStore.createOpportunity(workspaceId, {
        title: title.substring(0, 200),
        description: description,
        effort: (canvas_data.effort as any) || 'medium',
        value: (canvas_data.value as any) || 'high',
      });
    } else if (target_entity_type === 'hypothesis') {
      const title = canvas_data.title || canvas_data.hypothesis || 'Nova Hipótese de Produto';
      const statement = canvas_data.statement || canvas_data.expected_result || `Acreditamos que implementar [solução] gerará [impacto].`;
      
      // Look for first opportunity to link
      const opps = await dbStore.listOpportunities(workspaceId);
      const targetOppId = opps[0]?.id || 'opp_default';

      createdEntity = await dbStore.createHypothesis(workspaceId, {
        opportunity_id: targetOppId,
        title: title.substring(0, 200),
        statement: statement,
        metrics_to_validate: canvas_data.metrics || canvas_data.success_criteria || 'Métrica de validação a definir',
      });
    } else if (target_entity_type === 'experiment') {
      const title = canvas_data.title || canvas_data.experiment || 'Novo Experimento de Validação';
      
      // Look for first hypothesis
      const hyps = await dbStore.listHypotheses(workspaceId);
      const targetHypId = hyps[0]?.id || 'hyp_default';

      createdEntity = await dbStore.createExperiment(workspaceId, {
        hypothesis_id: targetHypId,
        title: title.substring(0, 200),
        description: canvas_data.description || canvas_data.details || 'Experimento estruturado através do Experiment Canvas.',
        methodology: canvas_data.methodology || canvas_data.experiment_type || 'Teste A/B / Prototipagem',
      });
    } else if (target_entity_type === 'decision') {
      const title = canvas_data.title || canvas_data.decision || 'Decisão Estratégica';
      
      const exps = await dbStore.listExperiments(workspaceId);
      const targetExpId = exps[0]?.id || 'exp_default';

      createdEntity = await dbStore.createDecision(workspaceId, {
        experiment_id: targetExpId,
        title: title.substring(0, 200),
        decision: canvas_data.decision || canvas_data.recommendation || 'Aprovado para desenvolvimento',
        rationale: canvas_data.rationale || canvas_data.trade_offs || canvas_data.context || 'Decisão documentada no Decision Canvas.',
        status: 'accepted',
      });
    } else if (target_entity_type === 'persona') {
      const name = canvas_data.name || 'Nova Persona';
      createdEntity = await dbStore.createPersona(workspaceId, {
        name: name.substring(0, 100),
        role_title: canvas_data.role_title || canvas_data.role || 'Usuário Final',
        segment: canvas_data.segment || 'Geral',
        description: canvas_data.description || 'Persona criada através da ferramenta de Personas.',
        goals: Array.isArray(canvas_data.goals) ? canvas_data.goals : (canvas_data.goals ? [canvas_data.goals] : []),
        pains: Array.isArray(canvas_data.pains) ? canvas_data.pains : (canvas_data.pains ? [canvas_data.pains] : []),
        jobs_to_be_done: Array.isArray(canvas_data.jobs) ? canvas_data.jobs : (canvas_data.jobs ? [canvas_data.jobs] : []),
      });
    }

    res.status(201).json({
      success: true,
      entity_type: target_entity_type,
      data: createdEntity,
    });
  } catch (error) {
    next(error);
  }
});
