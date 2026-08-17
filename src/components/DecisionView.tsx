import React, { useState, useEffect } from 'react';
import { Decision, Experiment, CreateDecisionInput } from '../types';
import { apiFetch } from '../lib/api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  FlaskConical, 
  FileText, 
  Check, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';

interface DecisionViewProps {
  workspaceId: string;
}

export const DecisionView: React.FC<DecisionViewProps> = ({ workspaceId }) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedExperimentId, setSelectedExperimentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [decisionText, setDecisionText] = useState('');
  const [rationale, setRationale] = useState('');
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected' | 'deferred'>('accepted');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [decRes, expRes] = await Promise.all([
        apiFetch('/api/decisions', {}, workspaceId),
        apiFetch('/api/experiments', {}, workspaceId),
      ]);
      setDecisions(decRes.data || []);
      setExperiments(expRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar decisões do produto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  // Filter completed experiments that don't have decisions yet (or allow selecting any completed)
  const completedExperiments = experiments.filter((e) => e.status === 'completed');

  const handleExperimentSelect = (expId: string) => {
    setSelectedExperimentId(expId);
    const exp = experiments.find((e) => e.id === expId);
    if (exp) {
      setTitle(`Decisão sobre: ${exp.title}`);
      setDecisionText(exp.learnings ? `Com base no aprendizado: ${exp.learnings}` : '');
      setRationale(exp.results ? `Resultados obtidos: ${exp.results}` : '');
    }
  };

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExperimentId || !title || !decisionText) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateDecisionInput = {
        experiment_id: selectedExperimentId,
        title,
        description: description || undefined,
        decision: decisionText,
        rationale: rationale || undefined,
        status,
      };

      await apiFetch('/api/decisions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, workspaceId);

      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar decisão');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDecision = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta decisão de produto?')) return;
    try {
      await apiFetch(`/api/decisions/${id}`, { method: 'DELETE' }, workspaceId);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao excluir decisão');
    }
  };

  const resetForm = () => {
    setSelectedExperimentId('');
    setTitle('');
    setDescription('');
    setDecisionText('');
    setRationale('');
    setStatus('accepted');
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aprovada / Executar
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Descartada
          </span>
        );
      case 'deferred':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-military-500/10 text-military-400 border border-military-500/20">
            <Clock className="w-3.5 h-3.5" /> Adiada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600">
            <HelpCircle className="w-3.5 h-3.5" /> Em Análise
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-military-950 to-zinc-900 border border-military-700/40 rounded-xl p-6 shadow-md text-zinc-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-military-500/20 text-military-300 border border-military-500/30 rounded">
                Etapa 6 — Fechamento do Ciclo
              </span>
              <span className="text-xs text-zinc-400">• Product OS</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-military-400" />
              Decisões & Aprendizados do Produto
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Transforme os resultados dos seus experimentos em decisões rastreáveis.
              Cada decisão conecta a evidência original ao resultado e direciona o roadmap.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 font-semibold text-xs rounded-lg shadow transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Registrar Nova Decisão
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Decisions List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando decisões do produto...</div>
      ) : decisions.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-military-900/80 text-military-400 border border-military-700/50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Nenhuma Decisão Registrada</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6">
            Conclua um experimento para formalizar a decisão de produto (Aprovar, Descartar ou Adiar) com justificativa técnica.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow transition"
          >
            <Plus className="w-4 h-4" />
            Formalizar Primeira Decisão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisions.map((dec) => {
            const exp = experiments.find((e) => e.id === dec.experiment_id);
            return (
              <div
                key={dec.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-semibold text-military-400 uppercase tracking-wider block mb-0.5">
                        Decisão de Produto
                      </span>
                      <h3 className="text-base font-bold text-zinc-100 leading-snug">{dec.title}</h3>
                    </div>
                    {getStatusBadge(dec.status)}
                  </div>

                  {dec.description && (
                    <p className="text-xs text-zinc-300 mb-3">{dec.description}</p>
                  )}

                  {/* Decision Text Box */}
                  <div className="bg-zinc-950/80 rounded-lg p-3 border border-zinc-800/80 mb-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Veredito do Produto
                    </span>
                    <p className="text-xs font-medium text-zinc-200">{dec.decision}</p>
                  </div>

                  {/* Rationale */}
                  {dec.rationale && (
                    <div className="mb-3 text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-300">Racional: </span>
                      {dec.rationale}
                    </div>
                  )}

                  {/* Linked Experiment */}
                  {exp && (
                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <FlaskConical className="w-3.5 h-3.5 text-military-400 shrink-0" />
                        <span className="truncate">Experimento: <strong className="text-zinc-300">{exp.title}</strong></span>
                      </div>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                        {new Date(dec.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">ID: {dec.id.substring(0, 8)}</span>
                  <button
                    onClick={() => handleDeleteDecision(dec.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 rounded transition"
                    title="Excluir Decisão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal New Decision */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-military-400" />
                Registrar Decisão do Produto (Etapa 6)
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDecision} className="space-y-4">
              {/* Select Experiment */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Selecione o Experimento Concluído <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedExperimentId}
                  onChange={(e) => handleExperimentSelect(e.target.value)}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                >
                  <option value="">-- Selecione um experimento concluído --</option>
                  {completedExperiments.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} (Status: Concluído)
                    </option>
                  ))}
                  {completedExperiments.length === 0 && (
                    <option disabled value="">
                      Nenhum experimento concluído disponível. Finalize um na aba Experimentos.
                    </option>
                  )}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Título da Decisão <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aprovar feature X para o roadmap Q3"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Resultado / Veredito
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('accepted')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                      status === 'accepted'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aprovada
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('rejected')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                      status === 'rejected'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Descartada
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('deferred')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                      status === 'deferred'
                        ? 'bg-military-500/20 border-military-500 text-military-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Adiada
                  </button>
                </div>
              </div>

              {/* Decision Text */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Decisão Tomada <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={decisionText}
                  onChange={(e) => setDecisionText(e.target.value)}
                  rows={2}
                  placeholder="Descreva a decisão tomada com clareza..."
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>

              {/* Rationale */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Racional & Justificativa (Aprendizados)
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  rows={2}
                  placeholder="Explique o motivo da decisão com base nas métricas e evidências..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedExperimentId}
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 disabled:opacity-50 text-zinc-100 font-semibold text-xs rounded-lg shadow transition"
                >
                  {submitting ? 'Salvando...' : 'Formalizar Decisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
