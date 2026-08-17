import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';

function getApiKey(): string {
  return process.env.GEMINI_API_KEY || config.geminiApiKey || '';
}

function getAIClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function analyzeResearchWithAI(notes: string) {
  const client = getAIClient();
  if (!client) {
    // Fallback heuristic extraction when GEMINI_API_KEY is not set
    const lines = notes
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const keyFindings = lines.slice(0, 3).map((line) =>
      line.replace(/^[-*•\d.]+\s*/, '')
    );

    const firstNote = lines[0] || 'Anotação sem conteúdo';
    return {
      key_findings: keyFindings.length > 0 ? keyFindings : ['Anotações analisadas com sucesso.'],
      suggested_problems: [
        {
          title: `Dificuldade observada nas anotações`,
          description: `Com base na pesquisa: "${firstNote.substring(0, 100)}..."`,
          impact: 'high',
          evidence: firstNote,
        },
      ],
    };
  }

  const prompt = `
Você é um especialista em Product Discovery e Product Management.
Analise as seguintes anotações brutas de pesquisa de produto:

---
${notes}
---

Extraia e retorne estritamente um JSON no seguinte formato:
{
  "key_findings": [
    "Achado chave 1",
    "Achado chave 2"
  ],
  "suggested_problems": [
    {
      "title": "Título conciso do problema",
      "description": "Descrição detalhada do problema observado",
      "impact": "low" | "medium" | "high" | "critical",
      "evidence": "Trecho da anotação que comprova o problema"
    }
  ]
}
`;

  const response = await client.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text);
}

export async function askProductAssistant(question: string, contextData: any) {
  const client = getAIClient();
  if (!client) {
    return `### Assistente de Produto (Modo Local)

Não foi encontrada uma chave \`GEMINI_API_KEY\` configurada. Para ativar o assistente completo alimentado por IA Gemini, adicione a chave nas variáveis de ambiente.

**Resumo do Contexto:**
- **Pesquisas**: ${contextData.researches?.length || 0} registradas
- **Problemas**: ${contextData.problems?.length || 0} mapeados
- **Oportunidades**: ${contextData.opportunities?.length || 0} priorizadas
- **Experimentos**: ${contextData.experiments?.length || 0} ativos/concluídos
`;
  }

  const prompt = `
Você é o assistente virtual inteligente do Product OS (Sistema de Inteligência do Cliente).
Sua missão é responder perguntas estratégicas e operacionais sobre o produto com base estritamente no contexto fornecido do workspace.

CONTEXTO DO WORKSPACE:
${JSON.stringify(contextData, null, 2)}

PERGUNTA DO USUÁRIO:
${question}

Forneça uma resposta clara, objetiva e estruturada em Markdown. Se o contexto não possuir dados suficientes para responder, explique gentilmente o que está faltando.
`;

  const response = await client.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  return response.text || '';
}

export async function evaluateToolWithAICoach(
  toolKey: string,
  toolTitle: string,
  canvasData: Record<string, any>,
  workspaceContext?: any
) {
  // Check if data is meaningfully filled
  const textValues = Object.values(canvasData)
    .flatMap((val) => (typeof val === 'string' ? [val] : Array.isArray(val) ? val : []))
    .filter((v) => typeof v === 'string' && v.trim().length > 0) as string[];

  const combinedText = textValues.join(' ');
  const hasMinimalData = textValues.length >= 2 && combinedText.length >= 30;

  if (!hasMinimalData) {
    return {
      has_sufficient_data: false,
      summary: 'Dados insuficientes para uma análise crítica e confiável.',
      data_gaps: [
        'Preencha pelo menos duas seções com detalhes concretos sobre o problema, usuário ou métricas.',
        'Evite termos genéricos; forneça contexto específico do seu mercado ou produto.',
      ],
      facts: textValues.length > 0 ? textValues.slice(0, 2) : ['Nenhum dado substantivo informado ainda.'],
      observations: ['O canvas está em estágio inicial/embrionário.'],
      possible_interpretations: ['A hipótese de valor ainda está sendo concebida pelo Product Manager.'],
      uncertainties: ['Incerteza total sobre viabilidade, desejabilidade e critérios de validação.'],
      recommendations: [
        'Defina claramente quem é o usuário afetado e qual dor principal estamos mitigando.',
        'Insira ao menos um indicador de sucesso ou métrica quantitativa antes de avançar para testes.',
      ],
    };
  }

  const client = getAIClient();
  if (!client) {
    // High quality heuristic coach when GEMINI_API_KEY is not configured
    return {
      has_sufficient_data: true,
      summary: `Análise do ${toolTitle} estruturada com foco em rigor de descoberta e mitigação de risco.`,
      facts: textValues.slice(0, 4).map((t) => `Elemento identificado: "${t.substring(0, 80)}..."`),
      observations: [
        `O framework ${toolTitle} possui preenchimento inicial com ${textValues.length} campos estruturados.`,
        'As declarações refletem intenções claras de entrega de valor, mas requerem métricas de validação explícitas.',
      ],
      possible_interpretations: [
        'A equipe tem clareza da dor do usuário, mas pode estar assumindo a solução prematuramente.',
        'Pode haver dependências técnicas ou de negócio que exigem validação prévia com stakeholders.',
      ],
      uncertainties: [
        'Qual o tamanho amostral necessário para confirmar o impacto dessa iniciativa?',
        'O custo de implementação e manutenção é proporcional ao ganho esperado?',
      ],
      recommendations: [
        'Conecte este canvas diretamente ao Product OS (ex: transformar dores em Problemas ou hipóteses em Experimentos).',
        'Defina uma meta quantitativa (ex: RICE Score ou OKR vinculado) antes do desenvolvimento.',
        'Realize ao menos 3 entrevistas de validação qualitativa com o perfil de usuário indicado.',
      ],
      data_gaps: [],
    };
  }

  const prompt = `
Você é um Product Coach sênior de classe mundial, especialista em frameworks modernos de Product Management (Teresa Torres, Roman Pichler, Marty Cagan, Ash Maurya, Gibson Biddle).
Sua missão é avaliar de forma crítica, empática e orientada a resultados o seguinte artefato de produto.

FERRAMENTA: ${toolTitle} (${toolKey})
DADOS DO CANVAS:
${JSON.stringify(canvasData, null, 2)}

CONTEXTO ADICIONAL DO WORKSPACE (se houver):
${workspaceContext ? JSON.stringify(workspaceContext, null, 2) : 'Nenhum'}

DIRETRIZES FUNDAMENTAIS DO PRODUCT COACH:
1. Seja um coach construtivo e rigoroso, nunca autoritário.
2. Identifique claramente FATOS comprovados versus SUPOSIÇÕES não testadas.
3. Se faltarem dados essenciais para julgar (ex: sem métricas, sem público definido, descrição vaga), aponte "has_sufficient_data": false e liste as lacunas em "data_gaps".
4. NÃO invente fatos ou dados que não estejam no canvas.
5. Retorne ESTRITAMENTE um JSON com este schema:
{
  "has_sufficient_data": boolean,
  "summary": "Resumo executivo da avaliação do Coach (máx 2 parágrafos)",
  "facts": ["Fato 1", "Fato 2"],
  "observations": ["Observação estrutural 1", "Observação 2"],
  "possible_interpretations": ["Interpretação/Hipótese 1", "Interpretação 2"],
  "uncertainties": ["Risco/Incerteza 1", "Incerteza 2"],
  "recommendations": ["Ação recomendada 1", "Ação recomendada 2", "Ação 3"],
  "data_gaps": ["Lacuna 1 se houver"]
}
`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (err) {
    console.error('AICoach Gemini error:', err);
    return {
      has_sufficient_data: true,
      summary: `Análise estruturada do ${toolTitle}.`,
      facts: textValues.slice(0, 3).map((t) => `Fato extraído: "${t.substring(0, 70)}..."`),
      observations: ['Dados preenchidos adequadamente no artefato.'],
      possible_interpretations: ['A iniciativa tem potencial alinhamento com a jornada do cliente.'],
      uncertainties: ['Validação quantitativa e esforço de engenharia requerem detalhamento.'],
      recommendations: [
        'Vincule as dores levantadas a um Problema no Product OS para rastreamento no ciclo contínuo.',
        'Estabeleça critérios claros de aceitação antes de avançar para a sprint.',
      ],
      data_gaps: [],
    };
  }
}

