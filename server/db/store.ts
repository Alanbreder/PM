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
} from '../types/index.js';
import { db } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { BusinessRuleError } from '../utils/errors.js';

class PostgresStore {
  // Users
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
      throw new Error('Falha ao registrar ou buscar usuário');
    }
  }

  // Workspaces
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

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    try {
      const rows = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, id)).limit(1);
      if (rows.length === 0) return null;
      const w = rows[0];
      return {
        id: w.id,
        name: w.name,
        slug: w.slug,
        description: w.description || undefined,
        role: 'member',
        created_at: w.createdAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getWorkspaceById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar workspace');
    }
  }

  async createWorkspace(name: string, userId: string, description?: string): Promise<Workspace> {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
      
      const [workspace] = await db
        .insert(schema.workspaces)
        .values({
          name,
          slug,
          description,
        })
        .returning();

      await db.insert(schema.workspaceMembers).values({
        workspaceId: workspace.id,
        userId,
        role: 'owner',
      });

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description || undefined,
        role: 'owner',
        created_at: workspace.createdAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createWorkspace error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar workspace');
    }
  }

  async getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
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
      const m = rows[0];
      return {
        id: m.id,
        workspace_id: m.workspaceId,
        user_id: m.userId,
        role: m.role as WorkspaceRole,
        created_at: m.createdAt.toISOString(),
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

      const [member] = await db
        .insert(schema.workspaceMembers)
        .values({
          workspaceId,
          userId,
          role,
        })
        .returning();

      return {
        id: member.id,
        workspace_id: member.workspaceId,
        user_id: member.userId,
        role: member.role as WorkspaceRole,
        created_at: member.createdAt.toISOString(),
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
      const member = await this.getWorkspaceMember(workspaceId, userId);
      if (!member) {
        throw new BusinessRuleError('Membro não encontrado no workspace.');
      }

      if (member.role === 'owner' && newRole !== 'owner') {
        const members = await this.listWorkspaceMembers(workspaceId);
        const ownerCount = members.filter((m) => m.role === 'owner').length;
        if (ownerCount <= 1) {
          throw new BusinessRuleError('Não é possível rebaixar o único proprietário do workspace.');
        }
      }

      const [updated] = await db
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
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateMemberRole error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar papel do membro');
    }
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    try {
      const member = await this.getWorkspaceMember(workspaceId, userId);
      if (!member) {
        throw new BusinessRuleError('Membro não encontrado no workspace.');
      }

      if (member.role === 'owner') {
        const members = await this.listWorkspaceMembers(workspaceId);
        const ownerCount = members.filter((m) => m.role === 'owner').length;
        if (ownerCount <= 1) {
          throw new BusinessRuleError('Não é possível remover o único proprietário do workspace.');
        }
      }

      await db
        .delete(schema.workspaceMembers)
        .where(
          and(
            eq(schema.workspaceMembers.workspaceId, workspaceId),
            eq(schema.workspaceMembers.userId, userId)
          )
        );
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres removeMember error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao remover membro do workspace');
    }
  }

  // Researches
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
        key_findings: (r.keyFindings as string[]) || undefined,
        suggested_problems: (r.suggestedProblems as any[]) || undefined,
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
        .where(
          and(
            eq(schema.researches.id, researchId),
            eq(schema.researches.workspaceId, workspaceId)
          )
        )
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
        key_findings: (r.keyFindings as string[]) || undefined,
        suggested_problems: (r.suggestedProblems as any[]) || undefined,
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
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        title: inserted.title,
        objective: inserted.objective || undefined,
        target_audience: inserted.targetAudience || undefined,
        raw_notes: inserted.rawNotes || undefined,
        analysis_status: inserted.analysisStatus as any,
        status: inserted.status as any,
        created_at: inserted.createdAt.toISOString(),
        updated_at: inserted.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createResearch error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar pesquisa');
    }
  }

  async updateResearch(workspaceId: string, researchId: string, data: Partial<Research>): Promise<Research> {
    try {
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
        .where(
          and(
            eq(schema.researches.id, researchId),
            eq(schema.researches.workspaceId, workspaceId)
          )
        )
        .returning();

      return {
        id: updated.id,
        workspace_id: updated.workspaceId,
        title: updated.title,
        objective: updated.objective || undefined,
        target_audience: updated.targetAudience || undefined,
        raw_notes: updated.rawNotes || undefined,
        key_findings: (updated.keyFindings as string[]) || undefined,
        suggested_problems: (updated.suggestedProblems as any[]) || undefined,
        analysis_status: updated.analysisStatus as any,
        status: updated.status as any,
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres updateResearch error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar pesquisa');
    }
  }

  // Evidences
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

      return rows.map((r) => ({
        id: r.id,
        workspace_id: r.workspaceId,
        research_id: r.researchId,
        content: r.content,
        source: r.source || undefined,
        impact_score: r.impactScore,
        tags: (r.tags as string[]) || undefined,
        created_at: r.createdAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listEvidences error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar evidências');
    }
  }

  async createEvidence(workspaceId: string, data: CreateEvidenceInput): Promise<Evidence> {
    try {
      const research = await this.getResearchById(workspaceId, data.research_id);
      if (!research) {
        throw new BusinessRuleError('Pesquisa não encontrada neste workspace.');
      }

      const [inserted] = await db
        .insert(schema.evidences)
        .values({
          workspaceId,
          researchId: data.research_id,
          content: data.content,
          source: data.source,
          impactScore: data.impact_score || 3,
          tags: data.tags,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        research_id: inserted.researchId,
        content: inserted.content,
        source: inserted.source || undefined,
        impact_score: inserted.impactScore,
        tags: (inserted.tags as string[]) || undefined,
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

  // Problems
  async listProblems(workspaceId: string): Promise<Problem[]> {
    try {
      const rows = await db
        .select()
        .from(schema.problems)
        .where(eq(schema.problems.workspaceId, workspaceId))
        .orderBy(desc(schema.problems.createdAt));

      return rows.map((r) => ({
        id: r.id,
        workspace_id: r.workspaceId,
        title: r.title,
        description: r.description,
        impact: r.impact as any,
        frequency: r.frequency as any,
        status: r.status as any,
        score: r.score || 0,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
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
        .where(
          and(
            eq(schema.problems.id, problemId),
            eq(schema.problems.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        workspace_id: r.workspaceId,
        title: r.title,
        description: r.description,
        impact: r.impact as any,
        frequency: r.frequency as any,
        status: r.status as any,
        score: r.score || 0,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getProblemById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar problema');
    }
  }

  async createProblem(workspaceId: string, data: CreateProblemInput): Promise<Problem> {
    try {
      if (data.evidence_ids && data.evidence_ids.length > 0) {
        const existingEvidences = await db
          .select()
          .from(schema.evidences)
          .where(
            and(
              eq(schema.evidences.workspaceId, workspaceId),
              inArray(schema.evidences.id, data.evidence_ids)
            )
          );

        if (existingEvidences.length !== data.evidence_ids.length) {
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
        })
        .returning();

      if (data.evidence_ids && data.evidence_ids.length > 0) {
        for (const evId of data.evidence_ids) {
          await db.insert(schema.problemEvidences).values({
            workspaceId,
            problemId: inserted.id,
            evidenceId: evId,
          });
        }
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
        .where(
          and(
            eq(schema.problems.id, problemId),
            eq(schema.problems.workspaceId, workspaceId)
          )
        )
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
    const problem = await this.getProblemById(workspaceId, problemId);
    if (!problem) throw new BusinessRuleError('Problema não encontrado neste workspace.');

    const evs = await db
      .select()
      .from(schema.evidences)
      .where(and(eq(schema.evidences.workspaceId, workspaceId), inArray(schema.evidences.id, evidenceIds)));

    if (evs.length !== evidenceIds.length) {
      throw new BusinessRuleError('Evidências inválidas ou pertencentes a outro workspace.');
    }

    for (const evId of evidenceIds) {
      await db
        .insert(schema.problemEvidences)
        .values({
          workspaceId,
          problemId,
          evidenceId: evId,
        })
        .onConflictDoNothing();
    }
  }

  // Opportunities
  async listOpportunities(workspaceId: string): Promise<Opportunity[]> {
    try {
      const rows = await db
        .select()
        .from(schema.opportunities)
        .where(eq(schema.opportunities.workspaceId, workspaceId))
        .orderBy(desc(schema.opportunities.createdAt));

      return rows.map((r) => ({
        id: r.id,
        workspace_id: r.workspaceId,
        title: r.title,
        description: r.description,
        effort: r.effort as any,
        value: r.value as any,
        status: r.status as any,
        score: r.score || 0,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
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
        .where(
          and(
            eq(schema.opportunities.id, opportunityId),
            eq(schema.opportunities.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        workspace_id: r.workspaceId,
        title: r.title,
        description: r.description,
        effort: r.effort as any,
        value: r.value as any,
        status: r.status as any,
        score: r.score || 0,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getOpportunityById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar oportunidade');
    }
  }

  async createOpportunity(workspaceId: string, data: CreateOpportunityInput): Promise<Opportunity> {
    try {
      if (data.problem_ids && data.problem_ids.length > 0) {
        const existingProblems = await db
          .select()
          .from(schema.problems)
          .where(
            and(
              eq(schema.problems.workspaceId, workspaceId),
              inArray(schema.problems.id, data.problem_ids)
            )
          );

        if (existingProblems.length !== data.problem_ids.length) {
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

      if (data.problem_ids && data.problem_ids.length > 0) {
        for (const pId of data.problem_ids) {
          await db.insert(schema.opportunityProblems).values({
            workspaceId,
            opportunityId: inserted.id,
            problemId: pId,
          });
        }
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
        .where(
          and(
            eq(schema.opportunities.id, opportunityId),
            eq(schema.opportunities.workspaceId, workspaceId)
          )
        )
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
        created_at: updated.createdAt.toISOString(),
        updated_at: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres updateOpportunity error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao atualizar oportunidade');
    }
  }

  // Hypotheses
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
        opportunity_id: r.opportunityId,
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

  async createHypothesis(workspaceId: string, data: CreateHypothesisInput): Promise<Hypothesis> {
    try {
      const opp = await this.getOpportunityById(workspaceId, data.opportunity_id);
      if (!opp) {
        throw new BusinessRuleError('Oportunidade não encontrada neste workspace.');
      }

      const [inserted] = await db
        .insert(schema.hypotheses)
        .values({
          workspaceId,
          opportunityId: data.opportunity_id,
          title: data.title,
          statement: data.statement,
          metricsToValidate: data.metrics_to_validate,
          confidenceScore: data.confidence_score || 3,
        })
        .returning();

      return {
        id: inserted.id,
        workspace_id: inserted.workspaceId,
        opportunity_id: inserted.opportunityId,
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

  // Experiments
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
        .where(
          and(
            eq(schema.experiments.id, experimentId),
            eq(schema.experiments.workspaceId, workspaceId)
          )
        )
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
      const hypList = await this.listHypotheses(workspaceId);
      const hyp = hypList.find((h) => h.id === data.hypothesis_id);
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

        const allowedNext = validTransitions[existing.status] || [];
        if (!allowedNext.includes(data.status)) {
          throw new BusinessRuleError(
            `Transição de status inválida: de '${existing.status}' para '${data.status}'.`
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
        .where(
          and(
            eq(schema.experiments.id, experimentId),
            eq(schema.experiments.workspaceId, workspaceId)
          )
        )
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

  // Decisions
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
        .where(
          and(
            eq(schema.decisions.id, decisionId),
            eq(schema.decisions.workspaceId, workspaceId)
          )
        )
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
        .where(
          and(
            eq(schema.decisions.id, decisionId),
            eq(schema.decisions.workspaceId, workspaceId)
          )
        )
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
        .where(
          and(
            eq(schema.decisions.id, decisionId),
            eq(schema.decisions.workspaceId, workspaceId)
          )
        );
    } catch (err) {
      if (err instanceof BusinessRuleError) throw err;
      console.error('Postgres deleteDecision error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao excluir decisão');
    }
  }

  // ETAPA 7: PRODUCT INSIGHTS & DISCOVERY HEALTH
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
      return [];
    }
  }

  async saveInsights(workspaceId: string, insights: ProductInsight[]): Promise<ProductInsight[]> {
    try {
      // Remove old suggested insights for this workspace to avoid stale suggestions
      await db
        .delete(schema.productInsights)
        .where(
          and(
            eq(schema.productInsights.workspaceId, workspaceId),
            eq(schema.productInsights.status, 'suggested')
          )
        );

      if (insights.length === 0) return [];

      const valuesToInsert = insights.map((i) => ({
        id: i.id,
        workspaceId,
        type: i.type,
        severity: i.severity,
        title: i.title,
        summary: i.summary,
        facts: i.facts,
        interpretation: i.interpretation,
        uncertainties: i.uncertainties,
        sources: i.sources,
        status: i.status || 'suggested',
        feedbackNotes: i.feedback_notes,
      }));

      await db.insert(schema.productInsights).values(valuesToInsert);
      return insights;
    } catch (err) {
      console.error('Postgres saveInsights error:', err instanceof Error ? err.message : err);
      return insights;
    }
  }

  async updateInsightStatus(
    workspaceId: string,
    insightId: string,
    status: InsightStatus,
    feedbackNotes?: string
  ): Promise<ProductInsight> {
    try {
      const existingRows = await db
        .select()
        .from(schema.productInsights)
        .where(
          and(
            eq(schema.productInsights.id, insightId),
            eq(schema.productInsights.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (existingRows.length === 0) {
        throw new BusinessRuleError('Insight não encontrado neste workspace.');
      }

      const updateData: any = {
        status,
        updatedAt: new Date(),
      };
      if (feedbackNotes !== undefined) {
        updateData.feedbackNotes = feedbackNotes;
      }

      const [updated] = await db
        .update(schema.productInsights)
        .set(updateData)
        .where(
          and(
            eq(schema.productInsights.id, insightId),
            eq(schema.productInsights.workspaceId, workspaceId)
          )
        )
        .returning();

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
    const [
      researches,
      evidences,
      problems,
      opportunities,
      hypotheses,
      experiments,
      decisions,
    ] = await Promise.all([
      this.listResearches(workspaceId),
      this.listEvidences(workspaceId),
      this.listProblems(workspaceId),
      this.listOpportunities(workspaceId),
      this.listHypotheses(workspaceId),
      this.listExperiments(workspaceId),
      this.listDecisions(workspaceId),
    ]);

    const validatedProblems = problems.filter((p) => p.status === 'validated' || p.status === 'solved').length;
    const testedHypotheses = hypotheses.filter((h) => h.status === 'validated' || h.status === 'invalidated').length;

    const rToEvRatio = researches.length > 0 ? Number((evidences.length / researches.length).toFixed(2)) : 0;
    const probValRatio = problems.length > 0 ? Number((validatedProblems / problems.length).toFixed(2)) : 0;
    const hypTestRatio = hypotheses.length > 0 ? Number((testedHypotheses / hypotheses.length).toFixed(2)) : 0;
    const expDecRatio = experiments.length > 0 ? Number((decisions.length / experiments.length).toFixed(2)) : 0;

    let decisionsWithoutEvidenceCount = 0;
    for (const dec of decisions) {
      const exp = experiments.find((e) => e.id === dec.experiment_id);
      if (!exp) {
        decisionsWithoutEvidenceCount++;
        continue;
      }
      const hyp = hypotheses.find((h) => h.id === exp.hypothesis_id);
      if (!hyp) {
        decisionsWithoutEvidenceCount++;
        continue;
      }
      const opp = opportunities.find((o) => o.id === hyp.opportunity_id);
      if (!opp) {
        decisionsWithoutEvidenceCount++;
        continue;
      }
      if (evidences.length === 0) {
        decisionsWithoutEvidenceCount++;
      }
    }

    const unvalidatedHypothesesCount = hypotheses.filter((h) => {
      const exp = experiments.find((e) => e.hypothesis_id === h.id);
      return !exp && (h.status === 'draft' || h.status === 'in_testing');
    }).length;

    const inconclusiveExperimentsCount = experiments.filter(
      (e) => e.status === 'cancelled' || (e.status === 'completed' && (!e.results || e.results.trim().length < 10))
    ).length;

    const orphanedProblemsCount = problems.filter((p) => (p.evidence_count || 0) === 0).length;

    let score = 100;
    score -= decisionsWithoutEvidenceCount * 12;
    score -= unvalidatedHypothesesCount * 6;
    score -= inconclusiveExperimentsCount * 8;
    score -= orphanedProblemsCount * 5;

    if (researches.length > 0 && evidences.length > 0) score += 5;
    if (validatedProblems > 0) score += 5;
    if (decisions.length > 0) score += 5;

    const healthScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      workspace_id: workspaceId,
      health_score: healthScore,
      totals: {
        researches: researches.length,
        evidences: evidences.length,
        problems: problems.length,
        opportunities: opportunities.length,
        hypotheses: hypotheses.length,
        experiments: experiments.length,
        decisions: decisions.length,
      },
      funnel_conversion: {
        researches_to_evidences_ratio: rToEvRatio,
        problems_validated_ratio: probValRatio,
        hypotheses_tested_ratio: hypTestRatio,
        experiments_decided_ratio: expDecRatio,
      },
      risk_indicators: {
        decisions_without_evidence_count: decisionsWithoutEvidenceCount,
        unvalidated_hypotheses_count: unvalidatedHypothesesCount,
        inconclusive_experiments_count: inconclusiveExperimentsCount,
        orphaned_problems_count: orphanedProblemsCount,
      },
      last_evaluated_at: new Date().toISOString(),
    };
  }
}

import { MemoryStore } from './memoryStore.js';

export const dbStore = new MemoryStore();

