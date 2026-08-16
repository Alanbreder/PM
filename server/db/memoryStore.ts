import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
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
  DecisionStatus,
  ProductInsight,
  InsightStatus,
  DiscoveryHealthMetrics,
  RoadmapItem,
  CreateRoadmapItemInput,
  UpdateRoadmapItemInput,
  RoadmapLineage,
} from '../types/index.js';
import { BusinessRuleError } from '../utils/errors.js';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

interface SchemaData {
  users: User[];
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  researches: Research[];
  evidences: Evidence[];
  problems: Problem[];
  problemEvidences: { id: string; workspace_id: string; problem_id: string; evidence_id: string }[];
  opportunities: Opportunity[];
  opportunityProblems: { id: string; workspace_id: string; opportunity_id: string; problem_id: string }[];
  hypotheses: Hypothesis[];

  experiments: Experiment[];
  decisions: Decision[];
  insights: ProductInsight[];
  roadmapItems: RoadmapItem[];
}

function getInitialData(): SchemaData {
  const defaultWsId = 'ws_default_123';
  const defaultUserId = 'usr_demo_admin';
  const resId = 'res_demo_001';
  const evId = 'ev_demo_001';
  const probId = 'prob_demo_001';
  const opId = 'op_demo_001';
  const hypId = 'hyp_demo_001';
  const expId = 'exp_demo_001';
  const decId = 'dec_demo_001';
  const roadId = 'road_demo_001';
  const now = new Date().toISOString();


  return {
    users: [
      {
        uid: defaultUserId,
        email: 'demo@productos.io',
        name: 'Demo Admin',
      },
    ],
    workspaces: [
      {
        id: defaultWsId,
        name: 'Workspace Principal',
        slug: 'workspace-principal',
        description: 'Workspace padrão para Descoberta de Produto & Decisões OS',
        role: 'owner',
        created_at: now,
      },
    ],
    workspaceMembers: [
      {
        id: 'wsm_demo_001',
        workspace_id: defaultWsId,
        user_id: defaultUserId,
        role: 'owner',
        created_at: now,
        user_email: 'demo@productos.io',
        user_name: 'Demo Admin',
      },
    ],
    researches: [
      {
        id: resId,
        workspace_id: defaultWsId,
        title: 'Entrevistas de Onboarding e Retenção B2B',
        objective: 'Compreender os gargalos de usabilidade e adesão inicial na plataforma',
        target_audience: 'Gerentes de Produto e Líderes Técnicos',
        raw_notes: 'Usuários relatam dificuldade no fluxo de configuração de integrações. Falta de clareza nos erros de conexão.',
        key_findings: [
          'Dificuldade no fluxo de onboarding inicial',
          'Mensagens de erro genéricas causam suporte recorrente',
        ],
        suggested_problems: [
          {
            title: 'Configuração de integrações complexa',
            description: 'Usuários abandonam a configuração inicial por erros de validação obscuros.',
            impact: 'high',
            evidence: 'Entrevistas de Onboarding',
          },
        ],
        analysis_status: 'completed',
        status: 'analyzed',
        created_at: now,
        updated_at: now,
      },
    ],
    evidences: [
      {
        id: evId,
        workspace_id: defaultWsId,
        research_id: resId,
        content: '68% dos usuários abandonam a tentativa de conexão na primeira falha sem log detalhado.',
        source: 'Pesquisa de UX & Logs de Suporte',
        impact_score: 4,
        tags: ['onboarding', 'ux', 'integracao'],
        created_at: now,
      },
    ],
    problems: [
      {
        id: probId,
        workspace_id: defaultWsId,
        title: 'Alta taxa de fricção e abandono no Setup de Integrações',
        description: 'Os clientes não conseguem diagnosticar por que a integração falhou, gerando chamados repetitivos.',
        impact: 'high',
        frequency: 'constant',
        status: 'validated',
        score: 85,
        created_at: now,
        updated_at: now,
      },
    ],
    problemEvidences: [
      {
        id: 'pe_demo_001',
        workspace_id: defaultWsId,
        problem_id: probId,
        evidence_id: evId,
      },
    ],
    opportunities: [
      {
        id: opId,
        workspace_id: defaultWsId,
        title: 'Assistente de Validação de Integração com Diagnóstico em Tempo Real',
        description: 'Testar credenciais em tempo real com mensagens explicativas de correção.',
        effort: 'medium',
        value: 'high',
        score: 85,
        status: 'prioritized',
        created_at: now,
        updated_at: now,
      },
    ],
    opportunityProblems: [
      {
        id: 'op_prob_demo_001',
        workspace_id: defaultWsId,
        opportunity_id: opId,
        problem_id: probId,
      },
    ],
    hypotheses: [

      {
        id: hypId,
        workspace_id: defaultWsId,
        opportunity_id: opId,
        title: 'Validacao de credenciais online reduz chamados em 40%',
        statement: 'Se oferecermos checagem automatizada no formulário, então a taxa de erro cairá porque o usuário corrige no ato.',
        metrics_to_validate: 'Taxa de conclusão do setup > 85%',
        confidence_score: 4,
        status: 'in_testing',
        created_at: now,
        updated_at: now,
      },
    ],
    experiments: [
      {
        id: expId,
        workspace_id: defaultWsId,
        hypothesis_id: hypId,
        title: 'Teste A/B com Validador de Credenciais no Onboarding',
        description: 'Protótipo interativo com checagem assíncrona de credenciais antes do envio.',
        methodology: 'Teste A/B com 500 usuários ativos',
        sample_size: 500,
        status: 'completed',
        results: 'A taxa de erro caiu de 32% para 7% no grupo B, e o tempo médio de setup reduziu em 60%.',
        learnings: 'Feedback imediato reduz ansiedade do usuário e elimina chamados ao suporte técnico.',
        created_at: now,
        updated_at: now,
      },
    ],
    decisions: [
      {
        id: decId,
        workspace_id: defaultWsId,
        experiment_id: expId,
        title: 'Aprovar e Implementar Validador em Tempo Real no Produto',
        description: 'Com base na redução comprovada de erros de 32% para 7% no experimento.',
        decision: 'approved',
        rationale: 'O impacto no sucesso do onboarding é expressivo e reduz custos diretos de suporte.',
        status: 'accepted',
        created_at: now,
        updated_at: now,
      },
    ],
    insights: [],
    roadmapItems: [
      {
        id: roadId,
        workspace_id: defaultWsId,
        title: 'Assistente Validador de Configuração em Tempo Real',
        description: 'Implementar validação proativa de credenciais e rotas de webhook no fluxo de setup inicial.',
        timeframe: 'now',
        status: 'in_progress',
        priority: 'high',
        target_quarter: '2026-Q3',
        decision_id: decId,
        opportunity_id: opId,
        metrics_target: 'Reduzir tickets de suporte no setup em 70% e aumentar conversão para 88%',
        progress: 45,
        owner_name: 'Equipe de Core Platform',
        created_at: now,
        updated_at: now,
      },
    ],
  };
}


export class MemoryStore {
  private data: SchemaData;

  constructor() {
    this.data = this.loadFromFile();
  }

  private loadFromFile(): SchemaData {
    if (process.env.NODE_ENV === 'test' || process.env.PERSIST_MEMORY_TO_FILE !== 'true') {
      return getInitialData();
    }
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('MemoryStore load warning, using initial data:', err);
    }
    return getInitialData();
  }

  private saveToFile(data: SchemaData = this.data): void {
    if (process.env.NODE_ENV === 'test' || process.env.PERSIST_MEMORY_TO_FILE !== 'true') {
      return;
    }
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('MemoryStore save error:', err);
    }
  }

  // Users
  async findOrCreateUser(uid: string, email: string, name?: string): Promise<User> {
    let user = this.data.users.find((u) => u.uid === uid);
    if (!user) {
      user = { uid, email, name };
      this.data.users.push(user);
      this.saveToFile();
    }
    return user;
  }

  // Workspaces
  async listUserWorkspaces(userId: string): Promise<Workspace[]> {
    const memberRows = this.data.workspaceMembers.filter((m) => m.user_id === userId);
    const result: Workspace[] = [];
    for (const m of memberRows) {
      const ws = this.data.workspaces.find((w) => w.id === m.workspace_id);
      if (ws) {
        result.push({
          ...ws,
          role: m.role,
        });
      }
    }
    return result;
  }

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    const ws = this.data.workspaces.find((w) => w.id === id);
    if (!ws) return null;
    return { ...ws };
  }

  async createWorkspace(name: string, userId: string, description?: string): Promise<Workspace> {
    const id = `ws_${randomUUID()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();

    const workspace: Workspace = {
      id,
      name,
      slug,
      description,
      role: 'owner',
      created_at: now,
    };

    this.data.workspaces.push(workspace);

    const user = this.data.users.find((u) => u.uid === userId);
    this.data.workspaceMembers.push({
      id: `wsm_${randomUUID()}`,
      workspace_id: id,
      user_id: userId,
      role: 'owner',
      created_at: now,
      user_email: user?.email,
      user_name: user?.name,
    });

    this.saveToFile();
    return workspace;
  }

  async getWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    const member = this.data.workspaceMembers.find(
      (m) => m.workspace_id === workspaceId && m.user_id === userId
    );
    return member ? { ...member } : null;
  }

  async addWorkspaceMember(workspaceId: string, userId: string, role: WorkspaceRole = 'member'): Promise<WorkspaceMember> {
    const existing = await this.getWorkspaceMember(workspaceId, userId);
    if (existing) {
      throw new BusinessRuleError('Usuário já é membro deste workspace');
    }

    const user = this.data.users.find((u) => u.uid === userId);
    const now = new Date().toISOString();
    const newMember: WorkspaceMember = {
      id: `wsm_${randomUUID()}`,
      workspace_id: workspaceId,
      user_id: userId,
      role,
      created_at: now,
      user_email: user?.email,
      user_name: user?.name,
    };

    this.data.workspaceMembers.push(newMember);
    this.saveToFile();
    return newMember;
  }

  async listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.data.workspaceMembers
      .filter((m) => m.workspace_id === workspaceId)
      .map((m) => {
        const u = this.data.users.find((usr) => usr.uid === m.user_id);
        return {
          ...m,
          user_email: u?.email || m.user_email,
          user_name: u?.name || m.user_name,
        };
      });
  }

  async updateMemberRole(workspaceId: string, userId: string, newRole: WorkspaceRole): Promise<WorkspaceMember> {
    const memberIndex = this.data.workspaceMembers.findIndex(
      (m) => m.workspace_id === workspaceId && m.user_id === userId
    );
    if (memberIndex === -1) {
      throw new BusinessRuleError('Membro não encontrado no workspace.');
    }

    const member = this.data.workspaceMembers[memberIndex];
    if (member.role === 'owner' && newRole !== 'owner') {
      const members = this.data.workspaceMembers.filter((m) => m.workspace_id === workspaceId && m.role === 'owner');
      if (members.length <= 1) {
        throw new BusinessRuleError('Não é possível rebaixar o único proprietário do workspace.');
      }
    }

    this.data.workspaceMembers[memberIndex].role = newRole;
    this.saveToFile();
    return { ...this.data.workspaceMembers[memberIndex] };
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const member = await this.getWorkspaceMember(workspaceId, userId);
    if (!member) {
      throw new BusinessRuleError('Membro não encontrado no workspace.');
    }

    if (member.role === 'owner') {
      const owners = this.data.workspaceMembers.filter((m) => m.workspace_id === workspaceId && m.role === 'owner');
      if (owners.length <= 1) {
        throw new BusinessRuleError('Não é possível remover o único proprietário do workspace.');
      }
    }

    this.data.workspaceMembers = this.data.workspaceMembers.filter(
      (m) => !(m.workspace_id === workspaceId && m.user_id === userId)
    );
    this.saveToFile();
  }

  // Researches
  async listResearches(workspaceId: string): Promise<Research[]> {
    return this.data.researches
      .filter((r) => r.workspace_id === workspaceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getResearchById(workspaceId: string, researchId: string): Promise<Research | null> {
    const r = this.data.researches.find(
      (item) => item.id === researchId && item.workspace_id === workspaceId
    );
    return r ? { ...r } : null;
  }

  async createResearch(workspaceId: string, data: CreateResearchInput): Promise<Research> {
    const now = new Date().toISOString();
    const research: Research = {
      id: `res_${randomUUID()}`,
      workspace_id: workspaceId,
      title: data.title,
      objective: data.objective,
      target_audience: data.target_audience,
      raw_notes: data.raw_notes,
      analysis_status: 'pending',
      status: 'draft',
      created_at: now,
      updated_at: now,
    };

    this.data.researches.push(research);
    this.saveToFile();
    return research;
  }

  async updateResearch(workspaceId: string, researchId: string, data: Partial<Research>): Promise<Research> {
    const idx = this.data.researches.findIndex(
      (r) => r.id === researchId && r.workspace_id === workspaceId
    );
    if (idx === -1) {
      throw new BusinessRuleError('Pesquisa não encontrada.');
    }

    const current = this.data.researches[idx];
    const updated: Research = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.data.researches[idx] = updated;
    this.saveToFile();
    return updated;
  }

  // Evidences
  async listEvidences(workspaceId: string, researchId?: string): Promise<Evidence[]> {
    return this.data.evidences
      .filter((e) => {
        if (e.workspace_id !== workspaceId) return false;
        if (researchId && e.research_id !== researchId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createEvidence(workspaceId: string, data: CreateEvidenceInput): Promise<Evidence> {
    const research = await this.getResearchById(workspaceId, data.research_id);
    if (!research) {
      throw new BusinessRuleError('Pesquisa não encontrada neste workspace.');
    }

    const now = new Date().toISOString();
    const evidence: Evidence = {
      id: `ev_${randomUUID()}`,
      workspace_id: workspaceId,
      research_id: data.research_id,
      content: data.content,
      source: data.source,
      impact_score: data.impact_score || 3,
      tags: data.tags,
      created_at: now,
    };

    this.data.evidences.push(evidence);
    this.saveToFile();
    return evidence;
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
    return this.data.problems
      .filter((p) => p.workspace_id === workspaceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getProblemById(workspaceId: string, problemId: string): Promise<Problem | null> {
    const p = this.data.problems.find(
      (item) => item.id === problemId && item.workspace_id === workspaceId
    );
    return p ? { ...p } : null;
  }

  async createProblem(workspaceId: string, data: CreateProblemInput): Promise<Problem> {
    const now = new Date().toISOString();
    const problem: Problem = {
      id: `prob_${randomUUID()}`,
      workspace_id: workspaceId,
      title: data.title,
      description: data.description,
      impact: data.impact,
      frequency: data.frequency,
      status: 'identified',
      score: data.impact === 'critical' || data.impact === 'high' ? 85 : 50,
      created_at: now,
      updated_at: now,
    };

    this.data.problems.push(problem);

    if (data.evidence_ids && data.evidence_ids.length > 0) {
      for (const evId of data.evidence_ids) {
        this.data.problemEvidences.push({
          id: `pe_${randomUUID()}`,
          workspace_id: workspaceId,
          problem_id: problem.id,
          evidence_id: evId,
        });
      }
    }

    this.saveToFile();
    return problem;
  }

  async updateProblem(workspaceId: string, problemId: string, data: UpdateProblemInput): Promise<Problem> {
    const idx = this.data.problems.findIndex(
      (p) => p.id === problemId && p.workspace_id === workspaceId
    );
    if (idx === -1) {
      throw new BusinessRuleError('Problema não encontrado neste workspace.');
    }

    const current = this.data.problems[idx];
    const updated: Problem = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.data.problems[idx] = updated;
    this.saveToFile();
    return updated;
  }

  async linkProblemEvidences(workspaceId: string, problemId: string, evidenceIds: string[]): Promise<void> {
    const problem = await this.getProblemById(workspaceId, problemId);
    if (!problem) throw new BusinessRuleError('Problema não encontrado.');

    for (const evId of evidenceIds) {
      const exists = this.data.problemEvidences.some(
        (pe) => pe.problem_id === problemId && pe.evidence_id === evId
      );
      if (!exists) {
        this.data.problemEvidences.push({
          id: `pe_${randomUUID()}`,
          workspace_id: workspaceId,
          problem_id: problemId,
          evidence_id: evId,
        });
      }
    }
    this.saveToFile();
  }

  // Opportunities
  async listOpportunities(workspaceId: string): Promise<Opportunity[]> {
    return this.data.opportunities
      .filter((o) => o.workspace_id === workspaceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getOpportunityById(workspaceId: string, opportunityId: string): Promise<Opportunity | null> {
    const o = this.data.opportunities.find(
      (item) => item.id === opportunityId && item.workspace_id === workspaceId
    );
    return o ? { ...o } : null;
  }

  async createOpportunity(workspaceId: string, data: CreateOpportunityInput): Promise<Opportunity> {
    const now = new Date().toISOString();
    const opportunity: Opportunity = {
      id: `op_${randomUUID()}`,
      workspace_id: workspaceId,
      title: data.title,
      description: data.description,
      effort: data.effort,
      value: data.value,
      score: data.value === 'transformative' ? 95 : data.value === 'high' ? 80 : 50,
      status: 'backlog',
      created_at: now,
      updated_at: now,
    };

    this.data.opportunities.push(opportunity);

    if (data.problem_ids && data.problem_ids.length > 0) {
      if (!this.data.opportunityProblems) this.data.opportunityProblems = [];
      for (const pId of data.problem_ids) {
        this.data.opportunityProblems.push({
          id: `op_p_${randomUUID()}`,
          workspace_id: workspaceId,
          opportunity_id: opportunity.id,
          problem_id: pId,
        });
      }
    }

    this.saveToFile();
    return opportunity;
  }

  async linkOpportunityProblems(
    workspaceId: string,
    opportunityId: string,
    problemIds: string[]
  ): Promise<void> {
    const opp = await this.getOpportunityById(workspaceId, opportunityId);
    if (!opp) throw new BusinessRuleError('Oportunidade não encontrada.');

    if (!this.data.opportunityProblems) this.data.opportunityProblems = [];
    for (const pId of problemIds) {
      const exists = this.data.opportunityProblems.some(
        (op) => op.opportunity_id === opportunityId && op.problem_id === pId && op.workspace_id === workspaceId
      );
      if (!exists) {
        this.data.opportunityProblems.push({
          id: `op_p_${randomUUID()}`,
          workspace_id: workspaceId,
          opportunity_id: opportunityId,
          problem_id: pId,
        });
      }
    }
    this.saveToFile();
  }


  async updateOpportunity(
    workspaceId: string,
    opportunityId: string,
    data: UpdateOpportunityInput
  ): Promise<Opportunity> {
    const idx = this.data.opportunities.findIndex(
      (o) => o.id === opportunityId && o.workspace_id === workspaceId
    );
    if (idx === -1) throw new BusinessRuleError('Oportunidade não encontrada.');

    const current = this.data.opportunities[idx];
    const updated: Opportunity = {
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
    };

    this.data.opportunities[idx] = updated;
    this.saveToFile();
    return updated;
  }

  // Hypotheses
  async listHypotheses(workspaceId: string, opportunityId?: string): Promise<Hypothesis[]> {
    return this.data.hypotheses
      .filter((h) => {
        if (h.workspace_id !== workspaceId) return false;
        if (opportunityId && h.opportunity_id !== opportunityId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getHypothesisById(workspaceId: string, hypothesisId: string): Promise<Hypothesis | null> {
    const h = this.data.hypotheses.find(
      (item) => item.id === hypothesisId && item.workspace_id === workspaceId
    );
    return h ? { ...h } : null;
  }

  async createHypothesis(workspaceId: string, data: CreateHypothesisInput): Promise<Hypothesis> {
    const op = await this.getOpportunityById(workspaceId, data.opportunity_id);
    if (!op) throw new BusinessRuleError('Oportunidade não encontrada neste workspace.');

    const now = new Date().toISOString();
    const hypothesis: Hypothesis = {
      id: `hyp_${randomUUID()}`,
      workspace_id: workspaceId,
      opportunity_id: data.opportunity_id,
      title: data.title,
      statement: data.statement,
      metrics_to_validate: data.metrics_to_validate,
      confidence_score: data.confidence_score || 3,
      status: 'draft',
      created_at: now,
      updated_at: now,
    };

    this.data.hypotheses.push(hypothesis);
    this.saveToFile();
    return hypothesis;
  }

  async updateHypothesis(
    workspaceId: string,
    hypothesisId: string,
    data: Partial<CreateHypothesisInput> & { status?: string }
  ): Promise<Hypothesis> {
    const idx = this.data.hypotheses.findIndex(
      (h) => h.id === hypothesisId && h.workspace_id === workspaceId
    );
    if (idx === -1) throw new BusinessRuleError('Hipótese não encontrada.');

    const current = this.data.hypotheses[idx];
    const updated: Hypothesis = {
      ...current,
      ...data,
      status: (data.status as any) || current.status,
      updated_at: new Date().toISOString(),
    };

    this.data.hypotheses[idx] = updated;
    this.saveToFile();
    return updated;
  }

  // Experiments
  async listExperiments(workspaceId: string, hypothesisId?: string): Promise<Experiment[]> {
    return this.data.experiments
      .filter((e) => {
        if (e.workspace_id !== workspaceId) return false;
        if (hypothesisId && e.hypothesis_id !== hypothesisId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getExperimentById(workspaceId: string, experimentId: string): Promise<Experiment | null> {
    const exp = this.data.experiments.find(
      (item) => item.id === experimentId && item.workspace_id === workspaceId
    );
    return exp ? { ...exp } : null;
  }

  async createExperiment(workspaceId: string, data: CreateExperimentInput): Promise<Experiment> {
    const hyp = await this.getHypothesisById(workspaceId, data.hypothesis_id);
    if (!hyp) throw new BusinessRuleError('Hipótese não encontrada neste workspace.');

    const now = new Date().toISOString();
    const experiment: Experiment = {
      id: `exp_${randomUUID()}`,
      workspace_id: workspaceId,
      hypothesis_id: data.hypothesis_id,
      title: data.title,
      description: data.description,
      methodology: data.methodology,
      sample_size: data.sample_size,
      status: 'draft',
      created_at: now,
      updated_at: now,
    };

    this.data.experiments.push(experiment);
    this.saveToFile();
    return experiment;
  }

  async updateExperiment(
    workspaceId: string,
    experimentId: string,
    data: UpdateExperimentInput
  ): Promise<Experiment> {
    const idx = this.data.experiments.findIndex(
      (e) => e.id === experimentId && e.workspace_id === workspaceId
    );
    if (idx === -1) throw new BusinessRuleError('Experimento não encontrado.');

    const current = this.data.experiments[idx];
    const updated: Experiment = {
      ...current,
      ...data,
      status: (data.status as any) || current.status,
      updated_at: new Date().toISOString(),
    };

    this.data.experiments[idx] = updated;
    this.saveToFile();
    return updated;
  }

  // Decisions
  async listDecisions(workspaceId: string, experimentId?: string, status?: string): Promise<Decision[]> {
    return this.data.decisions
      .filter((d) => {
        if (d.workspace_id !== workspaceId) return false;
        if (experimentId && d.experiment_id !== experimentId) return false;
        if (status && d.status !== status) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getDecisionById(workspaceId: string, decisionId: string): Promise<Decision | null> {
    const d = this.data.decisions.find(
      (item) => item.id === decisionId && item.workspace_id === workspaceId
    );
    return d ? { ...d } : null;
  }

  async createDecision(workspaceId: string, data: CreateDecisionInput): Promise<Decision> {
    const exp = await this.getExperimentById(workspaceId, data.experiment_id);
    if (!exp) throw new BusinessRuleError('Experimento não encontrado neste workspace.');

    const now = new Date().toISOString();
    const status: DecisionStatus = data.decision === 'approved' ? 'accepted' : data.decision === 'discarded' ? 'rejected' : 'pending';

    const decision: Decision = {
      id: `dec_${randomUUID()}`,
      workspace_id: workspaceId,
      experiment_id: data.experiment_id,
      title: data.title,
      description: data.description,
      decision: data.decision,
      rationale: data.rationale,
      status,
      created_at: now,
      updated_at: now,
    };

    this.data.decisions.push(decision);
    this.saveToFile();
    return decision;
  }

  async updateDecision(
    workspaceId: string,
    decisionId: string,
    data: Partial<CreateDecisionInput> & { status?: DecisionStatus }
  ): Promise<Decision> {
    const idx = this.data.decisions.findIndex(
      (d) => d.id === decisionId && d.workspace_id === workspaceId
    );
    if (idx === -1) throw new BusinessRuleError('Decisão não encontrada.');

    const current = this.data.decisions[idx];
    const updated: Decision = {
      ...current,
      ...data,
      status: (data.status as DecisionStatus) || current.status,
      updated_at: new Date().toISOString(),
    };

    this.data.decisions[idx] = updated;
    this.saveToFile();
    return updated;
  }

  async deleteDecision(workspaceId: string, decisionId: string): Promise<void> {
    const idx = this.data.decisions.findIndex(
      (d) => d.id === decisionId && d.workspace_id === workspaceId
    );
    if (idx === -1) throw new BusinessRuleError('Decisão não encontrada.');

    this.data.decisions.splice(idx, 1);
    this.saveToFile();
  }

  // ETAPA 7: PRODUCT INSIGHTS & DISCOVERY HEALTH
  async getInsights(workspaceId: string, status?: InsightStatus): Promise<ProductInsight[]> {
    if (!this.data.insights) this.data.insights = [];
    return this.data.insights.filter(
      (i) => i.workspace_id === workspaceId && (!status || i.status === status)
    );
  }

  async saveInsights(workspaceId: string, insights: ProductInsight[]): Promise<ProductInsight[]> {
    if (!this.data.insights) this.data.insights = [];
    // Remove existing 'suggested' insights when generating new ones to avoid duplicate suggestions
    this.data.insights = this.data.insights.filter(
      (i) => !(i.workspace_id === workspaceId && i.status === 'suggested')
    );
    this.data.insights.push(...insights);
    this.saveToFile();
    return insights;
  }

  async updateInsightStatus(
    workspaceId: string,
    insightId: string,
    status: InsightStatus,
    feedbackNotes?: string
  ): Promise<ProductInsight> {
    if (!this.data.insights) this.data.insights = [];
    const idx = this.data.insights.findIndex(
      (i) => i.id === insightId && i.workspace_id === workspaceId
    );
    if (idx === -1) throw new BusinessRuleError('Insight não encontrado.');

    const current = this.data.insights[idx];
    const updated: ProductInsight = {
      ...current,
      status,
      feedback_notes: feedbackNotes !== undefined ? feedbackNotes : current.feedback_notes,
      updated_at: new Date().toISOString(),
    };

    this.data.insights[idx] = updated;
    this.saveToFile();
    return updated;
  }

  async getDiscoveryHealth(workspaceId: string): Promise<DiscoveryHealthMetrics> {
    const researches = this.data.researches.filter((r) => r.workspace_id === workspaceId);
    const evidences = this.data.evidences.filter((e) => e.workspace_id === workspaceId);
    const problems = this.data.problems.filter((p) => p.workspace_id === workspaceId);
    const opportunities = this.data.opportunities.filter((o) => o.workspace_id === workspaceId);
    const hypotheses = this.data.hypotheses.filter((h) => h.workspace_id === workspaceId);
    const experiments = this.data.experiments.filter((ex) => ex.workspace_id === workspaceId);
    const decisions = this.data.decisions.filter((d) => d.workspace_id === workspaceId);

    const problemEvidences = this.data.problemEvidences.filter((pe) => pe.workspace_id === workspaceId);

    // Conversions
    const validatedProblems = problems.filter((p) => p.status === 'validated' || p.status === 'solved').length;
    const testedHypotheses = hypotheses.filter((h) => h.status === 'validated' || h.status === 'invalidated').length;

    const rToEvRatio = researches.length > 0 ? Number((evidences.length / researches.length).toFixed(2)) : 0;
    const probValRatio = problems.length > 0 ? Number((validatedProblems / problems.length).toFixed(2)) : 0;
    const hypTestRatio = hypotheses.length > 0 ? Number((testedHypotheses / hypotheses.length).toFixed(2)) : 0;
    const expDecRatio = experiments.length > 0 ? Number((decisions.length / experiments.length).toFixed(2)) : 0;

    // Risk Indicators
    // 1. Decisions linked to experiments whose hypothesis has no evidence on problem
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
      // Check if opportunity linked to problem has evidence
      const opp = opportunities.find((o) => o.id === hyp.opportunity_id);
      if (!opp) {
        decisionsWithoutEvidenceCount++;
        continue;
      }
      // Check evidences
      const linkedProbIds = new Set(problemEvidences.map((pe) => pe.problem_id));
      const hasEvidence = linkedProbIds.size > 0 || evidences.length > 0;
      if (!hasEvidence) {
        decisionsWithoutEvidenceCount++;
      }
    }

    // 2. Unvalidated hypotheses without experiments
    const unvalidatedHypothesesCount = hypotheses.filter((h) => {
      const exp = experiments.find((e) => e.hypothesis_id === h.id);
      return !exp && (h.status === 'draft' || h.status === 'in_testing');
    }).length;

    // 3. Inconclusive or cancelled experiments
    const inconclusiveExperimentsCount = experiments.filter(
      (e) => e.status === 'cancelled' || (e.status === 'completed' && (!e.results || e.results.trim().length < 10))
    ).length;

    // 4. Orphaned problems (no evidence attached)
    const problemsWithEvidence = new Set(problemEvidences.map((pe) => pe.problem_id));
    const orphanedProblemsCount = problems.filter((p) => !problemsWithEvidence.has(p.id) && (p.evidence_count || 0) === 0).length;

    // Calculate Health Score (0 - 100)
    let score = 100;
    score -= decisionsWithoutEvidenceCount * 12;
    score -= unvalidatedHypothesesCount * 6;
    score -= inconclusiveExperimentsCount * 8;
    score -= orphanedProblemsCount * 5;

    // Reward completed full discovery loops
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

  // ETAPA 8: ROADMAP & STRATEGIC INITIATIVES
  async listRoadmapItems(
    workspaceId: string,
    timeframe?: string,
    status?: string
  ): Promise<RoadmapItem[]> {
    if (!this.data.roadmapItems) this.data.roadmapItems = [];
    const items = this.data.roadmapItems.filter(
      (item) =>
        item.workspace_id === workspaceId &&
        (!timeframe || item.timeframe === timeframe) &&
        (!status || item.status === status)
    );

    // Attach computed titles
    return items.map((item) => {
      const decision = item.decision_id
        ? this.data.decisions.find((d) => d.id === item.decision_id && d.workspace_id === workspaceId)
        : undefined;
      const opportunity = item.opportunity_id
        ? this.data.opportunities.find((o) => o.id === item.opportunity_id && o.workspace_id === workspaceId)
        : undefined;
      return {
        ...item,
        decision_title: decision?.title,
        opportunity_title: opportunity?.title,
      };
    });
  }

  async getRoadmapItemById(workspaceId: string, id: string): Promise<RoadmapItem | null> {
    if (!this.data.roadmapItems) this.data.roadmapItems = [];
    const item = this.data.roadmapItems.find(
      (i) => i.id === id && i.workspace_id === workspaceId
    );
    if (!item) return null;

    const decision = item.decision_id
      ? this.data.decisions.find((d) => d.id === item.decision_id && d.workspace_id === workspaceId)
      : undefined;
    const opportunity = item.opportunity_id
      ? this.data.opportunities.find((o) => o.id === item.opportunity_id && o.workspace_id === workspaceId)
      : undefined;

    return {
      ...item,
      decision_title: decision?.title,
      opportunity_title: opportunity?.title,
    };
  }

  async createRoadmapItem(
    workspaceId: string,
    input: CreateRoadmapItemInput
  ): Promise<RoadmapItem> {
    if (!this.data.roadmapItems) this.data.roadmapItems = [];

    // Multi-tenant foreign reference validation
    if (input.decision_id) {
      const decision = this.data.decisions.find(
        (d) => d.id === input.decision_id && d.workspace_id === workspaceId
      );
      if (!decision) {
        throw new BusinessRuleError('A decisão selecionada não existe neste workspace.');
      }
    }

    if (input.opportunity_id) {
      const opportunity = this.data.opportunities.find(
        (o) => o.id === input.opportunity_id && o.workspace_id === workspaceId
      );
      if (!opportunity) {
        throw new BusinessRuleError('A oportunidade selecionada não existe neste workspace.');
      }
    }

    const now = new Date().toISOString();
    const newItem: RoadmapItem = {
      id: randomUUID(),
      workspace_id: workspaceId,
      title: input.title.trim(),
      description: input.description?.trim(),
      timeframe: input.timeframe || 'now',
      status: input.status || 'planned',
      priority: input.priority || 'medium',
      target_quarter: input.target_quarter?.trim(),
      decision_id: input.decision_id || undefined,
      opportunity_id: input.opportunity_id || undefined,
      metrics_target: input.metrics_target?.trim(),
      progress: Math.min(100, Math.max(0, input.progress ?? 0)),
      owner_name: input.owner_name?.trim(),
      created_at: now,
      updated_at: now,
    };

    this.data.roadmapItems.unshift(newItem);
    this.saveToFile();
    return this.getRoadmapItemById(workspaceId, newItem.id) as Promise<RoadmapItem>;
  }

  async updateRoadmapItem(
    workspaceId: string,
    id: string,
    input: UpdateRoadmapItemInput
  ): Promise<RoadmapItem> {
    if (!this.data.roadmapItems) this.data.roadmapItems = [];
    const index = this.data.roadmapItems.findIndex(
      (i) => i.id === id && i.workspace_id === workspaceId
    );
    if (index === -1) {
      throw new BusinessRuleError('Iniciativa de Roadmap não encontrada.');
    }

    if (input.decision_id) {
      const decision = this.data.decisions.find(
        (d) => d.id === input.decision_id && d.workspace_id === workspaceId
      );
      if (!decision) {
        throw new BusinessRuleError('A decisão selecionada não existe neste workspace.');
      }
    }

    if (input.opportunity_id) {
      const opportunity = this.data.opportunities.find(
        (o) => o.id === input.opportunity_id && o.workspace_id === workspaceId
      );
      if (!opportunity) {
        throw new BusinessRuleError('A oportunidade selecionada não existe neste workspace.');
      }
    }

    const current = this.data.roadmapItems[index];
    const updated: RoadmapItem = {
      ...current,
      title: input.title !== undefined ? input.title.trim() : current.title,
      description: input.description !== undefined ? input.description?.trim() : current.description,
      timeframe: input.timeframe !== undefined ? input.timeframe : current.timeframe,
      status: input.status !== undefined ? input.status : current.status,
      priority: input.priority !== undefined ? input.priority : current.priority,
      target_quarter: input.target_quarter !== undefined ? input.target_quarter?.trim() : current.target_quarter,
      decision_id: input.decision_id !== undefined ? (input.decision_id || undefined) : current.decision_id,
      opportunity_id: input.opportunity_id !== undefined ? (input.opportunity_id || undefined) : current.opportunity_id,
      metrics_target: input.metrics_target !== undefined ? input.metrics_target?.trim() : current.metrics_target,
      progress: input.progress !== undefined ? Math.min(100, Math.max(0, input.progress)) : current.progress,
      owner_name: input.owner_name !== undefined ? input.owner_name?.trim() : current.owner_name,
      updated_at: new Date().toISOString(),
    };

    this.data.roadmapItems[index] = updated;
    this.saveToFile();
    return this.getRoadmapItemById(workspaceId, id) as Promise<RoadmapItem>;
  }

  async deleteRoadmapItem(workspaceId: string, id: string): Promise<void> {
    if (!this.data.roadmapItems) this.data.roadmapItems = [];
    const index = this.data.roadmapItems.findIndex(
      (i) => i.id === id && i.workspace_id === workspaceId
    );
    if (index === -1) {
      throw new BusinessRuleError('Iniciativa de Roadmap não encontrada.');
    }
    this.data.roadmapItems.splice(index, 1);
    this.saveToFile();
  }

  async getRoadmapItemLineage(workspaceId: string, id: string): Promise<RoadmapLineage> {
    const item = await this.getRoadmapItemById(workspaceId, id);
    if (!item) {
      throw new BusinessRuleError('Iniciativa de Roadmap não encontrada.');
    }

    let decision: Decision | undefined;
    let experiment: Experiment | undefined;
    let hypothesis: Hypothesis | undefined;
    let opportunity: Opportunity | undefined;
    const problemIds = new Set<string>();

    if (item.decision_id) {
      decision = this.data.decisions.find(
        (d) => d.id === item.decision_id && d.workspace_id === workspaceId
      );
      if (decision) {
        experiment = this.data.experiments.find(
          (e) => e.id === decision!.experiment_id && e.workspace_id === workspaceId
        );
        if (experiment) {
          hypothesis = this.data.hypotheses.find(
            (h) => h.id === experiment!.hypothesis_id && h.workspace_id === workspaceId
          );
          if (hypothesis) {
            opportunity = this.data.opportunities.find(
              (o) => o.id === hypothesis!.opportunity_id && o.workspace_id === workspaceId
            );
          }
        }
      }
    }

    if (!opportunity && item.opportunity_id) {
      opportunity = this.data.opportunities.find(
        (o) => o.id === item.opportunity_id && o.workspace_id === workspaceId
      );
    }

    // Resolve Problems linked to Opportunity
    if (opportunity) {
      const links = (this.data.opportunityProblems || []).filter(
        (op) => op.opportunity_id === opportunity!.id && op.workspace_id === workspaceId
      );
      for (const l of links) {
        problemIds.add(l.problem_id);
      }
    }


    const problems = this.data.problems.filter(
      (p) => p.workspace_id === workspaceId && problemIds.has(p.id)
    );

    // Resolve Evidences linked to Problems
    const evidenceIds = new Set<string>();
    for (const p of problems) {
      const peLinks = this.data.problemEvidences.filter(
        (pe) => pe.problem_id === p.id && pe.workspace_id === workspaceId
      );
      for (const l of peLinks) {
        evidenceIds.add(l.evidence_id);
      }
    }

    const evidences = this.data.evidences.filter(
      (e) => e.workspace_id === workspaceId && evidenceIds.has(e.id)
    );

    // Resolve Researches linked to Evidences
    const researchIds = new Set(evidences.map((e) => e.research_id));
    const researches = this.data.researches.filter(
      (r) => r.workspace_id === workspaceId && researchIds.has(r.id)
    );

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
  }
}


