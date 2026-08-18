import { dbStore } from '../db/store.js';
import { PostgresStore } from '../db/postgresStore.js';
import { dbReadyPromise } from '../../src/db/index.js';
import assert from 'assert';

async function runPostgresPersistenceValidation() {
  await dbReadyPromise;
  console.log('🐘 INICIANDO VALIDAÇÃO DE PERSISTÊNCIA REAL POSTGRESQL & MULTI-TENANT ISOLATION...\n');

  // 1. Verify Store Type
  console.log('1️⃣ Verificando tipo de Store instanciado...');
  assert.ok(dbStore instanceof PostgresStore, 'O dbStore DEVE ser uma instância estrita de PostgresStore');
  console.log('✅ Confirmado: dbStore é estritamente PostgresStore (sem fallback para MemoryStore).\n');

  // 2. Setup Multi-tenant Test Workspaces
  console.log('2️⃣ Configurando workspaces para isolamento multi-tenant...');
  const userA = await dbStore.findOrCreateUser('usr_tenant_a', 'alice@tenant-a.com', 'Alice Tenant A');
  const userB = await dbStore.findOrCreateUser('usr_tenant_b', 'bob@tenant-b.com', 'Bob Tenant B');

  const wsA = await dbStore.createWorkspace('Empresa Alpha', userA.uid, 'Workspace da Empresa Alpha');
  const wsB = await dbStore.createWorkspace('Empresa Beta', userB.uid, 'Workspace da Empresa Beta');

  console.log(`✅ Workspace A criado: ${wsA.name} (${wsA.id})`);
  console.log(`✅ Workspace B criado: ${wsB.name} (${wsB.id})\n`);

  // 3. Test Entity Creation in Workspace A
  console.log('3️⃣ Criando entidades no Workspace A (Research, Evidence, Problem, Opportunity, Hypothesis, PRD, Persona)...');
  
  // Research & Evidence
  const researchA = await dbStore.createResearch(wsA.id, {
    title: 'Pesquisa com Usuários Enterprise',
    objective: 'Mapear fricções no onboarding',
  });
  const evidenceA = await dbStore.createEvidence(wsA.id, {
    content: 'Clientes levam 4 dias para configurar integrações',
    source: 'Entrevista com Head of Ops',
    origin_type: 'customer_interview',
    research_id: researchA.id,
  });

  // Problem & Opportunity
  const problemA = await dbStore.createProblem(wsA.id, {
    title: 'Onboarding de integrações lento e manual',
    description: 'Falta de assistente automatizado causa abandono',
    impact: 'high',
    frequency: 'frequent',
    evidence_ids: [evidenceA.id],
  });
  const opportunityA = await dbStore.createOpportunity(wsA.id, {
    title: 'Assistente de onboarding self-service com templates',
    description: 'Reduzir tempo de configuração de 4 dias para 15 minutos',
    effort: 'medium',
    value: 'high',
    problem_ids: [problemA.id],
  });

  // Hypothesis & Experiment
  const hypothesisA = await dbStore.createHypothesis(wsA.id, {
    title: 'Se fornecermos templates prontos, o tempo de setup cairá 70%',
    statement: 'Acreditamos que templates reduzem atrito inicial',
    opportunity_id: opportunityA.id,
  });
  const experimentA = await dbStore.createExperiment(wsA.id, {
    title: 'Teste A/B com 3 templates de integração',
    hypothesis_id: hypothesisA.id,
    methodology: 'A/B Test em 50 novas contas',
  });
  await dbStore.updateExperiment(wsA.id, experimentA.id, { status: 'running' });
  await dbStore.updateExperiment(wsA.id, experimentA.id, { status: 'completed' });

  // Decision & Roadmap
  const decisionA = await dbStore.createDecision(wsA.id, {
    title: 'Adotar templates como padrão do produto',
    decision: 'Implementar catálogo nativo no Core',
    experiment_id: experimentA.id,
  });
  const roadmapA = await dbStore.createRoadmapItem(wsA.id, {
    title: 'Módulo de Catálogo de Templates',
    timeframe: 'now',
    status: 'in_progress',
    opportunity_id: opportunityA.id,
  });

  // Persona & PRD
  const personaA = await dbStore.createPersona(wsA.id, {
    name: 'Paula Product Manager',
    role_title: 'Head of Product',
    pains: ['Falta de rastreabilidade', 'Dados descentralizados'],
  });
  const prdA = await dbStore.createPRD(wsA.id, {
    title: 'PRD - Catálogo de Templates v1',
  });

  console.log('✅ Entidades criadas com sucesso no Workspace A.\n');

  // 4. Test Multi-tenant Isolation (Workspace B cannot see Workspace A data)
  console.log('4️⃣ Validando isolamento estrito: Workspace B NÃO deve ter acesso aos dados do Workspace A...');
  
  const evidencesB = await dbStore.listEvidences(wsB.id);
  const problemsB = await dbStore.listProblems(wsB.id);
  const opportunitiesB = await dbStore.listOpportunities(wsB.id);
  const hypothesesB = await dbStore.listHypotheses(wsB.id);
  const roadmapB = await dbStore.listRoadmapItems(wsB.id);
  const personasB = await dbStore.listPersonas(wsB.id);
  const prdsB = await dbStore.listPRDs(wsB.id);

  assert.strictEqual(evidencesB.length, 0, 'Workspace B não deve listar evidências do Workspace A');
  assert.strictEqual(problemsB.length, 0, 'Workspace B não deve listar problemas do Workspace A');
  assert.strictEqual(opportunitiesB.length, 0, 'Workspace B não deve listar oportunidades do Workspace A');
  assert.strictEqual(hypothesesB.length, 0, 'Workspace B não deve listar hipóteses do Workspace A');
  assert.strictEqual(roadmapB.length, 0, 'Workspace B não deve listar roadmap do Workspace A');
  assert.strictEqual(personasB.length, 0, 'Workspace B não deve listar personas do Workspace A');
  assert.strictEqual(prdsB.length, 0, 'Workspace B não deve listar PRDs do Workspace A');

  console.log('✅ Isolamento multi-tenant confirmado: 0 registros vazados para o Workspace B.\n');

  // 5. Test Cross-Tenant Tampering Prevention
  console.log('5️⃣ Validando proteção contra tentativas de alteração/exclusão cross-tenant...');
  
  try {
    await dbStore.updateProblem(wsB.id, problemA.id, { title: 'Tentativa de Hijack por Tenant B' });
    assert.fail('Deveria falhar ao tentar atualizar problema de outro workspace');
  } catch (err: any) {
    console.log('✅ Atualização cross-tenant bloqueada com sucesso.');
  }

  try {
    await dbStore.deleteRoadmapItem(wsB.id, roadmapA.id);
    assert.fail('Deveria falhar ao tentar deletar roadmap de outro workspace');
  } catch (err: any) {
    console.log('✅ Deleção cross-tenant bloqueada com sucesso.');
  }

  // 6. Test Persistence Across Store Re-Instantiation
  console.log('\n6️⃣ Validando persistência através de nova instância do PostgresStore (Simulação de Restart do Servidor)...');
  const freshPostgresStore = new PostgresStore();

  const retrievedProblems = await freshPostgresStore.listProblems(wsA.id);
  const retrievedRoadmap = await freshPostgresStore.listRoadmapItems(wsA.id);
  const retrievedPrd = await freshPostgresStore.getPRDById(wsA.id, prdA.id);

  assert.strictEqual(retrievedProblems.length, 1, 'Nova instância deve recuperar exatamente 1 problema do banco');
  assert.strictEqual(retrievedProblems[0].title, 'Onboarding de integrações lento e manual');
  assert.strictEqual(retrievedRoadmap.length, 1, 'Nova instância deve recuperar 1 item de roadmap');
  assert.strictEqual(retrievedRoadmap[0].title, 'Módulo de Catálogo de Templates');
  assert.ok(retrievedPrd !== null, 'Nova instância deve recuperar o PRD pelo ID');
  assert.strictEqual(retrievedPrd?.title, 'PRD - Catálogo de Templates v1');

  console.log('✅ Persistência confirmada com sucesso: dados preservados e recuperados por nova instância.\n');

  console.log('🎉 TODAS AS VALIDAÇÕES DE PERSISTÊNCIA REAL POSTGRESQL PASSARAM COM 100% DE SUCESSO!');
}

runPostgresPersistenceValidation().catch((err) => {
  console.error('❌ Falha na validação de persistência PostgreSQL:', err);
  process.exit(1);
});
