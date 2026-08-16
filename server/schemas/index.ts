import { z } from 'zod';

export const uuidSchema = z.string().uuid('ID com formato UUID inválido');

export const uuidParamSchema = z.object({
  id: uuidSchema,
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(3, 'O nome do workspace deve ter no mínimo 3 caracteres').max(255),
  description: z.string().optional(),
});

export const addWorkspaceMemberSchema = z.object({
  user_id: z.string().min(1, 'ID do usuário é obrigatório'),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).default('member'),
});

export const updateWorkspaceMemberSchema = z.object({
  role: z.enum(['owner', 'admin', 'member', 'viewer']),
});

export const userIdParamSchema = z.object({
  id: uuidSchema,
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
});

// Research Schemas
export const createResearchSchema = z.object({
  title: z.string().min(3, 'O título da pesquisa deve ter no mínimo 3 caracteres').max(200),
  objective: z.string().optional(),
  target_audience: z.string().optional(),
  raw_notes: z.string().optional(),
});

export const approveAnalysisSchema = z.object({
  problemsToCreate: z
    .array(
      z.object({
        title: z.string().min(3),
        description: z.string(),
        impact: z.enum(['low', 'medium', 'high', 'critical']),
        evidence: z.string().min(1),
      })
    )
    .optional(),
});

// Evidence Schemas
export const createEvidenceSchema = z.object({
  research_id: uuidSchema,
  content: z.string().min(3, 'O conteúdo da evidência deve ter no mínimo 3 caracteres'),
  source: z.string().optional(),
  impact_score: z.number().int().min(1).max(5).default(3),
  tags: z.array(z.string()).optional(),
});

export const batchCreateEvidenceSchema = z.object({
  evidences: z.array(createEvidenceSchema).min(1, 'Envie ao menos 1 evidência para o lote'),
});

// Problem Schemas
export const createProblemSchema = z.object({
  title: z.string().min(3, 'O título do problema deve ter no mínimo 3 caracteres').max(255),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  impact: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  frequency: z.enum(['rare', 'occasional', 'frequent', 'constant']).default('occasional'),
  evidence_ids: z.array(uuidSchema).optional(),
});

export const updateProblemSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  impact: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  frequency: z.enum(['rare', 'occasional', 'frequent', 'constant']).optional(),
  status: z.enum(['identified', 'validating', 'validated', 'rejected', 'solved']).optional(),
});

export const linkProblemEvidencesSchema = z.object({
  evidence_ids: z.array(uuidSchema).min(1, 'Pelo menos uma evidência deve ser informada'),
});

// Opportunity Schemas
export const createOpportunitySchema = z.object({
  title: z.string().min(3, 'O título da oportunidade deve ter no mínimo 3 caracteres').max(255),
  description: z.string().min(10, 'A descrição deve ter no mínimo 10 caracteres'),
  effort: z.enum(['low', 'medium', 'high', 'very_high']).default('medium'),
  value: z.enum(['low', 'medium', 'high', 'transformative']).default('medium'),
  problem_ids: z.array(uuidSchema).optional(),
});

export const updateOpportunitySchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().min(10).optional(),
  effort: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  value: z.enum(['low', 'medium', 'high', 'transformative']).optional(),
  status: z.enum(['backlog', 'in_discovery', 'prioritized', 'deferred', 'dropped']).optional(),
});

export const linkOpportunityProblemsSchema = z.object({
  problem_ids: z.array(uuidSchema).min(1, 'Pelo menos um problema deve ser informado'),
});

// Hypothesis Schemas
export const createHypothesisSchema = z.object({
  opportunity_id: uuidSchema,
  title: z.string().min(3, 'O título da hipótese deve ter no mínimo 3 caracteres').max(255),
  statement: z.string().min(10, 'A declaração deve ter no mínimo 10 caracteres'),
  metrics_to_validate: z.string().optional(),
  confidence_score: z.number().int().min(1).max(5).default(3),
});

// Experiment Schemas
export const createExperimentSchema = z.object({
  hypothesis_id: uuidSchema,
  title: z.string().min(3, 'O título do experimento deve ter no mínimo 3 caracteres').max(255),
  description: z.string().optional(),
  methodology: z.string().optional(),
  sample_size: z.number().int().positive().optional(),
});

export const experimentStatusEnum = z.enum(['draft', 'running', 'completed', 'cancelled']);

export const updateExperimentSchema = z
  .object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().optional(),
    methodology: z.string().optional(),
    sample_size: z.number().int().positive().optional(),
    status: experimentStatusEnum.optional(),
    results: z.string().optional(),
    learnings: z.string().optional(),
  })
  .strict();

// Ask Product Assistant Schema
export const askProductSchema = z
  .object({
    question: z
      .string()
      .min(3, 'A pergunta deve ter no mínimo 3 caracteres')
      .max(4000, 'A pergunta excede o tamanho máximo de 4000 caracteres'),
  })
  .strict();

// Decision Schemas
export const decisionStatusEnum = z.enum(['pending', 'accepted', 'rejected', 'deferred']);

export const createDecisionSchema = z
  .object({
    experiment_id: uuidSchema,
    title: z.string().min(3, 'O título da decisão deve ter no mínimo 3 caracteres').max(255),
    description: z.string().optional(),
    decision: z.string().min(3, 'A decisão deve ter no mínimo 3 caracteres'),
    rationale: z.string().optional(),
    status: decisionStatusEnum.optional().default('pending'),
  })
  .strict();

export const updateDecisionSchema = z
  .object({
    title: z.string().min(3, 'O título da decisão deve ter no mínimo 3 caracteres').max(255).optional(),
    description: z.string().optional(),
    decision: z.string().min(3, 'A decisão deve ter no mínimo 3 caracteres').optional(),
    rationale: z.string().optional(),
    status: decisionStatusEnum.optional(),
  })
  .strict();
