import { z } from 'zod';

export const updateInsightStatusSchema = z.object({
  status: z.enum(['suggested', 'accepted', 'rejected', 'dismissed']),
  feedback_notes: z.string().max(1000).optional(),
});

export const insightTypeSchema = z.enum([
  'recurring_pattern',
  'unvalidated_hypothesis',
  'inconclusive_experiment',
  'weak_evidence_decision',
  'contradiction',
  'gap',
]);

export const insightSeveritySchema = z.enum(['critical', 'warning', 'opportunity', 'info']);

export const entityTypeSchema = z.enum([
  'research',
  'evidence',
  'problem',
  'opportunity',
  'hypothesis',
  'experiment',
  'decision',
]);

export const entityReferenceSchema = z.object({
  entity_type: entityTypeSchema,
  entity_id: z.string(),
  title: z.string(),
});

export const generatedInsightItemSchema = z.object({
  type: insightTypeSchema,
  severity: insightSeveritySchema,
  title: z.string().min(3).max(150),
  summary: z.string().min(10).max(1000),
  facts: z.array(z.string()).min(1),
  interpretation: z.string().min(10).max(1000),
  uncertainties: z.array(z.string()),
  sources: z.array(entityReferenceSchema),
});

export const generatedInsightsResponseSchema = z.object({
  insights: z.array(generatedInsightItemSchema),
});
