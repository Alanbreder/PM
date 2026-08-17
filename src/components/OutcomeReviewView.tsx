import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { TrendingUp, Plus, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, Lightbulb } from 'lucide-react';

interface OutcomeReviewViewProps {
  workspaceId: string;
}

export const OutcomeReviewView: React.FC<OutcomeReviewViewProps> = ({ workspaceId }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  // Review Form
  const [title, setTitle] = useState('');
  const [metricName, setMetricName] = useState('');
  const [baselineVal, setBaselineVal] = useState('30%');
  const [targetVal, setTargetVal] = useState('70%');
  const [actualVal, setActualVal] = useState('80%');
  const [status, setStatus] = useState<'exceeded' | 'on_target' | 'below_target' | 'failed'>('exceeded');

  const [expected, setExpected] = useState('');
  const [happened, setHappened] = useState('');
  const [learned, setLearned] = useState('');
  const [nextActions, setNextActions] = useState('');
  const [refeed, setRefeed] = useState(true);
  const [roadmapItemId, setRoadmapItemId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [outRes, roadRes] = await Promise.all([
        apiFetch('/api/outcomes', {}, workspaceId),
        apiFetch('/api/roadmap', {}, workspaceId),
      ]);
      setReviews(outRes.data || []);
      setRoadmapItems(roadRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar revisões de resultado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/outcomes',
        {
          method: 'POST',
          body: JSON.stringify({
            roadmap_item_id: roadmapItemId || undefined,
            title,
            metric_name: metricName,
            baseline_value: baselineVal,
            target_value: targetVal,
            actual_value: actualVal,
            status,
            what_we_expected: expected,
            what_happened: happened,
            what_we_learned: learned,
            next_actions: nextActions,
            refeed_to_discovery: refeed,
          }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setMetricName('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar revisão de resultado');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Revisão de Impacto (Post-Launch Outcome Reviews)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Avalie o impacto real pós-lançamento, documente aprendizados e realimente o Discovery automaticamente.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Registrar Revisão Pós-Lançamento
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando revisões de impacto...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
          <TrendingUp className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Nenhuma Revisão de Resultado</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Após 30 dias do lançamento de uma feature, meça o impacto e feche o ciclo do Discovery.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-medium rounded-lg shadow"
          >
            Registrar Primeira Revisão
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] rounded font-bold uppercase bg-emerald-500/20 text-emerald-300">
                      {rev.status}
                    </span>
                    {rev.roadmap_title && (
                      <span className="text-xs text-zinc-400">Item: {rev.roadmap_title}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-zinc-100 mt-1">{rev.title}</h3>
                </div>
                <div className="flex items-center gap-4 bg-zinc-800/80 px-4 py-2 rounded-lg border border-zinc-700/60 text-xs font-mono">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Métrica</span>
                    <strong className="text-zinc-100">{rev.metric_name}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Antes</span>
                    <span className="text-zinc-300">{rev.baseline_value}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Meta</span>
                    <span className="text-military-300">{rev.target_value}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Atingido</span>
                    <strong className="text-military-400">{rev.actual_value}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-zinc-800/50 p-3.5 rounded-lg border border-zinc-700/50">
                  <span className="font-bold text-military-300 uppercase text-[10px] block mb-1">O que esperávamos</span>
                  <p className="text-zinc-300">{rev.what_we_expected || '—'}</p>
                </div>
                <div className="bg-zinc-800/50 p-3.5 rounded-lg border border-zinc-700/50">
                  <span className="font-bold text-military-400 uppercase text-[10px] block mb-1">O que realmente aconteceu</span>
                  <p className="text-zinc-300">{rev.what_happened || '—'}</p>
                </div>
                <div className="bg-zinc-800/50 p-3.5 rounded-lg border border-zinc-700/50">
                  <span className="font-bold text-military-300 uppercase text-[10px] block mb-1">O que aprendemos</span>
                  <p className="text-zinc-300">{rev.what_we_learned || '—'}</p>
                </div>
              </div>

              {rev.refeed_to_discovery && (
                <div className="bg-military-950/60 border border-military-600/40 p-3 rounded-lg flex items-center justify-between text-xs text-military-200">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-military-400 shrink-0" />
                    <span>Este aprendizado foi enviado automaticamente como um novo Problema no Discovery Engine.</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full text-zinc-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Registrar Revisão de Impacto Pós-Lançamento</h3>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Título da Revisão</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Revisão de Impacto 30 Dias — Módulo Validador"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Nome da Métrica</label>
                  <input
                    type="text"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    placeholder="Taxa de Conversão"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Avaliação do Resultado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="exceeded">Excedeu as expectativas</option>
                    <option value="on_target">Dentro da meta</option>
                    <option value="below_target">Abaixo da meta</option>
                    <option value="failed">Não atingiu resultado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Valor Inicial</label>
                  <input
                    type="text"
                    value={baselineVal}
                    onChange={(e) => setBaselineVal(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Valor Meta</label>
                  <input
                    type="text"
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Valor Atingido</label>
                  <input
                    type="text"
                    value={actualVal}
                    onChange={(e) => setActualVal(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">O que esperávamos</label>
                <textarea
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">O que realmente aconteceu</label>
                <textarea
                  value={happened}
                  onChange={(e) => setHappened(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">O que aprendemos</label>
                <textarea
                  value={learned}
                  onChange={(e) => setLearned(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-refeed"
                  checked={refeed}
                  onChange={(e) => setRefeed(e.target.checked)}
                  className="rounded border-zinc-700 text-military-500 focus:ring-0"
                />
                <label htmlFor="chk-refeed" className="text-xs text-zinc-200">
                  Realimentar o Discovery (gerar novo Problema para o backlog)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Salvar Revisão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
