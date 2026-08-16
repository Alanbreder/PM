import { dbStore } from '../db/store.js';
import { intelligenceService } from '../services/intelligence.service.js';

async function runIntelligenceTests() {
  console.log('🧪 Iniciando suíte de testes de Inteligência do Produto (Etapa 7)...');

  const workspaceId = 'ws_default_123';

  // 1. Test Discovery Health Metrics Calculation
  console.log('📊 Testando cálculo de Discovery Health...');
  const health = await dbStore.getDiscoveryHealth(workspaceId);
  if (!health || typeof health.health_score !== 'number') {
    throw new Error('Falha no cálculo de Discovery Health');
  }
  console.log(`✅ Discovery Health Score: ${health.health_score}/100`);
  console.log(`   Totals: Decisões: ${health.totals.decisions}, Experimentos: ${health.totals.experiments}`);

  // 2. Test Generate Insights (Heuristic/Gemini Fallback & Validation)
  console.log('💡 Testando geração e validação de Product Insights...');
  const insights = await intelligenceService.generateInsights(workspaceId);
  if (!Array.isArray(insights) || insights.length === 0) {
    throw new Error('Falha na geração de insights: resultado vazio');
  }

  const first = insights[0];
  if (!first.title || !first.facts || !first.interpretation || !first.uncertainties || !first.sources) {
    throw new Error('Insight gerado não possui estrutura completa (Fatos/Interpretação/Incertezas/Fontes)');
  }
  if (first.status !== 'suggested') {
    throw new Error(`Status inicial do insight deve ser 'suggested', recebido: ${first.status}`);
  }
  console.log(`✅ ${insights.length} insight(s) gerado(s) com sucesso. Exemplo: "${first.title}"`);

  // 3. Test Human-in-the-loop Update Status
  console.log('🤝 Testando mecanismo Human-in-the-loop (Aceite do PM)...');
  const updated = await intelligenceService.updateInsightStatus(
    workspaceId,
    first.id,
    'accepted',
    'Aprovado pelo PM para próxima sprint'
  );
  if (updated.status !== 'accepted' || updated.feedback_notes !== 'Aprovado pelo PM para próxima sprint') {
    throw new Error('Falha ao atualizar status do insight para aceito');
  }
  console.log(`✅ Insight marcado como 'accepted' com sucesso.`);

  // 4. Multi-tenant Isolation Test
  console.log('🔒 Testando isolamento Multi-tenant do Workspace B...');
  const otherWsId = 'ws_other_456';
  const otherInsights = await dbStore.getInsights(otherWsId);
  const leaked = otherInsights.filter((i) => i.workspace_id === workspaceId);
  if (leaked.length > 0) {
    throw new Error('Vazamento multi-tenant detectado entre workspaces!');
  }
  console.log('✅ Isolamento multi-tenant verificado com sucesso.');

  console.log('🎉 Todos os testes de Inteligência do Produto passaram perfeitamente!');
}

runIntelligenceTests().catch((err) => {
  console.error('❌ Erro nos testes de Inteligência do Produto:', err);
  process.exit(1);
});
