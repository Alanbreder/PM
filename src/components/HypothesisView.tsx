import React, { useState, useEffect } from 'react';
import { Hypothesis, Opportunity } from '../types';
import { apiFetch } from '../lib/api';
import { GitCommit, Plus, AlertCircle } from 'lucide-react';

interface HypothesisViewProps {
  workspaceId: string;
}

export const HypothesisView: React.FC<HypothesisViewProps> = ({ workspaceId }) => {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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
        apiFetch('/api/opportunities', {}, workspaceId),
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
    if (!opportunityId || !title || !statement) return;
    setSubmitting(true);
    try {
      await apiFetch(
        '/api/hypotheses',
        {
          method: 'POST',
          body: JSON.stringify({
            opportunity_id: opportunityId,
            title,
            statement,
            metrics_to_validate: metrics || undefined,
            confidence_score: Number(confidence),
          }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setStatement('');
      setMetrics('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar hipótese');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-indigo-400" />
            Hipóteses de Produto
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Declarações testáveis ligadas a uma oportunidade. Definem premissas claras e métricas de validação.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition flex items-center gap-2"
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
        <div className="p-12 text-center text-slate-400 text-sm">Carregando hipóteses...</div>
      ) : hypotheses.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <GitCommit className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Nenhuma hipótese formulada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Crie sua primeira hipótese para testar a solução proposta.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg"
          >
            Formular Hipótese
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hypotheses.map((h) => {
            const op = opportunities.find((o) => o.id === h.opportunity_id);
            return (
              <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">{h.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Confiança: {h.confidence_score}/5
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 italic">
                  "{h.statement}"
                </div>
                {h.metrics_to_validate && (
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-300">Métricas:</strong> {h.metrics_to_validate}
                  </p>
                )}
                {op && (
                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    Oportunidade: <span className="text-slate-400 font-medium">{op.title}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Formular Nova Hipótese</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Oportunidade Relacionada</label>
                <select
                  value={opportunityId}
                  onChange={(e) => setOpportunityId(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="">-- Selecione uma Oportunidade --</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título da Hipótese</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Oferecer PIX reduz a desistência em 25%"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Declaração (Premissa)</label>
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={3}
                  placeholder="Se nós [fizeramos X], então [resultado Y ocorrerá] porque [motivo Z]."
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Métricas de Validação</label>
                <input
                  type="text"
                  value={metrics}
                  onChange={(e) => setMetrics(e.target.value)}
                  placeholder="Ex: Conversão no checkout > 15%"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nível de Confiança Inicial (1 a 5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !opportunityId}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
                >
                  Criar Hipótese
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
