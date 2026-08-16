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
    model: 'gemini-2.5-flash',
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
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || '';
}

