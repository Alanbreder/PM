import { describe, it } from 'node:test';
import assert from 'node:assert';
import { dbStore } from '../db/store.js';
import { evaluateToolWithAICoach } from '../services/gemini.service.js';
import { dbReadyPromise } from '../../src/db/index.js';

async function runToolkitTests() {
  await dbReadyPromise;
  console.log('🧪 Iniciando suíte de testes do Product Tools & AI Coach...');

  const user = await dbStore.findOrCreateUser('usr_toolkit_test', 'toolkit@test.com', 'Toolkit Tester');
  const wsObjA = await dbStore.createWorkspace('Toolkit Workspace A', user.uid);
  const wsObjB = await dbStore.createWorkspace('Toolkit Workspace B', user.uid);
  const wsA = wsObjA.id;
  const wsB = wsObjB.id;

  // 1. Criação e Persistência de Canvas
  console.log('1️⃣ Testando Criação e Persistência de Canvas...');
  const savedCanvas = await dbStore.saveToolkitCanvas(wsA, {
    tool_key: 'product_canvas',
    title: 'Product Canvas - App Mobile',
    canvas_data: {
      product_name: 'Super App B2B',
      vision_goal: 'Ser a plataforma número 1 em automação de discovery',
      target_group: 'Product Managers e Líderes de Produto',
      metrics: 'Aumento de 40% na velocidade do ciclo de discovery',
    },
  });

  assert.ok(savedCanvas.id, 'Canvas deve possuir ID');
  assert.strictEqual(savedCanvas.tool_key, 'product_canvas');
  assert.strictEqual(savedCanvas.workspace_id, wsA);
  console.log('   ✅ Canvas criado e salvo com sucesso');

  // 2. Isolamento Multi-Tenant
  console.log('2️⃣ Testando Isolamento Multi-Tenant...');
  const listWsA = await dbStore.listToolkitCanvases(wsA);
  const listWsB = await dbStore.listToolkitCanvases(wsB);
  assert.strictEqual(listWsA.length >= 1, true);
  assert.strictEqual(listWsB.filter((c) => c.id === savedCanvas.id).length, 0);
  console.log('   ✅ Isolamento multi-tenant garantido');

  // 3. Atualização (AutoSave)
  console.log('3️⃣ Testando Atualização de Canvas...');
  const updatedCanvas = await dbStore.saveToolkitCanvas(wsA, {
    id: savedCanvas.id,
    tool_key: 'product_canvas',
    title: 'Product Canvas - App Mobile v2',
    canvas_data: {
      ...savedCanvas.canvas_data,
      metrics: 'Aumento de 50% na retenção',
    },
  });
  assert.strictEqual(updatedCanvas.title, 'Product Canvas - App Mobile v2');
  assert.strictEqual(updatedCanvas.canvas_data.metrics, 'Aumento de 50% na retenção');
  console.log('   ✅ Canvas atualizado via AutoSave com sucesso');

  // 4. Duplicação de Canvas
  console.log('4️⃣ Testando Duplicação de Canvas...');
  const duplicated = await dbStore.duplicateToolkitCanvas(wsA, savedCanvas.id);
  assert.ok(duplicated);
  assert.notStrictEqual(duplicated.id, savedCanvas.id);
  assert.strictEqual(duplicated.title, 'Product Canvas - App Mobile v2 (Cópia)');
  console.log('   ✅ Canvas duplicado com sucesso');

  // 5. AI Product Coach - Detecção de Dados Insuficientes
  console.log('5️⃣ Testando AI Product Coach com dados insuficientes...');
  const emptyEvaluation = await evaluateToolWithAICoach('lean_canvas', 'Lean Canvas', {
    problem: '',
    solution: '',
  });
  assert.strictEqual(emptyEvaluation.has_sufficient_data, false);
  assert.ok(emptyEvaluation.data_gaps && emptyEvaluation.data_gaps.length > 0);
  console.log('   ✅ AI Coach detectou corretamente dados insuficientes');

  // 6. AI Product Coach - Análise Estruturada nos 5 Pilares
  console.log('6️⃣ Testando AI Product Coach com dados preenchidos nos 5 pilares...');
  const fullEvaluation = await evaluateToolWithAICoach('problem_statement', 'Problem Statement', {
    problem: 'Os usuários enfrentam atraso de 15 minutos para carregar o dashboard executivo',
    context: 'Empresas de grande porte com mais de 500 projetos ativos simultâneos',
    frequency: 'Diariamente durante a primeira reunião matinal',
    impact: 'Perda de produtividade e abandono da ferramenta por diretores',
    why_it_matters: 'Diminui o NPS e aumenta churn no tier Enterprise',
    desired_outcome: 'Carregamento do dashboard em menos de 1.5 segundos',
  });

  assert.strictEqual(fullEvaluation.has_sufficient_data, true);
  assert.ok(Array.isArray(fullEvaluation.facts), 'facts deve ser array');
  assert.ok(Array.isArray(fullEvaluation.observations), 'observations deve ser array');
  assert.ok(Array.isArray(fullEvaluation.possible_interpretations), 'possible_interpretations deve ser array');
  assert.ok(Array.isArray(fullEvaluation.uncertainties), 'uncertainties deve ser array');
  assert.ok(Array.isArray(fullEvaluation.recommendations), 'recommendations deve ser array');
  console.log('   ✅ AI Coach retornou avaliação estruturada nos 5 pilares com sucesso');

  // 7. Exclusão Segura
  console.log('7️⃣ Testando Exclusão de Canvas...');
  const deleted = await dbStore.deleteToolkitCanvas(wsA, duplicated.id);
  assert.strictEqual(deleted, true);
  const findDeleted = await dbStore.getToolkitCanvasById(wsA, duplicated.id);
  assert.strictEqual(findDeleted, null);
  console.log('   ✅ Canvas excluído com sucesso');

  console.log('🎉 Todos os testes de Product Tools & AI Coach passaram com 100% de sucesso!');
}

runToolkitTests().catch((err) => {
  console.error('❌ Erro nos testes de Toolkit:', err);
  process.exit(1);
});
