import { GoogleGenAI, Type } from '@google/genai';
import { dbStore as db } from '../db/store.js';
import {
  ProductInsight,
  InsightStatus,
  DiscoveryHealthMetrics,
  EntityReference,
  Research,
  Evidence,
  Problem,
  Opportunity,
  Hypothesis,
  Experiment,
  Decision,
} from '../types/index.js';
import { generatedInsightsResponseSchema } from '../schemas/intelligence.schema.js';

export class IntelligenceService {
  async getHealthMetrics(workspaceId: string): Promise<DiscoveryHealthMetrics> {
    return db.getDiscoveryHealth(workspaceId);
  }

  async getInsights(workspaceId: string, status?: InsightStatus): Promise<ProductInsight[]> {
    return db.getInsights(workspaceId, status);
  }

  async updateInsightStatus(
    workspaceId: string,
    insightId: string,
    status: InsightStatus,
    feedbackNotes?: string
  ): Promise<ProductInsight> {
    return db.updateInsightStatus(workspaceId, insightId, status, feedbackNotes);
  }

  async generateInsights(workspaceId: string): Promise<ProductInsight[]> {
    // 1. Fetch only entities belonging to the authenticated workspace
    const [
      researches,
      evidences,
      problems,
      opportunities,
      hypotheses,
      experiments,
      decisions,
    ] = await Promise.all([
      db.listResearches(workspaceId),
      db.listEvidences(workspaceId),
      db.listProblems(workspaceId),
      db.listOpportunities(workspaceId),
      db.listHypotheses(workspaceId),
      db.listExperiments(workspaceId),
      db.listDecisions(workspaceId),
    ]);

    // Build entity lookup map for validation and prompt context
    const validEntitiesMap = new Map<string, EntityReference>();

    researches.forEach((r: Research) => validEntitiesMap.set(r.id, { entity_type: 'research', entity_id: r.id, title: r.title }));
    evidences.forEach((e: Evidence) => validEntitiesMap.set(e.id, { entity_type: 'evidence', entity_id: e.id, title: e.content.slice(0, 50) }));
    problems.forEach((p: Problem) => validEntitiesMap.set(p.id, { entity_type: 'problem', entity_id: p.id, title: p.title }));
    opportunities.forEach((o: Opportunity) => validEntitiesMap.set(o.id, { entity_type: 'opportunity', entity_id: o.id, title: o.title }));
    hypotheses.forEach((h: Hypothesis) => validEntitiesMap.set(h.id, { entity_type: 'hypothesis', entity_id: h.id, title: h.title }));
    experiments.forEach((ex: Experiment) => validEntitiesMap.set(ex.id, { entity_type: 'experiment', entity_id: ex.id, title: ex.title }));
    decisions.forEach((d: Decision) => validEntitiesMap.set(d.id, { entity_type: 'decision', entity_id: d.id, title: d.title }));

    let rawInsights: any[] = [];

    // 2. Call Gemini API if key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        // Compact workspace representation to prevent token explosion and injection
        const contextSummary = {
          researches: researches.map((r) => ({ id: r.id, title: r.title, findings: r.key_findings || [] })),
          evidences: evidences.map((e) => ({ id: e.id, content: e.content, impact: e.impact_score })),
          problems: problems.map((p) => ({ id: p.id, title: p.title, impact: p.impact, status: p.status, evidence_count: p.evidence_count })),
          opportunities: opportunities.map((o) => ({ id: o.id, title: o.title, status: o.status, effort: o.effort, value: o.value })),
          hypotheses: hypotheses.map((h) => ({ id: h.id, title: h.title, status: h.status, confidence: h.confidence_score })),
          experiments: experiments.map((ex) => ({ id: ex.id, title: ex.title, status: ex.status, results: ex.results })),
          decisions: decisions.map((d) => ({ id: d.id, title: d.title, decision: d.decision, rationale: d.rationale })),
        };

        const prompt = `
Você é um especialista em Inteligência de Produto para Product Managers.
Análise o seguinte estado do Discovery de um Produto e extraia de 3 a 6 insights acionáveis e estruturados.

REGRAS RÍGIDAS DE ANÁLISE:
1. Identifique:
   - Padrões recorrentes nos dados
   - Problemas recorrentes ou sem suporte
   - Oportunidades bem/mal sustentadas
   - Hipóteses sem validação ou estagnadas
   - Experimentos inconclusivos ou sem aprendizado
   - Decisões com pouca evidência
   - Contradições entre evidências, hipóteses e decisões
2. MANTENHA SEPARAÇÃO RÍGIDA ENTRE FATOS E INTERPRETAÇÕES:
   - "facts": lista de fatos/evidências concretas extraídas estritamente do contexto.
   - "interpretation": a análise lógica/hipótese proposta pela IA baseada nesses fatos.
   - "uncertainties": dúvidas, limitações de dados ou incertezas existentes.
3. RASTREABILIDADE:
   - Em "sources", inclua APENAS IDs e tipos de entidades que existem de fato no contexto fornecido.

CONTEXTO DO WORKSPACE:
${JSON.stringify(contextSummary, null, 2)}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                insights: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: {
                        type: Type.STRING,
                        description: 'Um dos tipos: recurring_pattern, unvalidated_hypothesis, inconclusive_experiment, weak_evidence_decision, contradiction, gap',
                      },
                      severity: {
                        type: Type.STRING,
                        description: 'critical, warning, opportunity, info',
                      },
                      title: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      facts: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      interpretation: { type: Type.STRING },
                      uncertainties: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      sources: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            entity_type: { type: Type.STRING },
                            entity_id: { type: Type.STRING },
                            title: { type: Type.STRING },
                          },
                          required: ['entity_type', 'entity_id', 'title'],
                        },
                      },
                    },
                    required: ['type', 'severity', 'title', 'summary', 'facts', 'interpretation', 'uncertainties', 'sources'],
                  },
                },
              },
              required: ['insights'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          const validation = generatedInsightsResponseSchema.safeParse(parsed);
          if (validation.success) {
            rawInsights = validation.data.insights;
          }
        }
      } catch (error) {
        console.warn('Gemini API query warning, falling back to deterministic heuristic insights:', error);
      }
    }

    // 3. Fallback / Enhancement: If rawInsights is empty, build rule-based insights deterministically
    if (!rawInsights || rawInsights.length === 0) {
      rawInsights = this.generateHeuristicInsights({
        researches,
        evidences,
        problems,
        opportunities,
        hypotheses,
        experiments,
        decisions,
      });
    }

    // 4. Validate and attach verified sources with strict workspace traceability
    const now = new Date().toISOString();
    const validatedInsights: ProductInsight[] = rawInsights.map((item, idx) => {
      // Filter sources to ensure every entity_id belongs to this workspace
      const verifiedSources: EntityReference[] = [];
      if (Array.isArray(item.sources)) {
        for (const src of item.sources) {
          const matched = validEntitiesMap.get(src.entity_id);
          if (matched) {
            verifiedSources.push(matched);
          }
        }
      }

      // If no valid sources matched, attach first available relevant workspace entity
      if (verifiedSources.length === 0 && validEntitiesMap.size > 0) {
        const firstEntry = validEntitiesMap.entries().next().value;
        if (firstEntry && firstEntry[1]) {
          verifiedSources.push(firstEntry[1]);
        }
      }

      return {
        id: `ins_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        workspace_id: workspaceId,
        type: item.type || 'recurring_pattern',
        severity: item.severity || 'warning',
        title: item.title,
        summary: item.summary,
        facts: Array.isArray(item.facts) && item.facts.length > 0 ? item.facts : ['Registrado no fluxo de Discovery do produto.'],
        interpretation: item.interpretation || item.summary,
        uncertainties: Array.isArray(item.uncertainties) ? item.uncertainties : ['Necessita validação empírica contínua.'],
        sources: verifiedSources,
        status: 'suggested',
        created_at: now,
        updated_at: now,
      };
    });

    // 5. Persist as 'suggested' in store (Human-in-the-loop: non-destructive)
    await db.saveInsights(workspaceId, validatedInsights);
    return validatedInsights;
  }

  private generateHeuristicInsights(data: {
    researches: any[];
    evidences: any[];
    problems: any[];
    opportunities: any[];
    hypotheses: any[];
    experiments: any[];
    decisions: any[];
  }): any[] {
    const insights: any[] = [];

    // Check decisions without direct evidence
    if (data.decisions.length > 0) {
      const dec = data.decisions[0];
      const sources: EntityReference[] = [
        { entity_type: 'decision', entity_id: dec.id, title: dec.title },
      ];
      if (data.experiments.length > 0) {
        sources.push({ entity_type: 'experiment', entity_id: data.experiments[0].id, title: data.experiments[0].title });
      }

      insights.push({
        type: 'weak_evidence_decision',
        severity: 'critical',
        title: 'Decisão de Produto com Pouca Evidência Factual',
        summary: `A decisão "${dec.title}" foi aprovada sem um volume robusto de evidências diretas associadas aos problemas do usuário.`,
        facts: [
          `Decisão '${dec.title}' está cadastrada com status '${dec.status}'.`,
          `Existe um total de ${data.evidences.length} evidência(s) registrada(s) no workspace.`,
        ],
        interpretation: 'Aprovar decisões sem suporte em dados reais aumenta o risco de investir esforço de engenharia em funcionalidades não prioritárias.',
        uncertainties: [
          'Qual o nível de impacto financeiro/operacional caso a premissa esteja incorreta?',
        ],
        sources,
      });
    }

    // Check unvalidated hypotheses
    const unvalidated = data.hypotheses.filter((h) => h.status === 'draft' || h.status === 'in_testing');
    if (unvalidated.length > 0) {
      const hyp = unvalidated[0];
      const sources: EntityReference[] = [
        { entity_type: 'hypothesis', entity_id: hyp.id, title: hyp.title },
      ];
      if (data.opportunities.length > 0) {
        sources.push({ entity_type: 'opportunity', entity_id: data.opportunities[0].id, title: data.opportunities[0].title });
      }

      insights.push({
        type: 'unvalidated_hypothesis',
        severity: 'warning',
        title: 'Hipótese Crítica Pendente de Validação',
        summary: `A hipótese "${hyp.title}" permanece em aberto sem experimento ativo conclusivo.`,
        facts: [
          `Hipótese '${hyp.title}' possui status '${hyp.status}'.`,
          `Métrica informada: ${hyp.metrics_to_validate || 'Não especificada'}.`,
        ],
        interpretation: 'Manter hipóteses sem teste gera estagnação no funil de validação de oportunidades.',
        uncertainties: [
          'A amostragem de usuários será suficiente para atingir significância estatística?',
        ],
        sources,
      });
    }

    // Check problems with high impact
    const highImpact = data.problems.filter((p) => p.impact === 'high' || p.impact === 'critical');
    if (highImpact.length > 0) {
      const prob = highImpact[0];
      const sources: EntityReference[] = [
        { entity_type: 'problem', entity_id: prob.id, title: prob.title },
      ];
      if (data.evidences.length > 0) {
        sources.push({ entity_type: 'evidence', entity_id: data.evidences[0].id, title: data.evidences[0].content.slice(0, 40) });
      }

      insights.push({
        type: 'recurring_pattern',
        severity: 'opportunity',
        title: 'Padrão Recorrente de Dor com Alto Impacto',
        summary: `O problema "${prob.title}" afeta diretamente a experiência do usuário com nível de impacto ${prob.impact.toUpperCase()}.`,
        facts: [
          `Problema '${prob.title}' registrado com frequência '${prob.frequency}'.`,
          `Status atual: ${prob.status}.`,
        ],
        interpretation: 'Resolver este ponto focal prioriza soluções de valor transformador para os usuários mais engajados.',
        uncertainties: [
          'Existe alguma dependência técnica externa para contornar essa dor?',
        ],
        sources,
      });
    }

    // Default fallback if workspace is completely empty
    if (insights.length === 0) {
      insights.push({
        type: 'gap',
        severity: 'info',
        title: 'Workspace de Discovery em Frequência Inicial',
        summary: 'Cadastre mais pesquisas, evidências e problemas para desbloquear o diagnóstico avançado com inteligência artificial.',
        facts: ['Poucos registros cadastrados nas etapas de Discovery.'],
        interpretation: 'Alimentar o repositório estruturado do Product OS permite identificar contradições e gargalos com precisão.',
        uncertainties: ['Aguardando novas entrevistas ou notas de pesquisas.'],
        sources: [],
      });
    }

    return insights;
  }
}

export const intelligenceService = new IntelligenceService();
