import React, { useState, useEffect } from 'react';
import { Hypothesis, Opportunity } from '../types';
import { apiFetch } from '../lib/api';
import { 
  GitCommit, 
  Plus, 
  AlertCircle, 
  Link2, 
  Sparkles, 
  X, 
  Layers, 
  ArrowRight,
  HelpCircle,
  FlaskConical
} from 'lucide-react';

interface HypothesisViewProps {
  workspaceId: string;
  onNavigateTab?: (tab: string) => void;
  onOpenToolkit?: (toolKey: any) => void;
}

export const HypothesisView: React.FC<HypothesisViewProps> = ({ 
  workspaceId, 
  onNavigateTab,
  onOpenToolkit 
}) => {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [opportunityId, setOpportunityId] = useState('');
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [metrics, setMetrics] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hypRes, opRes] = await Promise.all([
        apiFetch('/api/hypotheses', {}, workspaceId),
        apiFetch('/api/opportunities', {}, workspaceId).catch(() => ({ data: [] })),
      ]);
      setHypotheses(hypRes.data || []);
      setOpportunities(opRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar hipóteses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !statement.trim()) return;

    setSubmitting(true);
    try {
      await apiFetch(
        '/api/hypotheses',
        {
          method: 'POST',
          body: JSON.stringify({
            opportunity_id: opportunityId || undefined,
            title: title.trim(),
            statement: statement.trim(),
            metrics_to_validate: metrics.trim() || undefined,
            confidence_score: Number(confidence),
          }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setStatement('');
      setMetrics('');
      setOpportunityId('');
      setConfidence(3);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar hipótese');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-military-900/80 text-military-300 border border-military-700/60 text-[10px] font-bold uppercase tracking-wider">
              Discovery Contínuo • Etapa 5
            </span>
            <span className="text-zinc-500 text-xs">|</span>
            <span className="text-zinc-400 text-xs font-medium">Declarações Falsificáveis</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mt-1">
            <GitCommit className="w-5 h-5 text-military-400" />
            Hipóteses de Produto
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Premissas claras com métricas explícitas de validação. Podem estar atreladas a uma oportunidade ou serem hipóteses exploratórias livres.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Formular Hipótese
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando hipóteses...</div>
      ) : hypotheses.length === 0 ? (
        /* Empty State Inteligente */
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-military-950 border border-military-700/40 text-military-400 mx-auto">
            <GitCommit className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-zinc-100">Nenhuma hipótese formulada</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Formule uma hipótese testável para validar o impacto antes de investir em desenvolvimento ou experimentos caros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
            <div 
              onClick={() => setShowModal(true)}
              className="bg-zinc-900 border border-zinc-700/80 hover:border-military-500 p-5 rounded-xl text-left cursor-pointer transition group"
            >
              <span className="text-xs font-bold text-zinc-100 group-hover:text-military-300 flex items-center gap-1.5 mb-1.5">
                <Plus className="w-4 h-4 text-military-400" />
                Formular Hipótese Direta / Livre
              </span>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Estruture uma premissa ("Se fizermos X, esperamos Y...") sem dependência de oportunidades prévias.
              </p>
            </div>

            {onNavigateTab && (
              <div 
                onClick={() => onNavigateTab('opportunities')}
                className="bg-zinc-900 border border-zinc-700/80 hover:border-military-500 p-5 rounded-xl text-left cursor-pointer transition group"
              >
                <span className="text-xs font-bold text-zinc-100 group-hover:text-military-300 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-4 h-4 text-military-400" />
                  Ver Oportunidades
                </span>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Escolha uma oportunidade de solução e desdobre hipóteses específicas para ela.
                </p>
              </div>
            )}
          </div>

          {onOpenToolkit && (
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 max-w-xl mx-auto text-xs text-zinc-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <Layers className="w-4 h-4 text-military-400 shrink-0" />
                <span>
                  <strong>Priorização Rápida:</strong> Use a matriz <strong className="text-zinc-200">RICE Score</strong> ou <strong className="text-zinc-200">Value vs Effort</strong> no Toolkit para comparar hipóteses.
                </span>
              </div>
              <button
                onClick={() => onOpenToolkit('rice-score')}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold shrink-0 transition"
              >
                Abrir RICE
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hypotheses.map((h) => {
            const op = opportunities.find((o) => o.id === h.opportunity_id);

            return (
              <div key={h.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-3.5 transition flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-zinc-100">{h.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-military-900/80 text-military-300 border border-military-700/50 shrink-0">
                      Confiança: {h.confidence_score}/5
                    </span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 italic font-mono leading-relaxed">
                    "{h.statement}"
                  </div>

                  {h.metrics_to_validate && (
                    <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Métricas de Validação
                      </span>
                      <p className="text-zinc-200 text-xs">{h.metrics_to_validate}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                  {op ? (
                    <div className="flex items-center gap-1.5 text-zinc-300 truncate max-w-[240px]">
                      <Link2 className="w-3 h-3 text-military-400 shrink-0" />
                      <span className="truncate">Oportunidade: <strong className="text-zinc-200">{op.title}</strong></span>
                    </div>
                  ) : (
                    <span className="text-zinc-500 italic">
                      Hipótese Exploratória / Livre
                    </span>
                  )}

                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('experiments')}
                      className="text-military-400 hover:text-military-300 font-medium flex items-center gap-1 shrink-0 transition"
                    >
                      <FlaskConical className="w-3 h-3" /> Criar Experimento
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Formular Hipótese */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full text-zinc-100 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-military-400" />
                <h3 className="text-base font-bold text-zinc-100">Formular Nova Hipótese</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Oportunidade Relacionada <span className="text-zinc-500 font-normal">(opcional)</span>
                </label>
                <select
                  value={opportunityId}
                  onChange={(e) => setOpportunityId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                >
                  <option value="">Nenhuma oportunidade (Hipótese Exploratória / Livre)</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Título da Hipótese <span className="text-military-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Oferecer PIX no checkout reduz abandono em 25%"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Declaração Falsificável (Premissa) <span className="text-military-400">*</span>
                </label>
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={3}
                  placeholder="Acreditamos que [fazer isso] para [esse usuário] resultará em [esse impacto mensurável], porque [evidência/razão]."
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 font-mono transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Métricas de Validação / Critério de Sucesso
                </label>
                <input
                  type="text"
                  value={metrics}
                  onChange={(e) => setMetrics(e.target.value)}
                  placeholder="Ex: Taxa de conversão no checkout > 18%; Redução de tickets em 40%"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nível de Confiança Inicial (1 a 5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !statement.trim()}
                  className="px-5 py-2 bg-military-600 hover:bg-military-500 disabled:opacity-50 text-zinc-100 text-xs font-semibold rounded-xl transition shadow"
                >
                  {submitting ? 'Formulando...' : 'Formular Hipótese'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
