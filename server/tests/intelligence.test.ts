import { dbStore } from '../db/store.js';
import { intelligenceService } from '../services/intelligence.service.js';
import { requireRole } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rate_limit.js';

async function runIntelligenceTests() {
  console.log('🧪 Iniciando suíte de testes de Inteligência do Produto (Etapa 7)...');

  const workspaceIdA = 'ws_tenant_A';
  const workspaceIdB = 'ws_tenant_B';

  // Seed user & workspaces
  await dbStore.findOrCreateUser('usr_admin_1', 'admin@example.com', 'Admin User');
  await dbStore.findOrCreateUser('usr_viewer_1', 'viewer@example.com', 'Viewer User');

  // Setup roles
  const mockMemberships: Record<string, string> = {
    'usr_admin_1': 'admin',
    'usr_viewer_1': 'viewer',
  };

  // 1. Test Discovery Health Metrics Calculation
  console.log('📊 Testando cálculo de Discovery Health...');
  const health = await dbStore.getDiscoveryHealth(workspaceIdA);
  if (!health || typeof health.health_score !== 'number') {
    throw new Error('Falha no cálculo de Discovery Health');
  }
  console.log(`✅ Discovery Health Score: ${health.health_score}/100`);

  // 2. Test Insight Generation & Traceability
  console.log('💡 Testando geração e validação de Product Insights...');
  const probA = await dbStore.createProblem(workspaceIdA, {
    title: 'Problema de Onboarding',
    description: 'Usuários desistem no passo 2',
    impact: 'high',
    frequency: 'frequent',
  });

  const oppA = await dbStore.createOpportunity(workspaceIdA, {
    problem_ids: [probA.id],
    title: 'Oportunidade de Simplificação',
    description: 'Reduzir campos do formulário',
    value: 'high',
    effort: 'low',
  });

  const hypA = await dbStore.createHypothesis(workspaceIdA, {
    opportunity_id: oppA.id,
    title: 'Hipótese de Menos Campos',
    statement: 'Se removermos 3 campos, a conversão sobe 15%',
    metrics_to_validate: 'Taxa de conversão',
  });

  const expA = await dbStore.createExperiment(workspaceIdA, {
    hypothesis_id: hypA.id,
    title: 'Teste A/B do Formulário',
    description: 'Comparar 3 campos vs 6 campos',
  });

  const decA = await dbStore.createDecision(workspaceIdA, {
    experiment_id: expA.id,
    title: 'Decisão Estratégica do Onboarding',
    decision: 'Aprovar formulário simplificado',
    rationale: 'Premissa suportada por dados preliminares',
  });

  const insightsA = await intelligenceService.generateInsights(workspaceIdA);
  if (!Array.isArray(insightsA) || insightsA.length === 0) {
    throw new Error('Falha na geração de insights: resultado vazio');
  }

  const firstInsight = insightsA[0];
  if (!firstInsight.title || !firstInsight.facts || !firstInsight.interpretation || !firstInsight.uncertainties) {
    throw new Error('Insight gerado não possui estrutura completa');
  }
  console.log(`✅ ${insightsA.length} insight(s) gerado(s) com sucesso.`);

  // 3. Test Traceability: Source IDs belonging strictly to workspaceIdA
  console.log('🔗 Testando rastreabilidade estrita de fontes (Sources)...');
  const allDecsA = await dbStore.listDecisions(workspaceIdA);
  const decIdsA = new Set(allDecsA.map((d) => d.id));
  for (const ins of insightsA) {
    for (const src of ins.sources) {
      if (src.entity_type === 'decision' && !decIdsA.has(src.entity_id)) {
        throw new Error(`FALHA: Source ID ${src.entity_id} não pertence a nenhuma decisão do workspace A!`);
      }
    }
  }
  console.log('✅ Fontes mapeadas correspondem exclusivamente às entidades do workspace.');

  // 4. Test: Insight sem source NÃO fabrica fonte artificial
  console.log('🚫 Testando prevenção de fabricação de fontes falsas...');
  const emptyWorkspaceId = 'ws_empty_test_999';
  const emptyInsights = await intelligenceService.generateInsights(emptyWorkspaceId);
  const emptyGapInsight = emptyInsights.find((i) => i.type === 'gap');
  if (emptyGapInsight && emptyGapInsight.sources.length > 0) {
    throw new Error('FALHA: Insight gerado em workspace sem entidades não deve fabricar sources!');
  }
  console.log('✅ Prevenção de fabricação de fontes falsas verificada com sucesso (sources = []).');

  // 5. Test: Persistência real de Insights por workspace
  console.log('💾 Testando persistência real de Insights...');
  const retrieved = await dbStore.getInsights(workspaceIdA);
  if (retrieved.length === 0) {
    throw new Error('FALHA: Insights salvos não foram recuperados da persistência!');
  }
  console.log(`✅ ${retrieved.length} insight(s) recuperado(s) da persistência com sucesso.`);

  // 6. Test: Cross-tenant Intelligence Isolation
  console.log('🔒 Testando isolamento cross-tenant entre Workspace A e Workspace B...');
  const insightsB = await dbStore.getInsights(workspaceIdB);
  const leakedToB = insightsB.filter((i) => i.workspace_id === workspaceIdA);
  if (leakedToB.length > 0) {
    throw new Error('FALHA: Vazamento de dados detectado do Workspace A para o Workspace B!');
  }
  console.log('✅ Isolamento cross-tenant verificado com sucesso.');

  // 7. Test: Viewer Role Blocked on /generate
  console.log('🛡️ Testando bloqueio de papel "viewer" na rota de geração...');
  const roleCheckMiddleware = requireRole(['owner', 'admin', 'member']);

  let viewerBlocked = false;
  let viewerReq: any = { memberRole: 'viewer' };
  let viewerRes: any = {
    status: (code: number) => {
      if (code === 403) viewerBlocked = true;
      return { json: () => {} };
    },
  };

  roleCheckMiddleware(viewerReq, viewerRes, () => {});
  if (!viewerBlocked) {
    throw new Error('FALHA: Usuário com papel "viewer" deveria ter sido bloqueado (403)!');
  }
  console.log('✅ Papel "viewer" bloqueado corretamente na geração de insights.');

  // 8. Test: Rate limit on generate
  console.log('⏱️ Testando rate limiter de inteligência artificial...');
  let rateLimit429Triggered = false;
  const mockReq: any = { ip: '127.0.0.1', user: { uid: 'usr_rate_test' } };
  const mockRes: any = {
    status: (code: number) => {
      if (code === 429) rateLimit429Triggered = true;
      return { json: () => {} };
    },
  };

  // Simulate 12 requests in short succession
  for (let i = 0; i < 12; i++) {
    aiRateLimiter(mockReq, mockRes, () => {});
  }

  if (!rateLimit429Triggered) {
    throw new Error('FALHA: Rate limiter não disparou status HTTP 429 após rajada de requisições!');
  }
  console.log('✅ Rate limiter de IA ativo e disparando HTTP 429 após rajada.');

  // 9. Test: Human-in-the-loop Update Status
  console.log('🤝 Testando alteração de status do Insight (Aceite do PM)...');
  const updated = await intelligenceService.updateInsightStatus(
    workspaceIdA,
    firstInsight.id,
    'accepted',
    'Aprovado pelo PM para próxima sprint'
  );
  if (updated.status !== 'accepted' || updated.feedback_notes !== 'Aprovado pelo PM para próxima sprint') {
    throw new Error('Falha ao atualizar status do insight para aceito');
  }
  console.log('✅ Status do Insight atualizado com sucesso.');

  console.log('🎉 Todos os testes de Inteligência do Produto e Segurança passaram!');
  process.exit(0);
}

runIntelligenceTests().catch((err) => {
  console.error('❌ Erro nos testes de Inteligência do Produto:', err);
  process.exit(1);
});
