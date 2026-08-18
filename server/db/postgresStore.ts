import {
  User,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  Research,
  CreateResearchInput,
  Evidence,
  CreateEvidenceInput,
  Problem,
  CreateProblemInput,
  UpdateProblemInput,
  Opportunity,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  Hypothesis,
  CreateHypothesisInput,
  Experiment,
  CreateExperimentInput,
  UpdateExperimentInput,
  Decision,
  CreateDecisionInput,
  ProductInsight,
  InsightStatus,
  DiscoveryHealthMetrics,
  RoadmapItem,
  CreateRoadmapItemInput,
  UpdateRoadmapItemInput,
  RoadmapLineage,
  Objective,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  KeyResult,
  CreateKeyResultInput,
  UpdateKeyResultInput,
  Prioritization,
  CreatePrioritizationInput,
  Persona,
  CreatePersonaInput,
  CustomerSegment,
  CreateCustomerSegmentInput,
  EntityPersonaLink,
  PRD,
  CreatePRDInput,
  UpdatePRDInput,
  OutcomeReview,
  CreateOutcomeReviewInput,
  Comment,
  CreateCommentInput,
  ActivityLog,
  ToolkitCanvas,
  CreateToolkitCanvasInput,
} from '../types/index.js';

import { db } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { BusinessRuleError } from '../utils/errors.js';
import { randomUUID } from 'crypto';

export function isValidUUID(val: string | null | undefined): boolean {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

export class PostgresStore {
  // ==========================================
  // 1. USERS & WORKSPACES
  // ==========================================
  async findOrCreateUser(uid: string, email: string, name?: string): Promise<User> {
    try {
      const existing = await db.select().from(schema.users).where(eq(schema.users.uid, uid)).limit(1);
      if (existing.length > 0) {
        return {
          uid: existing[0].uid,
          email: existing[0].email,
          name: existing[0].name || undefined,
        };
      }

      const [created] = await db
        .insert(schema.users)
        .values({
          uid,
          email,
          name: name || null,
        })
        .returning();

      return {
        uid: created.uid,
        email: created.email,
        name: created.name || undefined,
      };
    } catch (err) {
      console.error('Postgres findOrCreateUser error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao autenticar/criar usuário');
    }
  }

  async createWorkspace(name: string, userId: string, description?: string): Promise<Workspace> {
    try {
      // Ensure creator user exists in users table to satisfy FK
      const userExists = await db.select().from(schema.users).where(eq(schema.users.uid, userId)).limit(1);
      if (userExists.length === 0) {
        await db.insert(schema.users).values({
          uid: userId,
          email: `${userId}@workspace.local`,
          name: userId,
        });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      const [ws] = await db
        .insert(schema.workspaces)
        .values({
          name,
          slug,
          description: description || null,
        })
        .returning();

      await db.insert(schema.workspaceMembers).values({
        workspaceId: ws.id,
        userId,
        role: 'owner',
      });

      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        description: ws.description || undefined,
        role: 'owner',
        created_at: ws.createdAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createWorkspace error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar workspace');
    }
  }

  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    if (!isValidUUID(workspaceId)) return null;
    try {
      const rows = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, workspaceId)).limit(1);
      if (rows.length === 0) return null;
      const ws = rows[0];
      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        description: ws.description || undefined,
        role: 'member',
        created_at: ws.createdAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getWorkspaceById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar workspace');
    }
  }

  async listUserWorkspaces(userId: string): Promise<Workspace[]> {
    try {
      const rows = await db
        .select({
          workspace: schema.workspaces,
          role: schema.workspaceMembers.role,
        })
        .from(schema.workspaceMembers)
        .innerJoin(schema.workspaces, eq(schema.workspaceMembers.workspaceId, schema.workspaces.id))
        .where(eq(schema.workspaceMembers.userId, userId));

      return rows.map((r) => ({
        id: r.workspace.id,
        name: r.workspace.name,
        slug: r.workspace.slug,
        description: r.workspace.description || undefined,
        role: r.role as WorkspaceRole,
        created_at: r.workspace.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listUserWorkspaces error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar workspaces do usuário');
    }
  }

  async getUserRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    try {
      const rows = await db
        .select()
        .from(schema.workspaceMembers)
        .where(
          and(
            eq(schema.workspaceMembers.workspaceId, workspaceId),
            eq(schema.workspaceMembers.userId, userId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      return rows[0].role as WorkspaceRole;
    } catch (err) {
      console.error('Postgres getUserRole error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar papel do usuário');
    }
  }

  async getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    try {
      const rows = await db
        .select({
          member: schema.workspaceMembers,
          userEmail: schema.users.email,
          userName: schema.users.name,
        })
        .from(schema.workspaceMembers)
        .leftJoin(schema.users, eq(schema.workspaceMembers.userId, schema.users.uid))
        .where(
          and(
            eq(schema.workspaceMembers.workspaceId, workspaceId),
            eq(schema.workspaceMembers.userId, userId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.member.id,
        workspace_id: r.member.workspaceId,
        user_id: r.member.userId,
        role: r.member.role as WorkspaceRole,
        created_at: r.member.createdAt.toISOString(),
        user_email: r.userEmail || undefined,
        user_name: r.userName || undefined,
      };
    } catch (err) {
      console.error('Postgres getWorkspaceMember error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao consultar membro do workspace');
    }
  }

  async addWorkspaceMember(workspaceId: string, userId: string, role: WorkspaceRole = 'member'): Promise<WorkspaceMember> {
    try {
      const existing = await this.getWorkspaceMember(workspaceId, userId);
      if (existing) {
        throw new BusinessRuleError('Usuário já é membro deste workspace');
      }

      // Ensure user exists to satisfy FK
      const userExists = await db.select().from(schema.users).where(eq(schema.users.uid, userId)).limit(1);
      if (userExists.length === 0) {
        await db.insert(schema.users).values({
          uid: userId,
          email: `${userId}@workspace.local`,
          name: userId,
        });
      }

      const [m] = await db
        .insert(schema.workspaceMembers)
        .values({
          workspaceId,
          userId,
          role,
        })
        .returning();

      return {
        id: m.id,
        workspace_id: m.workspaceId,
        user_id: m.userId,
        role: m.role as WorkspaceRole,
        created_at: m.createdAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres addWorkspaceMember error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao adicionar membro ao workspace');
    }
  }

  async listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    try {
      const rows = await db
        .select({
          member: schema.workspaceMembers,
          userEmail: schema.users.email,
          userName: schema.users.name,
        })
        .from(schema.workspaceMembers)
        .leftJoin(schema.users, eq(schema.workspaceMembers.userId, schema.users.uid))
        .where(eq(schema.workspaceMembers.workspaceId, workspaceId));

      return rows.map((r) => ({
        id: r.member.id,
        workspace_id: r.member.workspaceId,
        user_id: r.member.userId,
        role: r.member.role as WorkspaceRole,
        created_at: r.member.createdAt.toISOString(),
        user_email: r.userEmail || undefined,
        user_name: r.userName || undefined,
      }));
    } catch (err) {
      console.error('Postgres listWorkspaceMembers error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar membros do workspace');
    }
  }

  async updateMemberRole(workspaceId: string, userId: string, newRole: WorkspaceRole): Promise<WorkspaceMember> {
    try {
      return await db.transaction(async (tx) => {
        const rows = await tx.select().from(schema.workspaceMembers)
          .where(and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userId, userId)))
          .limit(1)
          .for('update'); // Lock this member row
  
        if (rows.length === 0) {
          throw new BusinessRuleError('Membro não encontrado no workspace.');
        }
        const member = rows[0];
  
        if (member.role === 'owner' && newRole !== 'owner') {
          // Lock all owner members in this workspace to prevent race condition
          const owners = await tx.select().from(schema.workspaceMembers)
            .where(and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.role, 'owner')))
            .for('update');
          
          if (owners.length <= 1) {
            throw new BusinessRuleError('Não é possível rebaixar o único proprietário do workspace.');
          }
        }
  
        const [updated] = await tx
          .update(schema.workspaceMembers)
          .set({ role: newRole })
          .where(
            and(
              eq(schema.workspaceMembers.workspaceId, workspaceId),
              eq(schema.workspaceMembers.userId, userId)
            )
          )
          .returning();
  
        return {
          id: updated.id,
          workspace_id: updated.workspaceId,
          user_id: updated.userId,
          role: updated.role as WorkspaceRole,
          created_at: updated.createdAt.toISOString(),
        };
      });
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateMemberRole error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar papel do membro');
    }
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        const rows = await tx.select().from(schema.workspaceMembers)
          .where(and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userId, userId)))
          .limit(1)
          .for('update');
  
        if (rows.length === 0) {
          throw new BusinessRuleError('Membro não encontrado no workspace.');
        }
        const member = rows[0];
  
        if (member.role === 'owner') {
          const owners = await tx.select().from(schema.workspaceMembers)
            .where(and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.role, 'owner')))
            .for('update');
            
          if (owners.length <= 1) {
            throw new BusinessRuleError('Não é possível remover o único proprietário do workspace.');
          }
        }
  
        await tx
          .delete(schema.workspaceMembers)
          .where(
            and(
              eq(schema.workspaceMembers.workspaceId, workspaceId),
              eq(schema.workspaceMembers.userId, userId)
            )
          );
      });
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres removeMember error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao remover membro do workspace');
    }
  }

  // ==========================================
  // 2. RESEARCHES & EVIDENCES
  // ==========================================
  async listResearches(workspaceId: string): Promise<Research[]> {
    try {
      const rows = await db
        .select()
        .from(schema.researches)
        .where(eq(schema.researches.workspaceId, workspaceId))
        .orderBy(desc(schema.researches.createdAt));

      return rows.map((r) => ({
        id: r.id,
        workspace_id: r.workspaceId,
        title: r.title,
        objective: r.objective || undefined,
        target_audience: r.targetAudience || undefined,
        raw_notes: r.rawNotes || undefined,
        key_findings: (r.keyFindings as string[]) || [],
        suggested_problems: (r.suggestedProblems as any[]) || [],
        analysis_status: r.analysisStatus as any,
        status: r.status as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listResearches error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar pesquisas');
    }
  }

  async getResearchById(workspaceId: string, researchId: string): Promise<Research | null> {
    try {
      const rows = await db
        .select()
        .from(schema.researches)
        .where(and(eq(schema.researches.id, researchId), eq(schema.researches.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        workspace_id: r.workspaceId,
        title: r.title,
        objective: r.objective || undefined,
        target_audience: r.targetAudience || undefined,
        raw_notes: r.rawNotes || undefined,
        key_findings: (r.keyFindings as string[]) || [],
        suggested_problems: (r.suggestedProblems as any[]) || [],
        analysis_status: r.analysisStatus as any,
        status: r.status as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getResearchById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar pesquisa');
    }
  }

  async createResearch(workspaceId: string, data: CreateResearchInput): Promise<Research> {
    try {
      const [inserted] = await db
        .insert(schema.researches)
        .values({
          workspaceId,
          title: data.title,
          objective: data.objective,
          targetAudience: data.target_audience,
          rawNotes: data.raw_notes,
          keyFindings: [],
          suggestedProblems: [],
          analysisStatus: 'pending',
          status: 'draft',
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        title: inserted.title,
        objective: inserted.objective || undefined,
        target_audience: inserted.targetAudience || undefined,
        raw_notes: inserted.rawNotes || undefined,
        key_findings: [],
        suggested_problems: [],
        analysis_status: 'pending',
        status: 'draft',
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createResearch error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar pesquisa');
    }
  }

  async updateResearch(
    workspaceId: string,
    researchId: string,
    data: Partial<CreateResearchInput> & {
      key_findings?: string[];
      suggested_problems?: any[];
      analysis_status?: string;
      status?: string;
    }
  ): Promise<Research> {
    try {
      const existing = await this.getResearchById(workspaceId, researchId);
      if (!existing) {
        throw new BusinessRuleError('Pesquisa não encontrada neste workspace.');
      }

      const updateFields: any = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.objective !== undefined) updateFields.objective = data.objective;
      if (data.target_audience !== undefined) updateFields.targetAudience = data.target_audience;
      if (data.raw_notes !== undefined) updateFields.rawNotes = data.raw_notes;
      if (data.key_findings !== undefined) updateFields.keyFindings = data.key_findings;
      if (data.suggested_problems !== undefined) updateFields.suggestedProblems = data.suggested_problems;
      if (data.analysis_status !== undefined) updateFields.analysisStatus = data.analysis_status;
      if (data.status !== undefined) updateFields.status = data.status;

      const [updated] = await db
        .update(schema.researches)
        .set(updateFields)
        .where(and(eq(schema.researches.id, researchId), eq(schema.researches.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        title: updated.title,
        objective: updated.objective || undefined,
        target_audience: updated.targetAudience || undefined,
        raw_notes: updated.rawNotes || undefined,
        key_findings: (updated.keyFindings as string[]) || [],
        suggested_problems: (updated.suggestedProblems as any[]) || [],
        analysis_status: updated.analysisStatus as any,
        status: updated.status as any,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateResearch error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar pesquisa');
    }
  }

  async listEvidences(workspaceId: string, researchId?: string): Promise<Evidence[]> {
    try {
      const conditions = [eq(schema.evidences.workspaceId, workspaceId)];
      if (researchId) {
        conditions.push(eq(schema.evidences.researchId, researchId));
      }

      const rows = await db
        .select()
        .from(schema.evidences)
        .where(and(...conditions))
        .orderBy(desc(schema.evidences.createdAt));

      return rows.map((e) => ({
        id: e.id,
        workspace_id: e.workspaceId,
        research_id: e.researchId || undefined,
        content: e.content,
        source: e.source || undefined,
        origin_type: e.originType as any,
        notes: e.notes || undefined,
        impact_score: e.impactScore,
        tags: (e.tags as string[]) || [],
        created_at: e.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listEvidences error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar evidências');
    }
  }

  async getEvidenceById(workspaceId: string, evidenceId: string): Promise<Evidence | null> {
    try {
      const rows = await db
        .select()
        .from(schema.evidences)
        .where(and(eq(schema.evidences.id, evidenceId), eq(schema.evidences.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const e = rows[0];
      return {
        id: e.id,
        workspace_id: e.workspaceId,
        research_id: e.researchId || undefined,
        content: e.content,
        source: e.source || undefined,
        origin_type: e.originType as any,
        notes: e.notes || undefined,
        impact_score: e.impactScore,
        tags: (e.tags as string[]) || [],
        created_at: e.createdAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getEvidenceById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar evidência');
    }
  }

  async createEvidence(workspaceId: string, data: CreateEvidenceInput): Promise<Evidence> {
    try {
      if (data.research_id) {
        const research = await this.getResearchById(workspaceId, data.research_id);
        if (!research) {
          throw new BusinessRuleError('Pesquisa não encontrada neste workspace.');
        }
      }

      const [inserted] = await db
        .insert(schema.evidences)
        .values({
          workspaceId,
          researchId: data.research_id || null,
          content: data.content,
          source: data.source,
          originType: data.origin_type,
          notes: data.notes,
          impactScore: data.impact_score || 3,
          tags: data.tags || [],
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        research_id: inserted.researchId || undefined,
        content: inserted.content,
        source: inserted.source || undefined,
        origin_type: inserted.originType as any,
        notes: inserted.notes || undefined,
        impact_score: inserted.impactScore,
        tags: (inserted.tags as string[]) || [],
        created_at: inserted.createdAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createEvidence error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar evidência');
    }
  }

  async batchCreateEvidences(workspaceId: string, items: CreateEvidenceInput[]): Promise<Evidence[]> {
    const results: Evidence[] = [];
    for (const item of items) {
      results.push(await this.createEvidence(workspaceId, item));
    }
    return results;
  }

  // ==========================================
  // 3. PROBLEMS & PROBLEM-EVIDENCES
  // ==========================================
  async listProblems(workspaceId: string): Promise<Problem[]> {
    try {
      const rows = await db
        .select()
        .from(schema.problems)
        .where(eq(schema.problems.workspaceId, workspaceId))
        .orderBy(desc(schema.problems.createdAt));

      const problemIds = rows.map((r) => r.id);
      const links = problemIds.length > 0
        ? await db.select().from(schema.problemEvidences).where(inArray(schema.problemEvidences.problemId, problemIds))
        : [];

      return rows.map((p) => {
        const evLinks = links.filter((l) => l.problemId === p.id);
        return {
          id: p.id,
          workspace_id: p.workspaceId,
          title: p.title,
          description: p.description,
          impact: p.impact as any,
          frequency: p.frequency as any,
          status: p.status as any,
          score: p.score || 0,
          evidence_count: evLinks.length,
          evidence_ids: evLinks.map((l) => l.evidenceId),
          created_at: p.createdAt.toISOString(),
          updated_at: p.updatedAt.toISOString(),
        };
      });
    } catch (err) {
      console.error('Postgres listProblems error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar problemas');
    }
  }

  async getProblemById(workspaceId: string, problemId: string): Promise<Problem | null> {
    try {
      const rows = await db
        .select()
        .from(schema.problems)
        .where(and(eq(schema.problems.id, problemId), eq(schema.problems.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const p = rows[0];

      const links = await db
        .select()
        .from(schema.problemEvidences)
        .where(and(eq(schema.problemEvidences.problemId, problemId), eq(schema.problemEvidences.workspaceId, workspaceId)));

      return {
        id: p.id,
        workspace_id: p.workspaceId,
        title: p.title,
        description: p.description,
        impact: p.impact as any,
        frequency: p.frequency as any,
        status: p.status as any,
        score: p.score || 0,
        evidence_count: links.length,
        evidence_ids: links.map((l) => l.evidenceId),
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getProblemById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar problema');
    }
  }

  async createProblem(workspaceId: string, data: CreateProblemInput): Promise<Problem> {
    try {
      const evidenceIds = data.evidence_ids || (data.evidence_id ? [data.evidence_id] : []);

      if (evidenceIds.length > 0) {
        const evs = await db
          .select()
          .from(schema.evidences)
          .where(and(inArray(schema.evidences.id, evidenceIds), eq(schema.evidences.workspaceId, workspaceId)));

        if (evs.length !== evidenceIds.length) {
          throw new BusinessRuleError('Uma ou mais evidências não pertencem a este workspace.');
        }
      }

      const [inserted] = await db
        .insert(schema.problems)
        .values({
          workspaceId,
          title: data.title,
          description: data.description,
          impact: data.impact,
          frequency: data.frequency,
          status: 'identified',
        })
        .returning();

      for (const eId of evidenceIds) {
        await db.insert(schema.problemEvidences).values({
          workspaceId,
          problemId: inserted.id,
          evidenceId: eId,
        });
      }

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        title: inserted.title,
        description: inserted.description,
        impact: inserted.impact as any,
        frequency: inserted.frequency as any,
        status: inserted.status as any,
        score: inserted.score || 0,
        evidence_count: evidenceIds.length,
        evidence_ids: evidenceIds,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createProblem error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar problema');
    }
  }

  async updateProblem(workspaceId: string, problemId: string, data: UpdateProblemInput): Promise<Problem> {
    try {
      const existing = await this.getProblemById(workspaceId, problemId);
      if (!existing) {
        throw new BusinessRuleError('Problema não encontrado neste workspace.');
      }

      const updateFields: any = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.impact !== undefined) updateFields.impact = data.impact;
      if (data.frequency !== undefined) updateFields.frequency = data.frequency;
      if (data.status !== undefined) updateFields.status = data.status;

      const [updated] = await db
        .update(schema.problems)
        .set(updateFields)
        .where(and(eq(schema.problems.id, problemId), eq(schema.problems.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        title: updated.title,
        description: updated.description,
        impact: updated.impact as any,
        frequency: updated.frequency as any,
        status: updated.status as any,
        score: updated.score || 0,
        evidence_count: existing.evidence_count,
        evidence_ids: existing.evidence_ids,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateProblem error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar problema');
    }
  }

  async linkProblemEvidences(workspaceId: string, problemId: string, evidenceIds: string[]): Promise<void> {
    try {
      const problem = await this.getProblemById(workspaceId, problemId);
      if (!problem) throw new BusinessRuleError('Problema não encontrado.');

      for (const eId of evidenceIds) {
        const ev = await this.getEvidenceById(workspaceId, eId);
        if (!ev) throw new BusinessRuleError('Evidência não encontrada.');

        const exists = await db
          .select()
          .from(schema.problemEvidences)
          .where(
            and(
              eq(schema.problemEvidences.workspaceId, workspaceId),
              eq(schema.problemEvidences.problemId, problemId),
              eq(schema.problemEvidences.evidenceId, eId)
            )
          )
          .limit(1);

        if (exists.length === 0) {
          await db.insert(schema.problemEvidences).values({
            workspaceId,
            problemId,
            evidenceId: eId,
          });
        }
      }
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres linkProblemEvidences error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao vincular evidências');
    }
  }

  // ==========================================
  // 4. OPPORTUNITIES & OPPORTUNITY-PROBLEMS
  // ==========================================
  async listOpportunities(workspaceId: string): Promise<Opportunity[]> {
    try {
      const rows = await db
        .select()
        .from(schema.opportunities)
        .where(eq(schema.opportunities.workspaceId, workspaceId))
        .orderBy(desc(schema.opportunities.createdAt));

      const oppIds = rows.map((r) => r.id);
      const links = oppIds.length > 0
        ? await db.select().from(schema.opportunityProblems).where(inArray(schema.opportunityProblems.opportunityId, oppIds))
        : [];

      return rows.map((o) => {
        const probLinks = links.filter((l) => l.opportunityId === o.id);
        return {
          id: o.id,
          workspace_id: o.workspaceId,
          title: o.title,
          description: o.description,
          effort: o.effort as any,
          value: o.value as any,
          status: o.status as any,
          score: o.score || 0,
          problem_id: probLinks[0]?.problemId,
          problem_ids: probLinks.map((l) => l.problemId),
          created_at: o.createdAt.toISOString(),
          updated_at: o.updatedAt.toISOString(),
        };
      });
    } catch (err) {
      console.error('Postgres listOpportunities error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar oportunidades');
    }
  }

  async getOpportunityById(workspaceId: string, opportunityId: string): Promise<Opportunity | null> {
    try {
      const rows = await db
        .select()
        .from(schema.opportunities)
        .where(and(eq(schema.opportunities.id, opportunityId), eq(schema.opportunities.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const o = rows[0];

      const links = await db
        .select()
        .from(schema.opportunityProblems)
        .where(
          and(
            eq(schema.opportunityProblems.opportunityId, opportunityId),
            eq(schema.opportunityProblems.workspaceId, workspaceId)
          )
        );

      return {
        id: o.id,
        workspace_id: o.workspaceId,
        title: o.title,
        description: o.description,
        effort: o.effort as any,
        value: o.value as any,
        status: o.status as any,
        score: o.score || 0,
        problem_id: links[0]?.problemId,
        problem_ids: links.map((l) => l.problemId),
        created_at: o.createdAt.toISOString(),
        updated_at: o.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getOpportunityById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar oportunidade');
    }
  }

  async createOpportunity(workspaceId: string, data: CreateOpportunityInput): Promise<Opportunity> {
    try {
      const problemIds = data.problem_ids || (data.problem_id ? [data.problem_id] : []);

      if (problemIds.length > 0) {
        const probs = await db
          .select()
          .from(schema.problems)
          .where(and(inArray(schema.problems.id, problemIds), eq(schema.problems.workspaceId, workspaceId)));

        if (probs.length !== problemIds.length) {
          throw new BusinessRuleError('Um ou mais problemas não pertencem a este workspace.');
        }
      }

      const [inserted] = await db
        .insert(schema.opportunities)
        .values({
          workspaceId,
          title: data.title,
          description: data.description,
          effort: data.effort,
          value: data.value,
        })
        .returning();

      for (const pId of problemIds) {
        await db.insert(schema.opportunityProblems).values({
          workspaceId,
          opportunityId: inserted.id,
          problemId: pId,
        });
      }

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        title: inserted.title,
        description: inserted.description,
        effort: inserted.effort as any,
        value: inserted.value as any,
        status: inserted.status as any,
        score: inserted.score || 0,
        problem_id: problemIds[0] || undefined,
        problem_ids: problemIds,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createOpportunity error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar oportunidade');
    }
  }

  async updateOpportunity(workspaceId: string, opportunityId: string, data: UpdateOpportunityInput): Promise<Opportunity> {
    try {
      const existing = await this.getOpportunityById(workspaceId, opportunityId);
      if (!existing) {
        throw new BusinessRuleError('Oportunidade não encontrada neste workspace.');
      }

      const updateFields: any = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.effort !== undefined) updateFields.effort = data.effort;
      if (data.value !== undefined) updateFields.value = data.value;
      if (data.status !== undefined) updateFields.status = data.status;

      const [updated] = await db
        .update(schema.opportunities)
        .set(updateFields)
        .where(and(eq(schema.opportunities.id, opportunityId), eq(schema.opportunities.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        title: updated.title,
        description: updated.description,
        effort: updated.effort as any,
        value: updated.value as any,
        status: updated.status as any,
        score: updated.score || 0,
        problem_id: existing.problem_id,
        problem_ids: existing.problem_ids,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateOpportunity error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar oportunidade');
    }
  }

  async linkOpportunityProblems(workspaceId: string, opportunityId: string, problemIds: string[]): Promise<void> {
    try {
      const opp = await this.getOpportunityById(workspaceId, opportunityId);
      if (!opp) throw new BusinessRuleError('Oportunidade não encontrada.');

      for (const pId of problemIds) {
        const prob = await this.getProblemById(workspaceId, pId);
        if (!prob) throw new BusinessRuleError('Problema não encontrado.');

        const exists = await db
          .select()
          .from(schema.opportunityProblems)
          .where(
            and(
              eq(schema.opportunityProblems.workspaceId, workspaceId),
              eq(schema.opportunityProblems.opportunityId, opportunityId),
              eq(schema.opportunityProblems.problemId, pId)
            )
          )
          .limit(1);

        if (exists.length === 0) {
          await db.insert(schema.opportunityProblems).values({
            workspaceId,
            opportunityId,
            problemId: pId,
          });
        }
      }
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres linkOpportunityProblems error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao vincular problemas');
    }
  }

  // ==========================================
  // 5. HYPOTHESES, EXPERIMENTS & DECISIONS
  // ==========================================
  async listHypotheses(workspaceId: string, opportunityId?: string): Promise<Hypothesis[]> {
    try {
      const conditions = [eq(schema.hypotheses.workspaceId, workspaceId)];
      if (opportunityId) {
        conditions.push(eq(schema.hypotheses.opportunityId, opportunityId));
      }

      const rows = await db
        .select()
        .from(schema.hypotheses)
        .where(and(...conditions))
        .orderBy(desc(schema.hypotheses.createdAt));

      return rows.map((r) => ({
        id: r.id,
        workspace_id: r.workspaceId,
        opportunity_id: r.opportunityId || undefined,
        title: r.title,
        statement: r.statement,
        metrics_to_validate: r.metricsToValidate || undefined,
        confidence_score: r.confidenceScore || undefined,
        status: r.status as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listHypotheses error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar hipóteses');
    }
  }

  async getHypothesisById(workspaceId: string, hypothesisId: string): Promise<Hypothesis | null> {
    try {
      const rows = await db
        .select()
        .from(schema.hypotheses)
        .where(and(eq(schema.hypotheses.id, hypothesisId), eq(schema.hypotheses.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        workspace_id: r.workspaceId,
        opportunity_id: r.opportunityId || undefined,
        title: r.title,
        statement: r.statement,
        metrics_to_validate: r.metricsToValidate || undefined,
        confidence_score: r.confidenceScore || undefined,
        status: r.status as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getHypothesisById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar hipótese');
    }
  }

  async createHypothesis(workspaceId: string, data: CreateHypothesisInput): Promise<Hypothesis> {
    try {
      if (data.opportunity_id) {
        const opp = await this.getOpportunityById(workspaceId, data.opportunity_id);
        if (!opp) {
          throw new BusinessRuleError('Oportunidade não encontrada neste workspace.');
        }
      }

      const [inserted] = await db
        .insert(schema.hypotheses)
        .values({
          workspaceId,
          opportunityId: data.opportunity_id || null,
          title: data.title,
          statement: data.statement,
          metricsToValidate: data.metrics_to_validate,
          confidenceScore: data.confidence_score || 3,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        opportunity_id: inserted.opportunityId || undefined,
        title: inserted.title,
        statement: inserted.statement,
        metrics_to_validate: inserted.metricsToValidate || undefined,
        confidence_score: inserted.confidenceScore || undefined,
        status: inserted.status as any,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createHypothesis error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar hipótese');
    }
  }

  async updateHypothesis(
    workspaceId: string,
    hypothesisId: string,
    data: Partial<CreateHypothesisInput> & { status?: string }
  ): Promise<Hypothesis> {
    try {
      const existing = await this.getHypothesisById(workspaceId, hypothesisId);
      if (!existing) throw new BusinessRuleError('Hipótese não encontrada neste workspace.');

      if (data.opportunity_id) {
        const opp = await this.getOpportunityById(workspaceId, data.opportunity_id);
        if (!opp) throw new BusinessRuleError('Oportunidade não encontrada neste workspace.');
      }

      const updateFields: any = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.statement !== undefined) updateFields.statement = data.statement;
      if (data.metrics_to_validate !== undefined) updateFields.metricsToValidate = data.metrics_to_validate;
      if (data.confidence_score !== undefined) updateFields.confidenceScore = data.confidence_score;
      if (data.status !== undefined) updateFields.status = data.status;
      if (data.opportunity_id !== undefined) updateFields.opportunityId = data.opportunity_id || null;

      const [updated] = await db
        .update(schema.hypotheses)
        .set(updateFields)
        .where(and(eq(schema.hypotheses.id, hypothesisId), eq(schema.hypotheses.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        opportunity_id: updated.opportunityId || undefined,
        title: updated.title,
        statement: updated.statement,
        metrics_to_validate: updated.metricsToValidate || undefined,
        confidence_score: updated.confidenceScore || undefined,
        status: updated.status as any,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateHypothesis error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar hipótese');
    }
  }

  async listExperiments(workspaceId: string, hypothesisId?: string): Promise<Experiment[]> {
    try {
      const conditions = [eq(schema.experiments.workspaceId, workspaceId)];
      if (hypothesisId) {
        conditions.push(eq(schema.experiments.hypothesisId, hypothesisId));
      }

      const rows = await db
        .select()
        .from(schema.experiments)
        .where(and(...conditions))
        .orderBy(desc(schema.experiments.createdAt));

      return rows.map((r) => ({
        id: r.id,
        workspace_id: r.workspaceId,
        hypothesis_id: r.hypothesisId,
        title: r.title,
        description: r.description || undefined,
        methodology: r.methodology || undefined,
        sample_size: r.sampleSize || undefined,
        status: r.status as any,
        results: r.results || undefined,
        learnings: r.learnings || undefined,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listExperiments error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar experimentos');
    }
  }

  async getExperimentById(workspaceId: string, experimentId: string): Promise<Experiment | null> {
    try {
      const rows = await db
        .select()
        .from(schema.experiments)
        .where(and(eq(schema.experiments.id, experimentId), eq(schema.experiments.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        workspace_id: r.workspaceId,
        hypothesis_id: r.hypothesisId,
        title: r.title,
        description: r.description || undefined,
        methodology: r.methodology || undefined,
        sample_size: r.sampleSize || undefined,
        status: r.status as any,
        results: r.results || undefined,
        learnings: r.learnings || undefined,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getExperimentById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar experimento');
    }
  }

  async createExperiment(workspaceId: string, data: CreateExperimentInput): Promise<Experiment> {
    try {
      const hyp = await this.getHypothesisById(workspaceId, data.hypothesis_id);
      if (!hyp) {
        throw new BusinessRuleError('Hipótese não encontrada neste workspace.');
      }

      const [inserted] = await db
        .insert(schema.experiments)
        .values({
          workspaceId,
          hypothesisId: data.hypothesis_id,
          title: data.title,
          description: data.description,
          methodology: data.methodology,
          sampleSize: data.sample_size,
          status: 'draft',
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        hypothesis_id: inserted.hypothesisId,
        title: inserted.title,
        description: inserted.description || undefined,
        methodology: inserted.methodology || undefined,
        sample_size: inserted.sampleSize || undefined,
        status: inserted.status as any,
        results: inserted.results || undefined,
        learnings: inserted.learnings || undefined,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createExperiment error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar experimento');
    }
  }

  async updateExperiment(workspaceId: string, experimentId: string, data: UpdateExperimentInput): Promise<Experiment> {
    try {
      const existing = await this.getExperimentById(workspaceId, experimentId);
      if (!existing) {
        throw new BusinessRuleError('Experimento não encontrado neste workspace.');
      }

      if (data.status && data.status !== existing.status) {
        const validTransitions: Record<string, string[]> = {
          draft: ['running', 'cancelled'],
          running: ['completed', 'cancelled'],
          completed: [],
          cancelled: [],
        };
        if (!validTransitions[existing.status]?.includes(data.status)) {
          throw new BusinessRuleError(
            `Transição inválida de status do experimento: ${existing.status} -> ${data.status}`
          );
        }
      }

      const updateFields: any = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.methodology !== undefined) updateFields.methodology = data.methodology;
      if (data.sample_size !== undefined) updateFields.sampleSize = data.sample_size;
      if (data.status !== undefined) updateFields.status = data.status;
      if (data.results !== undefined) updateFields.results = data.results;
      if (data.learnings !== undefined) updateFields.learnings = data.learnings;

      const [updated] = await db
        .update(schema.experiments)
        .set(updateFields)
        .where(and(eq(schema.experiments.id, experimentId), eq(schema.experiments.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        hypothesis_id: updated.hypothesisId,
        title: updated.title,
        description: updated.description || undefined,
        methodology: updated.methodology || undefined,
        sample_size: updated.sampleSize || undefined,
        status: updated.status as any,
        results: updated.results || undefined,
        learnings: updated.learnings || undefined,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateExperiment error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar experimento');
    }
  }

  async listDecisions(workspaceId: string, experimentId?: string, status?: string): Promise<Decision[]> {
    try {
      const conditions = [eq(schema.decisions.workspaceId, workspaceId)];
      if (experimentId) {
        conditions.push(eq(schema.decisions.experimentId, experimentId));
      }
      if (status) {
        conditions.push(eq(schema.decisions.status, status));
      }

      const rows = await db
        .select()
        .from(schema.decisions)
        .where(and(...conditions))
        .orderBy(desc(schema.decisions.createdAt));

      return rows.map((r) => ({
        id: r.id,
        workspace_id: r.workspaceId,
        experiment_id: r.experimentId,
        title: r.title,
        description: r.description || undefined,
        decision: r.decision,
        rationale: r.rationale || undefined,
        status: r.status as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listDecisions error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar decisões');
    }
  }

  async getDecisionById(workspaceId: string, decisionId: string): Promise<Decision | null> {
    try {
      const rows = await db
        .select()
        .from(schema.decisions)
        .where(and(eq(schema.decisions.id, decisionId), eq(schema.decisions.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        workspace_id: r.workspaceId,
        experiment_id: r.experimentId,
        title: r.title,
        description: r.description || undefined,
        decision: r.decision,
        rationale: r.rationale || undefined,
        status: r.status as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getDecisionById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar decisão');
    }
  }

  async createDecision(workspaceId: string, data: CreateDecisionInput & { status?: string }): Promise<Decision> {
    try {
      const exp = await this.getExperimentById(workspaceId, data.experiment_id);
      if (!exp) {
        throw new BusinessRuleError('Experimento não encontrado neste workspace.');
      }

      if (exp.status !== 'completed') {
        throw new BusinessRuleError(
          `Uma decisão só pode ser criada para um experimento concluído (status atual: ${exp.status}).`
        );
      }

      const [inserted] = await db
        .insert(schema.decisions)
        .values({
          workspaceId,
          experimentId: data.experiment_id,
          title: data.title,
          description: data.description,
          decision: data.decision,
          rationale: data.rationale,
          status: data.status || 'pending',
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        experiment_id: inserted.experimentId,
        title: inserted.title,
        description: inserted.description || undefined,
        decision: inserted.decision,
        rationale: inserted.rationale || undefined,
        status: inserted.status as any,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createDecision error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar decisão');
    }
  }

  async updateDecision(
    workspaceId: string,
    decisionId: string,
    data: Partial<CreateDecisionInput> & { status?: string }
  ): Promise<Decision> {
    try {
      const existing = await this.getDecisionById(workspaceId, decisionId);
      if (!existing) {
        throw new BusinessRuleError('Decisão não encontrada neste workspace.');
      }

      const updateFields: any = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.decision !== undefined) updateFields.decision = data.decision;
      if (data.rationale !== undefined) updateFields.rationale = data.rationale;
      if (data.status !== undefined) updateFields.status = data.status;

      const [updated] = await db
        .update(schema.decisions)
        .set(updateFields)
        .where(and(eq(schema.decisions.id, decisionId), eq(schema.decisions.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        experiment_id: updated.experimentId,
        title: updated.title,
        description: updated.description || undefined,
        decision: updated.decision,
        rationale: updated.rationale || undefined,
        status: updated.status as any,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateDecision error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar decisão');
    }
  }

  async deleteDecision(workspaceId: string, decisionId: string): Promise<void> {
    try {
      const existing = await this.getDecisionById(workspaceId, decisionId);
      if (!existing) {
        throw new BusinessRuleError('Decisão não encontrada neste workspace.');
      }

      await db
        .delete(schema.decisions)
        .where(and(eq(schema.decisions.id, decisionId), eq(schema.decisions.workspaceId, workspaceId)));
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres deleteDecision error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir decisão');
    }
  }

  // ==========================================
  // 6. INSIGHTS & DISCOVERY HEALTH
  // ==========================================
  async getInsights(workspaceId: string, status?: InsightStatus): Promise<ProductInsight[]> {
    try {
      const conditions = [eq(schema.productInsights.workspaceId, workspaceId)];
      if (status) {
        conditions.push(eq(schema.productInsights.status, status));
      }

      const rows = await db
        .select()
        .from(schema.productInsights)
        .where(and(...conditions))
        .orderBy(desc(schema.productInsights.createdAt));

      return rows.map((r) => ({
        id: r.id,
        workspace_id: r.workspaceId,
        type: r.type as any,
        severity: r.severity as any,
        title: r.title,
        summary: r.summary,
        facts: (r.facts as string[]) || [],
        interpretation: r.interpretation,
        uncertainties: (r.uncertainties as string[]) || [],
        sources: (r.sources as any[]) || [],
        status: r.status as any,
        feedback_notes: r.feedbackNotes || undefined,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres getInsights error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar insights');
    }
  }

  async saveInsights(workspaceId: string, insights: ProductInsight[]): Promise<ProductInsight[]> {
    try {
      const saved: ProductInsight[] = [];
      for (const ins of insights) {
        if (ins.sources) {
          for (const src of ins.sources) {
            const belongs = await this.verifyEntityBelongsToWorkspace(workspaceId, src.entity_type, src.entity_id);
            if (!belongs) {
              throw new BusinessRuleError('A fonte referenciada no insight não existe ou não pertence a este workspace.');
            }
          }
        }

        const [inserted] = await db
          .insert(schema.productInsights)
          .values({
            id: ins.id || randomUUID(),
            workspaceId,
            type: ins.type,
            severity: ins.severity,
            title: ins.title,
            summary: ins.summary,
            facts: ins.facts,
            interpretation: ins.interpretation,
            uncertainties: ins.uncertainties,
            sources: ins.sources,
            status: ins.status || 'suggested',
            feedbackNotes: ins.feedback_notes || null,
          })
          .onConflictDoUpdate({
            target: [schema.productInsights.id],
            set: {
              type: ins.type,
              severity: ins.severity,
              title: ins.title,
              summary: ins.summary,
              facts: ins.facts,
              interpretation: ins.interpretation,
              uncertainties: ins.uncertainties,
              sources: ins.sources,
              updatedAt: new Date(),
            },
          })
          .returning();

        saved.push({
          id: inserted.id,
          workspace_id: inserted.workspaceId,
          type: inserted.type as any,
          severity: inserted.severity as any,
          title: inserted.title,
          summary: inserted.summary,
          facts: (inserted.facts as string[]) || [],
          interpretation: inserted.interpretation,
          uncertainties: (inserted.uncertainties as string[]) || [],
          sources: (inserted.sources as any[]) || [],
          status: inserted.status as any,
          feedback_notes: inserted.feedbackNotes || undefined,
          created_at: inserted.createdAt.toISOString(),
          updated_at: inserted.updatedAt.toISOString(),
        });
      }
      return saved;
    } catch (err) {
      console.error('Postgres saveInsights error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao salvar insights');
    }
  }

  async updateInsightStatus(
    workspaceId: string,
    insightId: string,
    status: InsightStatus,
    feedbackNotes?: string
  ): Promise<ProductInsight> {
    try {
      const [updated] = await db
        .update(schema.productInsights)
        .set({
          status,
          feedbackNotes: feedbackNotes !== undefined ? feedbackNotes : undefined,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.productInsights.id, insightId),
            eq(schema.productInsights.workspaceId, workspaceId)
          )
        )
        .returning();

      if (!updated) throw new BusinessRuleError('Insight não encontrado neste workspace.');

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        type: updated.type as any,
        severity: updated.severity as any,
        title: updated.title,
        summary: updated.summary,
        facts: (updated.facts as string[]) || [],
        interpretation: updated.interpretation,
        uncertainties: (updated.uncertainties as string[]) || [],
        sources: (updated.sources as any[]) || [],
        status: updated.status as any,
        feedback_notes: updated.feedbackNotes || undefined,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateInsightStatus error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar insight');
    }
  }

  async getDiscoveryHealth(workspaceId: string): Promise<DiscoveryHealthMetrics> {
    try {
      const [
        resList,
        evList,
        probList,
        oppList,
        hypList,
        expList,
        decList,
      ] = await Promise.all([
        this.listResearches(workspaceId),
        this.listEvidences(workspaceId),
        this.listProblems(workspaceId),
        this.listOpportunities(workspaceId),
        this.listHypotheses(workspaceId),
        this.listExperiments(workspaceId),
        this.listDecisions(workspaceId),
      ]);

      const totalRes = resList.length;
      const totalEv = evList.length;
      const totalProb = probList.length;
      const totalOpp = oppList.length;
      const totalHyp = hypList.length;
      const totalExp = expList.length;
      const totalDec = decList.length;

      const resToEv = totalRes > 0 ? Number((totalEv / totalRes).toFixed(2)) : 0;
      const probVal = totalProb > 0 ? Number((probList.filter((p) => (p.evidence_count || 0) > 0).length / totalProb).toFixed(2)) : 0;
      const hypTested = totalHyp > 0 ? Number((expList.length / totalHyp).toFixed(2)) : 0;
      const expDecided = totalExp > 0 ? Number((decList.length / totalExp).toFixed(2)) : 0;

      const decWithoutEv = decList.filter((d) => {
        const exp = expList.find((e) => e.id === d.experiment_id);
        if (!exp) return true;
        const hyp = hypList.find((h) => h.id === exp.hypothesis_id);
        if (!hyp || !hyp.opportunity_id) return true;
        const opp = oppList.find((o) => o.id === hyp.opportunity_id);
        return !opp;
      }).length;

      const unvalHyp = hypList.filter((h) => !expList.some((e) => e.hypothesis_id === h.id)).length;
      const inconvExp = expList.filter((e) => e.status === 'completed' && (!e.learnings || e.learnings.length < 10)).length;
      const orphanedProb = probList.filter((p) => (p.evidence_count || 0) === 0).length;

      let score = 70;
      if (probVal > 0.5) score += 10;
      if (expDecided > 0.5) score += 10;
      if (decWithoutEv === 0 && totalDec > 0) score += 10;
      if (orphanedProb > 3) score -= 15;
      score = Math.max(0, Math.min(100, score));

      return {
        workspace_id: workspaceId,
        health_score: score,
        totals: {
          researches: totalRes,
          evidences: totalEv,
          problems: totalProb,
          opportunities: totalOpp,
          hypotheses: totalHyp,
          experiments: totalExp,
          decisions: totalDec,
        },
        funnel_conversion: {
          researches_to_evidences_ratio: resToEv,
          problems_validated_ratio: probVal,
          hypotheses_tested_ratio: hypTested,
          experiments_decided_ratio: expDecided,
        },
        risk_indicators: {
          decisions_without_evidence_count: decWithoutEv,
          unvalidated_hypotheses_count: unvalHyp,
          inconclusive_experiments_count: inconvExp,
          orphaned_problems_count: orphanedProb,
        },
        last_evaluated_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Postgres getDiscoveryHealth error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao calcular saúde do discovery');
    }
  }

  // ==========================================
  // 7. ROADMAP & STRATEGIC INITIATIVES
  // ==========================================
  async listRoadmapItems(workspaceId: string, timeframe?: string, status?: string): Promise<RoadmapItem[]> {
    try {
      const conditions = [eq(schema.roadmapItems.workspaceId, workspaceId)];
      if (timeframe) conditions.push(eq(schema.roadmapItems.timeframe, timeframe));
      if (status) conditions.push(eq(schema.roadmapItems.status, status));

      const rows = await db
        .select()
        .from(schema.roadmapItems)
        .where(and(...conditions))
        .orderBy(desc(schema.roadmapItems.createdAt));

      const decIds = rows.map((r) => r.decisionId).filter(Boolean) as string[];
      const oppIds = rows.map((r) => r.opportunityId).filter(Boolean) as string[];

      const decs = decIds.length > 0
        ? await db.select().from(schema.decisions).where(inArray(schema.decisions.id, decIds))
        : [];
      const opps = oppIds.length > 0
        ? await db.select().from(schema.opportunities).where(inArray(schema.opportunities.id, oppIds))
        : [];

      return rows.map((r) => {
        const dec = decs.find((d) => d.id === r.decisionId);
        const opp = opps.find((o) => o.id === r.opportunityId);
        return {
          id: r.id,
          workspace_id: r.workspaceId,
          title: r.title,
          description: r.description || undefined,
          timeframe: r.timeframe as any,
          status: r.status as any,
          priority: r.priority as any,
          target_quarter: r.targetQuarter || undefined,
          decision_id: r.decisionId || undefined,
          opportunity_id: r.opportunityId || undefined,
          metrics_target: r.metricsTarget || undefined,
          progress: r.progress,
          owner_name: r.ownerName || undefined,
          created_at: r.createdAt.toISOString(),
          updated_at: r.updatedAt.toISOString(),
          decision_title: dec?.title,
          opportunity_title: opp?.title,
        };
      });
    } catch (err) {
      console.error('Postgres listRoadmapItems error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar itens do roadmap');
    }
  }

  async getRoadmapItemById(workspaceId: string, id: string): Promise<RoadmapItem | null> {
    try {
      const rows = await db
        .select()
        .from(schema.roadmapItems)
        .where(and(eq(schema.roadmapItems.id, id), eq(schema.roadmapItems.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];

      let decTitle: string | undefined;
      let oppTitle: string | undefined;

      if (r.decisionId) {
        const dec = await this.getDecisionById(workspaceId, r.decisionId);
        decTitle = dec?.title;
      }
      if (r.opportunityId) {
        const opp = await this.getOpportunityById(workspaceId, r.opportunityId);
        oppTitle = opp?.title;
      }

      return {
        id: r.id,
        workspace_id: r.workspaceId,
        title: r.title,
        description: r.description || undefined,
        timeframe: r.timeframe as any,
        status: r.status as any,
        priority: r.priority as any,
        target_quarter: r.targetQuarter || undefined,
        decision_id: r.decisionId || undefined,
        opportunity_id: r.opportunityId || undefined,
        metrics_target: r.metricsTarget || undefined,
        progress: r.progress,
        owner_name: r.ownerName || undefined,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
        decision_title: decTitle,
        opportunity_title: oppTitle,
      };
    } catch (err) {
      console.error('Postgres getRoadmapItemById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar item do roadmap');
    }
  }

  async createRoadmapItem(workspaceId: string, input: CreateRoadmapItemInput): Promise<RoadmapItem> {
    try {
      if (input.decision_id) {
        const dec = await this.getDecisionById(workspaceId, input.decision_id);
        if (!dec) throw new BusinessRuleError('Decisão vinculada não encontrada neste workspace.');
      }
      if (input.opportunity_id) {
        const opp = await this.getOpportunityById(workspaceId, input.opportunity_id);
        if (!opp) throw new BusinessRuleError('Oportunidade vinculada não encontrada neste workspace.');
      }

      const [inserted] = await db
        .insert(schema.roadmapItems)
        .values({
          workspaceId,
          title: input.title,
          description: input.description,
          timeframe: input.timeframe || 'now',
          status: input.status || 'planned',
          priority: input.priority || 'medium',
          targetQuarter: input.target_quarter,
          decisionId: input.decision_id || null,
          opportunityId: input.opportunity_id || null,
          metricsTarget: input.metrics_target,
          progress: input.progress ?? 0,
          ownerName: input.owner_name,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        title: inserted.title,
        description: inserted.description || undefined,
        timeframe: inserted.timeframe as any,
        status: inserted.status as any,
        priority: inserted.priority as any,
        target_quarter: inserted.targetQuarter || undefined,
        decision_id: inserted.decisionId || undefined,
        opportunity_id: inserted.opportunityId || undefined,
        metrics_target: inserted.metricsTarget || undefined,
        progress: inserted.progress,
        owner_name: inserted.ownerName || undefined,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createRoadmapItem error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar item do roadmap');
    }
  }

  async updateRoadmapItem(workspaceId: string, id: string, input: UpdateRoadmapItemInput): Promise<RoadmapItem> {
    try {
      const existing = await this.getRoadmapItemById(workspaceId, id);
      if (!existing) throw new BusinessRuleError('Item de roadmap não encontrado neste workspace.');

      if (input.decision_id) {
        const dec = await this.getDecisionById(workspaceId, input.decision_id);
        if (!dec) throw new BusinessRuleError('Decisão vinculada não encontrada neste workspace.');
      }
      if (input.opportunity_id) {
        const opp = await this.getOpportunityById(workspaceId, input.opportunity_id);
        if (!opp) throw new BusinessRuleError('Oportunidade vinculada não encontrada neste workspace.');
      }

      const updateFields: any = { updatedAt: new Date() };
      if (input.title !== undefined) updateFields.title = input.title;
      if (input.description !== undefined) updateFields.description = input.description;
      if (input.timeframe !== undefined) updateFields.timeframe = input.timeframe;
      if (input.status !== undefined) updateFields.status = input.status;
      if (input.priority !== undefined) updateFields.priority = input.priority;
      if (input.target_quarter !== undefined) updateFields.targetQuarter = input.target_quarter;
      if (input.decision_id !== undefined) updateFields.decisionId = input.decision_id || null;
      if (input.opportunity_id !== undefined) updateFields.opportunityId = input.opportunity_id || null;
      if (input.metrics_target !== undefined) updateFields.metricsTarget = input.metrics_target;
      if (input.progress !== undefined) updateFields.progress = input.progress;
      if (input.owner_name !== undefined) updateFields.ownerName = input.owner_name;

      const [updated] = await db
        .update(schema.roadmapItems)
        .set(updateFields)
        .where(and(eq(schema.roadmapItems.id, id), eq(schema.roadmapItems.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        title: updated.title,
        description: updated.description || undefined,
        timeframe: updated.timeframe as any,
        status: updated.status as any,
        priority: updated.priority as any,
        target_quarter: updated.targetQuarter || undefined,
        decision_id: updated.decisionId || undefined,
        opportunity_id: updated.opportunityId || undefined,
        metrics_target: updated.metricsTarget || undefined,
        progress: updated.progress,
        owner_name: updated.ownerName || undefined,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateRoadmapItem error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar item de roadmap');
    }
  }

  async deleteRoadmapItem(workspaceId: string, id: string): Promise<void> {
    try {
      const existing = await this.getRoadmapItemById(workspaceId, id);
      if (!existing) throw new BusinessRuleError('Item de roadmap não encontrado neste workspace.');

      await db
        .delete(schema.roadmapItems)
        .where(and(eq(schema.roadmapItems.id, id), eq(schema.roadmapItems.workspaceId, workspaceId)));
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres deleteRoadmapItem error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir item de roadmap');
    }
  }

  async getRoadmapItemLineage(workspaceId: string, id: string): Promise<RoadmapLineage> {
    try {
      const item = await this.getRoadmapItemById(workspaceId, id);
      if (!item) throw new BusinessRuleError('Item do roadmap não encontrado.');

      let decision: Decision | undefined;
      let experiment: Experiment | undefined;
      let hypothesis: Hypothesis | undefined;
      let opportunity: Opportunity | undefined;
      let problems: Problem[] = [];
      let evidences: Evidence[] = [];
      let researches: Research[] = [];

      if (item.decision_id) {
        decision = (await this.getDecisionById(workspaceId, item.decision_id)) || undefined;
        if (decision) {
          experiment = (await this.getExperimentById(workspaceId, decision.experiment_id)) || undefined;
          if (experiment) {
            hypothesis = (await this.getHypothesisById(workspaceId, experiment.hypothesis_id)) || undefined;
            if (hypothesis?.opportunity_id) {
              opportunity = (await this.getOpportunityById(workspaceId, hypothesis.opportunity_id)) || undefined;
            }
          }
        }
      } else if (item.opportunity_id) {
        opportunity = (await this.getOpportunityById(workspaceId, item.opportunity_id)) || undefined;
      }

      if (opportunity) {
        const pIds = opportunity.problem_ids || (opportunity.problem_id ? [opportunity.problem_id] : []);
        if (pIds.length > 0) {
          for (const pId of pIds) {
            const prob = await this.getProblemById(workspaceId, pId);
            if (prob) problems.push(prob);
          }
        }
      }

      const evIds = new Set<string>();
      for (const p of problems) {
        (p.evidence_ids || []).forEach((eId: string) => evIds.add(eId));
      }

      if (evIds.size > 0) {
        for (const eId of Array.from(evIds)) {
          const ev = await this.getEvidenceById(workspaceId, eId);
          if (ev) evidences.push(ev);
        }
      }

      const resIds = new Set<string>();
      for (const e of evidences) {
        if (e.research_id) resIds.add(e.research_id);
      }

      if (resIds.size > 0) {
        for (const rId of Array.from(resIds)) {
          const res = await this.getResearchById(workspaceId, rId);
          if (res) researches.push(res);
        }
      }

      return {
        roadmap_item: item,
        decision,
        experiment,
        hypothesis,
        opportunity,
        problems,
        evidences,
        researches,
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres getRoadmapItemLineage error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao obter linhagem estratégica');
    }
  }

  // ==========================================
  // 8. OBJECTIVES & KEY RESULTS (OKRs)
  // ==========================================
  async listObjectives(workspaceId: string): Promise<Objective[]> {
    try {
      const rows = await db
        .select()
        .from(schema.objectives)
        .where(eq(schema.objectives.workspaceId, workspaceId))
        .orderBy(desc(schema.objectives.createdAt));

      const krs = await db
        .select()
        .from(schema.keyResults)
        .where(eq(schema.keyResults.workspaceId, workspaceId));

      return rows.map((obj) => {
        const objKrs = krs.filter((k) => k.objectiveId === obj.id);
        const avgProgress = objKrs.length > 0
          ? Math.round(objKrs.reduce((acc, k) => acc + k.progress, 0) / objKrs.length)
          : obj.progress;

        return {
          id: obj.id,
          workspace_id: obj.workspaceId,
          title: obj.title,
          description: obj.description || undefined,
          timeframe: obj.timeframe,
          status: obj.status as any,
          progress: avgProgress,
          owner_name: obj.ownerName || undefined,
          created_at: obj.createdAt.toISOString(),
          updated_at: obj.updatedAt.toISOString(),
          key_results: objKrs.map((k) => ({
            id: k.id,
            workspace_id: k.workspaceId,
            objective_id: k.objectiveId,
            title: k.title,
            metric_name: k.metricName,
            initial_value: k.initialValue,
            target_value: k.targetValue,
            current_value: k.currentValue,
            unit: k.unit,
            progress: k.progress,
            status: k.status as any,
            created_at: k.createdAt.toISOString(),
            updated_at: k.updatedAt.toISOString(),
          })),
        };
      });
    } catch (err) {
      console.error('Postgres listObjectives error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar objetivos');
    }
  }

  async getObjectiveById(workspaceId: string, objectiveId: string): Promise<Objective | null> {
    try {
      const rows = await db
        .select()
        .from(schema.objectives)
        .where(and(eq(schema.objectives.id, objectiveId), eq(schema.objectives.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const obj = rows[0];

      const krs = await db
        .select()
        .from(schema.keyResults)
        .where(and(eq(schema.keyResults.objectiveId, objectiveId), eq(schema.keyResults.workspaceId, workspaceId)));

      return {
        id: obj.id,
        workspace_id: obj.workspaceId,
        title: obj.title,
        description: obj.description || undefined,
        timeframe: obj.timeframe,
        status: obj.status as any,
        progress: obj.progress,
        owner_name: obj.ownerName || undefined,
        created_at: obj.createdAt.toISOString(),
        updated_at: obj.updatedAt.toISOString(),
        key_results: krs.map((k) => ({
          id: k.id,
          workspace_id: k.workspaceId,
          objective_id: k.objectiveId,
          title: k.title,
          metric_name: k.metricName,
          initial_value: k.initialValue,
          target_value: k.targetValue,
          current_value: k.currentValue,
          unit: k.unit,
          progress: k.progress,
          status: k.status as any,
          created_at: k.createdAt.toISOString(),
          updated_at: k.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.error('Postgres getObjectiveById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar objetivo');
    }
  }

  async createObjective(workspaceId: string, input: CreateObjectiveInput): Promise<Objective> {
    try {
      const [inserted] = await db
        .insert(schema.objectives)
        .values({
          workspaceId,
          title: input.title,
          description: input.description,
          timeframe: input.timeframe || 'Q1-2026',
          status: input.status || 'active',
          progress: input.progress ?? 0,
          ownerName: input.owner_name,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        title: inserted.title,
        description: inserted.description || undefined,
        timeframe: inserted.timeframe,
        status: inserted.status as any,
        progress: inserted.progress,
        owner_name: inserted.ownerName || undefined,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
        key_results: [],
      };
    } catch (err) {
      console.error('Postgres createObjective error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar objetivo');
    }
  }

  async updateObjective(workspaceId: string, objectiveId: string, input: UpdateObjectiveInput): Promise<Objective> {
    try {
      const existing = await this.getObjectiveById(workspaceId, objectiveId);
      if (!existing) throw new BusinessRuleError('Objetivo não encontrado neste workspace.');

      const updateFields: any = { updatedAt: new Date() };
      if (input.title !== undefined) updateFields.title = input.title;
      if (input.description !== undefined) updateFields.description = input.description;
      if (input.timeframe !== undefined) updateFields.timeframe = input.timeframe;
      if (input.status !== undefined) updateFields.status = input.status;
      if (input.progress !== undefined) updateFields.progress = input.progress;
      if (input.owner_name !== undefined) updateFields.ownerName = input.owner_name;

      const [updated] = await db
        .update(schema.objectives)
        .set(updateFields)
        .where(and(eq(schema.objectives.id, objectiveId), eq(schema.objectives.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        title: updated.title,
        description: updated.description || undefined,
        timeframe: updated.timeframe,
        status: updated.status as any,
        progress: updated.progress,
        owner_name: updated.ownerName || undefined,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
        key_results: existing.key_results,
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateObjective error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar objetivo');
    }
  }

  async deleteObjective(workspaceId: string, objectiveId: string): Promise<void> {
    try {
      const existing = await this.getObjectiveById(workspaceId, objectiveId);
      if (!existing) throw new BusinessRuleError('Objetivo não encontrado.');

      await db
        .delete(schema.objectives)
        .where(and(eq(schema.objectives.id, objectiveId), eq(schema.objectives.workspaceId, workspaceId)));
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres deleteObjective error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir objetivo');
    }
  }

  async listKeyResults(workspaceId: string, objectiveId?: string): Promise<KeyResult[]> {
    try {
      const conditions = [eq(schema.keyResults.workspaceId, workspaceId)];
      if (objectiveId) conditions.push(eq(schema.keyResults.objectiveId, objectiveId));

      const rows = await db
        .select()
        .from(schema.keyResults)
        .where(and(...conditions))
        .orderBy(desc(schema.keyResults.createdAt));

      return rows.map((k) => ({
        id: k.id,
        workspace_id: k.workspaceId,
        objective_id: k.objectiveId,
        title: k.title,
        metric_name: k.metricName,
        initial_value: k.initialValue,
        target_value: k.targetValue,
        current_value: k.currentValue,
        unit: k.unit,
        progress: k.progress,
        status: k.status as any,
        created_at: k.createdAt.toISOString(),
        updated_at: k.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listKeyResults error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar Key Results');
    }
  }

  async createKeyResult(workspaceId: string, input: CreateKeyResultInput): Promise<KeyResult> {
    try {
      const obj = await this.getObjectiveById(workspaceId, input.objective_id);
      if (!obj) throw new BusinessRuleError('Objetivo pai não encontrado neste workspace.');

      const initVal = input.initial_value ?? 0;
      const curVal = input.current_value ?? initVal;
      const targetVal = input.target_value;
      const range = targetVal - initVal;
      const progress = range !== 0 ? Math.max(0, Math.min(100, Math.round(((curVal - initVal) / range) * 100))) : 0;

      const [inserted] = await db
        .insert(schema.keyResults)
        .values({
          workspaceId,
          objectiveId: input.objective_id,
          title: input.title,
          metricName: input.metric_name,
          initialValue: initVal,
          targetValue: targetVal,
          currentValue: curVal,
          unit: input.unit || '%',
          progress,
          status: input.status || 'on_track',
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        objective_id: inserted.objectiveId,
        title: inserted.title,
        metric_name: inserted.metricName,
        initial_value: inserted.initialValue,
        target_value: inserted.targetValue,
        current_value: inserted.currentValue,
        unit: inserted.unit,
        progress: inserted.progress,
        status: inserted.status as any,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createKeyResult error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar Key Result');
    }
  }

  async updateKeyResult(workspaceId: string, krId: string, input: UpdateKeyResultInput): Promise<KeyResult> {
    try {
      const rows = await db
        .select()
        .from(schema.keyResults)
        .where(and(eq(schema.keyResults.id, krId), eq(schema.keyResults.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) throw new BusinessRuleError('Key Result não encontrado neste workspace.');
      const existing = rows[0];

      const initVal = input.initial_value !== undefined ? input.initial_value : existing.initialValue;
      const targetVal = input.target_value !== undefined ? input.target_value : existing.targetValue;
      const curVal = input.current_value !== undefined ? input.current_value : existing.currentValue;

      const range = targetVal - initVal;
      const progress = range !== 0 ? Math.max(0, Math.min(100, Math.round(((curVal - initVal) / range) * 100))) : 0;

      const [updated] = await db
        .update(schema.keyResults)
        .set({
          title: input.title ?? existing.title,
          metricName: input.metric_name ?? existing.metricName,
          initialValue: initVal,
          targetValue: targetVal,
          currentValue: curVal,
          unit: input.unit ?? existing.unit,
          progress,
          status: input.status ?? existing.status,
          updatedAt: new Date(),
        })
        .where(and(eq(schema.keyResults.id, krId), eq(schema.keyResults.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        objective_id: updated.objectiveId,
        title: updated.title,
        metric_name: updated.metricName,
        initial_value: updated.initialValue,
        target_value: updated.targetValue,
        current_value: updated.currentValue,
        unit: updated.unit,
        progress: updated.progress,
        status: updated.status as any,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateKeyResult error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar Key Result');
    }
  }

  async deleteKeyResult(workspaceId: string, krId: string): Promise<void> {
    try {
      await db
        .delete(schema.keyResults)
        .where(and(eq(schema.keyResults.id, krId), eq(schema.keyResults.workspaceId, workspaceId)));
    } catch (err) {
      console.error('Postgres deleteKeyResult error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir Key Result');
    }
  }

  async linkOpportunityObjective(workspaceId: string, opportunityId: string, objectiveId: string, krId?: string): Promise<void> {
    try {
      const opp = await this.getOpportunityById(workspaceId, opportunityId);
      if (!opp) throw new BusinessRuleError('Oportunidade não encontrada.');
      const obj = await this.getObjectiveById(workspaceId, objectiveId);
      if (!obj) throw new BusinessRuleError('Objetivo não encontrado.');

      await db.insert(schema.opportunityObjectives).values({
        workspaceId,
        opportunityId,
        objectiveId,
        krId: krId || null,
      });
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres linkOpportunityObjective error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao vincular oportunidade ao objetivo');
    }
  }

  // ==========================================
  // 9. PRIORITIZATIONS (RICE, ICE, WSJF)
  // ==========================================
  async listPrioritizations(workspaceId: string): Promise<Prioritization[]> {
    try {
      const rows = await db
        .select()
        .from(schema.prioritizations)
        .where(eq(schema.prioritizations.workspaceId, workspaceId))
        .orderBy(desc(schema.prioritizations.createdAt));

      const oppIds = rows.map((r) => r.opportunityId);
      const opps = oppIds.length > 0
        ? await db.select().from(schema.opportunities).where(inArray(schema.opportunities.id, oppIds))
        : [];

      return rows.map((r) => {
        const opp = opps.find((o) => o.id === r.opportunityId);
        return {
          id: r.id,
          workspace_id: r.workspaceId,
          opportunity_id: r.opportunityId,
          framework: r.framework as any,
          reach: r.reach || undefined,
          impact: r.impact || undefined,
          confidence: r.confidence || undefined,
          effort: r.effort || undefined,
          ice_impact: r.iceImpact || undefined,
          ice_confidence: r.iceConfidence || undefined,
          ice_ease: r.iceEase || undefined,
          user_business_value: r.userBusinessValue || undefined,
          time_criticality: r.timeCriticality || undefined,
          risk_reduction: r.riskReduction || undefined,
          job_size: r.jobSize || undefined,
          score: r.score,
          notes: r.notes || undefined,
          evaluator_name: r.evaluatorName || undefined,
          created_at: r.createdAt.toISOString(),
          updated_at: r.updatedAt.toISOString(),
          opportunity_title: opp?.title,
        };
      });
    } catch (err) {
      console.error('Postgres listPrioritizations error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar priorizações');
    }
  }

  async createPrioritization(workspaceId: string, input: CreatePrioritizationInput): Promise<Prioritization> {
    try {
      const opp = await this.getOpportunityById(workspaceId, input.opportunity_id);
      if (!opp) throw new BusinessRuleError('Oportunidade não encontrada neste workspace.');

      let score = 0;
      if (input.framework === 'rice') {
        const r = input.reach || 100;
        const i = input.impact || 3;
        const c = (input.confidence || 80) / 100;
        const e = Math.max(1, input.effort || 3);
        score = Math.round((r * i * c) / e);
      } else if (input.framework === 'ice') {
        const i = input.ice_impact || 7;
        const c = input.ice_confidence || 7;
        const e = input.ice_ease || 7;
        score = Math.round((i * c * e) / 10);
      } else if (input.framework === 'wsjf') {
        const cov = (input.user_business_value || 5) + (input.time_criticality || 5) + (input.risk_reduction || 5);
        const js = Math.max(1, input.job_size || 3);
        score = Math.round((cov / js) * 10);
      }

      const [inserted] = await db
        .insert(schema.prioritizations)
        .values({
          workspaceId,
          opportunityId: input.opportunity_id,
          framework: input.framework,
          reach: input.reach,
          impact: input.impact,
          confidence: input.confidence,
          effort: input.effort,
          iceImpact: input.ice_impact,
          iceConfidence: input.ice_confidence,
          iceEase: input.ice_ease,
          userBusinessValue: input.user_business_value,
          timeCriticality: input.time_criticality,
          riskReduction: input.risk_reduction,
          jobSize: input.job_size,
          score,
          notes: input.notes,
          evaluatorName: input.evaluator_name,
        })
        .returning();

      // Update opportunity score
      await db
        .update(schema.opportunities)
        .set({ score })
        .where(and(eq(schema.opportunities.id, input.opportunity_id), eq(schema.opportunities.workspaceId, workspaceId)));

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        opportunity_id: inserted.opportunityId,
        framework: inserted.framework as any,
        reach: inserted.reach || undefined,
        impact: inserted.impact || undefined,
        confidence: inserted.confidence || undefined,
        effort: inserted.effort || undefined,
        ice_impact: inserted.iceImpact || undefined,
        ice_confidence: inserted.iceConfidence || undefined,
        ice_ease: inserted.iceEase || undefined,
        user_business_value: inserted.userBusinessValue || undefined,
        time_criticality: inserted.timeCriticality || undefined,
        risk_reduction: inserted.riskReduction || undefined,
        job_size: inserted.jobSize || undefined,
        score: inserted.score,
        notes: inserted.notes || undefined,
        evaluator_name: inserted.evaluatorName || undefined,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
        opportunity_title: opp.title,
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createPrioritization error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao salvar priorização');
    }
  }

  async deletePrioritization(workspaceId: string, prioId: string): Promise<void> {
    try {
      await db
        .delete(schema.prioritizations)
        .where(and(eq(schema.prioritizations.id, prioId), eq(schema.prioritizations.workspaceId, workspaceId)));
    } catch (err) {
      console.error('Postgres deletePrioritization error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir priorização');
    }
  }

  // ==========================================
  // 10. PERSONAS & CUSTOMER SEGMENTS
  // ==========================================
  async listPersonas(workspaceId: string): Promise<Persona[]> {
    try {
      const rows = await db
        .select()
        .from(schema.personas)
        .where(eq(schema.personas.workspaceId, workspaceId))
        .orderBy(desc(schema.personas.createdAt));

      return rows.map((p) => ({
        id: p.id,
        workspace_id: p.workspaceId,
        name: p.name,
        role_title: p.roleTitle,
        segment: p.segment || undefined,
        description: p.description || undefined,
        jobs_to_be_done: (p.jobsToBeDone as string[]) || [],
        pains: (p.pains as string[]) || [],
        goals: (p.goals as string[]) || [],
        behaviors: (p.behaviors as string[]) || [],
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listPersonas error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar personas');
    }
  }

  async getPersonaById(workspaceId: string, personaId: string): Promise<Persona | null> {
    try {
      const rows = await db
        .select()
        .from(schema.personas)
        .where(and(eq(schema.personas.id, personaId), eq(schema.personas.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;

      const p = rows[0];
      return {
        id: p.id,
        workspace_id: p.workspaceId,
        name: p.name,
        role_title: p.roleTitle,
        segment: p.segment || undefined,
        description: p.description || undefined,
        jobs_to_be_done: (p.jobsToBeDone as string[]) || [],
        pains: (p.pains as string[]) || [],
        goals: (p.goals as string[]) || [],
        behaviors: (p.behaviors as string[]) || [],
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getPersonaById error:', err instanceof Error ? err.message : err);
      return null;
    }
  }

  async createPersona(workspaceId: string, input: CreatePersonaInput): Promise<Persona> {
    try {
      const [inserted] = await db
        .insert(schema.personas)
        .values({
          workspaceId,
          name: input.name,
          roleTitle: input.role_title || (input as any).role || 'N/A',
          segment: input.segment,
          description: input.description,
          jobsToBeDone: input.jobs_to_be_done || [],
          pains: input.pains || [],
          goals: input.goals || [],
          behaviors: input.behaviors || [],
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        name: inserted.name,
        role_title: inserted.roleTitle,
        segment: inserted.segment || undefined,
        description: inserted.description || undefined,
        jobs_to_be_done: (inserted.jobsToBeDone as string[]) || [],
        pains: (inserted.pains as string[]) || [],
        goals: (inserted.goals as string[]) || [],
        behaviors: (inserted.behaviors as string[]) || [],
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createPersona error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar persona');
    }
  }

  async deletePersona(workspaceId: string, personaId: string): Promise<void> {
    try {
      await db
        .delete(schema.personas)
        .where(and(eq(schema.personas.id, personaId), eq(schema.personas.workspaceId, workspaceId)));
    } catch (err) {
      console.error('Postgres deletePersona error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir persona');
    }
  }

  async listCustomerSegments(workspaceId: string): Promise<CustomerSegment[]> {
    try {
      const rows = await db
        .select()
        .from(schema.customerSegments)
        .where(eq(schema.customerSegments.workspaceId, workspaceId))
        .orderBy(desc(schema.customerSegments.createdAt));

      return rows.map((c) => ({
        id: c.id,
        workspace_id: c.workspaceId,
        name: c.name,
        type: c.type as any,
        description: c.description || undefined,
        criteria: (c.criteria as string[]) || [],
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listCustomerSegments error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar segmentos');
    }
  }

  async createCustomerSegment(workspaceId: string, input: CreateCustomerSegmentInput): Promise<CustomerSegment> {
    try {
      const [inserted] = await db
        .insert(schema.customerSegments)
        .values({
          workspaceId,
          name: input.name,
          type: input.type,
          description: input.description,
          criteria: input.criteria || [],
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        name: inserted.name,
        type: inserted.type as any,
        description: inserted.description || undefined,
        criteria: (inserted.criteria as string[]) || [],
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createCustomerSegment error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar segmento');
    }
  }

  async linkEntityPersona(
    workspaceId: string,
    personaId: string,
    entityType: 'research' | 'evidence' | 'problem' | 'opportunity' | 'hypothesis' | 'decision',
    entityId: string
  ): Promise<void> {
    try {
      const persona = await this.getPersonaById(workspaceId, personaId);
      if (!persona) throw new BusinessRuleError('Persona não encontrada neste workspace.');

      const belongs = await this.verifyEntityBelongsToWorkspace(workspaceId, entityType, entityId);
      if (!belongs) {
        throw new BusinessRuleError('A entidade referenciada não existe ou não pertence a este workspace.');
      }

      await db.insert(schema.entityPersonas).values({
        workspaceId,
        personaId,
        entityType,
        entityId,
      });
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres linkEntityPersona error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao associar persona à entidade');
    }
  }

  // ==========================================
  // 11. PRDs & USER STORIES
  // ==========================================
  async listPRDs(workspaceId: string): Promise<PRD[]> {
    try {
      const rows = await db
        .select()
        .from(schema.prds)
        .where(eq(schema.prds.workspaceId, workspaceId))
        .orderBy(desc(schema.prds.createdAt));

      const roadIds = rows.map((r) => r.roadmapItemId).filter(Boolean) as string[];
      const roadmaps = roadIds.length > 0
        ? await db.select().from(schema.roadmapItems).where(inArray(schema.roadmapItems.id, roadIds))
        : [];

      return rows.map((r) => {
        const road = roadmaps.find((rm) => rm.id === r.roadmapItemId);
        return {
          id: r.id,
          workspace_id: r.workspaceId,
          roadmap_item_id: r.roadmapItemId || undefined,
          title: r.title,
          summary: r.summary || undefined,
          problem_statement: r.problemStatement || undefined,
          goals: (r.goals as string[]) || [],
          non_goals: (r.nonGoals as string[]) || [],
          user_stories: (r.userStories as any[]) || [],
          technical_notes: r.technicalNotes || undefined,
          dependencies: (r.dependencies as string[]) || [],
          definition_of_done: (r.definitionOfDone as string[]) || [],
          status: r.status as any,
          version: r.version,
          created_at: r.createdAt.toISOString(),
          updated_at: r.updatedAt.toISOString(),
          roadmap_title: road?.title,
        };
      });
    } catch (err) {
      console.error('Postgres listPRDs error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar PRDs');
    }
  }

  async getPRDById(workspaceId: string, prdId: string): Promise<PRD | null> {
    try {
      const rows = await db
        .select()
        .from(schema.prds)
        .where(and(eq(schema.prds.id, prdId), eq(schema.prds.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];

      let roadTitle: string | undefined;
      if (r.roadmapItemId) {
        const road = await this.getRoadmapItemById(workspaceId, r.roadmapItemId);
        roadTitle = road?.title;
      }

      return {
        id: r.id,
        workspace_id: r.workspaceId,
        roadmap_item_id: r.roadmapItemId || undefined,
        title: r.title,
        summary: r.summary || undefined,
        problem_statement: r.problemStatement || undefined,
        goals: (r.goals as string[]) || [],
        non_goals: (r.nonGoals as string[]) || [],
        user_stories: (r.userStories as any[]) || [],
        technical_notes: r.technicalNotes || undefined,
        dependencies: (r.dependencies as string[]) || [],
        definition_of_done: (r.definitionOfDone as string[]) || [],
        status: r.status as any,
        version: r.version,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
        roadmap_title: roadTitle,
      };
    } catch (err) {
      console.error('Postgres getPRDById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar PRD');
    }
  }

  async createPRD(workspaceId: string, input: CreatePRDInput): Promise<PRD> {
    try {
      if (input.roadmap_item_id) {
        const item = await this.getRoadmapItemById(workspaceId, input.roadmap_item_id);
        if (!item) throw new BusinessRuleError('Item do roadmap vinculado não encontrado neste workspace.');
      }

      const [inserted] = await db
        .insert(schema.prds)
        .values({
          workspaceId,
          roadmapItemId: input.roadmap_item_id || null,
          title: input.title,
          summary: input.summary,
          problemStatement: input.problem_statement,
          goals: input.goals || [],
          nonGoals: input.non_goals || [],
          userStories: input.user_stories || [],
          technicalNotes: input.technical_notes,
          dependencies: input.dependencies || [],
          definitionOfDone: input.definition_of_done || [],
          status: input.status || 'draft',
          version: 1,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        roadmap_item_id: inserted.roadmapItemId || undefined,
        title: inserted.title,
        summary: inserted.summary || undefined,
        problem_statement: inserted.problemStatement || undefined,
        goals: (inserted.goals as string[]) || [],
        non_goals: (inserted.nonGoals as string[]) || [],
        user_stories: (inserted.userStories as any[]) || [],
        technical_notes: inserted.technicalNotes || undefined,
        dependencies: (inserted.dependencies as string[]) || [],
        definition_of_done: (inserted.definitionOfDone as string[]) || [],
        status: inserted.status as any,
        version: inserted.version,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres createPRD error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar PRD');
    }
  }

  async updatePRD(workspaceId: string, prdId: string, input: UpdatePRDInput): Promise<PRD> {
    try {
      const existing = await this.getPRDById(workspaceId, prdId);
      if (!existing) throw new BusinessRuleError('PRD não encontrado neste workspace.');

      const updateFields: any = { updatedAt: new Date() };
      if (input.title !== undefined) updateFields.title = input.title;
      if (input.summary !== undefined) updateFields.summary = input.summary;
      if (input.problem_statement !== undefined) updateFields.problemStatement = input.problem_statement;
      if (input.goals !== undefined) updateFields.goals = input.goals;
      if (input.non_goals !== undefined) updateFields.nonGoals = input.non_goals;
      if (input.user_stories !== undefined) updateFields.userStories = input.user_stories;
      if (input.technical_notes !== undefined) updateFields.technicalNotes = input.technical_notes;
      if (input.dependencies !== undefined) updateFields.dependencies = input.dependencies;
      if (input.definition_of_done !== undefined) updateFields.definitionOfDone = input.definition_of_done;
      if (input.status !== undefined) updateFields.status = input.status;
      if (input.version !== undefined) updateFields.version = input.version;

      const [updated] = await db
        .update(schema.prds)
        .set(updateFields)
        .where(and(eq(schema.prds.id, prdId), eq(schema.prds.workspaceId, workspaceId)))
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        roadmap_item_id: updated.roadmapItemId || undefined,
        title: updated.title,
        summary: updated.summary || undefined,
        problem_statement: updated.problemStatement || undefined,
        goals: (updated.goals as string[]) || [],
        non_goals: (updated.nonGoals as string[]) || [],
        user_stories: (updated.userStories as any[]) || [],
        technical_notes: updated.technicalNotes || undefined,
        dependencies: (updated.dependencies as string[]) || [],
        definition_of_done: (updated.definitionOfDone as string[]) || [],
        status: updated.status as any,
        version: updated.version,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updatePRD error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar PRD');
    }
  }

  async deletePRD(workspaceId: string, prdId: string): Promise<void> {
    try {
      await db
        .delete(schema.prds)
        .where(and(eq(schema.prds.id, prdId), eq(schema.prds.workspaceId, workspaceId)));
    } catch (err) {
      console.error('Postgres deletePRD error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir PRD');
    }
  }

  // ==========================================
  // 12. OUTCOME TRACKING & POST-LAUNCH REVIEWS
  // ==========================================
  async listOutcomeReviews(workspaceId: string): Promise<OutcomeReview[]> {
    try {
      const rows = await db
        .select()
        .from(schema.outcomeReviews)
        .where(eq(schema.outcomeReviews.workspaceId, workspaceId))
        .orderBy(desc(schema.outcomeReviews.createdAt));

      const roadIds = rows.map((r) => r.roadmapItemId).filter(Boolean) as string[];
      const roadmaps = roadIds.length > 0
        ? await db.select().from(schema.roadmapItems).where(inArray(schema.roadmapItems.id, roadIds))
        : [];

      return rows.map((r) => {
        const road = roadmaps.find((rm) => rm.id === r.roadmapItemId);
        return {
          id: r.id,
          workspace_id: r.workspaceId,
          roadmap_item_id: r.roadmapItemId || undefined,
          prd_id: r.prdId || undefined,
          title: r.title,
          metric_name: r.metricName,
          baseline_value: r.baselineValue,
          target_value: r.targetValue,
          actual_value: r.actualValue,
          timeframe_days: r.timeframeDays,
          status: r.status as any,
          what_we_expected: r.whatWeExpected || undefined,
          what_happened: r.whatHappened || undefined,
          what_we_learned: r.whatWeLearned || undefined,
          next_actions: r.nextActions || undefined,
          refeed_to_discovery: Boolean(r.refeedToDiscovery),
          new_problem_id: r.newProblemId || undefined,
          reviewed_at: r.reviewedAt.toISOString(),
          created_at: r.createdAt.toISOString(),
          updated_at: r.updatedAt.toISOString(),
          roadmap_title: road?.title,
        };
      });
    } catch (err) {
      console.error('Postgres listOutcomeReviews error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar avaliações de impacto');
    }
  }

  async createOutcomeReview(workspaceId: string, input: CreateOutcomeReviewInput): Promise<OutcomeReview> {
    try {
      if (input.roadmap_item_id) {
        const item = await this.getRoadmapItemById(workspaceId, input.roadmap_item_id);
        if (!item) throw new BusinessRuleError('Item do roadmap vinculado não encontrado neste workspace.');
      }
      if (input.prd_id) {
        const prd = await this.getPRDById(workspaceId, input.prd_id);
        if (!prd) throw new BusinessRuleError('PRD vinculado não encontrado neste workspace.');
      }

      let newProblemId: string | null = null;
      if (input.refeed_to_discovery) {
        const prob = await this.createProblem(workspaceId, {
          title: `Gap Pós-Lançamento: ${input.title}`,
          description: `Identificado durante revisão de impacto da métrica "${input.metric_name}". Aprendizado: ${input.what_we_learned || input.what_happened || 'Métrica abaixo do target.'}`,
          impact: 'high',
          frequency: 'frequent',
        });
        newProblemId = prob.id;
      }

      const [inserted] = await db
        .insert(schema.outcomeReviews)
        .values({
          workspaceId,
          roadmapItemId: input.roadmap_item_id || null,
          prdId: input.prd_id || null,
          title: input.title,
          metricName: input.metric_name,
          baselineValue: input.baseline_value,
          targetValue: input.target_value,
          actualValue: input.actual_value,
          timeframeDays: input.timeframe_days || 30,
          status: input.status || 'on_target',
          whatWeExpected: input.what_we_expected,
          whatHappened: input.what_happened,
          whatWeLearned: input.what_we_learned,
          nextActions: input.next_actions,
          refeedToDiscovery: input.refeed_to_discovery ? 1 : 0,
          newProblemId,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        roadmap_item_id: inserted.roadmapItemId || undefined,
        prd_id: inserted.prdId || undefined,
        title: inserted.title,
        metric_name: inserted.metricName,
        baseline_value: inserted.baselineValue,
        target_value: inserted.targetValue,
        actual_value: inserted.actualValue,
        timeframe_days: inserted.timeframeDays,
        status: inserted.status as any,
        what_we_expected: inserted.whatWeExpected || undefined,
        what_happened: inserted.whatHappened || undefined,
        what_we_learned: inserted.whatWeLearned || undefined,
        next_actions: inserted.nextActions || undefined,
        refeed_to_discovery: Boolean(inserted.refeedToDiscovery),
        new_problem_id: inserted.newProblemId || undefined,
        reviewed_at: inserted.reviewedAt.toISOString(),
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createOutcomeReview error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar avaliação de impacto');
    }
  }

  async deleteOutcomeReview(workspaceId: string, reviewId: string): Promise<void> {
    try {
      await db
        .delete(schema.outcomeReviews)
        .where(and(eq(schema.outcomeReviews.id, reviewId), eq(schema.outcomeReviews.workspaceId, workspaceId)));
    } catch (err) {
      console.error('Postgres deleteOutcomeReview error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir avaliação de impacto');
    }
  }

  // ==========================================
  // 13. COLLABORATION & ACTIVITY LOGS
  // ==========================================
  async listComments(workspaceId: string, entityType?: string, entityId?: string): Promise<Comment[]> {
    try {
      const conditions = [eq(schema.comments.workspaceId, workspaceId)];
      if (entityType) conditions.push(eq(schema.comments.entityType, entityType));
      if (entityId) conditions.push(eq(schema.comments.entityId, entityId));

      const rows = await db
        .select()
        .from(schema.comments)
        .where(and(...conditions))
        .orderBy(desc(schema.comments.createdAt));

      return rows.map((c) => ({
        id: c.id,
        workspace_id: c.workspaceId,
        entity_type: c.entityType,
        entity_id: c.entityId,
        author_id: c.authorId,
        author_name: c.authorName,
        author_email: c.authorEmail,
        content: c.content,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listComments error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar comentários');
    }
  }

  async createComment(
    workspaceId: string,
    author: { uid: string; name?: string; email: string },
    input: CreateCommentInput
  ): Promise<Comment> {
    try {
      const [inserted] = await db
        .insert(schema.comments)
        .values({
          workspaceId,
          entityType: input.entity_type,
          entityId: input.entity_id,
          authorId: author.uid,
          authorName: author.name || author.email.split('@')[0],
          authorEmail: author.email,
          content: input.content,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        entity_type: inserted.entityType,
        entity_id: inserted.entityId,
        author_id: inserted.authorId,
        author_name: inserted.authorName,
        author_email: inserted.authorEmail,
        content: inserted.content,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createComment error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar comentário');
    }
  }

  async listActivityLogs(workspaceId: string, limit: number = 50): Promise<ActivityLog[]> {
    try {
      const rows = await db
        .select()
        .from(schema.activityLogs)
        .where(eq(schema.activityLogs.workspaceId, workspaceId))
        .orderBy(desc(schema.activityLogs.createdAt))
        .limit(limit);

      return rows.map((a) => ({
        id: a.id,
        workspace_id: a.workspaceId,
        entity_type: a.entityType,
        entity_id: a.entityId,
        action: a.action,
        actor_id: a.actorId,
        actor_name: a.actorName,
        actor_email: a.actorEmail,
        details: (a.details as Record<string, any>) || undefined,
        created_at: a.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listActivityLogs error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar atividades');
    }
  }

  async logActivity(
    workspaceId: string,
    params: {
      entity_type: string;
      entity_id: string;
      action: string;
      actor: { uid: string; name?: string; email: string };
      details?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      if (params.entity_type && params.entity_id) {
        const belongs = await this.verifyEntityBelongsToWorkspace(workspaceId, params.entity_type, params.entity_id);
        if (!belongs && params.entity_type !== 'workspace' && params.entity_type !== 'workspace_member') {
          throw new BusinessRuleError('A entidade referenciada não existe ou não pertence a este workspace.');
        }
      }

      await db.insert(schema.activityLogs).values({
        workspaceId,
        entityType: params.entity_type,
        entityId: params.entity_id,
        action: params.action,
        actorId: params.actor.uid,
        actorName: params.actor.name || params.actor.email.split('@')[0],
        actorEmail: params.actor.email,
        details: params.details || null,
      });
    } catch (err) {
      console.error('Postgres logActivity error:', err instanceof Error ? err.message : err);
    }
  }

  // ==========================================
  // 14. TOOLKIT CANVASES
  // ==========================================
  async listToolkitCanvases(workspaceId: string, toolKey?: string): Promise<ToolkitCanvas[]> {
    try {
      const conditions = [eq(schema.toolkitCanvases.workspaceId, workspaceId)];
      if (toolKey) conditions.push(eq(schema.toolkitCanvases.toolKey, toolKey));

      const rows = await db
        .select()
        .from(schema.toolkitCanvases)
        .where(and(...conditions))
        .orderBy(desc(schema.toolkitCanvases.updatedAt));

      return rows.map((c) => ({
        id: c.id,
        workspace_id: c.workspaceId,
        tool_key: c.toolKey,
        title: c.title,
        entity_type: c.entityType || undefined,
        entity_id: c.entityId || undefined,
        canvas_data: c.canvasData as Record<string, any>,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listToolkitCanvases error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar canvases');
    }
  }

  async getToolkitCanvasById(workspaceId: string, id: string): Promise<ToolkitCanvas | null> {
    try {
      const rows = await db
        .select()
        .from(schema.toolkitCanvases)
        .where(and(eq(schema.toolkitCanvases.id, id), eq(schema.toolkitCanvases.workspaceId, workspaceId)))
        .limit(1);

      if (rows.length === 0) return null;
      const c = rows[0];
      return {
        id: c.id,
        workspace_id: c.workspaceId,
        tool_key: c.toolKey,
        title: c.title,
        entity_type: c.entityType || undefined,
        entity_id: c.entityId || undefined,
        canvas_data: c.canvasData as Record<string, any>,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getToolkitCanvasById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar canvas');
    }
  }

  async getToolkitCanvasByKey(workspaceId: string, toolKey: string, entityId?: string): Promise<ToolkitCanvas | null> {
    try {
      const conditions = [
        eq(schema.toolkitCanvases.workspaceId, workspaceId),
        eq(schema.toolkitCanvases.toolKey, toolKey),
      ];
      if (entityId) conditions.push(eq(schema.toolkitCanvases.entityId, entityId));

      const rows = await db
        .select()
        .from(schema.toolkitCanvases)
        .where(and(...conditions))
        .orderBy(desc(schema.toolkitCanvases.updatedAt))
        .limit(1);

      if (rows.length === 0) return null;
      const c = rows[0];
      return {
        id: c.id,
        workspace_id: c.workspaceId,
        tool_key: c.toolKey,
        title: c.title,
        entity_type: c.entityType || undefined,
        entity_id: c.entityId || undefined,
        canvas_data: c.canvasData as Record<string, any>,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getToolkitCanvasByKey error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar canvas por chave');
    }
  }

  async verifyEntityBelongsToWorkspace(workspaceId: string, entityType: string, entityId: string): Promise<boolean> {
    try {
      let table: any;
      switch (entityType) {
        case 'research': table = schema.researches; break;
        case 'evidence': table = schema.evidences; break;
        case 'problem': table = schema.problems; break;
        case 'opportunity': table = schema.opportunities; break;
        case 'hypothesis': table = schema.hypotheses; break;
        case 'experiment': table = schema.experiments; break;
        case 'decision': table = schema.decisions; break;
        case 'roadmap_item': table = schema.roadmapItems; break;
        case 'prd': table = schema.prds; break;
        case 'outcome_review': table = schema.outcomeReviews; break;
        case 'objective': table = schema.objectives; break;
        case 'key_result': table = schema.keyResults; break;
        case 'persona': table = schema.personas; break;
        case 'customer_segment': table = schema.customerSegments; break;
        case 'prioritization': table = schema.prioritizations; break;
        default: return false;
      }
      
      const rows = await db.select({ id: table.id }).from(table).where(and(eq(table.id, entityId), eq(table.workspaceId, workspaceId))).limit(1);
      return rows.length > 0;
    } catch (err) {
      return false;
    }
  }

  async saveToolkitCanvas(workspaceId: string, input: CreateToolkitCanvasInput): Promise<ToolkitCanvas> {
    try {
      if (input.entity_type && input.entity_id) {
        const belongs = await this.verifyEntityBelongsToWorkspace(workspaceId, input.entity_type, input.entity_id);
        if (!belongs) {
          throw new BusinessRuleError('A entidade referenciada não existe ou não pertence a este workspace.');
        }
      }

      if (input.id) {
        const existing = await this.getToolkitCanvasById(workspaceId, input.id);
        if (existing) {
          const [updated] = await db
            .update(schema.toolkitCanvases)
            .set({
              title: input.title,
              entityType: input.entity_type || null,
              entityId: input.entity_id || null,
              canvasData: input.canvas_data,
              updatedAt: new Date(),
            })
            .where(and(eq(schema.toolkitCanvases.id, input.id), eq(schema.toolkitCanvases.workspaceId, workspaceId)))
            .returning();

          return {
            id: updated.id,
            workspace_id: updated.workspaceId,
            tool_key: updated.toolKey,
            title: updated.title,
            entity_type: updated.entityType || undefined,
            entity_id: updated.entityId || undefined,
            canvas_data: updated.canvasData as Record<string, any>,
            created_at: updated.createdAt.toISOString(),
            updated_at: updated.updatedAt.toISOString(),
          };
        }
      }

      const [inserted] = await db
        .insert(schema.toolkitCanvases)
        .values({
          id: input.id || randomUUID(),
          workspaceId,
          toolKey: input.tool_key,
          title: input.title,
          entityType: input.entity_type || null,
          entityId: input.entity_id || null,
          canvasData: input.canvas_data,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        tool_key: inserted.toolKey,
        title: inserted.title,
        entity_type: inserted.entityType || undefined,
        entity_id: inserted.entityId || undefined,
        canvas_data: inserted.canvasData as Record<string, any>,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres saveToolkitCanvas error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao salvar canvas');
    }
  }

  async deleteToolkitCanvas(workspaceId: string, id: string): Promise<boolean> {
    try {
      const res = await db
        .delete(schema.toolkitCanvases)
        .where(and(eq(schema.toolkitCanvases.id, id), eq(schema.toolkitCanvases.workspaceId, workspaceId)))
        .returning();

      return res.length > 0;
    } catch (err) {
      console.error('Postgres deleteToolkitCanvas error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir canvas');
    }
  }

  async duplicateToolkitCanvas(workspaceId: string, id: string): Promise<ToolkitCanvas | null> {
    try {
      const original = await this.getToolkitCanvasById(workspaceId, id);
      if (!original) return null;

      const [duplicated] = await db
        .insert(schema.toolkitCanvases)
        .values({
          workspaceId,
          toolKey: original.tool_key,
          title: `${original.title} (Cópia)`,
          entityType: original.entity_type || null,
          entityId: original.entity_id || null,
          canvasData: original.canvas_data,
        })
        .returning();

      return {
        id: duplicated.id,
        workspace_id: duplicated.workspaceId,
        tool_key: duplicated.toolKey,
        title: duplicated.title,
        entity_type: duplicated.entityType || undefined,
        entity_id: duplicated.entityId || undefined,
        canvas_data: duplicated.canvasData as Record<string, any>,
        created_at: duplicated.createdAt.toISOString(),
        updated_at: duplicated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres duplicateToolkitCanvas error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao duplicar canvas');
    }
  }

  // ==========================================
  // 15. EXECUTIVE DASHBOARD
  // ==========================================
  async getExecutiveDashboard(workspaceId: string): Promise<any> {
    try {
      const [
        objectives,
        roadmapItems,
        prioritizations,
        outcomeReviews,
        health,
        prds,
      ] = await Promise.all([
        this.listObjectives(workspaceId),
        this.listRoadmapItems(workspaceId),
        this.listPrioritizations(workspaceId),
        this.listOutcomeReviews(workspaceId),
        this.getDiscoveryHealth(workspaceId),
        this.listPRDs(workspaceId),
      ]);

      const activeObjectives = objectives.filter((o) => o.status === 'active');
      const roadmapNow = roadmapItems.filter((r) => r.timeframe === 'now');
      const roadmapDelivered = roadmapItems.filter((r) => r.status === 'delivered');
      const reviewsOnTarget = outcomeReviews.filter((r) => r.status === 'on_target' || r.status === 'exceeded');

      return {
        strategic_alignment: {
          total_objectives: objectives.length,
          active_objectives: activeObjectives.length,
          average_okr_progress: objectives.length > 0
            ? Math.round(objectives.reduce((acc, o) => acc + o.progress, 0) / objectives.length)
            : 0,
        },
        roadmap_velocity: {
          total_initiatives: roadmapItems.length,
          in_flight: roadmapNow.length,
          delivered: roadmapDelivered.length,
          delivery_rate_pct: roadmapItems.length > 0
            ? Math.round((roadmapDelivered.length / roadmapItems.length) * 100)
            : 0,
        },
        discovery_health: {
          score: health.health_score,
          validated_problems_ratio: health.funnel_conversion.problems_validated_ratio,
          experiments_decided_ratio: health.funnel_conversion.experiments_decided_ratio,
        },
        impact_validation: {
          total_reviews: outcomeReviews.length,
          success_rate_pct: outcomeReviews.length > 0
            ? Math.round((reviewsOnTarget.length / outcomeReviews.length) * 100)
            : 0,
        },
        delivery_specs: {
          total_prds: prds.length,
          approved_prds: prds.filter((p) => p.status === 'approved' || p.status === 'in_delivery').length,
        },
      };
    } catch (err) {
      console.error('Postgres getExecutiveDashboard error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao compilar dashboard executivo');
    }
  }
}
