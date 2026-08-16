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
