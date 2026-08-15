import {
  Workspace,
  WorkspaceMember,
  Research,
  Evidence,
  Problem,
  Opportunity,
  OpportunityStatus,
  Hypothesis,
  Experiment,
  WorkspaceRole,
} from '../types/index.js';
import { db } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq, and, desc, inArray } from 'drizzle-orm';

class PostgresStore {
  // Sync user record from Firebase Auth to PostgreSQL
  async syncUser(uid: string, email: string, name?: string): Promise<void> {
    try {
      const existing = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.uid, uid))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(schema.users).values({
          uid,
          email,
          name: name || null,
          role: 'user',
        });
      }
    } catch (err) {
      console.error('Postgres syncUser error:', err instanceof Error ? err.message : err);
    }
  }

  // Workspaces
  async listAllWorkspaces(): Promise<Workspace[]> {
    try {
      const rows = await db
        .select()
        .from(schema.workspaces)
        .orderBy(desc(schema.workspaces.createdAt));

      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listAllWorkspaces error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar todos os workspaces');
    }
  }

  async listWorkspacesForUser(userId: string): Promise<Workspace[]> {
    try {
      const memberships = await db
        .select({ workspaceId: schema.workspaceMembers.workspaceId })
        .from(schema.workspaceMembers)
        .where(eq(schema.workspaceMembers.userId, userId));

      const wsIds = memberships.map((m) => m.workspaceId);
      if (wsIds.length === 0) return [];

      const rows = await db
        .select()
        .from(schema.workspaces)
        .where(inArray(schema.workspaces.id, wsIds));

      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listWorkspacesForUser error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar workspaces no banco de dados');
    }
  }

  async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    try {
      const rows = await db
        .select()
        .from(schema.workspaces)
        .where(eq(schema.workspaces.id, workspaceId))
        .limit(1);

      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getWorkspaceById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar workspace');
    }
  }

  async createWorkspace(name: string, slug: string, ownerUserId: string): Promise<Workspace> {
    try {
      const [ws] = await db
        .insert(schema.workspaces)
        .values({ name, slug })
        .returning();

      await db.insert(schema.workspaceMembers).values({
        workspaceId: ws.id,
        userId: ownerUserId,
        role: 'owner',
      });

      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        created_at: ws.createdAt.toISOString(),
        updated_at: ws.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createWorkspace error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao criar workspace no banco de dados');
    }
  }

  // Memberships
  async getMembership(workspaceId: string, userId: string): Promise<{ role: WorkspaceRole; workspace_id: string } | null> {
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
      return {
        role: rows[0].role as WorkspaceRole,
        workspace_id: rows[0].workspaceId,
      };
    } catch (err) {
      console.error('Postgres getMembership error:', err instanceof Error ? err.message : err);
      return null;
    }
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMember> {
    try {
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
      console.error('Postgres addMember error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao adicionar membro ao workspace');
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
        source_type: r.sourceType as any,
        raw_content: r.rawContent,
        participant_info: r.participantInfo as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listResearches error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar pesquisas');
    }
  }

  async getResearchById(workspaceId: string, id: string): Promise<Research | null> {
    try {
      const rows = await db
        .select()
        .from(schema.researches)
        .where(
          and(
            eq(schema.researches.id, id),
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
        source_type: r.sourceType as any,
        raw_content: r.rawContent,
        participant_info: r.participantInfo as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getResearchById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar pesquisa');
    }
  }

  async createResearch(
    workspaceId: string,
    data: Omit<Research, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>
  ): Promise<Research> {
    try {
      const [r] = await db
        .insert(schema.researches)
        .values({
          workspaceId,
          title: data.title,
          sourceType: data.source_type,
          rawContent: data.raw_content,
          participantInfo: data.participant_info || {},
          status: 'processed',
        })
        .returning();

      return {
        id: r.id,
        workspace_id: r.workspaceId,
        title: r.title,
        source_type: r.sourceType as any,
        raw_content: r.rawContent,
        participant_info: r.participantInfo as any,
        created_at: r.createdAt.toISOString(),
        updated_at: r.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres createResearch error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao registrar pesquisa');
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
        .select({
          id: schema.evidences.id,
          workspaceId: schema.evidences.workspaceId,
          researchId: schema.evidences.researchId,
          quote: schema.evidences.quote,
          context: schema.evidences.context,
          confidenceLevel: schema.evidences.confidenceLevel,
          tags: schema.evidences.tags,
          createdAt: schema.evidences.createdAt,
          updatedAt: schema.evidences.updatedAt,
          researchTitle: schema.researches.title,
          researchSourceType: schema.researches.sourceType,
          researchParticipantInfo: schema.researches.participantInfo,
        })
        .from(schema.evidences)
        .leftJoin(
          schema.researches,
          and(
            eq(schema.evidences.researchId, schema.researches.id),
            eq(schema.researches.workspaceId, workspaceId)
          )
        )
        .where(and(...conditions))
        .orderBy(desc(schema.evidences.createdAt));

      return rows.map((e) => ({
        id: e.id,
        workspace_id: e.workspaceId,
        research_id: e.researchId,
        quote: e.quote,
        context: e.context || undefined,
        confidence_level: e.confidenceLevel as any,
        tags: (e.tags as string[]) || [],
        created_at: e.createdAt.toISOString(),
        updated_at: e.updatedAt.toISOString(),
        research_title: e.researchTitle || undefined,
        research_source_type: (e.researchSourceType as any) || undefined,
        research_participant_name: (e.researchParticipantInfo as any)?.name || undefined,
      }));
    } catch (err) {
      console.error('Postgres listEvidences error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar evidências');
    }
  }

  async createEvidence(
    workspaceId: string,
    data: Omit<Evidence, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>
  ): Promise<Evidence> {
    try {
      // 1. Strict cross-tenant validation: Ensure target research belongs to the exact same workspace
      const researchCheck = await this.getResearchById(workspaceId, data.research_id);
      if (!researchCheck) {
        throw new Error('A pesquisa de referência não existe ou pertence a outro workspace.');
      }

      const [e] = await db
        .insert(schema.evidences)
        .values({
          workspaceId,
          researchId: data.research_id,
          quote: data.quote,
          context: data.context || null,
          confidenceLevel: data.confidence_level || 'medium',
          tags: data.tags || [],
        })
        .returning();

      return {
        id: e.id,
        workspace_id: e.workspaceId,
        research_id: e.researchId,
        quote: e.quote,
        context: e.context || undefined,
        confidence_level: e.confidenceLevel as any,
        tags: (e.tags as string[]) || [],
        created_at: e.createdAt.toISOString(),
        updated_at: e.updatedAt.toISOString(),
      };
    } catch (err: any) {
      console.error('Postgres createEvidence error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  // Problems
  async listProblems(workspaceId: string): Promise<Problem[]> {
    try {
      const problemsRows = await db
        .select()
        .from(schema.problems)
        .where(eq(schema.problems.workspaceId, workspaceId))
        .orderBy(desc(schema.problems.createdAt));

      const peRows = await db
        .select()
        .from(schema.problemEvidences)
        .where(eq(schema.problemEvidences.workspaceId, workspaceId));

      const allEvidences = await this.listEvidences(workspaceId);
      const evidenceMap = new Map(allEvidences.map((e) => [e.id, e]));

      return problemsRows.map((p) => {
        const linkedIds = peRows
          .filter((pe) => pe.problemId === p.id)
          .map((pe) => pe.evidenceId);

        const attached = linkedIds
          .map((id) => evidenceMap.get(id))
          .filter(Boolean) as Evidence[];

        return {
          id: p.id,
          workspace_id: p.workspaceId,
          title: p.title,
          description: p.description,
          impact_level: p.impactLevel as any,
          status: p.status as any,
          evidences: attached,
          created_at: p.createdAt.toISOString(),
          updated_at: p.updatedAt.toISOString(),
        };
      });
    } catch (err) {
      console.error('Postgres listProblems error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar problemas');
    }
  }

  async getProblemById(workspaceId: string, id: string): Promise<Problem | null> {
    try {
      const rows = await db
        .select()
        .from(schema.problems)
        .where(
          and(
            eq(schema.problems.id, id),
            eq(schema.problems.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      const p = rows[0];

      const peRows = await db
        .select()
        .from(schema.problemEvidences)
        .where(
          and(
            eq(schema.problemEvidences.workspaceId, workspaceId),
            eq(schema.problemEvidences.problemId, id)
          )
        );

      const evidenceIds = peRows.map((pe) => pe.evidenceId);
      let attached: Evidence[] = [];
      if (evidenceIds.length > 0) {
        const evRows = await db
          .select({
            id: schema.evidences.id,
            workspaceId: schema.evidences.workspaceId,
            researchId: schema.evidences.researchId,
            quote: schema.evidences.quote,
            context: schema.evidences.context,
            confidenceLevel: schema.evidences.confidenceLevel,
            tags: schema.evidences.tags,
            createdAt: schema.evidences.createdAt,
            updatedAt: schema.evidences.updatedAt,
            researchTitle: schema.researches.title,
            researchSourceType: schema.researches.sourceType,
            researchParticipantInfo: schema.researches.participantInfo,
          })
          .from(schema.evidences)
          .leftJoin(
            schema.researches,
            and(
              eq(schema.evidences.researchId, schema.researches.id),
              eq(schema.researches.workspaceId, workspaceId)
            )
          )
          .where(
            and(
              eq(schema.evidences.workspaceId, workspaceId),
              inArray(schema.evidences.id, evidenceIds)
            )
          );
        attached = evRows.map((e) => ({
          id: e.id,
          workspace_id: e.workspaceId,
          research_id: e.researchId,
          quote: e.quote,
          context: e.context || undefined,
          confidence_level: e.confidenceLevel as any,
          tags: (e.tags as string[]) || [],
          created_at: e.createdAt.toISOString(),
          updated_at: e.updatedAt.toISOString(),
          research_title: e.researchTitle || undefined,
          research_source_type: (e.researchSourceType as any) || undefined,
          research_participant_name: (e.researchParticipantInfo as any)?.name || undefined,
        }));
      }

      return {
        id: p.id,
        workspace_id: p.workspaceId,
        title: p.title,
        description: p.description,
        impact_level: p.impactLevel as any,
        status: p.status as any,
        evidences: attached,
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getProblemById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar problema');
    }
  }

  async createProblem(
    workspaceId: string,
    data: Omit<Problem, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>,
    evidenceIds: string[] = []
  ): Promise<Problem> {
    try {
      // 1. Verify all evidenceIds belong strictly to this workspace (prevent cross-tenant linkage)
      if (evidenceIds.length > 0) {
        const validEvidences = await db
          .select({ id: schema.evidences.id })
          .from(schema.evidences)
          .where(
            and(
              eq(schema.evidences.workspaceId, workspaceId),
              inArray(schema.evidences.id, evidenceIds)
            )
          );

        if (validEvidences.length !== evidenceIds.length) {
          throw new Error('Uma ou mais evidências selecionadas não pertencem a este workspace.');
        }
      }

      const [p] = await db
        .insert(schema.problems)
        .values({
          workspaceId,
          title: data.title,
          description: data.description,
          impactLevel: data.impact_level || 'medium',
          status: data.status || 'identified',
        })
        .returning();

      for (const evidenceId of evidenceIds) {
        await db.insert(schema.problemEvidences).values({
          workspaceId,
          problemId: p.id,
          evidenceId,
        });
      }

      return {
        id: p.id,
        workspace_id: p.workspaceId,
        title: p.title,
        description: p.description,
        impact_level: p.impactLevel as any,
        status: p.status as any,
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
      };
    } catch (err: any) {
      console.error('Postgres createProblem error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async updateProblem(
    workspaceId: string,
    id: string,
    data: Partial<Omit<Problem, 'id' | 'workspace_id' | 'created_at' | 'updated_at' | 'evidences'>>,
    evidenceIds?: string[]
  ): Promise<Problem> {
    try {
      const existing = await this.getProblemById(workspaceId, id);
      if (!existing) {
        throw new Error('Problema não encontrado neste workspace');
      }

      // Execute update + evidence sync within a single atomic transaction
      await db.transaction(async (tx) => {
        // If evidenceIds provided, validate all belong to workspaceId
        if (evidenceIds !== undefined) {
          if (evidenceIds.length > 0) {
            const validEvidences = await tx
              .select({ id: schema.evidences.id })
              .from(schema.evidences)
              .where(
                and(
                  eq(schema.evidences.workspaceId, workspaceId),
                  inArray(schema.evidences.id, evidenceIds)
                )
              );

            if (validEvidences.length !== evidenceIds.length) {
              throw new Error('Uma ou mais evidências selecionadas não pertencem a este workspace.');
            }
          }

          // Replace junction rows for this problem in workspace atomically
          await tx
            .delete(schema.problemEvidences)
            .where(
              and(
                eq(schema.problemEvidences.workspaceId, workspaceId),
                eq(schema.problemEvidences.problemId, id)
              )
            );

          for (const evId of evidenceIds) {
            await tx.insert(schema.problemEvidences).values({
              workspaceId,
              problemId: id,
              evidenceId: evId,
            });
          }
        }

        const updateValues: Record<string, any> = {
          updatedAt: new Date(),
        };
        if (data.title !== undefined) updateValues.title = data.title;
        if (data.description !== undefined) updateValues.description = data.description;
        if (data.impact_level !== undefined) updateValues.impactLevel = data.impact_level;
        if (data.status !== undefined) updateValues.status = data.status;

        await tx
          .update(schema.problems)
          .set(updateValues)
          .where(
            and(
              eq(schema.problems.id, id),
              eq(schema.problems.workspaceId, workspaceId)
            )
          );
      });

      const updated = await this.getProblemById(workspaceId, id);
      if (!updated) {
        throw new Error('Falha ao recuperar problema atualizado');
      }
      return updated;
    } catch (err: any) {
      console.error('Postgres updateProblem error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async deleteProblem(workspaceId: string, id: string): Promise<boolean> {
    try {
      const existing = await this.getProblemById(workspaceId, id);
      if (!existing) {
        throw new Error('Problema não encontrado neste workspace');
      }

      // Execute junction rows deletion + problem deletion within a single atomic transaction
      await db.transaction(async (tx) => {
        await tx
          .delete(schema.problemEvidences)
          .where(
            and(
              eq(schema.problemEvidences.workspaceId, workspaceId),
              eq(schema.problemEvidences.problemId, id)
            )
          );

        await tx
          .delete(schema.problems)
          .where(
            and(
              eq(schema.problems.id, id),
              eq(schema.problems.workspaceId, workspaceId)
            )
          );
      });

      return true;
    } catch (err: any) {
      console.error('Postgres deleteProblem error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async unlinkEvidenceFromProblem(workspaceId: string, problemId: string, evidenceId: string): Promise<boolean> {
    try {
      const problem = await this.getProblemById(workspaceId, problemId);
      if (!problem) {
        throw new Error('Problema não encontrado neste workspace');
      }

      await db
        .delete(schema.problemEvidences)
        .where(
          and(
            eq(schema.problemEvidences.workspaceId, workspaceId),
            eq(schema.problemEvidences.problemId, problemId),
            eq(schema.problemEvidences.evidenceId, evidenceId)
          )
        );

      return true;
    } catch (err: any) {
      console.error('Postgres unlinkEvidenceFromProblem error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async linkEvidencesToProblem(workspaceId: string, problemId: string, evidenceIds: string[]): Promise<any[]> {
    try {
      // 1. Verify problem belongs to workspace
      const problem = await this.getProblemById(workspaceId, problemId);
      if (!problem) {
        throw new Error('Problema não encontrado neste workspace');
      }

      // 2. Verify all evidenceIds belong to workspace
      if (evidenceIds.length > 0) {
        const validEvidences = await db
          .select({ id: schema.evidences.id })
          .from(schema.evidences)
          .where(
            and(
              eq(schema.evidences.workspaceId, workspaceId),
              inArray(schema.evidences.id, evidenceIds)
            )
          );

        if (validEvidences.length !== evidenceIds.length) {
          throw new Error('Uma ou mais evidências selecionadas não pertencem a este workspace.');
        }
      }

      const links = [];
      for (const evidenceId of evidenceIds) {
        const [link] = await db
          .insert(schema.problemEvidences)
          .values({
            workspaceId,
            problemId,
            evidenceId,
          })
          .onConflictDoNothing()
          .returning();
        if (link) links.push(link);
      }
      return links;
    } catch (err: any) {
      console.error('Postgres linkEvidencesToProblem error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  // Opportunities
  async listOpportunities(workspaceId: string): Promise<Opportunity[]> {
    try {
      const oppRows = await db
        .select()
        .from(schema.opportunities)
        .where(eq(schema.opportunities.workspaceId, workspaceId))
        .orderBy(desc(schema.opportunities.createdAt));

      const opRows = await db
        .select()
        .from(schema.opportunityProblems)
        .where(eq(schema.opportunityProblems.workspaceId, workspaceId));

      const allProblems = await this.listProblems(workspaceId);
      const problemMap = new Map(allProblems.map((p) => [p.id, p]));

      return oppRows.map((o) => {
        const linkedProblemIds = opRows
          .filter((op) => op.opportunityId === o.id)
          .map((op) => op.problemId);

        const attachedProblems = linkedProblemIds
          .map((pid) => problemMap.get(pid))
          .filter(Boolean) as Problem[];

        return {
          id: o.id,
          workspace_id: o.workspaceId,
          title: o.title,
          description: o.description,
          status: o.status as any,
          problems: attachedProblems,
          created_at: o.createdAt.toISOString(),
          updated_at: o.updatedAt.toISOString(),
        };
      });
    } catch (err) {
      console.error('Postgres listOpportunities error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar oportunidades');
    }
  }

  async getOpportunityById(workspaceId: string, id: string): Promise<Opportunity | null> {
    try {
      const rows = await db
        .select()
        .from(schema.opportunities)
        .where(
          and(
            eq(schema.opportunities.id, id),
            eq(schema.opportunities.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      const o = rows[0];

      const opRows = await db
        .select()
        .from(schema.opportunityProblems)
        .where(
          and(
            eq(schema.opportunityProblems.workspaceId, workspaceId),
            eq(schema.opportunityProblems.opportunityId, id)
          )
        );

      const problemIds = opRows.map((op) => op.problemId);
      let attachedProblems: Problem[] = [];
      if (problemIds.length > 0) {
        const allProblems = await this.listProblems(workspaceId);
        attachedProblems = allProblems.filter((p) => problemIds.includes(p.id));
      }

      return {
        id: o.id,
        workspace_id: o.workspaceId,
        title: o.title,
        description: o.description,
        status: o.status as any,
        problems: attachedProblems,
        created_at: o.createdAt.toISOString(),
        updated_at: o.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getOpportunityById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar oportunidade');
    }
  }

  async createOpportunity(
    workspaceId: string,
    data: { title: string; description: string; status?: OpportunityStatus },
    problemIds: string[] = []
  ): Promise<Opportunity> {
    try {
      const createdId = await db.transaction(async (tx) => {
        // Cross-tenant check for linked problems
        if (problemIds.length > 0) {
          const validProblems = await tx
            .select({ id: schema.problems.id })
            .from(schema.problems)
            .where(
              and(
                eq(schema.problems.workspaceId, workspaceId),
                inArray(schema.problems.id, problemIds)
              )
            );

          if (validProblems.length !== problemIds.length) {
            throw new Error('Um ou mais problemas informados pertencem a outro workspace.');
          }
        }

        const [o] = await tx
          .insert(schema.opportunities)
          .values({
            workspaceId,
            title: data.title,
            description: data.description,
            status: data.status || 'draft',
          })
          .returning();

        for (const problemId of problemIds) {
          await tx.insert(schema.opportunityProblems).values({
            workspaceId,
            opportunityId: o.id,
            problemId,
          });
        }

        return o.id;
      });

      const opt = await this.getOpportunityById(workspaceId, createdId);
      return opt!;
    } catch (err: any) {
      console.error('Postgres createOpportunity error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async updateOpportunity(
    workspaceId: string,
    id: string,
    data: { title?: string; description?: string; status?: OpportunityStatus },
    problemIds?: string[]
  ): Promise<Opportunity> {
    try {
      const opp = await this.getOpportunityById(workspaceId, id);
      if (!opp) {
        throw new Error('Oportunidade não encontrada neste workspace');
      }

      await db.transaction(async (tx) => {
        if (problemIds !== undefined) {
          if (problemIds.length > 0) {
            const validProblems = await tx
              .select({ id: schema.problems.id })
              .from(schema.problems)
              .where(
                and(
                  eq(schema.problems.workspaceId, workspaceId),
                  inArray(schema.problems.id, problemIds)
                )
              );

            if (validProblems.length !== problemIds.length) {
              throw new Error('Um ou mais problemas informados pertencem a outro workspace.');
            }
          }

          // Delete existing junction rows for this opportunity in workspace
          await tx
            .delete(schema.opportunityProblems)
            .where(
              and(
                eq(schema.opportunityProblems.workspaceId, workspaceId),
                eq(schema.opportunityProblems.opportunityId, id)
              )
            );

          for (const pid of problemIds) {
            await tx.insert(schema.opportunityProblems).values({
              workspaceId,
              opportunityId: id,
              problemId: pid,
            });
          }
        }

        const updateValues: Record<string, any> = {
          updatedAt: new Date(),
        };
        if (data.title !== undefined) updateValues.title = data.title;
        if (data.description !== undefined) updateValues.description = data.description;
        if (data.status !== undefined) updateValues.status = data.status;

        await tx
          .update(schema.opportunities)
          .set(updateValues)
          .where(
            and(
              eq(schema.opportunities.id, id),
              eq(schema.opportunities.workspaceId, workspaceId)
            )
          );
      });

      const updated = await this.getOpportunityById(workspaceId, id);
      if (!updated) {
        throw new Error('Oportunidade não encontrada após atualização');
      }
      return updated;
    } catch (err: any) {
      console.error('Postgres updateOpportunity error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async deleteOpportunity(workspaceId: string, id: string): Promise<boolean> {
    try {
      const opp = await this.getOpportunityById(workspaceId, id);
      if (!opp) {
        throw new Error('Oportunidade não encontrada neste workspace');
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(schema.opportunityProblems)
          .where(
            and(
              eq(schema.opportunityProblems.workspaceId, workspaceId),
              eq(schema.opportunityProblems.opportunityId, id)
            )
          );

        await tx
          .delete(schema.opportunities)
          .where(
            and(
              eq(schema.opportunities.id, id),
              eq(schema.opportunities.workspaceId, workspaceId)
            )
          );
      });

      return true;
    } catch (err: any) {
      console.error('Postgres deleteOpportunity error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async linkProblemsToOpportunity(workspaceId: string, opportunityId: string, problemIds: string[]): Promise<any[]> {
    try {
      const opp = await this.getOpportunityById(workspaceId, opportunityId);
      if (!opp) {
        throw new Error('Oportunidade não encontrada neste workspace');
      }

      return await db.transaction(async (tx) => {
        if (problemIds.length > 0) {
          const validProblems = await tx
            .select({ id: schema.problems.id })
            .from(schema.problems)
            .where(
              and(
                eq(schema.problems.workspaceId, workspaceId),
                inArray(schema.problems.id, problemIds)
              )
            );

          if (validProblems.length !== problemIds.length) {
            throw new Error('Um ou mais problemas informados pertencem a outro workspace.');
          }
        }

        const links = [];
        for (const problemId of problemIds) {
          const [link] = await tx
            .insert(schema.opportunityProblems)
            .values({
              workspaceId,
              opportunityId,
              problemId,
            })
            .onConflictDoNothing()
            .returning();
          if (link) links.push(link);
        }
        return links;
      });
    } catch (err: any) {
      console.error('Postgres linkProblemsToOpportunity error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async unlinkProblemFromOpportunity(workspaceId: string, opportunityId: string, problemId: string): Promise<boolean> {
    try {
      const opp = await this.getOpportunityById(workspaceId, opportunityId);
      if (!opp) {
        throw new Error('Oportunidade não encontrada neste workspace');
      }

      await db
        .delete(schema.opportunityProblems)
        .where(
          and(
            eq(schema.opportunityProblems.workspaceId, workspaceId),
            eq(schema.opportunityProblems.opportunityId, opportunityId),
            eq(schema.opportunityProblems.problemId, problemId)
          )
        );

      return true;
    } catch (err: any) {
      console.error('Postgres unlinkProblemFromOpportunity error:', err instanceof Error ? err.message : err);
      throw err;
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

      return rows.map((h) => ({
        id: h.id,
        workspace_id: h.workspaceId,
        opportunity_id: h.opportunityId,
        statement: h.statement,
        metric_target: h.metricTarget,
        confidence_score: h.confidenceScore,
        status: h.status as any,
        created_at: h.createdAt.toISOString(),
        updated_at: h.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.error('Postgres listHypotheses error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar hipóteses');
    }
  }

  async createHypothesis(
    workspaceId: string,
    data: Omit<Hypothesis, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>
  ): Promise<Hypothesis> {
    try {
      if (!data.opportunity_id || typeof data.opportunity_id !== 'string' || data.opportunity_id.trim() === '') {
        throw new Error('Oportunidade é obrigatória.');
      }
      if (!data.metric_target || typeof data.metric_target !== 'string' || data.metric_target.trim() === '') {
        throw new Error('Métrica de sucesso é obrigatória.');
      }

      // Strict cross-tenant validation: Verify parent opportunity belongs strictly to this workspace
      const opp = await this.getOpportunityById(workspaceId, data.opportunity_id);
      if (!opp) {
        throw new Error('A oportunidade de referência não existe neste workspace.');
      }

      const [h] = await db
        .insert(schema.hypotheses)
        .values({
          workspaceId,
          opportunityId: data.opportunity_id,
          statement: data.statement,
          metricTarget: data.metric_target,
          confidenceScore: data.confidence_score ?? 3,
          status: data.status || 'draft',
        })
        .returning();

      return {
        id: h.id,
        workspace_id: h.workspaceId,
        opportunity_id: h.opportunityId,
        opportunity_title: opp.title,
        statement: h.statement,
        metric_target: h.metricTarget,
        confidence_score: h.confidenceScore,
        status: h.status as any,
        created_at: h.createdAt.toISOString(),
        updated_at: h.updatedAt.toISOString(),
      };
    } catch (err: any) {
      console.error('Postgres createHypothesis error:', err.message || err);
      throw err;
    }
  }

  async getHypothesisById(workspaceId: string, hypothesisId: string): Promise<Hypothesis | null> {
    try {
      const rows = await db
        .select({
          hypothesis: schema.hypotheses,
          oppTitle: schema.opportunities.title,
        })
        .from(schema.hypotheses)
        .leftJoin(
          schema.opportunities,
          and(
            eq(schema.opportunities.id, schema.hypotheses.opportunityId),
            eq(schema.opportunities.workspaceId, workspaceId)
          )
        )
        .where(
          and(
            eq(schema.hypotheses.id, hypothesisId),
            eq(schema.hypotheses.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;

      const h = rows[0].hypothesis;
      return {
        id: h.id,
        workspace_id: h.workspaceId,
        opportunity_id: h.opportunityId,
        opportunity_title: rows[0].oppTitle || undefined,
        statement: h.statement,
        metric_target: h.metricTarget,
        confidence_score: h.confidenceScore,
        status: h.status as any,
        created_at: h.createdAt.toISOString(),
        updated_at: h.updatedAt.toISOString(),
      };
    } catch (err) {
      console.error('Postgres getHypothesisById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar hipótese');
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
        .select({
          exp: schema.experiments,
          hypStatement: schema.hypotheses.statement,
          oppId: schema.opportunities.id,
          oppTitle: schema.opportunities.title,
        })
        .from(schema.experiments)
        .leftJoin(
          schema.hypotheses,
          and(
            eq(schema.hypotheses.id, schema.experiments.hypothesisId),
            eq(schema.hypotheses.workspaceId, workspaceId)
          )
        )
        .leftJoin(
          schema.opportunities,
          and(
            eq(schema.opportunities.id, schema.hypotheses.opportunityId),
            eq(schema.opportunities.workspaceId, workspaceId)
          )
        )
        .where(and(...conditions))
        .orderBy(desc(schema.experiments.createdAt));

      return rows.map((r) => {
        const e = r.exp;
        return {
          id: e.id,
          workspace_id: e.workspaceId,
          hypothesis_id: e.hypothesisId,
          title: e.title,
          description: e.description,
          method: e.method,
          success_criteria: e.successCriteria,
          status: e.status as any,
          result: (e.result as any) || null,
          learning: e.learning || null,
          started_at: e.startedAt ? e.startedAt.toISOString() : null,
          completed_at: e.completedAt ? e.completedAt.toISOString() : null,
          created_at: e.createdAt.toISOString(),
          updated_at: e.updatedAt.toISOString(),
          hypothesis_statement: r.hypStatement || undefined,
          opportunity_id: r.oppId || undefined,
          opportunity_title: r.oppTitle || undefined,
        };
      });
    } catch (err) {
      console.error('Postgres listExperiments error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao listar experimentos');
    }
  }

  async getExperimentById(workspaceId: string, experimentId: string): Promise<Experiment | null> {
    try {
      const rows = await db
        .select({
          exp: schema.experiments,
          hypStatement: schema.hypotheses.statement,
          oppId: schema.opportunities.id,
          oppTitle: schema.opportunities.title,
        })
        .from(schema.experiments)
        .leftJoin(
          schema.hypotheses,
          and(
            eq(schema.hypotheses.id, schema.experiments.hypothesisId),
            eq(schema.hypotheses.workspaceId, workspaceId)
          )
        )
        .leftJoin(
          schema.opportunities,
          and(
            eq(schema.opportunities.id, schema.hypotheses.opportunityId),
            eq(schema.opportunities.workspaceId, workspaceId)
          )
        )
        .where(
          and(
            eq(schema.experiments.id, experimentId),
            eq(schema.experiments.workspaceId, workspaceId)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;

      const e = rows[0].exp;
      return {
        id: e.id,
        workspace_id: e.workspaceId,
        hypothesis_id: e.hypothesisId,
        title: e.title,
        description: e.description,
        method: e.method,
        success_criteria: e.successCriteria,
        status: e.status as any,
        result: (e.result as any) || null,
        learning: e.learning || null,
        started_at: e.startedAt ? e.startedAt.toISOString() : null,
        completed_at: e.completedAt ? e.completedAt.toISOString() : null,
        created_at: e.createdAt.toISOString(),
        updated_at: e.updatedAt.toISOString(),
        hypothesis_statement: rows[0].hypStatement || undefined,
        opportunity_id: rows[0].oppId || undefined,
        opportunity_title: rows[0].oppTitle || undefined,
      };
    } catch (err) {
      console.error('Postgres getExperimentById error:', err instanceof Error ? err.message : err);
      throw new Error('Falha ao buscar experimento');
    }
  }

  async createExperiment(
    workspaceId: string,
    data: {
      hypothesis_id: string;
      title: string;
      description: string;
      method: string;
      success_criteria: string;
    }
  ): Promise<Experiment> {
    try {
      if (!data.hypothesis_id) {
        throw new Error('A hipótese é obrigatória para criar um experimento.');
      }

      // Validar a cadeia completa de tenancy: Experiment -> Hypothesis -> Opportunity -> Workspace
      const hypothesis = await this.getHypothesisById(workspaceId, data.hypothesis_id);
      if (!hypothesis) {
        throw new Error('A hipótese informada não existe neste workspace.');
      }

      const [e] = await db
        .insert(schema.experiments)
        .values({
          workspaceId,
          hypothesisId: data.hypothesis_id,
          title: data.title,
          description: data.description,
          method: data.method,
          successCriteria: data.success_criteria,
          status: 'draft',
          result: null,
          learning: null,
          startedAt: null,
          completedAt: null,
        })
        .returning();

      return {
        id: e.id,
        workspace_id: e.workspaceId,
        hypothesis_id: e.hypothesisId,
        title: e.title,
        description: e.description,
        method: e.method,
        success_criteria: e.successCriteria,
        status: e.status as any,
        result: null,
        learning: null,
        started_at: null,
        completed_at: null,
        created_at: e.createdAt.toISOString(),
        updated_at: e.updatedAt.toISOString(),
        hypothesis_statement: hypothesis.statement,
        opportunity_id: hypothesis.opportunity_id,
        opportunity_title: hypothesis.opportunity_title,
      };
    } catch (err: any) {
      console.error('Postgres createExperiment error:', err.message || err);
      throw err;
    }
  }

  async updateExperiment(
    workspaceId: string,
    experimentId: string,
    data: Partial<{
      title: string;
      description: string;
      method: string;
      success_criteria: string;
      status: 'draft' | 'running' | 'completed' | 'cancelled';
      result: 'confirmed' | 'partially_confirmed' | 'rejected' | 'inconclusive' | null;
      learning: string | null;
      started_at: string | null;
      completed_at: string | null;
    }>
  ): Promise<Experiment> {
    try {
      const existing = await this.getExperimentById(workspaceId, experimentId);
      if (!existing) {
        throw new Error('Experimento não encontrado neste workspace.');
      }

      const currentStatus = existing.status;
      const nextStatus = data.status ?? currentStatus;

      // 1. Regras de Transição de Ciclo de Vida:
      // draft -> running
      // running -> completed
      // draft -> cancelled
      // completed não pode voltar para draft/running ou cancelled
      // cancelled não pode voltar para running
      if (currentStatus === 'completed' && nextStatus !== 'completed') {
        throw new Error(`Experimento concluído não pode alterar status para ${nextStatus}.`);
      }
      if (currentStatus === 'cancelled' && nextStatus === 'running') {
        throw new Error('Experimento cancelado não pode transitar para running.');
      }
      if (currentStatus === 'draft' && nextStatus === 'completed') {
        throw new Error('Transição de draft direto para completed não é permitida. Coloque o experimento em running primeiro.');
      }

      // 2. Não permitir result ou learning antes de completed (Regra 5)
      const incomingResult = data.result !== undefined ? data.result : existing.result;
      const incomingLearning = data.learning !== undefined ? data.learning : existing.learning;

      if (nextStatus !== 'completed') {
        if (incomingResult !== null && incomingResult !== undefined) {
          throw new Error('O resultado só pode ser informado quando o experimento estiver concluído.');
        }
        if (incomingLearning !== null && incomingLearning !== undefined && incomingLearning.trim() !== '') {
          throw new Error('O aprendizado só pode ser informado quando o experimento estiver concluído.');
        }
      }

      // 3. Regras para o status 'completed' (Regras 3, 4, 5):
      let finalStartedAt: Date | null = existing.started_at ? new Date(existing.started_at) : null;
      let finalCompletedAt: Date | null = existing.completed_at ? new Date(existing.completed_at) : null;

      if (nextStatus === 'running') {
        if (!finalStartedAt) {
          finalStartedAt = data.started_at ? new Date(data.started_at) : new Date();
        }
      }

      if (nextStatus === 'completed') {
        if (!finalStartedAt) {
          finalStartedAt = data.started_at ? new Date(data.started_at) : new Date();
        }
        finalCompletedAt = data.completed_at ? new Date(data.completed_at) : new Date();

        if (!incomingResult) {
          throw new Error('O resultado é obrigatório para concluir o experimento.');
        }
        const validResults = ['confirmed', 'partially_confirmed', 'rejected', 'inconclusive'];
        if (!validResults.includes(incomingResult)) {
          throw new Error('Resultado inválido para o experimento.');
        }

        if (!incomingLearning || typeof incomingLearning !== 'string' || incomingLearning.trim() === '') {
          throw new Error('O aprendizado é obrigatório para concluir o experimento.');
        }

        const currentSuccessCriteria = data.success_criteria ?? existing.success_criteria;
        if (!currentSuccessCriteria || currentSuccessCriteria.trim() === '') {
          throw new Error('Critério de sucesso deve existir para concluir o experimento.');
        }
      }

      const updateValues: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) updateValues.title = data.title;
      if (data.description !== undefined) updateValues.description = data.description;
      if (data.method !== undefined) updateValues.method = data.method;
      if (data.success_criteria !== undefined) updateValues.successCriteria = data.success_criteria;
      if (data.status !== undefined) updateValues.status = data.status;

      if (nextStatus === 'completed') {
        updateValues.result = incomingResult;
        updateValues.learning = incomingLearning ? incomingLearning.trim() : null;
        updateValues.startedAt = finalStartedAt;
        updateValues.completedAt = finalCompletedAt;
      } else {
        if (data.result !== undefined) updateValues.result = data.result;
        if (data.learning !== undefined) updateValues.learning = data.learning;
        if (nextStatus === 'running' && finalStartedAt) {
          updateValues.startedAt = finalStartedAt;
        }
      }

      await db
        .update(schema.experiments)
        .set(updateValues)
        .where(
          and(
            eq(schema.experiments.id, experimentId),
            eq(schema.experiments.workspaceId, workspaceId)
          )
        );

      const updated = await this.getExperimentById(workspaceId, experimentId);
      if (!updated) {
        throw new Error('Experimento não encontrado após atualização');
      }
      return updated;
    } catch (err: any) {
      console.error('Postgres updateExperiment error:', err.message || err);
      throw err;
    }
  }

  async deleteExperiment(workspaceId: string, experimentId: string): Promise<boolean> {
    try {
      const existing = await this.getExperimentById(workspaceId, experimentId);
      if (!existing) {
        throw new Error('Experimento não encontrado neste workspace.');
      }

      await db
        .delete(schema.experiments)
        .where(
          and(
            eq(schema.experiments.id, experimentId),
            eq(schema.experiments.workspaceId, workspaceId)
          )
        );

      return true;
    } catch (err: any) {
      console.error('Postgres deleteExperiment error:', err.message || err);
      throw err;
    }
  }

  // Save approved AI analysis (Atomic & Tenant-isolated)
  async saveApprovedAnalysis(
    workspaceId: string,
    researchId: string,
    approvedEvidences: Array<{
      quote: string;
      context?: string | null;
      confidence_level: 'high' | 'medium' | 'low';
      tags?: string[];
    }>,
    approvedProblems: Array<{
      title: string;
      description: string;
      impact_level: 'critical' | 'high' | 'medium' | 'low';
      status?: 'identified' | 'exploring' | 'validated' | 'archived';
      supporting_evidence_local_indices: number[];
    }>
  ): Promise<{ saved_evidences: Evidence[]; saved_problems: Problem[] }> {
    try {
      // 1. Verify research belongs to workspace
      const research = await this.getResearchById(workspaceId, researchId);
      if (!research) {
        throw new Error('Pesquisa não encontrada ou pertence a outro workspace.');
      }

      const savedEvidences: Evidence[] = [];

      // 2. Persist approved evidences
      for (const e of approvedEvidences) {
        const [inserted] = await db
          .insert(schema.evidences)
          .values({
            workspaceId,
            researchId,
            quote: e.quote,
            context: e.context || null,
            confidenceLevel: e.confidence_level,
            tags: e.tags || [],
          })
          .returning();

        savedEvidences.push({
          id: inserted.id,
          workspace_id: inserted.workspaceId,
          research_id: inserted.researchId,
          quote: inserted.quote,
          context: inserted.context || undefined,
          confidence_level: inserted.confidenceLevel as any,
          tags: (inserted.tags as string[]) || [],
          created_at: inserted.createdAt.toISOString(),
          updated_at: inserted.updatedAt.toISOString(),
        });
      }

      const savedProblems: Problem[] = [];

      // 3. Persist approved problems and link them to corresponding saved evidences
      for (const p of approvedProblems) {
        const [insertedProblem] = await db
          .insert(schema.problems)
          .values({
            workspaceId,
            title: p.title,
            description: p.description,
            impactLevel: p.impact_level,
            status: p.status || 'identified',
          })
          .returning();

        const linkedEvidences: Evidence[] = [];

        // Link evidences mapped by local index
        if (p.supporting_evidence_local_indices && p.supporting_evidence_local_indices.length > 0) {
          for (const idx of p.supporting_evidence_local_indices) {
            const targetEvidence = savedEvidences[idx];
            if (targetEvidence) {
              await db
                .insert(schema.problemEvidences)
                .values({
                  workspaceId,
                  problemId: insertedProblem.id,
                  evidenceId: targetEvidence.id,
                })
                .onConflictDoNothing();
              linkedEvidences.push(targetEvidence);
            }
          }
        }

        savedProblems.push({
          id: insertedProblem.id,
          workspace_id: insertedProblem.workspaceId,
          title: insertedProblem.title,
          description: insertedProblem.description,
          impact_level: insertedProblem.impactLevel as any,
          status: insertedProblem.status as any,
          evidences: linkedEvidences,
          created_at: insertedProblem.createdAt.toISOString(),
          updated_at: insertedProblem.updatedAt.toISOString(),
        });
      }

      return {
        saved_evidences: savedEvidences,
        saved_problems: savedProblems,
      };
    } catch (err: any) {
      console.error('Postgres saveApprovedAnalysis error:', err instanceof Error ? err.message : err);
      throw err;
    }
  }
}

export const dbStore = new PostgresStore();
