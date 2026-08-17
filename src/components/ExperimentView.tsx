import React, { useState, useEffect } from 'react';
import { Experiment, Hypothesis } from '../types';
import { apiFetch } from '../lib/api';
import { FlaskConical, Plus, AlertCircle, Play, CheckCircle2, XCircle } from 'lucide-react';

interface ExperimentViewProps {
  workspaceId: string;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ workspaceId }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [hypothesisId, setHypothesisId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [methodology, setMethodology] = useState('');
  const [sampleSize, setSampleSize] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  // Active edit state for completing an experiment
  const [editingExp, setEditingExp] = useState<Experiment | null>(null);
  const [resultsText, setResultsText] = useState('');
  const [learningsText, setLearningsText] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, hypRes] = await Promise.all([
        apiFetch('/api/experiments', {}, workspaceId),
        apiFetch('/api/hypotheses', {}, workspaceId),
      ]);
      setExperiments(expRes.data || []);
      setHypotheses(hypRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar experimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesisId || !title) return;
    setSubmitting(true);
    try {
      await apiFetch(
        '/api/experiments',
        {
          method: 'POST',
          body: JSON.stringify({
            hypothesis_id: hypothesisId,
            title,
            description: description || undefined,
            methodology: methodology || undefined,
            sample_size: Number(sampleSize) || undefined,
          }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setDescription('');
      setMethodology('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar experimento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (exp: Experiment, newStatus: string) => {
    try {
      await apiFetch(
        `/api/experiments/${exp.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        },
        workspaceId
      );
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao atualizar status do experimento');
    }
  };

  const handleSaveResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    try {
      await apiFetch(
        `/api/experiments/${editingExp.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'completed',
            results: resultsText,
            learnings: learningsText,
          }),
        },
        workspaceId
      );
      setEditingExp(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar resultados');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-military-400" />
            Experimentos em Campo
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Planeje testes (A/B, Prototipagem, Concierge) e registre aprendizados.
            Experimentos concluídos alimentam a Etapa 6 (Decisões).
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Criar Experimento
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando experimentos...</div>
      ) : experiments.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
          <FlaskConical className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Nenhum experimento cadastrado</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Crie um experimento para testar uma das hipóteses formuladas.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
          >
            Criar Experimento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiments.map((exp) => {
            const hyp = hypotheses.find((h) => h.id === exp.hypothesis_id);
            return (
              <div key={exp.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-100">{exp.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                      exp.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : exp.status === 'running'
                        ? 'bg-military-900/80 text-military-300 border-military-700/50 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>

                {exp.description && <p className="text-xs text-zinc-300">{exp.description}</p>}

                {exp.methodology && (
                  <div className="text-xs text-zinc-400">
                    <strong className="text-zinc-300">Metodologia:</strong> {exp.methodology}
                  </div>
                )}

                {exp.sample_size && (
                  <div className="text-xs text-zinc-400">
                    <strong className="text-zinc-300">Amostra:</strong> {exp.sample_size} usuários
                  </div>
                )}

                {exp.results && (
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs">
                    <span className="font-bold text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
                      Resultados Obtidos
                    </span>
                    <p className="text-zinc-200">{exp.results}</p>
                  </div>
                )}

                {exp.learnings && (
                  <div className="bg-military-950/60 p-3 rounded-lg border border-military-700/50 text-xs">
                    <span className="font-bold text-[10px] text-military-300 uppercase tracking-wider block mb-1">
                      Aprendizados do Produto
                    </span>
                    <p className="text-military-200">{exp.learnings}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                  {exp.status === 'draft' && (
                    <button
                      onClick={() => handleStatusUpdate(exp, 'running')}
                      className="px-3 py-1 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded flex items-center gap-1 shadow"
                    >
                      <Play className="w-3 h-3" /> Iniciar Experimento
                    </button>
                  )}

                  {exp.status === 'running' && (
                    <button
                      onClick={() => {
                        setEditingExp(exp);
                        setResultsText(exp.results || '');
                        setLearningsText(exp.learnings || '');
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Concluir & Registrar Aprendizado
                    </button>
                  )}

                  {exp.status === 'completed' && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pronto para Decisão (Etapa 6)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal New Experiment */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Novo Experimento</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Hipótese a Testar</label>
                <select
                  value={hypothesisId}
                  onChange={(e) => setHypothesisId(e.target.value)}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                >
                  <option value="">-- Selecione uma Hipótese --</option>
                  {hypotheses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Título do Experimento</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Teste A/B no fluxo de Checkout PIX"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Metodologia</label>
                <input
                  type="text"
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  placeholder="Ex: Teste A/B com split 50/50, Protótipo de Alta Fidelidade"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Tamanho da Amostra (Usuários)</label>
                <input
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
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
                  disabled={submitting || !hypothesisId}
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Criar Experimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Results & Learnings */}
      {editingExp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-2">Concluir Experimento & Registrar Aprendizados</h3>
            <p className="text-xs text-zinc-400 mb-4">{editingExp.title}</p>
            <form onSubmit={handleSaveResults} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Resultados Obtidos</label>
                <textarea
                  value={resultsText}
                  onChange={(e) => setResultsText(e.target.value)}
                  rows={3}
                  placeholder="Ex: A conversão subiu de 10% para 18% no grupo B (p < 0.05)."
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Aprendizados Chave</label>
                <textarea
                  value={learningsText}
                  onChange={(e) => setLearningsText(e.target.value)}
                  rows={3}
                  placeholder="Ex: Usuários valorizam a velocidade de confirmação do PIX mais do que opções de parcelamento."
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg"
                >
                  Salvar Resultados e Concluir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
