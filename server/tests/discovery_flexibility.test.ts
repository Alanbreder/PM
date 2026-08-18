import { dbStore, BusinessRuleError } from '../db/store.js';
import { dbReadyPromise } from '../../src/db/index.js';

async function runDiscoveryFlexibilityTests() {
  await dbReadyPromise;
  console.log('🧪 Iniciando testes de Flexibilidade e Discovery Não-Linear ("Guided when useful, flexible when necessary")...');

  // Create test workspaces
  const ws1 = await dbStore.createWorkspace('Flexibility WS 1', 'Owner 1', 'Test Workspace 1');
  const ws2 = await dbStore.createWorkspace('Flexibility WS 2', 'Owner 2', 'Test Workspace 2');

  // Test 1: Manual Evidence Creation (No research_id)
  console.log('  Testing: Criação manual de evidência sem pesquisa...');
  const manualEv = await dbStore.createEvidence(ws1.id, {
    content: 'Clientes reclamam que o tempo de resposta é muito alto no checkout.',
    source: 'Ticket de Suporte #1092',
    origin_type: 'support_ticket',
    impact_score: 4,
    tags: ['checkout', 'performance'],
    notes: 'Prioridade alta para o próximo trimestre',
  });

  if (!manualEv.id || manualEv.content !== 'Clientes reclamam que o tempo de resposta é muito alto no checkout.' || manualEv.research_id !== undefined && manualEv.research_id !== null) {
    throw new Error('Falha no Teste 1: Evidência manual deveria ser criada sem pesquisa associada!');
  }
  console.log('  ✅ Teste 1 passou: Evidência manual criada com sucesso.');

  // Test 2: Evidence with valid research_id
  console.log('  Testing: Criação de evidência com pesquisa vinculada...');
  const research = await dbStore.createResearch(ws1.id, {
    title: 'Pesquisa de Usabilidade Checkout',
    objective: 'Mapear fricções no funil',
    target_audience: 'Compradores frequentes mobile',
  });

  const linkedEv = await dbStore.createEvidence(ws1.id, {
    research_id: research.id,
    content: 'Usuário não encontrou o botão de pagar com Pix.',
    source: 'Entrevista #1',
    origin_type: 'customer_interview',
    impact_score: 5,
  });

  if (!linkedEv.id || linkedEv.research_id !== research.id) {
    throw new Error('Falha no Teste 2: Evidência vinculada à pesquisa não foi associada corretamente!');
  }
  console.log('  ✅ Teste 2 passou: Evidência vinculada com sucesso.');

  // Test 3: Standalone Opportunity (No problem_id)
  console.log('  Testing: Criação de oportunidade direta/independente...');
  const directOpp = await dbStore.createOpportunity(ws1.id, {
    title: 'Integração Nativa com Apple Pay',
    description: 'Permitir pagamento biométrico instantâneo.',
    effort: 'low',
    value: 'high',
  });

  if (!directOpp.id || directOpp.title !== 'Integração Nativa com Apple Pay') {
    throw new Error('Falha no Teste 3: Oportunidade direta deveria ser criada sem problemas associados!');
  }
  console.log('  ✅ Teste 3 passou: Oportunidade direta criada com sucesso.');

  // Test 4: Opportunity with Problem linking
  console.log('  Testing: Criação de oportunidade vinculada a problemas...');
  const problem = await dbStore.createProblem(ws1.id, {
    title: 'Abandono alto de carrinho no mobile',
    description: 'Muitos campos para preencher em telas pequenas.',
    impact: 'high',
    frequency: 'frequent',
  });

  const linkedOpp = await dbStore.createOpportunity(ws1.id, {
    title: 'Checkout 1-Clique Mobile',
    description: 'Preenchimento automático e autenticação rápida.',
    effort: 'medium',
    value: 'transformative',
    problem_ids: [problem.id],
  });

  if (!linkedOpp.id) {
    throw new Error('Falha no Teste 4: Oportunidade vinculada não foi criada!');
  }
  console.log('  ✅ Teste 4 passou: Oportunidade vinculada criada com sucesso.');

  // Test 5: Standalone Hypothesis (No opportunity_id)
  console.log('  Testing: Criação de hipótese exploratória/livre...');
  const freeHyp = await dbStore.createHypothesis(ws1.id, {
    title: 'Gamificação no onboarding reduz churn precoce',
    statement: 'Se adicionarmos uma barra de progresso com recompensas, a retenção D7 subirá 15%.',
    metrics_to_validate: 'Retenção D7 > 45%',
    confidence_score: 3,
  });

  if (!freeHyp.id || freeHyp.opportunity_id !== undefined && freeHyp.opportunity_id !== null) {
    throw new Error('Falha no Teste 5: Hipótese exploratória deveria ser criada sem oportunidade!');
  }
  console.log('  ✅ Teste 5 passou: Hipótese exploratória criada com sucesso.');

  // Test 6: Cross-workspace isolation
  console.log('  Testing: Bloqueio de relacionamento cross-workspace...');
  let crossWsBlocked = false;
  try {
    // Tentar criar oportunidade no WS2 referenciando problema do WS1
    await dbStore.createOpportunity(ws2.id, {
      title: 'Tentativa Cross WS',
      description: 'Tentando vazar dados de outro workspace',
      effort: 'low',
      value: 'low',
      problem_ids: [problem.id],
    });
  } catch (err: any) {
    if (err instanceof BusinessRuleError) {
      crossWsBlocked = true;
    }
  }

  if (!crossWsBlocked) {
    throw new Error('Falha no Teste 6: Tentativa de vincular entidade de outro workspace deveria ser bloqueada!');
  }
  console.log('  ✅ Teste 6 passou: Isolamento cross-workspace garantido.');

  console.log('🎉 Todos os testes de flexibilidade e discovery não-linear passaram com 100% de sucesso!');
}

runDiscoveryFlexibilityTests().catch((err) => {
  console.error('❌ Erro na suíte de testes de flexibilidade:', err);
  process.exit(1);
});
