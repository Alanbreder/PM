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
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-military-400" />
            Hipóteses de Produto
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Declarações testáveis ligadas a uma oportunidade. Definem premissas claras e métricas de validação.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow transition flex items-center gap-2"
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
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
          <GitCommit className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Nenhuma hipótese formulada</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Crie sua primeira hipótese para testar a solução proposta.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
          >
            Formular Hipótese
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hypotheses.map((h) => {
            const op = opportunities.find((o) => o.id === h.opportunity_id);
            return (
              <div key={h.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-100">{h.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-military-900/80 text-military-300 border border-military-700/50">
                    Confiança: {h.confidence_score}/5
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs text-zinc-300 italic">
                  "{h.statement}"
                </div>
                {h.metrics_to_validate && (
                  <p className="text-xs text-zinc-400">
                    <strong className="text-zinc-300">Métricas:</strong> {h.metrics_to_validate}
                  </p>
                )}
                {op && (
                  <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800">
                    Oportunidade: <span className="text-zinc-400 font-medium">{op.title}</span>
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Formular Nova Hipótese</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Oportunidade Relacionada</label>
                <select
                  value={opportunityId}
                  onChange={(e) => setOpportunityId(e.target.value)}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
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
                <label className="block text-xs font-medium text-zinc-300 mb-1">Título da Hipótese</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Oferecer PIX reduz a desistência em 25%"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Declaração (Premissa)</label>
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={3}
                  placeholder="Se nós [fizeramos X], então [resultado Y ocorrerá] porque [motivo Z]."
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Métricas de Validação</label>
                <input
                  type="text"
                  value={metrics}
                  onChange={(e) => setMetrics(e.target.value)}
                  placeholder="Ex: Conversão no checkout > 15%"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nível de Confiança Inicial (1 a 5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !opportunityId}
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
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
