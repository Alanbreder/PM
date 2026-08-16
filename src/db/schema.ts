import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  primaryKey,
  foreignKey,
  check,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table (mirrors Firebase Auth)
export const users = pgTable('users', {
  uid: varchar('uid', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workspaces table
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workspace Members
export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.uid, { onDelete: 'cascade' }),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceUserIdx: index('idx_wm_workspace_user').on(table.workspaceId, table.userId),
  };
});

// Researches table
export const researches = pgTable('researches', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  objective: text('objective'),
  targetAudience: text('target_audience'),
  rawNotes: text('raw_notes'),
  keyFindings: jsonb('key_findings').$type<string[]>(),
  suggestedProblems: jsonb('suggested_problems').$type<any[]>(),
  analysisStatus: varchar('analysis_status', { length: 50 }).notNull().default('pending'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_researches_workspace').on(table.workspaceId),
  };
});

// Evidences table with composite foreign key for cross-tenant integrity
export const evidences = pgTable('evidences', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  researchId: uuid('research_id').notNull(),
  content: text('content').notNull(),
  source: varchar('source', { length: 255 }),
  impactScore: integer('impact_score').notNull().default(3),
  tags: jsonb('tags').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    researchFk: foreignKey({
      columns: [table.researchId, table.workspaceId],
      foreignColumns: [researches.id, researches.workspaceId],
      name: 'fk_evidences_research_workspace',
    }).onDelete('cascade'),
    workspaceIdx: index('idx_evidences_workspace').on(table.workspaceId),
    researchIdx: index('idx_evidences_research').on(table.researchId),
  };
});

// Problems table
export const problems = pgTable('problems', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  impact: varchar('impact', { length: 50 }).notNull().default('medium'),
  frequency: varchar('frequency', { length: 50 }).notNull().default('occasional'),
  status: varchar('status', { length: 50 }).notNull().default('identified'),
  score: integer('score').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_problems_workspace').on(table.workspaceId),
  };
});

// Problem Evidences (Junction table with composite FKs)
export const problemEvidences = pgTable('problem_evidences', {
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  problemId: uuid('problem_id').notNull(),
  evidenceId: uuid('evidence_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.problemId, table.evidenceId] }),
    problemFk: foreignKey({
      columns: [table.problemId, table.workspaceId],
      foreignColumns: [problems.id, problems.workspaceId],
      name: 'fk_pe_problem_workspace',
    }).onDelete('cascade'),
    evidenceFk: foreignKey({
      columns: [table.evidenceId, table.workspaceId],
      foreignColumns: [evidences.id, evidences.workspaceId],
      name: 'fk_pe_evidence_workspace',
    }).onDelete('cascade'),
    workspaceIdx: index('idx_pe_workspace').on(table.workspaceId),
  };
});

// Opportunities table
export const opportunities = pgTable('opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  effort: varchar('effort', { length: 50 }).notNull().default('medium'),
  value: varchar('value', { length: 50 }).notNull().default('medium'),
  status: varchar('status', { length: 50 }).notNull().default('backlog'),
  score: integer('score').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_opportunities_workspace').on(table.workspaceId),
  };
});

// Opportunity Problems (Junction table with composite FKs)
export const opportunityProblems = pgTable('opportunity_problems', {
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id').notNull(),
  problemId: uuid('problem_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.opportunityId, table.problemId] }),
    opportunityFk: foreignKey({
      columns: [table.opportunityId, table.workspaceId],
      foreignColumns: [opportunities.id, opportunities.workspaceId],
      name: 'fk_op_opportunity_workspace',
    }).onDelete('cascade'),
    problemFk: foreignKey({
      columns: [table.problemId, table.workspaceId],
      foreignColumns: [problems.id, problems.workspaceId],
      name: 'fk_op_problem_workspace',
    }).onDelete('cascade'),
    workspaceIdx: index('idx_op_workspace').on(table.workspaceId),
  };
});

// Hypotheses table with composite foreign key
export const hypotheses = pgTable('hypotheses', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  statement: text('statement').notNull(),
  metricsToValidate: text('metrics_to_validate'),
  confidenceScore: integer('confidence_score').default(3),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    opportunityFk: foreignKey({
      columns: [table.opportunityId, table.workspaceId],
      foreignColumns: [opportunities.id, opportunities.workspaceId],
      name: 'fk_hypotheses_opportunity_workspace',
    }).onDelete('cascade'),
    workspaceIdx: index('idx_hypotheses_workspace').on(table.workspaceId),
    opportunityIdx: index('idx_hypotheses_opportunity').on(table.opportunityId),
  };
});

// Experiments table with composite foreign key
export const experiments = pgTable('experiments', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  hypothesisId: uuid('hypothesis_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  methodology: text('methodology'),
  sampleSize: integer('sample_size'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  results: text('results'),
  learnings: text('learnings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    hypothesisFk: foreignKey({
      columns: [table.hypothesisId, table.workspaceId],
      foreignColumns: [hypotheses.id, hypotheses.workspaceId],
      name: 'fk_experiments_hypothesis_workspace',
    }).onDelete('cascade'),
    statusCheck: check('chk_experiment_status', sql`${table.status} IN ('draft', 'running', 'completed', 'cancelled')`),
    workspaceIdx: index('idx_experiments_workspace').on(table.workspaceId),
    hypothesisIdx: index('idx_experiments_hypothesis').on(table.hypothesisId),
  };
});

// Decisions table with composite foreign key
export const decisions = pgTable('decisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  experimentId: uuid('experiment_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  decision: text('decision').notNull(),
  rationale: text('rationale'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    experimentFk: foreignKey({
      columns: [table.experimentId, table.workspaceId],
      foreignColumns: [experiments.id, experiments.workspaceId],
      name: 'fk_decisions_experiment_workspace',
    }).onDelete('cascade'),
    statusCheck: check('chk_decision_status', sql`${table.status} IN ('pending', 'accepted', 'rejected', 'deferred')`),
    workspaceIdx: index('idx_decisions_workspace').on(table.workspaceId),
    experimentIdx: index('idx_decisions_experiment').on(table.experimentId),
  };
});

// Product Insights table with multi-tenant isolation
export const productInsights = pgTable('product_insights', {
  id: varchar('id', { length: 255 }).primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary').notNull(),
  facts: jsonb('facts').$type<string[]>().notNull(),
  interpretation: text('interpretation').notNull(),
  uncertainties: jsonb('uncertainties').$type<string[]>().notNull(),
  sources: jsonb('sources').$type<any[]>().notNull(),
  status: varchar('status', { length: 50 }).notNull().default('suggested'),
  feedbackNotes: text('feedback_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_product_insights_workspace').on(table.workspaceId),
  };
});

// ETAPA 8: Roadmap & Strategic Initiatives table
export const roadmapItems = pgTable('roadmap_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  timeframe: varchar('timeframe', { length: 50 }).notNull().default('now'),
  status: varchar('status', { length: 50 }).notNull().default('planned'),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  targetQuarter: varchar('target_quarter', { length: 50 }),
  decisionId: uuid('decision_id'),
  opportunityId: uuid('opportunity_id'),
  objectiveId: uuid('objective_id'),
  krId: uuid('kr_id'),
  metricsTarget: text('metrics_target'),
  progress: integer('progress').default(0).notNull(),
  ownerName: varchar('owner_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    decisionFk: foreignKey({
      columns: [table.decisionId, table.workspaceId],
      foreignColumns: [decisions.id, decisions.workspaceId],
      name: 'fk_roadmap_decision_workspace',
    }).onDelete('set null'),
    opportunityFk: foreignKey({
      columns: [table.opportunityId, table.workspaceId],
      foreignColumns: [opportunities.id, opportunities.workspaceId],
      name: 'fk_roadmap_opportunity_workspace',
    }).onDelete('set null'),
    timeframeCheck: check('chk_roadmap_timeframe', sql`${table.timeframe} IN ('now', 'next', 'later')`),
    statusCheck: check('chk_roadmap_status', sql`${table.status} IN ('planned', 'in_progress', 'delivered', 'blocked', 'deferred')`),
    priorityCheck: check('chk_roadmap_priority', sql`${table.priority} IN ('critical', 'high', 'medium', 'low')`),
    progressCheck: check('chk_roadmap_progress', sql`${table.progress} >= 0 AND ${table.progress} <= 100`),
    workspaceIdx: index('idx_roadmap_items_workspace').on(table.workspaceId),
    decisionIdx: index('idx_roadmap_items_decision').on(table.decisionId),
    opportunityIdx: index('idx_roadmap_items_opportunity').on(table.opportunityId),
    timeframeIdx: index('idx_roadmap_items_timeframe').on(table.workspaceId, table.timeframe),
  };
});

// ETAPA A: Strategic Objectives table
export const objectives = pgTable('objectives', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  timeframe: varchar('timeframe', { length: 50 }).notNull().default('Q1-2026'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  progress: integer('progress').default(0).notNull(),
  ownerName: varchar('owner_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_objectives_workspace').on(table.workspaceId),
  };
});

// Key Results (KRs)
export const keyResults = pgTable('key_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  objectiveId: uuid('objective_id').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  metricName: varchar('metric_name', { length: 255 }).notNull(),
  initialValue: integer('initial_value').notNull().default(0),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').notNull().default(0),
  unit: varchar('unit', { length: 50 }).notNull().default('%'),
  progress: integer('progress').default(0).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('on_track'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    objectiveFk: foreignKey({
      columns: [table.objectiveId, table.workspaceId],
      foreignColumns: [objectives.id, objectives.workspaceId],
      name: 'fk_kr_objective_workspace',
    }).onDelete('cascade'),
    workspaceIdx: index('idx_kr_workspace').on(table.workspaceId),
    objectiveIdx: index('idx_kr_objective').on(table.objectiveId),
  };
});

// Opportunity to Objective / KR links
export const opportunityObjectives = pgTable('opportunity_objectives', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id').notNull(),
  objectiveId: uuid('objective_id').notNull(),
  krId: uuid('kr_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    opportunityFk: foreignKey({
      columns: [table.opportunityId, table.workspaceId],
      foreignColumns: [opportunities.id, opportunities.workspaceId],
      name: 'fk_opp_obj_opportunity_workspace',
    }).onDelete('cascade'),
    objectiveFk: foreignKey({
      columns: [table.objectiveId, table.workspaceId],
      foreignColumns: [objectives.id, objectives.workspaceId],
      name: 'fk_opp_obj_objective_workspace',
    }).onDelete('cascade'),
    workspaceIdx: index('idx_opp_obj_workspace').on(table.workspaceId),
  };
});

// ETAPA B: Product Prioritization Evaluations
export const prioritizations = pgTable('prioritizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  opportunityId: uuid('opportunity_id').notNull(),
  framework: varchar('framework', { length: 50 }).notNull().default('rice'),
  // RICE factors
  reach: integer('reach').default(100),
  impact: integer('impact').default(3), // 1-5
  confidence: integer('confidence').default(80), // 0-100%
  effort: integer('effort').default(3), // 1-5
  // ICE factors
  iceImpact: integer('ice_impact').default(7), // 1-10
  iceConfidence: integer('ice_confidence').default(7), // 1-10
  iceEase: integer('ice_ease').default(7), // 1-10
  // WSJF factors
  userBusinessValue: integer('user_business_value').default(5), // 1-10
  timeCriticality: integer('time_criticality').default(5), // 1-10
  riskReduction: integer('risk_reduction').default(5), // 1-10
  jobSize: integer('job_size').default(3), // 1-10
  score: integer('score').notNull().default(0),
  notes: text('notes'),
  evaluatorName: varchar('evaluator_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    opportunityFk: foreignKey({
      columns: [table.opportunityId, table.workspaceId],
      foreignColumns: [opportunities.id, opportunities.workspaceId],
      name: 'fk_prioritization_opportunity_workspace',
    }).onDelete('cascade'),
    workspaceIdx: index('idx_prioritizations_workspace').on(table.workspaceId),
    opportunityIdx: index('idx_prioritizations_opportunity').on(table.opportunityId),
  };
});

// ETAPA C: Personas & Customer Segments
export const personas = pgTable('personas', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  roleTitle: varchar('role_title', { length: 255 }).notNull(),
  segment: varchar('segment', { length: 255 }),
  description: text('description'),
  jobsToBeDone: jsonb('jobs_to_be_done').$type<string[]>(),
  pains: jsonb('pains').$type<string[]>(),
  goals: jsonb('goals').$type<string[]>(),
  behaviors: jsonb('behaviors').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_personas_workspace').on(table.workspaceId),
  };
});

export const customerSegments = pgTable('customer_segments', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('b2b'), // b2b, b2c, enterprise, smb
  description: text('description'),
  criteria: jsonb('criteria').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_customer_segments_workspace').on(table.workspaceId),
  };
});

// Entity Persona Links (Link personas to researches, problems, opportunities, etc.)
export const entityPersonas = pgTable('entity_personas', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  personaId: uuid('persona_id').notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // research, evidence, problem, opportunity, hypothesis, decision
  entityId: uuid('entity_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    personaFk: foreignKey({
      columns: [table.personaId, table.workspaceId],
      foreignColumns: [personas.id, personas.workspaceId],
      name: 'fk_entity_personas_persona_workspace',
    }).onDelete('cascade'),
    workspaceIdx: index('idx_entity_personas_workspace').on(table.workspaceId),
    entityIdx: index('idx_entity_personas_entity').on(table.entityType, table.entityId),
  };
});

// ETAPA D: PRDs, User Stories & Acceptance Criteria
export const prds = pgTable('prds', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  roadmapItemId: uuid('roadmap_item_id'),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  problemStatement: text('problem_statement'),
  goals: jsonb('goals').$type<string[]>(),
  nonGoals: jsonb('non_goals').$type<string[]>(),
  userStories: jsonb('user_stories').$type<Array<{
    id: string;
    asA: string;
    iWant: string;
    soThat: string;
    acceptanceCriteria: string[];
    status: 'backlog' | 'in_progress' | 'done';
  }>>(),
  technicalNotes: text('technical_notes'),
  dependencies: jsonb('dependencies').$type<string[]>(),
  definitionOfDone: jsonb('definition_of_done').$type<string[]>(),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // draft, in_review, approved, in_delivery, delivered
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    roadmapFk: foreignKey({
      columns: [table.roadmapItemId, table.workspaceId],
      foreignColumns: [roadmapItems.id, roadmapItems.workspaceId],
      name: 'fk_prd_roadmap_workspace',
    }).onDelete('set null'),
    workspaceIdx: index('idx_prds_workspace').on(table.workspaceId),
    roadmapIdx: index('idx_prds_roadmap').on(table.roadmapItemId),
  };
});

// ETAPA E: Outcome Tracking & Post-Launch Reviews
export const outcomeReviews = pgTable('outcome_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  roadmapItemId: uuid('roadmap_item_id'),
  prdId: uuid('prd_id'),
  title: varchar('title', { length: 255 }).notNull(),
  metricName: varchar('metric_name', { length: 255 }).notNull(),
  baselineValue: varchar('baseline_value', { length: 100 }).notNull(),
  targetValue: varchar('target_value', { length: 100 }).notNull(),
  actualValue: varchar('actual_value', { length: 100 }).notNull(),
  timeframeDays: integer('timeframe_days').notNull().default(30), // 30, 60, 90, 180
  status: varchar('status', { length: 50 }).notNull().default('on_target'), // on_target, below_target, exceeded, inconclusive
  whatWeExpected: text('what_we_expected'),
  whatHappened: text('what_happened'),
  whatWeLearned: text('what_we_learned'),
  nextActions: text('next_actions'),
  refeedToDiscovery: integer('refeed_to_discovery').default(0), // 0: false, 1: true
  newProblemId: uuid('new_problem_id'),
  reviewedAt: timestamp('reviewed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    roadmapFk: foreignKey({
      columns: [table.roadmapItemId, table.workspaceId],
      foreignColumns: [roadmapItems.id, roadmapItems.workspaceId],
      name: 'fk_outcome_roadmap_workspace',
    }).onDelete('set null'),
    workspaceIdx: index('idx_outcome_reviews_workspace').on(table.workspaceId),
  };
});

// ETAPA F: Collaboration & Activity Timeline
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  authorId: varchar('author_id', { length: 255 }).notNull(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorEmail: varchar('author_email', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_comments_workspace').on(table.workspaceId),
    entityIdx: index('idx_comments_entity').on(table.entityType, table.entityId),
  };
});

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // created, updated, status_changed, deleted, prioritized, delivered
  actorId: varchar('actor_id', { length: 255 }).notNull(),
  actorName: varchar('actor_name', { length: 255 }).notNull(),
  actorEmail: varchar('actor_email', { length: 255 }).notNull(),
  details: jsonb('details').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_activity_logs_workspace').on(table.workspaceId),
    entityIdx: index('idx_activity_logs_entity').on(table.entityType, table.entityId),
  };
});

// ETAPA G: Product Toolkit Canvases
export const toolkitCanvases = pgTable('toolkit_canvases', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  toolKey: varchar('tool_key', { length: 100 }).notNull(), // problem_statement, ost, assumption_mapping, lean_canvas, etc.
  title: varchar('title', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  canvasData: jsonb('canvas_data').$type<Record<string, any>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    workspaceIdx: index('idx_toolkit_canvases_workspace').on(table.workspaceId),
    toolKeyIdx: index('idx_toolkit_canvases_tool_key').on(table.workspaceId, table.toolKey),
  };
});

