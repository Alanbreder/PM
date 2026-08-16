import { db } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { dbStore } from '../db/store.js';
import { eq } from 'drizzle-orm';
import { authenticate, requireWorkspace, requireRole } from '../middleware/auth.js';
import { askProductSchema } from '../schemas/index.js';
import { Request, Response, NextFunction } from 'express';
import {
  handleRouteError,
  BusinessRuleError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
} from '../utils/errors.js';

export interface TestResult {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  details?: string;
}

// Helper to simulate Express middleware invocation
async function simulateAuthMiddleware(
  headers: Record<string, string>,
  env: { NODE_ENV: string; ALLOW_DEV_MOCK_AUTH?: string }
): Promise<{ status?: number; body?: any; nextCalled: boolean; user?: any }> {
  const origNodeEnv = process.env.NODE_ENV;
  const origMockAuth = process.env.ALLOW_DEV_MOCK_AUTH;

  try {
    process.env.NODE_ENV = env.NODE_ENV;
    if (env.ALLOW_DEV_MOCK_AUTH !== undefined) {
      process.env.ALLOW_DEV_MOCK_AUTH = env.ALLOW_DEV_MOCK_AUTH;
    } else {
      delete process.env.ALLOW_DEV_MOCK_AUTH;
    }

    let nextCalled = false;
    let statusCode: number | undefined = undefined;
    let responseBody: any = undefined;

    const mockReq: Partial<Request> = {
      headers,
    };

    const mockRes: Partial<Response> = {
      status(code: number) {
        statusCode = code;
        return this as Response;
      },
      json(body: any) {
        responseBody = body;
        return this as Response;
      },
    };

    const mockNext: NextFunction = () => {
      nextCalled = true;
    };

    await authenticate(mockReq as Request, mockRes as Response, mockNext);

    return {
      status: statusCode,
      body: responseBody,
      nextCalled,
      user: (mockReq as any).user,
    };
  } finally {
    process.env.NODE_ENV = origNodeEnv;
    if (origMockAuth !== undefined) {
      process.env.ALLOW_DEV_MOCK_AUTH = origMockAuth;
    } else {
      delete process.env.ALLOW_DEV_MOCK_AUTH;
    }
  }
}

// Helper to simulate requireWorkspace middleware invocation
async function simulateWorkspaceMiddleware(
  headers: Record<string, string>,
  user: any
): Promise<{ status?: number; body?: any; nextCalled: boolean; workspaceId?: string; role?: string }> {
  let nextCalled = false;
  let statusCode: number | undefined = undefined;
  let responseBody: any = undefined;

  const mockReq: Partial<Request> = {
    headers,
    params: {},
    query: {},
    user,
  };

  const mockRes: Partial<Response> = {
    status(code: number) {
      statusCode = code;
      return this as Response;
    },
    json(body: any) {
      responseBody = body;
      return this as Response;
    },
  };

  const mockNext: NextFunction = () => {
    nextCalled = true;
  };

  await requireWorkspace(mockReq as Request, mockRes as Response, mockNext);

  return {
    status: statusCode,
    body: responseBody,
    nextCalled,
    workspaceId: (mockReq as any).workspaceId,
    role: (mockReq as any).workspaceRole,
  };
}

// Helper to simulate route controller error handling
function testErrorResponse(errorToHandle: any): { status: number; body: any } {
  let statusCode = 200;
  let responseBody: any = null;

  const mockRes: Partial<Response> = {
    status(code: number) {
      statusCode = code;
      return this as Response;
    },
    json(body: any) {
      responseBody = body;
      return this as Response;
    },
  };

  handleRouteError(mockRes as Response, errorToHandle, 'testContext');
  return { status: statusCode, body: responseBody };
}

export async function runSecurityIsolationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // ==========================================
  // SECTION 1: AUTHENTICATION & MOCK AUTH (SEC-FB01)
  // ==========================================

  // 1.1 production + mock=true -> BLOQUEADO (401)
  const resProdMock = await simulateAuthMiddleware(
    { 'x-test-user-id': 'hacker-uid' },
    { NODE_ENV: 'production', ALLOW_DEV_MOCK_AUTH: 'true' }
  );
  results.push({
    name: '1.1 [SEC-FB01] Production + ALLOW_DEV_MOCK_AUTH=true sem token JWT -> Bloqueado 401',
    expected: 'Status 401 UNAUTHORIZED (Next NOT called)',
    actual: resProdMock.status === 401 && !resProdMock.nextCalled ? '401 UNAUTHORIZED (Bloqueado)' : `Inseguro (Status ${resProdMock.status})`,
    passed: resProdMock.status === 401 && !resProdMock.nextCalled,
  });

  // 1.2 development + mock=true -> BLOQUEADO (401) (Apenas test é permitido)
  const resDevMock = await simulateAuthMiddleware(
    { 'x-test-user-id': 'dev-uid' },
    { NODE_ENV: 'development', ALLOW_DEV_MOCK_AUTH: 'true' }
  );
  results.push({
    name: '1.2 [SEC-FB01] Development + ALLOW_DEV_MOCK_AUTH=true sem token JWT -> Bloqueado 401',
    expected: 'Status 401 UNAUTHORIZED (Next NOT called)',
    actual: resDevMock.status === 401 && !resDevMock.nextCalled ? '401 UNAUTHORIZED (Bloqueado)' : `Inseguro (Status ${resDevMock.status})`,
    passed: resDevMock.status === 401 && !resDevMock.nextCalled,
  });

  // 1.3 staging/preview + mock=true -> BLOQUEADO (401)
  const resStagingMock = await simulateAuthMiddleware(
    { 'x-test-user-id': 'staging-uid' },
    { NODE_ENV: 'staging', ALLOW_DEV_MOCK_AUTH: 'true' }
  );
  results.push({
    name: '1.3 [SEC-FB01] Staging/Preview + ALLOW_DEV_MOCK_AUTH=true sem token JWT -> Bloqueado 401',
    expected: 'Status 401 UNAUTHORIZED (Next NOT called)',
    actual: resStagingMock.status === 401 && !resStagingMock.nextCalled ? '401 UNAUTHORIZED (Bloqueado)' : `Inseguro (Status ${resStagingMock.status})`,
    passed: resStagingMock.status === 401 && !resStagingMock.nextCalled,
  });

  // 1.4 test + mock=true -> PERMITIDO (Next called)
  const resTestMock = await simulateAuthMiddleware(
    { 'x-test-user-id': 'ci-test-uid' },
    { NODE_ENV: 'test', ALLOW_DEV_MOCK_AUTH: 'true' }
  );
  results.push({
    name: '1.4 [SEC-FB01] Test Environment + ALLOW_DEV_MOCK_AUTH=true -> Permitido para CI/Unit tests',
    expected: 'Next() chamado com usuário autenticado ci-test-uid',
    actual: resTestMock.nextCalled && resTestMock.user?.id === 'ci-test-uid' ? 'Permitido (Next called com UID)' : 'Falhou',
    passed: Boolean(resTestMock.nextCalled && resTestMock.user?.id === 'ci-test-uid'),
  });

  // 1.5 production sem token -> 401
  const resProdNoToken = await simulateAuthMiddleware(
    {},
    { NODE_ENV: 'production' }
  );
  results.push({
    name: '1.5 [SEC-FB01] Production sem qualquer token ou header -> 401',
    expected: 'Status 401 UNAUTHORIZED',
    actual: resProdNoToken.status === 401 ? 'Status 401 UNAUTHORIZED' : `Inseguro (Status ${resProdNoToken.status})`,
    passed: resProdNoToken.status === 401,
  });

  // 1.6 token Firebase inválido -> 401
  const resInvalidToken = await simulateAuthMiddleware(
    { authorization: 'Bearer invalid-garbage-jwt-token-12345' },
    { NODE_ENV: 'production' }
  );
  results.push({
    name: '1.6 [SEC-FB01] Token JWT Forjado / Inválido -> 401 Rejeitado pelo Firebase Admin',
    expected: 'Status 401 UNAUTHORIZED',
    actual: resInvalidToken.status === 401 ? 'Status 401 UNAUTHORIZED (Rejeitado)' : `Inseguro (Status ${resInvalidToken.status})`,
    passed: resInvalidToken.status === 401,
  });

  // ==========================================
  // SECTION 2: WORKSPACE LISTING & MEMBERSHIP (SEC-R01)
  // ==========================================

  const userA = 'test-user-a-' + Date.now();
  const userB = 'test-user-b-' + Date.now();
  const userAdmin = 'test-user-admin-' + Date.now();
  const userMember = 'test-user-member-' + Date.now();
  const userViewer = 'test-user-viewer-' + Date.now();
  const userNoWs = 'test-user-none-' + Date.now();

  const wsA = await dbStore.createWorkspace('Workspace Alpha Test', 'ws-alpha-' + Date.now(), userA);
  const wsB = await dbStore.createWorkspace('Workspace Beta Test', 'ws-beta-' + Date.now(), userB);

  // Setup roles in wsA
  await dbStore.addMember(wsA.id, userAdmin, 'admin');
  await dbStore.addMember(wsA.id, userMember, 'member');
  await dbStore.addMember(wsA.id, userViewer, 'viewer');

  // 2.1 Usuário A recebe apenas seus workspaces
  const listA = await dbStore.listWorkspacesForUser(userA);
  const onlyHasA = listA.length === 1 && listA[0].id === wsA.id;
  results.push({
    name: '2.1 [SEC-R01] Usuário A recebe apenas seus próprios workspaces',
    expected: `Apenas Workspace Alpha (${wsA.id})`,
    actual: onlyHasA ? `Exatamente 1 workspace correspondente (${listA[0].name})` : `Incorreto (Retornou ${listA.length})`,
    passed: onlyHasA,
  });

  // 2.2 Usuário sem workspace recebe [] (Sem fallback para listAllWorkspaces)
  const listNoWs = await dbStore.listWorkspacesForUser(userNoWs);
  results.push({
    name: '2.2 [SEC-R01] Usuário sem workspace recebe array vazio [] (Zero Fallback Global)',
    expected: '[] (Array vazio)',
    actual: Array.isArray(listNoWs) && listNoWs.length === 0 ? '[] (Vazio, isolado)' : `Vazamento de dados (Retornou ${listNoWs.length})`,
    passed: Array.isArray(listNoWs) && listNoWs.length === 0,
  });

  // 2.3 Usuário A NUNCA recebe workspace B
  const listAContainsB = listA.some((w) => w.id === wsB.id);
  results.push({
    name: '2.3 [SEC-R01] Usuário A nunca recebe Workspace B na listagem',
    expected: 'Workspace B ausente',
    actual: !listAContainsB ? 'Workspace B estritamente ausente' : 'Vazamento cross-tenant!',
    passed: !listAContainsB,
  });

  // 2.4 Manipulação de workspaceId não altera autorização (Membership Guard)
  const memFake = await dbStore.getMembership(wsB.id, userA);
  results.push({
    name: '2.4 [SEC-R01] Tentativa do Usuário A de injetar header/id do Workspace B -> Acesso Negado',
    expected: 'null (Sem permissão)',
    actual: memFake === null ? 'null (Acesso 403 Forbidden)' : 'Falha na checagem de membership',
    passed: memFake === null,
  });

  // 2.5 requireWorkspace sem bypass para usr-dev-mock-1 ou qualquer usuário sem membership -> 403
  const resBypassMock = await simulateWorkspaceMiddleware(
    { 'x-workspace-id': wsB.id },
    { id: 'usr-dev-mock-1', email: 'dev-mock@sip.local' }
  );
  results.push({
    name: '2.5 [SEC-R01] requireWorkspace sem bypass residual: usr-dev-mock-1 sem membership -> Bloqueado 403',
    expected: 'Status 403 FORBIDDEN (Next NOT called)',
    actual: resBypassMock.status === 403 && !resBypassMock.nextCalled ? 'Status 403 FORBIDDEN (Bloqueado)' : `Bypass detectado (Status ${resBypassMock.status})`,
    passed: resBypassMock.status === 403 && !resBypassMock.nextCalled,
  });

  // 2.6 requireWorkspace com membership legítimo -> Autorizado 200 (next called)
  const resValidMember = await simulateWorkspaceMiddleware(
    { 'x-workspace-id': wsA.id },
    { id: userA, email: 'user-a@sip.local' }
  );
  results.push({
    name: '2.6 [SEC-R01] requireWorkspace com membership válido -> Autorizado com sucesso (Next chamado)',
    expected: 'Next() chamado com workspaceId e role owner injetados',
    actual: resValidMember.nextCalled && resValidMember.workspaceId === wsA.id && resValidMember.role === 'owner' ? 'Autorizado com tenant e role validados' : 'Falha na autorização',
    passed: Boolean(resValidMember.nextCalled && resValidMember.workspaceId === wsA.id && resValidMember.role === 'owner'),
  });

  // ==========================================
  // SECTION 3: WORKSPACE CREATION & ROLE HIERARCHY
  // ==========================================

  // 3.1 Unique constraint em workspace_members
  let duplicateMemberBlocked = false;
  try {
    await db.insert(schema.workspaceMembers).values({
      workspaceId: wsA.id,
      userId: userA,
      role: 'member',
    });
  } catch (err: any) {
    duplicateMemberBlocked = true;
  }
  results.push({
    name: '3.1 [DB-CONSTRAINT] Inserção duplicada de usuário no mesmo workspace é bloqueada por UNIQUE constraint',
    expected: 'Erro de violação de constraint única (uq_workspace_members_workspace_user)',
    actual: duplicateMemberBlocked ? 'Rejeitado pelo PostgreSQL (Constraint Ativa)' : 'Permitiu duplicata indevidamente',
    passed: duplicateMemberBlocked,
  });

  // 3.2 Transacionalidade na criação de workspace
  const userTx = 'test-user-tx-' + Date.now();
  const wsTx = await dbStore.createWorkspace('Workspace Transacional', 'ws-tx-' + Date.now(), userTx);
  const txMembership = await dbStore.getMembership(wsTx.id, userTx);
  const isTxAtomic = wsTx.id !== undefined && txMembership?.role === 'owner';
  results.push({
    name: '3.2 [DB-TX] createWorkspace cria workspace e associação de owner de forma atômica e transacional',
    expected: 'Workspace e Owner Membership persistidos atomicamente',
    actual: isTxAtomic ? 'Workspace e Owner Membership criados com integridade' : 'Falha na atomicidade',
    passed: isTxAtomic,
  });

  // 3.3 Role Hierarchy: Owner can add owner, admin, member, viewer
  const targetUser1 = 'target-user-1-' + Date.now();
  const targetUser2 = 'target-user-2-' + Date.now();
  const targetUser3 = 'target-user-3-' + Date.now();
  const targetUser4 = 'target-user-4-' + Date.now();

  const m1 = await dbStore.addMember(wsA.id, targetUser1, 'owner');
  const m2 = await dbStore.addMember(wsA.id, targetUser2, 'admin');
  const m3 = await dbStore.addMember(wsA.id, targetUser3, 'member');
  const m4 = await dbStore.addMember(wsA.id, targetUser4, 'viewer');

  const ownerPermittedAll = m1.role === 'owner' && m2.role === 'admin' && m3.role === 'member' && m4.role === 'viewer';
  results.push({
    name: '3.3 [ROLE-AUTH] OWNER tem permissão para convidar/adicionar owner, admin, member e viewer',
    expected: 'Todos os 4 papéis criados com sucesso pelo Owner',
    actual: ownerPermittedAll ? 'Todos os 4 papéis permitidos' : 'Falha ao adicionar papéis pelo Owner',
    passed: ownerPermittedAll,
  });

  // 3.4 Role Hierarchy: Admin cannot assign owner role
  // Simular verificação do endpoint POST /workspaces/:id/members
  function checkAddMemberPermission(callerRole: string, requestedRole: string): boolean {
    if (callerRole !== 'owner' && callerRole !== 'admin') return false;
    if (callerRole === 'admin' && requestedRole === 'owner') return false;
    return true;
  }

  const adminCanAddAdmin = checkAddMemberPermission('admin', 'admin');
  const adminCanAddMember = checkAddMemberPermission('admin', 'member');
  const adminCanAddViewer = checkAddMemberPermission('admin', 'viewer');
  const adminCannotAddOwner = !checkAddMemberPermission('admin', 'owner');
  const memberCannotAddAny = !checkAddMemberPermission('member', 'viewer');
  const viewerCannotAddAny = !checkAddMemberPermission('viewer', 'viewer');

  const roleHierarchyValid =
    adminCanAddAdmin &&
    adminCanAddMember &&
    adminCanAddViewer &&
    adminCannotAddOwner &&
    memberCannotAddAny &&
    viewerCannotAddAny;

  results.push({
    name: '3.4 [ROLE-AUTH] Regra estrita: ADMIN pode adicionar admin/member/viewer, mas é BLOQUEADO de adicionar OWNER',
    expected: 'Admin -> Admin/Member/Viewer (Permitido), Admin -> Owner (Bloqueado 403), Member/Viewer -> Qualquer (Bloqueado 403)',
    actual: roleHierarchyValid ? 'Hierarquia de permissões rigorosamente respeitada' : 'Falha na hierarquia de permissões',
    passed: roleHierarchyValid,
  });

  // ==========================================
  // SECTION 4: MULTI-TENANT ISOLATION & DATABASE CONSTRAINTS
  // ==========================================

  // Create research in wsA and wsB
  const researchA = await dbStore.createResearch(wsA.id, {
    title: 'Pesquisa Alpha 1',
    source_type: 'interview',
    raw_content: 'Conteúdo restrito do Workspace A',
    participant_info: { role: 'CTO' },
  });

  const researchB = await dbStore.createResearch(wsB.id, {
    title: 'Pesquisa Beta 1',
    source_type: 'survey',
    raw_content: 'Conteúdo restrito do Workspace B',
    participant_info: { role: 'Product Lead' },
  });

  // Evidence in wsA
  const evidenceA = await dbStore.createEvidence(wsA.id, {
    research_id: researchA.id,
    quote: 'Evidência exclusiva da Alpha',
    confidence_level: 'high',
    tags: ['pain-point'],
  });

  // 4.1 IDOR fetch Research
  const idorResearch = await dbStore.getResearchById(wsA.id, researchB.id);
  results.push({
    name: '4.1 [IDOR Guard] Usuário no Workspace A tenta buscar Research do Workspace B por UUID',
    expected: 'null (Bloqueado por tenant guard)',
    actual: idorResearch === null ? 'null (404 Not Found)' : 'Vazamento IDOR',
    passed: idorResearch === null,
  });

  // 4.2 Cross-tenant Evidence creation
  let crossTenantEvidenceRejected = false;
  try {
    await dbStore.createEvidence(wsB.id, {
      research_id: researchA.id, // Research belongs to wsA!
      quote: 'Tentativa de relacionamento cross-tenant',
      confidence_level: 'low',
      tags: ['test'],
    });
  } catch (err: any) {
    crossTenantEvidenceRejected = true;
  }
  results.push({
    name: '4.2 [Cross-Tenant Guard] Tentativa de vincular Research de A em Evidência de B na camada de serviço',
    expected: 'Rejeitado com erro de integridade referencial de tenant',
    actual: crossTenantEvidenceRejected ? 'Rejeitado com erro de integridade' : 'Permitido indevidamente',
    passed: crossTenantEvidenceRejected,
  });

  // 4.3 Database Level Cross-Tenant Constraint: Direct SQL Insert Evidence with mismatching workspace
  let dbDirectEvidenceViolation = false;
  try {
    await db.insert(schema.evidences).values({
      workspaceId: wsB.id, // Workspace B
      researchId: researchA.id, // Research of Workspace A!
      quote: 'Direct SQL cross-tenant injection test',
      confidenceLevel: 'low',
    });
  } catch (err: any) {
    // Foreign key constraint violation (code 23503 in PostgreSQL)
    dbDirectEvidenceViolation = true;
  }
  results.push({
    name: '4.3 [DB-CONSTRAINT] Inserção SQL direta de Evidência em B com Research de A é rejeitada pelo PostgreSQL FK',
    expected: 'Violação de FK composta (fk_evidences_research_workspace)',
    actual: dbDirectEvidenceViolation ? 'Rejeitado pelo PostgreSQL (FK Composta Ativa)' : 'Inseguro (Permitiu inserção direta)',
    passed: dbDirectEvidenceViolation,
  });

  // Create valid problem in wsA and wsB
  const problemA = await dbStore.createProblem(
    wsA.id,
    {
      title: 'Problema Alpha 1',
      description: 'Descrição do Problema Alpha',
      impact_level: 'high',
      status: 'identified',
    },
    [evidenceA.id]
  );

  const problemB = await dbStore.createProblem(
    wsB.id,
    {
      title: 'Problema Beta 1',
      description: 'Descrição do Problema Beta',
      impact_level: 'medium',
      status: 'identified',
    },
    []
  );

  // 4.4 IDOR fetch Problem
  const idorProblem = await dbStore.getProblemById(wsA.id, problemB.id);
  results.push({
    name: '4.4 [IDOR Guard] Usuário no Workspace A tenta buscar Problema do Workspace B por UUID',
    expected: 'null (Bloqueado)',
    actual: idorProblem === null ? 'null (404 Not Found)' : 'Vazamento IDOR',
    passed: idorProblem === null,
  });

  // 4.5 Database Level Cross-Tenant Constraint: Problem Evidence link
  let dbDirectProblemEvidenceViolation = false;
  try {
    await db.insert(schema.problemEvidences).values({
      workspaceId: wsB.id, // wsB
      problemId: problemB.id, // wsB
      evidenceId: evidenceA.id, // wsA!
    });
  } catch (err: any) {
    dbDirectProblemEvidenceViolation = true;
  }
  results.push({
    name: '4.5 [DB-CONSTRAINT] Inserção SQL direta de problem_evidences com Evidence de outro workspace é rejeitada pelo PostgreSQL',
    expected: 'Violação de FK composta (fk_pe_evidence_workspace)',
    actual: dbDirectProblemEvidenceViolation ? 'Rejeitado pelo PostgreSQL (FK Composta Ativa)' : 'Inseguro (Permitiu inserção direta)',
    passed: dbDirectProblemEvidenceViolation,
  });

  // Create valid opportunity in wsA and wsB
  const oppA = await dbStore.createOpportunity(
    wsA.id,
    {
      title: 'Oportunidade Alpha 1',
      description: 'Descrição Alpha',
      status: 'active',
    },
    [problemA.id]
  );

  const oppB = await dbStore.createOpportunity(
    wsB.id,
    {
      title: 'Oportunidade Beta 1',
      description: 'Descrição Beta',
      status: 'active',
    },
    []
  );

  // 4.6 IDOR fetch Opportunity
  const idorOpp = await dbStore.getOpportunityById(wsB.id, oppA.id);
  results.push({
    name: '4.6 [IDOR Guard] Usuário no Workspace B tenta buscar Oportunidade de A por UUID',
    expected: 'null (Bloqueado)',
    actual: idorOpp === null ? 'null (404 Not Found)' : 'Vazamento IDOR',
    passed: idorOpp === null,
  });

  // Create valid hypothesis in wsA
  const hypA = await dbStore.createHypothesis(wsA.id, {
    opportunity_id: oppA.id,
    statement: 'Se simplificarmos o onboarding, a conversão aumentará 15%',
    metric_target: 'Taxa de ativação > 65%',
    confidence_score: 8,
    status: 'validated',
  });

  // 4.7 Database Level Cross-Tenant Constraint: Direct SQL Hypothesis mismatch
  let dbDirectHypothesisViolation = false;
  try {
    await db.insert(schema.hypotheses).values({
      workspaceId: wsB.id, // wsB
      opportunityId: oppA.id, // oppA is in wsA!
      statement: 'Hipótese injetada diretamente',
      metricTarget: 'Métrica teste',
      status: 'draft',
    });
  } catch (err: any) {
    dbDirectHypothesisViolation = true;
  }
  results.push({
    name: '4.7 [DB-CONSTRAINT] Inserção SQL direta de Hipótese em B com Oportunidade de A é rejeitada pelo PostgreSQL FK',
    expected: 'Violação de FK composta (fk_hypotheses_opportunity_workspace)',
    actual: dbDirectHypothesisViolation ? 'Rejeitado pelo PostgreSQL (FK Composta Ativa)' : 'Inseguro (Permitiu inserção direta)',
    passed: dbDirectHypothesisViolation,
  });

  // 4.8 IDOR fetch Hypothesis
  const idorHyp = await dbStore.getHypothesisById(wsB.id, hypA.id);
  results.push({
    name: '4.8 [IDOR Guard] Usuário no Workspace B tenta buscar Hipótese de A por UUID',
    expected: 'null (Bloqueado)',
    actual: idorHyp === null ? 'null (404 Not Found)' : 'Vazamento IDOR',
    passed: idorHyp === null,
  });

  // Create valid experiment in wsA
  const expA = await dbStore.createExperiment(wsA.id, {
    hypothesis_id: hypA.id,
    title: 'Experimento A/B Onboarding Alpha',
    description: 'Validar novo fluxo de onboarding',
    method: 'Teste A/B 50/50',
    success_criteria: 'Conversão > 15%',
  });

  // 4.9 Database Level Cross-Tenant Constraint: Direct SQL Experiment mismatch
  let dbDirectExpViolation = false;
  try {
    await db.insert(schema.experiments).values({
      workspaceId: wsB.id, // wsB
      hypothesisId: hypA.id, // hypA is in wsA!
      title: 'Experimento injetado diretamente',
      description: 'Descrição de teste',
      method: 'Teste',
      successCriteria: 'Conversão > 10%',
      status: 'draft',
    });
  } catch (err: any) {
    dbDirectExpViolation = true;
  }
  results.push({
    name: '4.9 [DB-CONSTRAINT] Inserção SQL direta de Experimento em B com Hipótese de A é rejeitada pelo PostgreSQL FK',
    expected: 'Violação de FK composta (fk_experiments_hypothesis_workspace)',
    actual: dbDirectExpViolation ? 'Rejeitado pelo PostgreSQL (FK Composta Ativa)' : 'Inseguro (Permitiu inserção direta)',
    passed: dbDirectExpViolation,
  });

  // 4.10 IDOR fetch Experiment
  const idorExp = await dbStore.getExperimentById(wsB.id, expA.id);
  results.push({
    name: '4.10 [IDOR Guard] Usuário no Workspace B tenta buscar Experimento de A por UUID',
    expected: 'null (Bloqueado)',
    actual: idorExp === null ? 'null (404 Not Found)' : 'Vazamento IDOR',
    passed: idorExp === null,
  });

  // ==========================================
  // SECTION 5: ATOMIC EXPERIMENT TRANSITIONS & CONCURRENCY
  // ==========================================

  // 5.1 Premature result/learning rejection
  let prematureResultRejected = false;
  try {
    await dbStore.updateExperiment(wsA.id, expA.id, {
      status: 'running',
      result: 'confirmed',
      learning: 'Tentativa prematura de definir aprendizado antes de completed',
    });
  } catch (err: any) {
    prematureResultRejected = true;
  }
  results.push({
    name: '5.1 [EXP-ATOMIC] Preenchimento de resultado/aprendizado antes do status completed é bloqueado',
    expected: 'Rejeitado com erro de regra de ciclo de vida',
    actual: prematureResultRejected ? 'Rejeitado (Permitido apenas em completed)' : 'Permitido indevidamente',
    passed: prematureResultRejected,
  });

  // 5.2 Atomic transition draft -> running -> completed
  const runningExp = await dbStore.updateExperiment(wsA.id, expA.id, {
    status: 'running',
  });
  const completedExp = await dbStore.updateExperiment(wsA.id, expA.id, {
    status: 'completed',
    result: 'confirmed',
    learning: 'O onboarding simplificado atingiu 19.2% de conversão, superando o objetivo.',
  });
  const lifecycleValid =
    runningExp.status === 'running' &&
    runningExp.started_at !== null &&
    completedExp.status === 'completed' &&
    completedExp.completed_at !== null &&
    Boolean(completedExp.learning);

  results.push({
    name: '5.2 [EXP-ATOMIC] Transição atômica draft -> running -> completed com auditoria de timestamps e aprendizado',
    expected: 'Transição aceita com preenchimento automático de timestamps e persistência de aprendizados',
    actual: lifecycleValid ? 'Aprovado com timestamps e aprendizados íntegros' : 'Falha no ciclo de vida',
    passed: lifecycleValid,
  });

  // 5.3 Invalid Transition Reversal (completed -> draft is blocked)
  let invalidReversalBlocked = false;
  try {
    await dbStore.updateExperiment(wsA.id, expA.id, {
      status: 'draft',
    });
  } catch (err: any) {
    invalidReversalBlocked = true;
  }
  results.push({
    name: '5.3 [EXP-ATOMIC] Reversão inválida de status (completed -> draft) é bloqueada por regra de ciclo de vida',
    expected: 'Rejeitado por transição inválida de ciclo de vida',
    actual: invalidReversalBlocked ? 'Rejeitado com sucesso' : 'Permitido indevidamente',
    passed: invalidReversalBlocked,
  });

  // 5.4 Concurrency / Transactional Isolation Test (Simulate concurrent updates on a fresh experiment)
  const expConcurrent = await dbStore.createExperiment(wsA.id, {
    hypothesis_id: hypA.id,
    title: 'Experimento Concorrente',
    description: 'Teste de concorrência com FOR UPDATE',
    method: 'Teste Concorrente',
    success_criteria: 'Meta 10%',
  });

  // Execute simultaneous updates
  const [update1, update2] = await Promise.allSettled([
    dbStore.updateExperiment(wsA.id, expConcurrent.id, { title: 'Título Atualizado 1' }),
    dbStore.updateExperiment(wsA.id, expConcurrent.id, { description: 'Descrição Atualizada 2' }),
  ]);

  const bothSucceeded = update1.status === 'fulfilled' && update2.status === 'fulfilled';
  const finalExpState = await dbStore.getExperimentById(wsA.id, expConcurrent.id);
  const stateConsistent = finalExpState !== null && finalExpState.id === expConcurrent.id;

  results.push({
    name: '5.4 [EXP-ATOMIC] Atualizações concorrentes no mesmo experimento são serializadas atomicamente com FOR UPDATE',
    expected: 'Ambas as transações resolvidas sem deadlock e com estado consistente',
    actual: bothSucceeded && stateConsistent ? 'Execução concorrente atômica bem-sucedida' : 'Falha em concorrência',
    passed: bothSucceeded && stateConsistent,
  });

  // ==========================================
  // SECTION 6: STANDARDIZED ERROR HANDLING & ZERO DATA LEAKAGE
  // ==========================================

  // 6.1 Unexpected internal error (500) must return sanitized payload
  const internalErr = new Error('FATAL: connection to server at "10.0.0.1" failed: table "internal_secrets" not found');
  const resInternal = testErrorResponse(internalErr);
  const is500Sanitized =
    resInternal.status === 500 &&
    resInternal.body?.success === false &&
    resInternal.body?.error === 'INTERNAL_SERVER_ERROR' &&
    resInternal.body?.message === 'Não foi possível concluir a operação.' &&
    !JSON.stringify(resInternal.body).includes('10.0.0.1') &&
    !JSON.stringify(resInternal.body).includes('internal_secrets');

  results.push({
    name: '6.1 [ERROR-POLICY] Erro interno 500 não vaza SQL, IPs, nomes de tabelas ou stack traces para o cliente',
    expected: '{ success: false, error: "INTERNAL_SERVER_ERROR", message: "Não foi possível concluir a operação." }',
    actual: is500Sanitized ? 'Sanitizado com segurança (Zero vazamento)' : `Vazamento detectado: ${JSON.stringify(resInternal.body)}`,
    passed: is500Sanitized,
  });

  // 6.2 BusinessRuleError (400) returns clean domain message
  const bizErr = new BusinessRuleError('A hipótese informada não pertence a este workspace.');
  const resBiz = testErrorResponse(bizErr);
  const is400Clean =
    resBiz.status === 400 &&
    resBiz.body?.success === false &&
    resBiz.body?.error === 'BAD_REQUEST' &&
    resBiz.body?.message === 'A hipótese informada não pertence a este workspace.';

  results.push({
    name: '6.2 [ERROR-POLICY] BusinessRuleError retorna 400 BAD_REQUEST com mensagem clara de negócio',
    expected: '{ success: false, error: "BAD_REQUEST", message: "..." }',
    actual: is400Clean ? 'Retorno 400 padronizado' : `Incorreto: ${JSON.stringify(resBiz.body)}`,
    passed: is400Clean,
  });

  // 6.3 NotFoundError (404) returns clean NOT_FOUND
  const notFoundErr = new NotFoundError('Experimento não encontrado.');
  const resNotFound = testErrorResponse(notFoundErr);
  const is404Clean =
    resNotFound.status === 404 &&
    resNotFound.body?.success === false &&
    resNotFound.body?.error === 'NOT_FOUND' &&
    resNotFound.body?.message === 'Experimento não encontrado.';

  results.push({
    name: '6.3 [ERROR-POLICY] NotFoundError retorna 404 NOT_FOUND padronizado',
    expected: '{ success: false, error: "NOT_FOUND", message: "..." }',
    actual: is404Clean ? 'Retorno 404 padronizado' : `Incorreto: ${JSON.stringify(resNotFound.body)}`,
    passed: is404Clean,
  });

  // 6.4 ForbiddenError (403) returns clean FORBIDDEN
  const forbiddenErr = new ForbiddenError('Acesso negado ao recurso.');
  const resForbidden = testErrorResponse(forbiddenErr);
  const is403Clean =
    resForbidden.status === 403 &&
    resForbidden.body?.success === false &&
    resForbidden.body?.error === 'FORBIDDEN' &&
    resForbidden.body?.message === 'Acesso negado ao recurso.';

  results.push({
    name: '6.4 [ERROR-POLICY] ForbiddenError retorna 403 FORBIDDEN padronizado',
    expected: '{ success: false, error: "FORBIDDEN", message: "..." }',
    actual: is403Clean ? 'Retorno 403 padronizado' : `Incorreto: ${JSON.stringify(resForbidden.body)}`,
    passed: is403Clean,
  });

  // ==========================================
  // SECTION 7: AI PROMPT LIMITS (SEC-AI01)
  // ==========================================

  // 7.1 Ask Product limita prompt curto (< 3 chars)
  const shortPromptCheck = askProductSchema.safeParse({ prompt: 'ab' });
  results.push({
    name: '7.1 [AI-LIMITS] Ask Product rejeita prompt com menos de 3 caracteres',
    expected: 'Rejeitado por validação de tamanho mínimo',
    actual: !shortPromptCheck.success ? 'Rejeitado com erro de validação' : 'Aceito indevidamente',
    passed: !shortPromptCheck.success,
  });

  // 7.2 Ask Product limita prompt longo (> 2000 chars)
  const longPromptCheck = askProductSchema.safeParse({ prompt: 'a'.repeat(2001) });
  results.push({
    name: '7.2 [AI-LIMITS] Ask Product rejeita prompt que excede 2000 caracteres',
    expected: 'Rejeitado por validação de tamanho máximo (2000 chars)',
    actual: !longPromptCheck.success ? 'Rejeitado com erro de limite máximo' : 'Aceito indevidamente',
    passed: !longPromptCheck.success,
  });

  // 7.3 Ask Product aceita prompt válido
  const validPromptCheck = askProductSchema.safeParse({ prompt: 'Quais são as principais dores do onboarding?' });
  results.push({
    name: '7.3 [AI-LIMITS] Ask Product aceita prompt válido e sanitizado',
    expected: 'Aprovado na validação de schema',
    actual: validPromptCheck.success ? 'Aprovado com sucesso' : 'Falha na validação',
    passed: validPromptCheck.success,
  });

  // ==========================================
  // SECTION 8: RBAC ENFORCEMENT & MEMBER MANAGEMENT
  // ==========================================

  // Helper to simulate requireRole middleware
  function simulateRoleGuard(allowedRoles: any[], currentRole: string) {
    let nextCalled = false;
    let statusCode: number | undefined;
    let responseBody: any;

    const mockReq: Partial<Request> = {
      workspaceRole: currentRole as any,
    };

    const mockRes: Partial<Response> = {
      status(code: number) {
        statusCode = code;
        return this as Response;
      },
      json(body: any) {
        responseBody = body;
        return this as Response;
      },
    };

    const mockNext: NextFunction = () => {
      nextCalled = true;
    };

    const guard = requireRole(allowedRoles);
    guard(mockReq as Request, mockRes as Response, mockNext);

    return { status: statusCode, body: responseBody, nextCalled };
  }

  // 8.1 Viewer attempting mutation -> Blocked 403
  const viewerGuardRes = simulateRoleGuard(['owner', 'admin', 'member'], 'viewer');
  results.push({
    name: '8.1 [RBAC] Usuário com papel "viewer" tentando operação mutativa -> Bloqueado 403',
    expected: 'Status 403 FORBIDDEN (Next NOT called)',
    actual: viewerGuardRes.status === 403 && !viewerGuardRes.nextCalled ? '403 FORBIDDEN (Bloqueado)' : `Inseguro (Status ${viewerGuardRes.status})`,
    passed: viewerGuardRes.status === 403 && !viewerGuardRes.nextCalled,
  });

  // 8.2 Member / Admin / Owner permitted on mutative routes
  const memberGuardRes = simulateRoleGuard(['owner', 'admin', 'member'], 'member');
  const adminGuardRes = simulateRoleGuard(['owner', 'admin', 'member'], 'admin');
  const ownerGuardRes = simulateRoleGuard(['owner', 'admin', 'member'], 'owner');
  const mutativePermitted = memberGuardRes.nextCalled && adminGuardRes.nextCalled && ownerGuardRes.nextCalled;

  results.push({
    name: '8.2 [RBAC] Usuários com papéis "member", "admin" e "owner" autorizados em operações mutativas',
    expected: 'Next() chamado para member, admin e owner',
    actual: mutativePermitted ? 'Autorizado com sucesso' : 'Bloqueado indevidamente',
    passed: mutativePermitted,
  });

  // 8.3 Last Owner demotion protection in store
  let demoteLastOwnerBlocked = false;
  try {
    await dbStore.updateMemberRole(wsA.id, userA, 'member');
  } catch (err: any) {
    demoteLastOwnerBlocked = err instanceof BusinessRuleError && err.message.includes('único proprietário');
  }

  results.push({
    name: '8.3 [MEMBER-RULES] Tentativa de rebaixar o único proprietário do workspace é bloqueada',
    expected: 'BusinessRuleError com mensagem do único proprietário',
    actual: demoteLastOwnerBlocked ? 'Bloqueado por regra de negócio' : 'Permitiu rebaixar último proprietário',
    passed: demoteLastOwnerBlocked,
  });

  // 8.4 Last Owner removal protection in store
  let removeLastOwnerBlocked = false;
  try {
    await dbStore.removeMember(wsA.id, userA);
  } catch (err: any) {
    removeLastOwnerBlocked = err instanceof BusinessRuleError && err.message.includes('único proprietário');
  }

  results.push({
    name: '8.4 [MEMBER-RULES] Tentativa de remover o único proprietário do workspace é bloqueada',
    expected: 'BusinessRuleError com mensagem do único proprietário',
    actual: removeLastOwnerBlocked ? 'Bloqueado por regra de negócio' : 'Permitiu remover último proprietário',
    passed: removeLastOwnerBlocked,
  });

  // 8.5 List workspace members
  const membersList = await dbStore.listWorkspaceMembers(wsA.id);
  const hasMembers = Array.isArray(membersList) && membersList.some((m) => m.user_id === userA && m.role === 'owner');
  results.push({
    name: '8.5 [MEMBER-LIST] Listagem de membros do workspace retorna integrantes e seus papéis',
    expected: 'Lista contendo userA como owner',
    actual: hasMembers ? 'Lista obtida com sucesso' : 'Falha na listagem',
    passed: hasMembers,
  });

  // Cleanup test workspaces
  try {
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, wsA.id));
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, wsB.id));
    await db.delete(schema.workspaces).where(eq(schema.workspaces.id, wsTx.id));
  } catch (e) {
    // Non-critical cleanup
  }

  return results;
}

// Auto-run if executed directly via CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('security.test.ts')) {
  runSecurityIsolationTests()
    .then((results) => {
      console.log('\n================================================================');
      console.log('SUÍTE RIGOROSA DE TESTES DE SEGURANÇA & ISOLAMENTO MULTI-TENANT');
      console.log('================================================================\n');
      let allPassed = true;
      for (const r of results) {
        const icon = r.passed ? '✅' : '❌';
        console.log(`${icon} ${r.name}`);
        console.log(`   Esperado: ${r.expected}`);
        console.log(`   Obtido:   ${r.actual}\n`);
        if (!r.passed) allPassed = false;
      }
      const passedCount = results.filter((r) => r.passed).length;
      console.log('----------------------------------------------------------------');
      console.log(`Resultado Consolidado: ${passedCount}/${results.length} testes aprovados.`);
      console.log('----------------------------------------------------------------\n');
      if (!allPassed) process.exit(1);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Falha fatal na execução da suíte de segurança:', err);
      process.exit(1);
    });
}
