import React from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  Copy, 
  Check, 
  Compass,
  FileSearch,
  Eye,
  Lightbulb,
  ShieldAlert
} from 'lucide-react';
import { AICoachEvaluation } from '../../types/tools';

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  evaluation: AICoachEvaluation | null;
  onReanalyze: () => void;
  toolTitle: string;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({
  isOpen,
  onClose,
  loading,
  evaluation,
  onReanalyze,
  toolTitle,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!evaluation) return;
    const text = `
=== PARECER DO PRODUCT COACH: ${toolTitle} ===
${evaluation.summary}

[FATOS CONCRETOS]
${evaluation.facts.map((f) => `• ${f}`).join('\n')}

[OBSERVAÇÕES]
${evaluation.observations.map((o) => `• ${o}`).join('\n')}

[POSSÍVEIS INTERPRETAÇÕES]
${evaluation.possible_interpretations.map((i) => `• ${i}`).join('\n')}

[INCERTEZAS & RISCOS]
${evaluation.uncertainties.map((u) => `• ${u}`).join('\n')}

[RECOMENDAÇÕES PRÁTICAS]
${evaluation.recommendations.map((r) => `• ${r}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl text-zinc-100 animate-slide-left"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-military-600/30 border border-military-500/50 flex items-center justify-center text-military-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                Product Coach (IA)
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-military-900 text-military-300 border border-military-700/60">
                  Rigor Metodológico
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Avaliação crítica e recomendações para {toolTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={loading || !evaluation}
              className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition flex items-center gap-1"
              title="Copiar parecer completo"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onReanalyze}
              disabled={loading}
              className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
              title="Reavaliar com IA"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-military-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-zinc-300 font-medium">Analisando artefato sob a ótica de Product Discovery...</p>
              <p className="text-[11px] text-zinc-500">Mapeando fatos, consistência, incertezas e valor do negócio.</p>
            </div>
          ) : !evaluation ? (
            <div className="py-12 text-center text-zinc-400 space-y-3">
              <Compass className="w-8 h-8 mx-auto text-zinc-600" />
              <p>Nenhuma avaliação gerada ainda.</p>
              <button
                onClick={onReanalyze}
                className="px-4 py-2 bg-military-600 hover:bg-military-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Gerar Parecer com IA
              </button>
            </div>
          ) : (
            <>
              {/* Insufficient Data Warning Banner */}
              {!evaluation.has_sufficient_data && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    Dados Insuficientes para Análise Confiável
                  </div>
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    O Product Coach identificou que este canvas possui poucas informações para uma validação crítica.
                  </p>
                  {evaluation.data_gaps && evaluation.data_gaps.length > 0 && (
                    <div className="mt-2 space-y-1 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40">
                      <div className="font-semibold text-[11px] text-amber-200">Lacunas a preencher:</div>
                      <ul className="list-disc list-inside text-[11px] text-amber-300/90 space-y-1">
                        {evaluation.data_gaps.map((gap, i) => (
                          <li key={i}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Executive Summary */}
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-military-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Visão Executiva do Coach
                </div>
                <p className="text-zinc-200 leading-relaxed whitespace-pre-line text-xs font-normal">
                  {evaluation.summary}
                </p>
              </div>

              {/* Pillar 1: Facts */}
              <div className="bg-zinc-900/70 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <FileSearch className="w-3.5 h-3.5 text-military-400" />
                  1. Fatos Identificados nos Dados
                </div>
                <ul className="space-y-1.5 text-zinc-300">
                  {evaluation.facts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-military-400 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 2: Observations */}
              <div className="bg-zinc-900/70 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  2. Observações Estruturais & Métricas
                </div>
                <ul className="space-y-1.5 text-zinc-300">
                  {evaluation.observations.map((obs, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 3: Possible Interpretations */}
              <div className="bg-zinc-900/70 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  3. Possíveis Interpretações & Premissas
                </div>
                <ul className="space-y-1.5 text-zinc-300">
                  {evaluation.possible_interpretations.map((interp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{interp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 4: Uncertainties & Risks */}
              <div className="bg-zinc-900/70 border border-zinc-800/80 p-4 rounded-xl space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  4. Incertezas & Riscos Não Testados
                </div>
                <ul className="space-y-1.5 text-zinc-300">
                  {evaluation.uncertainties.map((unc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{unc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 5: Recommendations */}
              <div className="bg-military-950/40 border border-military-700/60 p-4 rounded-xl space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-military-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-military-400" />
                  5. Recomendações Práticas do Coach
                </div>
                <ul className="space-y-2 text-zinc-200">
                  {evaluation.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                      <ArrowRight className="w-3.5 h-3.5 text-military-400 mt-0.5 shrink-0" />
                      <span className="leading-relaxed font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Dica: use este parecer para embasar decisões e priorizações.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
