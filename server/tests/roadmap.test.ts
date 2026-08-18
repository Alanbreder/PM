import { dbStore } from '../db/store.js';
import { createRoadmapItemSchema, updateRoadmapItemSchema } from '../schemas/index.js';
import { BusinessRuleError } from '../utils/errors.js';
import { dbReadyPromise } from '../../src/db/index.js';

async function runRoadmapTests() {
  await dbReadyPromise;
  console.log('🧪 Iniciando suíte de testes de Roadmap Estratégico & Execução (Etapa 8)...');

  // Seed workspaces & users
  const adminUser = await dbStore.findOrCreateUser('usr_admin_r', 'admin@example.com', 'Admin User');
  await dbStore.findOrCreateUser('usr_member_r', 'member@example.com', 'Member User');
  await dbStore.findOrCreateUser('usr_viewer_r', 'viewer@example.com', 'Viewer User');

  const wsA = await dbStore.createWorkspace('Roadmap Tenant A', adminUser.uid);
  const wsB = await dbStore.createWorkspace('Roadmap Tenant B', adminUser.uid);
  const workspaceIdA = wsA.id;
  const workspaceIdB = wsB.id;

  // Seed discovery chain in Workspace A
  const resA = await dbStore.createResearch(workspaceIdA, {
    title: 'Pesquisa de Retenção Mobile',
    objective: 'Mapear atritos no primeiro acesso mobile',
    target_audience: 'Novos usuários mobile',
    raw_notes: 'Usuários não encontram o botão de exportar.',
  });

  const evA = await dbStore.createEvidence(workspaceIdA, {
    research_id: resA.id,
    content: '80% dos usuários desistem da exportação por falta de feedback visual.',
    impact_score: 9,
    tags: ['mobile', 'ux', 'retention'],
  });

  const probA = await dbStore.createProblem(workspaceIdA, {
    title: 'Exportação confusa no mobile',
    description: 'Falta de feedback visual no botão de exportar',
    impact: 'high',
    frequency: 'frequent',
  });

  await dbStore.linkProblemEvidences(workspaceIdA, probA.id, [evA.id]);

  const oppA = await dbStore.createOpportunity(workspaceIdA, {
    problem_ids: [probA.id],
    title: 'Redesenho da Ação de Exportar',
    description: 'Adicionar feedback em tempo real e spinner de progresso',
    value: 'high',
    effort: 'low',
  });

  const hypA = await dbStore.createHypothesis(workspaceIdA, {
    opportunity_id: oppA.id,
    title: 'Hipótese de Feedback Imediato',
    statement: 'Se adicionarmos spinner e toast de sucesso, a retenção aumenta 12%',
    metrics_to_validate: 'Taxa de conclusão de exportação',
  });

  const expA = await dbStore.createExperiment(workspaceIdA, {
    hypothesis_id: hypA.id,
    title: 'Experimento Toast & Progress Bar',
    description: 'Teste A/B com 500 usuários',
    methodology: 'Teste A/B',
    sample_size: 500,
  });
  await dbStore.updateExperiment(workspaceIdA, expA.id, {
    status: 'running',
  });
  await dbStore.updateExperiment(workspaceIdA, expA.id, {
    status: 'completed',
    results: 'Taxa de conclusão subiu de 45% para 89%',
    learnings: 'Feedback visual eliminou tickets de suporte',
  });

  const decA = await dbStore.createDecision(workspaceIdA, {
    experiment_id: expA.id,
    title: 'Aprovar Redesenho Global da Exportação',
    description: 'Lançar para 100% da base no Q3',
    decision: 'approved',
    rationale: 'Resultados comprovados com +44% de conversão na exportação',
  });

  // Seed item in Workspace B for tenant isolation testing
  const resB = await dbStore.createResearch(workspaceIdB, {
    title: 'Pesquisa Workspace B',
    objective: 'Objetivo B',
  });
  const evB = await dbStore.createEvidence(workspaceIdB, {
    research_id: resB.id,
    content: 'Evidência exclusiva de B',
  });
  const probB = await dbStore.createProblem(workspaceIdB, {
    title: 'Problema B',
    description: 'Descrição Problema B',
    impact: 'medium',
    frequency: 'occasional',
  });
  const oppB = await dbStore.createOpportunity(workspaceIdB, {
    problem_ids: [probB.id],
    title: 'Oportunidade B',
    description: 'Descrição Oportunidade B',
    effort: 'medium',
    value: 'medium',
  });
  const hypB = await dbStore.createHypothesis(workspaceIdB, {
    opportunity_id: oppB.id,
    title: 'Hipótese B',
    statement: 'Declaração B',
  });
  const expB = await dbStore.createExperiment(workspaceIdB, {
    hypothesis_id: hypB.id,
    title: 'Experimento B',
  });
  await dbStore.updateExperiment(workspaceIdB, expB.id, {
    status: 'running',
  });
  await dbStore.updateExperiment(workspaceIdB, expB.id, {
    status: 'completed',
  });
  const decB = await dbStore.createDecision(workspaceIdB, {
    experiment_id: expB.id,
    title: 'Decisão B',
    decision: 'approved',
  });

  // 1. Test Zod Validation Schemas
  console.log('1️⃣ Testando Validação Zod de Roadmap...');
  const validPayload = {
    title: 'Novo Módulo de Exportação Mobile',
    description: 'Implementação de componente com feedback síncrono',
    timeframe: 'now' as const,
    status: 'planned' as const,
    priority: 'high' as const,
    target_quarter: '2026-Q3',
    progress: 10,
    decision_id: decA.id,
  };
  const validated = createRoadmapItemSchema.parse(validPayload);
  if (!validated.title || validated.progress !== 10) {
    throw new Error('Falha na validação Zod válida');
  }

  // Reject invalid progress (> 100 or < 0)
  try {
    createRoadmapItemSchema.parse({
      title: 'Iniciativa Inválida',
      progress: 150,
    });
    throw new Error('Deveria ter rejeitado progress > 100');
  } catch (err: any) {
    if (err.message.includes('Deveria')) throw err;
    console.log('   ✅ Validação Zod rejeitou progress > 100 corretamente');
  }

  // Reject short title (< 3 chars)
  try {
    createRoadmapItemSchema.parse({
      title: 'ab',
    });
    throw new Error('Deveria ter rejeitado título muito curto');
  } catch (err: any) {
    if (err.message.includes('Deveria')) throw err;
    console.log('   ✅ Validação Zod rejeitou título menor que 3 caracteres');
  }

  // 2. Test Item Creation & Persistence
  console.log('2️⃣ Testando Criação e Persistência de Roadmap Item...');
  const itemA = await dbStore.createRoadmapItem(workspaceIdA, {
    title: 'Módulo de Exportação com Feedback Instantâneo',
    description: 'Implementar spinner e confirmação visual',
    timeframe: 'now',
    status: 'in_progress',
    priority: 'high',
    target_quarter: '2026-Q3',
    decision_id: decA.id,
    opportunity_id: oppA.id,
    metrics_target: 'Elevar conclusão de exportação para 90%',
    progress: 25,
    owner_name: 'Squad Mobile Core',
  });

  if (!itemA || !itemA.id || itemA.workspace_id !== workspaceIdA) {
    throw new Error('Falha na criação do Roadmap Item no Workspace A');
  }
  console.log(`   ✅ Item criado com ID ${itemA.id} e progresso ${itemA.progress}%`);

  // 3. Test Multi-Tenant Isolation
  console.log('3️⃣ Testando Isolamento Multi-Tenant Estrito...');
  const itemsInB = await dbStore.listRoadmapItems(workspaceIdB);
  const leaked = itemsInB.find((i) => i.id === itemA.id);
  if (leaked) {
    throw new Error('VIOLAÇÃO CRÍTICA: Item do Workspace A vazou na listagem do Workspace B!');
  }

  const fetchCrossTenant = await dbStore.getRoadmapItemById(workspaceIdB, itemA.id);
  if (fetchCrossTenant !== null) {
    throw new Error('VIOLAÇÃO CRÍTICA: Workspace B conseguiu consultar item do Workspace A por ID!');
  }
  console.log('   ✅ Isolamento de leitura multi-tenant 100% estrito');

  // Prevent cross-tenant linking (Linking Decision B to Workspace A Roadmap Item)
  try {
    await dbStore.createRoadmapItem(workspaceIdA, {
      title: 'Iniciativa Ilegal Cross-Tenant',
      decision_id: decB.id, // from Workspace B!
    });
    throw new Error('VIOLAÇÃO CRÍTICA: Permitiu vincular Decisão de outro Workspace!');
  } catch (err: any) {
    if (err.message.includes('VIOLAÇÃO')) throw err;
    console.log('   ✅ Bloqueio de chave estrangeira cross-tenant funcionou com sucesso');
  }

  // 4. Test End-to-End Discovery Lineage (Rastreabilidade de Ponta a Ponta)
  console.log('4️⃣ Testando Rastreabilidade de Linhagem Completa (Lineage Tree)...');
  const lineage = await dbStore.getRoadmapItemLineage(workspaceIdA, itemA.id);
  if (!lineage) throw new Error('Falha ao obter linhagem');

  if (!lineage.decision || lineage.decision.id !== decA.id) {
    throw new Error('Linhagem falhou ao resolver a Decisão de Produto vinculada');
  }
  if (!lineage.experiment || lineage.experiment.id !== expA.id) {
    throw new Error('Linhagem falhou ao resolver o Experimento de validação');
  }
  if (!lineage.hypothesis || lineage.hypothesis.id !== hypA.id) {
    throw new Error('Linhagem falhou ao resolver a Hipótese');
  }
  if (!lineage.opportunity || lineage.opportunity.id !== oppA.id) {
    throw new Error('Linhagem falhou ao resolver a Oportunidade');
  }
  if (lineage.problems.length === 0 || lineage.problems[0].id !== probA.id) {
    throw new Error('Linhagem falhou ao resolver os Problemas associados');
  }
  if (lineage.evidences.length === 0 || lineage.evidences[0].id !== evA.id) {
    throw new Error('Linhagem falhou ao resolver as Evidências');
  }
  if (lineage.researches.length === 0 || lineage.researches[0].id !== resA.id) {
    throw new Error('Linhagem falhou ao resolver a Pesquisa de origem');
  }
  console.log('   ✅ Linhagem completa de ponta a ponta verificada:');
  console.log(`      Pesquisa: "${lineage.researches[0].title}"`);
  console.log(`      -> Evidência: "${lineage.evidences[0].content.substring(0, 40)}..."`);
  console.log(`      -> Problema: "${lineage.problems[0].title}"`);
  console.log(`      -> Oportunidade: "${lineage.opportunity.title}"`);
  console.log(`      -> Hipótese: "${lineage.hypothesis.title}"`);
  console.log(`      -> Experimento: "${lineage.experiment.title}"`);
  console.log(`      -> Decisão: "${lineage.decision.title}"`);
  console.log(`      -> Roadmap: "${lineage.roadmap_item.title}"`);

  // 5. Test Item Update & Status Transition
  console.log('5️⃣ Testando Atualização de Progresso e Status...');
  const updatedItem = await dbStore.updateRoadmapItem(workspaceIdA, itemA.id, {
    progress: 100,
    status: 'delivered',
    timeframe: 'now',
  });
  if (updatedItem.progress !== 100 || updatedItem.status !== 'delivered') {
    throw new Error('Falha ao atualizar status de entrega para 100% delivered');
  }
  console.log('   ✅ Atualização de progresso e status verificada com sucesso');

  // 6. Test Item Deletion & Workspace Boundary
  console.log('6️⃣ Testando Exclusão Segura de Item...');
  // Workspace B cannot delete item from Workspace A
  try {
    await dbStore.deleteRoadmapItem(workspaceIdB, itemA.id);
    throw new Error('VIOLAÇÃO CRÍTICA: Workspace B conseguiu deletar item do Workspace A!');
  } catch (err: any) {
    if (err.message.includes('VIOLAÇÃO')) throw err;
    console.log('   ✅ Bloqueio de exclusão cross-tenant verificado');
  }

  // Deletion in correct workspace
  await dbStore.deleteRoadmapItem(workspaceIdA, itemA.id);
  const deletedItem = await dbStore.getRoadmapItemById(workspaceIdA, itemA.id);
  if (deletedItem !== null) {
    throw new Error('Falha ao deletar item de Roadmap');
  }
  console.log('   ✅ Item deletado com sucesso no workspace autorizado');

  console.log('🎉 Todos os testes de Roadmap Estratégico (Etapa 8) passaram com sucesso!');
}

runRoadmapTests().catch((err) => {
  console.error('❌ Falha na suíte de testes de Roadmap:', err);
  process.exit(1);
});
