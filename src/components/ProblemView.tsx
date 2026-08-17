import React, { useState, useEffect } from 'react';
import { Problem } from '../types';
import { apiFetch } from '../lib/api';
import { AlertCircle, Plus } from 'lucide-react';

interface ProblemViewProps {
  workspaceId: string;
}

export const ProblemView: React.FC<ProblemViewProps> = ({ workspaceId }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [frequency, setFrequency] = useState<'rare' | 'occasional' | 'frequent' | 'constant'>('occasional');
  const [submitting, setSubmitting] = useState(false);

  const loadProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/problems', {}, workspaceId);
      setProblems(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar problemas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadProblems();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    try {
      await apiFetch(
        '/api/problems',
        {
          method: 'POST',
          body: JSON.stringify({ title, description, impact, frequency }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadProblems();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar problema');
    } finally {
      setSubmitting(false);
    }
  };

  const getImpactBadge = (imp: string) => {
    switch (imp) {
      case 'critical': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high': return 'bg-military-500/20 text-military-300 border-military-500/30';
      case 'medium': return 'bg-military-900/80 text-military-300 border-military-700/50';
      default: return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-military-400" />
            Mapeamento de Problemas
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Problemas identificados a partir das evidências. Priorize com base em impacto e frequência.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Criar Problema
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando problemas...</div>
      ) : problems.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
          <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Nenhum problema registrado</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Aprove achados da pesquisa ou registre novos problemas manualmente.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
          >
            Criar Problema
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((p) => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-zinc-100">{p.title}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getImpactBadge(p.impact)}`}>
                  {p.impact}
                </span>
              </div>
              <p className="text-xs text-zinc-300">{p.description}</p>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                <span>Frequência: <strong className="text-zinc-200">{p.frequency}</strong></span>
                <span>Status: <strong className="text-military-400">{p.status}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Registrar Problema do Usuário</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Alta taxa de abandono no fluxo de pagamento"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detalhe a dor enfrentada pelo usuário..."
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Impacto</label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                  >
                    <option value="low">Baixo</option>
                    <option value="medium">Médio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Frequência</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                  >
                    <option value="rare">Rara</option>
                    <option value="occasional">Ocasional</option>
                    <option value="frequent">Frequente</option>
                    <option value="constant">Constante</option>
                  </select>
                </div>
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
                  disabled={submitting}
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Criar Problema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
