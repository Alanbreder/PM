import React from 'react';
import { CheckCircle2, ShieldAlert, Scale, HelpCircle, FileText, ArrowRight, UserCheck } from 'lucide-react';

interface DecisionCanvasToolProps {
  data: {
    decision?: string;
    context?: string;
    problem_addressed?: string;
    options_evaluated?: string;
    evidence_data?: string;
    trade_offs?: string;
    risks_mitigations?: string;
    recommendation?: string;
    expected_outcome?: string;
    owner?: string;
    review_date?: string;
  };
  onChange: (newData: any) => void;
}

export const DecisionCanvasTool: React.FC<DecisionCanvasToolProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: The Decision */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-military-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            Registro Formal de Decisão Estratégica (Decision Canvas / ADR)
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Governança & Alinhamento de Produto</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            A Decisão Tomada (The Decision)
          </label>
          <textarea
            value={data.decision || ''}
            onChange={(e) => updateField('decision', e.target.value)}
            placeholder="Qual foi a decisão final aprovada (ex: Aprovar lançamento global do Onboarding com IA)?"
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed font-bold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Contexto & Motivação (Why Now)
            </label>
            <textarea
              value={data.context || ''}
              onChange={(e) => updateField('context', e.target.value)}
              placeholder="Por que essa decisão precisava ser tomada agora? Qual era o cenário?"
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Problema que Estamos Resolvendo
            </label>
            <textarea
              value={data.problem_addressed || ''}
              onChange={(e) => updateField('problem_addressed', e.target.value)}
              placeholder="Qual dor do usuário ou gargalo do negócio motivou essa decisão?"
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Options Evaluated vs Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            Opções & Alternativas Consideradas
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Quais caminhos foram avaliados antes da escolha final?
          </p>
          <textarea
            value={data.options_evaluated || ''}
            onChange={(e) => updateField('options_evaluated', e.target.value)}
            placeholder="• Opção 1: Manter fluxo antigo com ajustes&#10;• Opção 2: Adicionar vídeo tutorial estático&#10;• Opção 3: Substituir por setup interativo com IA (Vencedora)..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-sky-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[280px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Evidências & Dados de Suporte
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Quais métricas de experimentos ou pesquisas justificam a decisão?
          </p>
          <textarea
            value={data.evidence_data || ''}
            onChange={(e) => updateField('evidence_data', e.target.value)}
            placeholder="Ex: Experimento EXP-042 comprovou 78% de taxa de conclusão na Opção 3 vs 35% no fluxo antigo..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed font-mono"
          />
        </div>
      </div>

      {/* Trade-offs & Risks/Mitigations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            Trade-offs (O que estamos abrindo mão?)
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            Quais custos, complexidades ou oportunidades secundárias estamos aceitando?
          </p>
          <textarea
            value={data.trade_offs || ''}
            onChange={(e) => updateField('trade_offs', e.target.value)}
            placeholder="Ex: Maior custo de infraestrutura de IA, compensado pelo aumento do LTV dos clientes..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col h-[260px]">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Riscos Identificados & Mitigações
          </div>
          <p className="text-[11px] text-zinc-400 mb-2">
            O que pode dar errado e como nos protegeremos?
          </p>
          <textarea
            value={data.risks_mitigations || ''}
            onChange={(e) => updateField('risks_mitigations', e.target.value)}
            placeholder="Ex: Risco de indisponibilidade da API: implementação de fallback heurístico sem travar o usuário..."
            className="flex-1 w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Governance & Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-military-400" /> Responsável pela Decisão (Owner)
          </label>
          <input
            type="text"
            value={data.owner || ''}
            onChange={(e) => updateField('owner', e.target.value)}
            placeholder="Ex: Mariana Silva (Head de Produto)"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Data de Revisão de Impacto
          </label>
          <input
            type="text"
            value={data.review_date || ''}
            onChange={(e) => updateField('review_date', e.target.value)}
            placeholder="Ex: 30 dias após o rollout geral (Q3)"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-military-500 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 outline-none"
          />
        </div>
      </div>
    </div>
  );
};
