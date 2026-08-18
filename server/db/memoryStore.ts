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
  UpdateToolkitCanvasInput,
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
  objectives: Objective[];
  keyResults: KeyResult[];
  opportunityObjectives: { id: string; workspace_id: string; opportunity_id: string; objective_id: string; kr_id?: string }[];
  prioritizations: Prioritization[];
  personas: Persona[];
  customerSegments: CustomerSegment[];
  entityPersonas: EntityPersonaLink[];
  prds: PRD[];
  outcomeReviews: OutcomeReview[];
  comments: Comment[];
  activityLogs: ActivityLog[];
  toolkitCanvases: ToolkitCanvas[];
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
    objectives: [
      {
        id: 'obj_demo_001',
        workspace_id: defaultWsId,
        title: 'Aumentar a Eficiência e Autonomia no Onboarding de Novos Clientes',
        description: 'Eliminar o atrito inicial de setup de integração para que 80% dos clientes completem a ativação sem intervenção manual.',
        timeframe: '2026-Q3',
        status: 'active',
        progress: 55,
        owner_name: 'Equipe de Crescimento',
        created_at: now,
        updated_at: now,
      },
    ],
    keyResults: [
      {
        id: 'kr_demo_001',
        workspace_id: defaultWsId,
        objective_id: 'obj_demo_001',
        title: 'Aumentar taxa de ativação no primeiro dia',
        metric_name: 'Ativação D1',
        initial_value: 35,
        target_value: 75,
        current_value: 58,
        unit: '%',
        progress: 57,
        status: 'on_track',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'kr_demo_002',
        workspace_id: defaultWsId,
        objective_id: 'obj_demo_001',
        title: 'Reduzir chamados de suporte técnico de primeiro nível',
        metric_name: 'Tickets de Setup',
        initial_value: 120,
        target_value: 30,
        current_value: 65,
        unit: 'tickets/mês',
        progress: 61,
        status: 'on_track',
        created_at: now,
        updated_at: now,
      },
    ],
    opportunityObjectives: [
      {
        id: 'opp_obj_demo_001',
        workspace_id: defaultWsId,
        opportunity_id: opId,
        objective_id: 'obj_demo_001',
        kr_id: 'kr_demo_001',
      },
    ],
    prioritizations: [
      {
        id: 'prio_demo_001',
        workspace_id: defaultWsId,
        opportunity_id: opId,
        framework: 'rice',
        reach: 450,
        impact: 4,
        confidence: 85,
        effort: 3,
        score: 510,
        notes: 'Impacto alto na conversão e esforço moderado focado no frontend.',
        evaluator_name: 'Head de Produto',
        created_at: now,
        updated_at: now,
      },
    ],
    personas: [
      {
        id: 'pers_demo_001',
        workspace_id: defaultWsId,
        name: 'Camila Engenheira',
        role_title: 'Tech Lead / Desenvolvedora de Integrações',
        segment: 'Mid-Market & Enterprise',
        description: 'Responsável técnica por conectar a infraestrutura do cliente aos webhooks e APIs da plataforma.',
        jobs_to_be_done: [
          'Configurar chaves de API sem precisar recorrer à documentação externa em PDF',
          'Testar payloads e webhooks com feedback instantâneo de sucesso ou erro',
          'Garantir conformidade e segurança nas credenciais transmitidas',
        ],
        pains: [
          'Erros opacos de conexão que demandam horas de debug',
          'Falta de validação assíncrona antes do envio de dados reais',
          'Documentação desatualizada em relação à versão deployed',
        ],
        goals: [
          'Concluir setup em menos de 15 minutos',
          'Reduzir retrabalho de suporte com time de produto',
        ],
        behaviors: [
          'Prefere ferramentas self-service com logs detalhados e alertas contextuais',
        ],
        created_at: now,
        updated_at: now,
      },
    ],
    customerSegments: [
      {
        id: 'seg_demo_001',
        workspace_id: defaultWsId,
        name: 'Enterprise Tech',
        type: 'enterprise',
        description: 'Empresas de médio e grande porte com equipes técnicas dedicadas de integração.',
        criteria: [
          'Mais de 50 colaboradores',
          'Volume mensal superior a 10.000 requisições',
          'Necessidade de múltiplos ambientes (sandbox e produção)',
        ],
        created_at: now,
        updated_at: now,
      },
    ],
    entityPersonas: [
      {
        id: 'ep_demo_001',
        workspace_id: defaultWsId,
        persona_id: 'pers_demo_001',
        entity_type: 'opportunity',
        entity_id: opId,
        created_at: now,
      },
    ],
    prds: [
      {
        id: 'prd_demo_001',
        workspace_id: defaultWsId,
        roadmap_item_id: roadId,
        title: 'PRD — Validador de Credenciais e Setup em Tempo Real',
        summary: 'Especificação funcional e critérios de aceite para a validação assíncrona proativa no fluxo de integração.',
        problem_statement: 'Usuários desistem do setup após encontrarem erros inesperados de chave de API sem feedback claro.',
        goals: [
          'Validar chaves de API em tempo real durante a digitação',
          'Fornecer mensagens acionáveis com a causa exata do erro',
          'Garantir tempo de resposta de validação inferior a 400ms',
        ],
        non_goals: [
          'Gerenciar renovação automática de certificados SSL de terceiros neste release',
        ],
        user_stories: [
          {
            id: 'us_001',
            asA: 'Desenvolvedora de Integrações',
            iWant: 'verificar se minha chave de API é válida assim que colo no campo',
            soThat: 'eu não precise submeter todo o formulário para descobrir que a chave expirou',
            acceptanceCriteria: [
              'O campo exibe feedback visual verde com ícone de sucesso para chaves válidas',
              'O campo exibe alerta em vermelho com motivo legível em caso de rejeição',
              'Debounce de 500ms antes de disparar a checagem no servidor',
            ],
            status: 'in_progress',
          },
        ],
        technical_notes: 'Utilizar rota assíncrona /api/credentials/verify com rate limiting por IP de 30 req/min.',
        dependencies: [
          'Serviço de Health Check do gateway operacional',
          'Componente de Notificação Toast integrado ao Design System',
        ],
        definition_of_done: [
          'Cobertura de testes unitários > 85%',
          'Testes de carga suportando 100 requisições simultâneas',
          'Aprovação de UX e Acessibilidade (WCAG AA)',
        ],
        status: 'in_delivery',
        version: 1,
        created_at: now,
        updated_at: now,
      },
    ],
    outcomeReviews: [
      {
        id: 'out_demo_001',
        workspace_id: defaultWsId,
        roadmap_item_id: roadId,
        title: 'Revisão de Impacto 30 Dias — Módulo Validador',
        metric_name: 'Taxa de Sucesso no Setup',
        baseline_value: '38%',
        target_value: '80%',
        actual_value: '84%',
        timeframe_days: 30,
        status: 'exceeded',
        what_we_expected: 'Esperávamos atingir 80% de sucesso reduzindo tickets de suporte.',
        what_happened: 'Atingimos 84% de sucesso e os chamados caíram 68% no primeiro mês.',
        what_we_learned: 'O feedback visual imediato estimulou os usuários a explorarem recursos avançados logo no primeiro day.',
        next_actions: 'Expandir o assistente validador para a etapa de webhooks personalizados.',
        refeed_to_discovery: true,
        reviewed_at: now,
        created_at: now,
        updated_at: now,
      },
    ],
    comments: [
      {
        id: 'comm_demo_001',
        workspace_id: defaultWsId,
        entity_type: 'opportunity',
        entity_id: opId,
        author_id: defaultUserId,
        author_name: 'Demo Admin',
        author_email: 'demo@productos.io',
        content: 'Priorização aprovada no comitê de produto. Iniciamos os testes com o protótipo no sprint 34.',
        created_at: now,
        updated_at: now,
      },
    ],
    activityLogs: [
      {
        id: 'act_demo_001',
        workspace_id: defaultWsId,
        entity_type: 'opportunity',
        entity_id: opId,
        action: 'prioritized',
        actor_id: defaultUserId,
        actor_name: 'Demo Admin',
        actor_email: 'demo@productos.io',
        details: { score: 510, framework: 'rice' },
        created_at: now,
      },
    ],
    toolkitCanvases: [],
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

  async getUserRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    const member = this.data.workspaceMembers.find(
      (m) => m.workspace_id === workspaceId && m.user_id === userId
    );
    return member ? member.role : null;
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
    if (data.research_id) {
      const research = await this.getResearchById(workspaceId, data.research_id);
      if (!research) {
        throw new BusinessRuleError('Pesquisa não encontrada neste workspace.');
      }
    }

    const now = new Date().toISOString();
    const evidence: Evidence = {
      id: `ev_${randomUUID()}`,
      workspace_id: workspaceId,
      research_id: data.research_id || null,
      content: data.content,
      source: data.source,
      origin_type: data.origin_type,
      notes: data.notes,
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

  async getEvidenceById(workspaceId: string, id: string): Promise<Evidence | null> {
    const item = this.data.evidences.find((e) => e.workspace_id === workspaceId && e.id === id);
    if (!item) return null;
    return { ...item };
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

    const problemIds = data.problem_ids && data.problem_ids.length > 0
      ? data.problem_ids
      : data.problem_id
      ? [data.problem_id]
      : [];

    if (problemIds.length > 0) {
      if (!this.data.opportunityProblems) this.data.opportunityProblems = [];
      for (const pId of problemIds) {
        const prob = await this.getProblemById(workspaceId, pId);
        if (!prob) {
          throw new BusinessRuleError('Um ou mais problemas não pertencem a este workspace.');
        }
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
    if (data.opportunity_id) {
      const op = await this.getOpportunityById(workspaceId, data.opportunity_id);
      if (!op) throw new BusinessRuleError('Oportunidade não encontrada neste workspace.');
    }

    const now = new Date().toISOString();
    const hypothesis: Hypothesis = {
      id: `hyp_${randomUUID()}`,
      workspace_id: workspaceId,
      opportunity_id: data.opportunity_id || null,
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

  // ==========================================
  // ETAPA A: Strategic Objectives & Key Results
  // ==========================================
  async listObjectives(workspaceId: string): Promise<Objective[]> {
    const objs = (this.data.objectives || []).filter((o) => o.workspace_id === workspaceId);
    return objs.map((obj) => {
      const krs = (this.data.keyResults || []).filter(
        (kr) => kr.objective_id === obj.id && kr.workspace_id === workspaceId
      );
      const linkedOpps = (this.data.opportunityObjectives || []).filter(
        (oo) => oo.objective_id === obj.id && oo.workspace_id === workspaceId
      );
      const linkedRoadmaps = (this.data.roadmapItems || []).filter(
        (ri) => (ri as any).objective_id === obj.id && ri.workspace_id === workspaceId
      );
      return {
        ...obj,
        key_results: krs,
        linked_opportunities_count: linkedOpps.length,
        linked_roadmaps_count: linkedRoadmaps.length,
      };
    });
  }

  async getObjectiveById(workspaceId: string, objectiveId: string): Promise<Objective | null> {
    const obj = (this.data.objectives || []).find(
      (o) => o.id === objectiveId && o.workspace_id === workspaceId
    );
    if (!obj) return null;
    const krs = (this.data.keyResults || []).filter(
      (kr) => kr.objective_id === obj.id && kr.workspace_id === workspaceId
    );
    return {
      ...obj,
      key_results: krs,
    };
  }

  async createObjective(workspaceId: string, input: CreateObjectiveInput): Promise<Objective> {
    const now = new Date().toISOString();
    const newObj: Objective = {
      id: randomUUID(),
      workspace_id: workspaceId,
      title: input.title,
      description: input.description,
      timeframe: input.timeframe || 'Q1-2026',
      status: input.status || 'active',
      progress: input.progress || 0,
      owner_name: input.owner_name,
      created_at: now,
      updated_at: now,
      key_results: [],
    };
    if (!this.data.objectives) this.data.objectives = [];
    this.data.objectives.push(newObj);
    this.saveToFile();
    return newObj;
  }

  async updateObjective(
    workspaceId: string,
    objectiveId: string,
    input: UpdateObjectiveInput
  ): Promise<Objective> {
    const idx = (this.data.objectives || []).findIndex(
      (o) => o.id === objectiveId && o.workspace_id === workspaceId
    );
    if (idx === -1) {
      throw new BusinessRuleError('Objetivo estratégico não encontrado.', 404);
    }
    const current = this.data.objectives[idx];
    const updated: Objective = {
      ...current,
      title: input.title !== undefined ? input.title : current.title,
      description: input.description !== undefined ? input.description : current.description,
      timeframe: input.timeframe !== undefined ? input.timeframe : current.timeframe,
      status: input.status !== undefined ? input.status : current.status,
      progress: input.progress !== undefined ? input.progress : current.progress,
      owner_name: input.owner_name !== undefined ? input.owner_name : current.owner_name,
      updated_at: new Date().toISOString(),
    };
    this.data.objectives[idx] = updated;
    this.saveToFile();
    return updated;
  }

  async deleteObjective(workspaceId: string, objectiveId: string): Promise<void> {
    this.data.objectives = (this.data.objectives || []).filter(
      (o) => !(o.id === objectiveId && o.workspace_id === workspaceId)
    );
    this.data.keyResults = (this.data.keyResults || []).filter(
      (kr) => !(kr.objective_id === objectiveId && kr.workspace_id === workspaceId)
    );
    this.data.opportunityObjectives = (this.data.opportunityObjectives || []).filter(
      (oo) => !(oo.objective_id === objectiveId && oo.workspace_id === workspaceId)
    );
    this.saveToFile();
  }

  async listKeyResults(workspaceId: string, objectiveId?: string): Promise<KeyResult[]> {
    let krs = (this.data.keyResults || []).filter((kr) => kr.workspace_id === workspaceId);
    if (objectiveId) {
      krs = krs.filter((kr) => kr.objective_id === objectiveId);
    }
    return krs;
  }

  async createKeyResult(workspaceId: string, input: CreateKeyResultInput): Promise<KeyResult> {
    const obj = (this.data.objectives || []).find(
      (o) => o.id === input.objective_id && o.workspace_id === workspaceId
    );
    if (!obj) {
      throw new BusinessRuleError('Objetivo pai não encontrado no workspace.', 404);
    }
    const now = new Date().toISOString();
    const initial = input.initial_value || 0;
    const current = input.current_value || initial;
    const target = input.target_value;
    let progress = 0;
    if (target !== initial) {
      progress = Math.min(100, Math.max(0, Math.round(((current - initial) / (target - initial)) * 100)));
    }
    const newKr: KeyResult = {
      id: randomUUID(),
      workspace_id: workspaceId,
      objective_id: input.objective_id,
      title: input.title,
      metric_name: input.metric_name,
      initial_value: initial,
      target_value: target,
      current_value: current,
      unit: input.unit || '%',
      progress,
      status: input.status || 'on_track',
      created_at: now,
      updated_at: now,
    };
    if (!this.data.keyResults) this.data.keyResults = [];
    this.data.keyResults.push(newKr);
    this.saveToFile();
    return newKr;
  }

  async updateKeyResult(
    workspaceId: string,
    krId: string,
    input: UpdateKeyResultInput
  ): Promise<KeyResult> {
    const idx = (this.data.keyResults || []).findIndex(
      (kr) => kr.id === krId && kr.workspace_id === workspaceId
    );
    if (idx === -1) {
      throw new BusinessRuleError('Key Result não encontrado.', 404);
    }
    const curr = this.data.keyResults[idx];
    const initial = input.initial_value !== undefined ? input.initial_value : curr.initial_value;
    const current = input.current_value !== undefined ? input.current_value : curr.current_value;
    const target = input.target_value !== undefined ? input.target_value : curr.target_value;
    let progress = curr.progress;
    if (target !== initial) {
      progress = Math.min(100, Math.max(0, Math.round(((current - initial) / (target - initial)) * 100)));
    }
    const updated: KeyResult = {
      ...curr,
      title: input.title !== undefined ? input.title : curr.title,
      metric_name: input.metric_name !== undefined ? input.metric_name : curr.metric_name,
      initial_value: initial,
      target_value: target,
      current_value: current,
      unit: input.unit !== undefined ? input.unit : curr.unit,
      progress,
      status: input.status !== undefined ? input.status : curr.status,
      updated_at: new Date().toISOString(),
    };
    this.data.keyResults[idx] = updated;
    this.saveToFile();
    return updated;
  }

  async deleteKeyResult(workspaceId: string, krId: string): Promise<void> {
    this.data.keyResults = (this.data.keyResults || []).filter(
      (kr) => !(kr.id === krId && kr.workspace_id === workspaceId)
    );
    this.saveToFile();
  }

  async linkOpportunityObjective(
    workspaceId: string,
    opportunityId: string,
    objectiveId: string,
    krId?: string
  ): Promise<void> {
    const opp = this.data.opportunities.find((o) => o.id === opportunityId && o.workspace_id === workspaceId);
    if (!opp) throw new BusinessRuleError('Oportunidade não encontrada no workspace.', 404);
    const obj = (this.data.objectives || []).find((o) => o.id === objectiveId && o.workspace_id === workspaceId);
    if (!obj) throw new BusinessRuleError('Objetivo não encontrado no workspace.', 404);

    if (!this.data.opportunityObjectives) this.data.opportunityObjectives = [];
    const exists = this.data.opportunityObjectives.find(
      (oo) => oo.workspace_id === workspaceId && oo.opportunity_id === opportunityId && oo.objective_id === objectiveId
    );
    if (!exists) {
      this.data.opportunityObjectives.push({
        id: randomUUID(),
        workspace_id: workspaceId,
        opportunity_id: opportunityId,
        objective_id: objectiveId,
        kr_id: krId,
      });
      this.saveToFile();
    }
  }

  // ==========================================
  // ETAPA B: Product Prioritization
  // ==========================================
  async listPrioritizations(workspaceId: string): Promise<Prioritization[]> {
    const prios = (this.data.prioritizations || []).filter((p) => p.workspace_id === workspaceId);
    return prios.map((p) => {
      const opp = this.data.opportunities.find((o) => o.id === p.opportunity_id && o.workspace_id === workspaceId);
      return {
        ...p,
        opportunity_title: opp?.title || 'Oportunidade Desconhecida',
      };
    });
  }

  async createPrioritization(
    workspaceId: string,
    input: CreatePrioritizationInput
  ): Promise<Prioritization> {
    const opp = this.data.opportunities.find(
      (o) => o.id === input.opportunity_id && o.workspace_id === workspaceId
    );
    if (!opp) {
      throw new BusinessRuleError('Oportunidade não encontrada no workspace.', 404);
    }

    let calculatedScore = 0;
    if (input.framework === 'rice') {
      const reach = input.reach || 100;
      const impact = input.impact || 3;
      const confidence = (input.confidence || 80) / 100;
      const effort = input.effort || 3;
      calculatedScore = Math.round((reach * impact * confidence) / Math.max(effort, 1));
    } else if (input.framework === 'ice') {
      const impact = input.ice_impact || 7;
      const confidence = input.ice_confidence || 7;
      const ease = input.ice_ease || 7;
      calculatedScore = Math.round((impact * confidence * ease) / 10);
    } else if (input.framework === 'wsjf') {
      const ubv = input.user_business_value || 5;
      const tc = input.time_criticality || 5;
      const rr = input.risk_reduction || 5;
      const size = input.job_size || 3;
      calculatedScore = Math.round(((ubv + tc + rr) / Math.max(size, 1)) * 10);
    } else {
      calculatedScore = Math.round((input.reach || 10) * (input.impact || 5));
    }

    const now = new Date().toISOString();
    const newPrio: Prioritization = {
      id: randomUUID(),
      workspace_id: workspaceId,
      opportunity_id: input.opportunity_id,
      framework: input.framework,
      reach: input.reach,
      impact: input.impact,
      confidence: input.confidence,
      effort: input.effort,
      ice_impact: input.ice_impact,
      ice_confidence: input.ice_confidence,
      ice_ease: input.ice_ease,
      user_business_value: input.user_business_value,
      time_criticality: input.time_criticality,
      risk_reduction: input.risk_reduction,
      job_size: input.job_size,
      score: calculatedScore,
      notes: input.notes,
      evaluator_name: input.evaluator_name || 'PM Responsável',
      created_at: now,
      updated_at: now,
      opportunity_title: opp.title,
    };

    if (!this.data.prioritizations) this.data.prioritizations = [];
    // Remove previous prioritization for same opp & framework if exists or keep history
    this.data.prioritizations.push(newPrio);

    // Update opportunity score & status
    const oppIdx = this.data.opportunities.findIndex(
      (o) => o.id === input.opportunity_id && o.workspace_id === workspaceId
    );
    if (oppIdx !== -1) {
      this.data.opportunities[oppIdx].score = calculatedScore;
      this.data.opportunities[oppIdx].status = 'prioritized';
    }

    this.saveToFile();
    return newPrio;
  }

  async deletePrioritization(workspaceId: string, prioId: string): Promise<void> {
    this.data.prioritizations = (this.data.prioritizations || []).filter(
      (p) => !(p.id === prioId && p.workspace_id === workspaceId)
    );
    this.saveToFile();
  }

  // ==========================================
  // ETAPA C: Personas & Customer Segments
  // ==========================================
  async listPersonas(workspaceId: string): Promise<Persona[]> {
    return (this.data.personas || []).filter((p) => p.workspace_id === workspaceId);
  }

  async createPersona(workspaceId: string, input: CreatePersonaInput): Promise<Persona> {
    const now = new Date().toISOString();
    const newPersona: Persona = {
      id: randomUUID(),
      workspace_id: workspaceId,
      name: input.name,
      role_title: input.role_title,
      segment: input.segment,
      description: input.description,
      jobs_to_be_done: input.jobs_to_be_done || [],
      pains: input.pains || [],
      goals: input.goals || [],
      behaviors: input.behaviors || [],
      created_at: now,
      updated_at: now,
    };
    if (!this.data.personas) this.data.personas = [];
    this.data.personas.push(newPersona);
    this.saveToFile();
    return newPersona;
  }

  async deletePersona(workspaceId: string, personaId: string): Promise<void> {
    this.data.personas = (this.data.personas || []).filter(
      (p) => !(p.id === personaId && p.workspace_id === workspaceId)
    );
    this.data.entityPersonas = (this.data.entityPersonas || []).filter(
      (ep) => !(ep.persona_id === personaId && ep.workspace_id === workspaceId)
    );
    this.saveToFile();
  }

  async listCustomerSegments(workspaceId: string): Promise<CustomerSegment[]> {
    return (this.data.customerSegments || []).filter((s) => s.workspace_id === workspaceId);
  }

  async createCustomerSegment(
    workspaceId: string,
    input: CreateCustomerSegmentInput
  ): Promise<CustomerSegment> {
    const now = new Date().toISOString();
    const newSeg: CustomerSegment = {
      id: randomUUID(),
      workspace_id: workspaceId,
      name: input.name,
      type: input.type,
      description: input.description,
      criteria: input.criteria || [],
      created_at: now,
      updated_at: now,
    };
    if (!this.data.customerSegments) this.data.customerSegments = [];
    this.data.customerSegments.push(newSeg);
    this.saveToFile();
    return newSeg;
  }

  async linkEntityPersona(
    workspaceId: string,
    personaId: string,
    entityType: 'research' | 'evidence' | 'problem' | 'opportunity' | 'hypothesis' | 'decision',
    entityId: string
  ): Promise<void> {
    const p = (this.data.personas || []).find((per) => per.id === personaId && per.workspace_id === workspaceId);
    if (!p) throw new BusinessRuleError('Persona não encontrada no workspace.', 404);

    if (!this.data.entityPersonas) this.data.entityPersonas = [];
    this.data.entityPersonas.push({
      id: randomUUID(),
      workspace_id: workspaceId,
      persona_id: personaId,
      entity_type: entityType,
      entity_id: entityId,
      created_at: new Date().toISOString(),
    });
    this.saveToFile();
  }

  // ==========================================
  // ETAPA D: PRDs & User Stories
  // ==========================================
  async listPRDs(workspaceId: string): Promise<PRD[]> {
    const prds = (this.data.prds || []).filter((p) => p.workspace_id === workspaceId);
    return prds.map((prd) => {
      const road = (this.data.roadmapItems || []).find(
        (r) => r.id === prd.roadmap_item_id && r.workspace_id === workspaceId
      );
      return {
        ...prd,
        roadmap_title: road?.title,
      };
    });
  }

  async getPRDById(workspaceId: string, prdId: string): Promise<PRD | null> {
    const prd = (this.data.prds || []).find((p) => p.id === prdId && p.workspace_id === workspaceId);
    if (!prd) return null;
    const road = (this.data.roadmapItems || []).find(
      (r) => r.id === prd.roadmap_item_id && r.workspace_id === workspaceId
    );
    return {
      ...prd,
      roadmap_title: road?.title,
    };
  }

  async createPRD(workspaceId: string, input: CreatePRDInput): Promise<PRD> {
    const now = new Date().toISOString();
    const newPrd: PRD = {
      id: randomUUID(),
      workspace_id: workspaceId,
      roadmap_item_id: input.roadmap_item_id,
      title: input.title,
      summary: input.summary,
      problem_statement: input.problem_statement,
      goals: input.goals || [],
      non_goals: input.non_goals || [],
      user_stories: input.user_stories || [],
      technical_notes: input.technical_notes,
      dependencies: input.dependencies || [],
      definition_of_done: input.definition_of_done || [],
      status: input.status || 'draft',
      version: 1,
      created_at: now,
      updated_at: now,
    };
    if (!this.data.prds) this.data.prds = [];
    this.data.prds.push(newPrd);
    this.saveToFile();
    return newPrd;
  }

  async updatePRD(workspaceId: string, prdId: string, input: UpdatePRDInput): Promise<PRD> {
    const idx = (this.data.prds || []).findIndex(
      (p) => p.id === prdId && p.workspace_id === workspaceId
    );
    if (idx === -1) {
      throw new BusinessRuleError('PRD não encontrado.', 404);
    }
    const curr = this.data.prds[idx];
    const updated: PRD = {
      ...curr,
      title: input.title !== undefined ? input.title : curr.title,
      summary: input.summary !== undefined ? input.summary : curr.summary,
      problem_statement: input.problem_statement !== undefined ? input.problem_statement : curr.problem_statement,
      goals: input.goals !== undefined ? input.goals : curr.goals,
      non_goals: input.non_goals !== undefined ? input.non_goals : curr.non_goals,
      user_stories: input.user_stories !== undefined ? input.user_stories : curr.user_stories,
      technical_notes: input.technical_notes !== undefined ? input.technical_notes : curr.technical_notes,
      dependencies: input.dependencies !== undefined ? input.dependencies : curr.dependencies,
      definition_of_done: input.definition_of_done !== undefined ? input.definition_of_done : curr.definition_of_done,
      status: input.status !== undefined ? input.status : curr.status,
      version: input.version !== undefined ? input.version : curr.version + 1,
      updated_at: new Date().toISOString(),
    };
    this.data.prds[idx] = updated;
    this.saveToFile();
    return updated;
  }

  async deletePRD(workspaceId: string, prdId: string): Promise<void> {
    this.data.prds = (this.data.prds || []).filter(
      (p) => !(p.id === prdId && p.workspace_id === workspaceId)
    );
    this.saveToFile();
  }

  // ==========================================
  // ETAPA E: Outcome Tracking & Post-Launch
  // ==========================================
  async listOutcomeReviews(workspaceId: string): Promise<OutcomeReview[]> {
    const reviews = (this.data.outcomeReviews || []).filter((r) => r.workspace_id === workspaceId);
    return reviews.map((rev) => {
      const road = (this.data.roadmapItems || []).find(
        (r) => r.id === rev.roadmap_item_id && r.workspace_id === workspaceId
      );
      return {
        ...rev,
        roadmap_title: road?.title,
      };
    });
  }

  async createOutcomeReview(
    workspaceId: string,
    input: CreateOutcomeReviewInput
  ): Promise<OutcomeReview> {
    const now = new Date().toISOString();
    const newRev: OutcomeReview = {
      id: randomUUID(),
      workspace_id: workspaceId,
      roadmap_item_id: input.roadmap_item_id,
      prd_id: input.prd_id,
      title: input.title,
      metric_name: input.metric_name,
      baseline_value: input.baseline_value,
      target_value: input.target_value,
      actual_value: input.actual_value,
      timeframe_days: input.timeframe_days || 30,
      status: input.status || 'on_target',
      what_we_expected: input.what_we_expected,
      what_happened: input.what_happened,
      what_we_learned: input.what_we_learned,
      next_actions: input.next_actions,
      refeed_to_discovery: input.refeed_to_discovery || false,
      reviewed_at: now,
      created_at: now,
      updated_at: now,
    };
    if (!this.data.outcomeReviews) this.data.outcomeReviews = [];
    this.data.outcomeReviews.push(newRev);

    // If refeed to discovery is checked, create a new discovery problem automatically
    if (input.refeed_to_discovery && input.what_we_learned) {
      const newProb = await this.createProblem(workspaceId, {
        title: `Novo Aprendizado Post-Launch: ${input.title}`,
        description: `Aprendizado: ${input.what_we_learned}. Próximos passos identificados: ${input.next_actions || 'Avaliar no discovery'}`,
        impact: 'medium',
        frequency: 'occasional',
      });
      newRev.new_problem_id = newProb.id;
    }

    this.saveToFile();
    return newRev;
  }

  async deleteOutcomeReview(workspaceId: string, reviewId: string): Promise<void> {
    this.data.outcomeReviews = (this.data.outcomeReviews || []).filter(
      (r) => !(r.id === reviewId && r.workspace_id === workspaceId)
    );
    this.saveToFile();
  }

  // ==========================================
  // ETAPA F: Collaboration & Activity Timeline
  // ==========================================
  async listComments(workspaceId: string, entityType?: string, entityId?: string): Promise<Comment[]> {
    let list = (this.data.comments || []).filter((c) => c.workspace_id === workspaceId);
    if (entityType && entityId) {
      list = list.filter((c) => c.entity_type === entityType && c.entity_id === entityId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createComment(
    workspaceId: string,
    author: { uid: string; name?: string; email: string },
    input: CreateCommentInput
  ): Promise<Comment> {
    const now = new Date().toISOString();
    const newComment: Comment = {
      id: randomUUID(),
      workspace_id: workspaceId,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      author_id: author.uid,
      author_name: author.name || author.email.split('@')[0],
      author_email: author.email,
      content: input.content,
      created_at: now,
      updated_at: now,
    };
    if (!this.data.comments) this.data.comments = [];
    this.data.comments.push(newComment);

    await this.logActivity(workspaceId, {
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      action: 'commented',
      actor: author,
      details: { comment_snippet: input.content.slice(0, 80) },
    });

    this.saveToFile();
    return newComment;
  }

  async listActivityLogs(workspaceId: string, limit = 50): Promise<ActivityLog[]> {
    return (this.data.activityLogs || [])
      .filter((a) => a.workspace_id === workspaceId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
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
    if (!this.data.activityLogs) this.data.activityLogs = [];
    this.data.activityLogs.push({
      id: randomUUID(),
      workspace_id: workspaceId,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      action: params.action,
      actor_id: params.actor.uid,
      actor_name: params.actor.name || params.actor.email.split('@')[0],
      actor_email: params.actor.email,
      details: params.details || {},
      created_at: new Date().toISOString(),
    });
    this.saveToFile();
  }

  // ==========================================
  // ETAPA G: Product Toolkit Canvases
  // ==========================================
  async listToolkitCanvases(workspaceId: string, toolKey?: string): Promise<ToolkitCanvas[]> {
    let list = (this.data.toolkitCanvases || []).filter((c) => c.workspace_id === workspaceId);
    if (toolKey) {
      list = list.filter((c) => c.tool_key === toolKey);
    }
    return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  async getToolkitCanvasById(workspaceId: string, id: string): Promise<ToolkitCanvas | null> {
    const item = (this.data.toolkitCanvases || []).find(
      (c) => c.workspace_id === workspaceId && c.id === id
    );
    return item || null;
  }

  async getToolkitCanvasByKey(
    workspaceId: string,
    toolKey: string,
    entityId?: string
  ): Promise<ToolkitCanvas | null> {
    const list = (this.data.toolkitCanvases || []).filter(
      (c) => c.workspace_id === workspaceId && c.tool_key === toolKey
    );
    if (entityId) {
      return list.find((c) => c.entity_id === entityId) || null;
    }
    return list[0] || null;
  }

  async saveToolkitCanvas(
    workspaceId: string,
    input: CreateToolkitCanvasInput
  ): Promise<ToolkitCanvas> {
    if (!this.data.toolkitCanvases) this.data.toolkitCanvases = [];
    const now = new Date().toISOString();

    let existingIdx = -1;
    if (input.id) {
      existingIdx = this.data.toolkitCanvases.findIndex(
        (c) => c.workspace_id === workspaceId && c.id === input.id
      );
    } else {
      existingIdx = this.data.toolkitCanvases.findIndex(
        (c) =>
          c.workspace_id === workspaceId &&
          c.tool_key === input.tool_key &&
          (input.entity_id ? c.entity_id === input.entity_id : true)
      );
    }

    if (existingIdx !== -1) {
      const current = this.data.toolkitCanvases[existingIdx];
      const updated: ToolkitCanvas = {
        ...current,
        title: input.title || current.title,
        entity_type: input.entity_type !== undefined ? input.entity_type : current.entity_type,
        entity_id: input.entity_id !== undefined ? input.entity_id : current.entity_id,
        canvas_data: input.canvas_data || current.canvas_data,
        updated_at: now,
      };
      this.data.toolkitCanvases[existingIdx] = updated;
      this.saveToFile();
      return updated;
    }

    const newCanvas: ToolkitCanvas = {
      id: input.id || randomUUID(),
      workspace_id: workspaceId,
      tool_key: input.tool_key,
      title: input.title,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      canvas_data: input.canvas_data || {},
      created_at: now,
      updated_at: now,
    };
    this.data.toolkitCanvases.push(newCanvas);
    this.saveToFile();
    return newCanvas;
  }

  async deleteToolkitCanvas(workspaceId: string, id: string): Promise<boolean> {
    if (!this.data.toolkitCanvases) return false;
    const initialLen = this.data.toolkitCanvases.length;
    this.data.toolkitCanvases = this.data.toolkitCanvases.filter(
      (c) => !(c.workspace_id === workspaceId && c.id === id)
    );
    const deleted = this.data.toolkitCanvases.length < initialLen;
    if (deleted) this.saveToFile();
    return deleted;
  }

  async duplicateToolkitCanvas(workspaceId: string, id: string): Promise<ToolkitCanvas | null> {
    const original = await this.getToolkitCanvasById(workspaceId, id);
    if (!original) return null;

    const now = new Date().toISOString();
    const duplicated: ToolkitCanvas = {
      id: randomUUID(),
      workspace_id: workspaceId,
      tool_key: original.tool_key,
      title: `${original.title} (Cópia)`,
      entity_type: original.entity_type,
      entity_id: original.entity_id,
      canvas_data: JSON.parse(JSON.stringify(original.canvas_data || {})),
      created_at: now,
      updated_at: now,
    };

    this.data.toolkitCanvases.push(duplicated);
    this.saveToFile();
    return duplicated;
  }

  // ==========================================
  // ETAPA I: Executive Dashboard Summary
  // ==========================================
  async getExecutiveDashboard(workspaceId: string) {
    const health = await this.getDiscoveryHealth(workspaceId);
    const objs = await this.listObjectives(workspaceId);
    const prios = await this.listPrioritizations(workspaceId);
    const topOpportunities = (this.data.opportunities || [])
      .filter((o) => o.workspace_id === workspaceId)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);
    const activeExperiments = (this.data.experiments || []).filter(
      (e) => e.workspace_id === workspaceId && (e.status === 'running' || e.status === 'draft')
    );
    const recentDecisions = (this.data.decisions || [])
      .filter((d) => d.workspace_id === workspaceId)
      .slice(0, 5);
    const roadmap = (this.data.roadmapItems || []).filter((r) => r.workspace_id === workspaceId);
    const outcomes = (this.data.outcomeReviews || []).filter((r) => r.workspace_id === workspaceId);
    const recentActivity = await this.listActivityLogs(workspaceId, 10);
    const insights = (this.data.insights || []).filter((i) => i.workspace_id === workspaceId);

    return {
      discovery_health: health,
      strategic_objectives: objs,
      top_opportunities: topOpportunities,
      prioritizations: prios,
      active_experiments: activeExperiments,
      recent_decisions: recentDecisions,
      roadmap_summary: {
        total: roadmap.length,
        now: roadmap.filter((r) => r.timeframe === 'now').length,
        in_progress: roadmap.filter((r) => r.status === 'in_progress').length,
        delivered: roadmap.filter((r) => r.status === 'delivered').length,
      },
      outcome_reviews: outcomes,
      recent_activity: recentActivity,
      intelligence_alerts: insights.filter((i) => i.status === 'suggested'),
    };
  }
}



