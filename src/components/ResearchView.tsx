import React, { useState, useEffect } from 'react';
import { Research } from '../types';
import { apiFetch } from '../lib/api';
import { Search, Plus, Sparkles, AlertCircle, FileText, CheckCircle, ArrowRight } from 'lucide-react';

interface ResearchViewProps {
  workspaceId: string;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ workspaceId }) => {
  const [researches, setResearches] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadResearches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/researches', {}, workspaceId);
      setResearches(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar pesquisas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadResearches();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);
    try {
      await apiFetch(
        '/api/researches',
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            objective: objective || undefined,
            target_audience: targetAudience || undefined,
            raw_notes: rawNotes || undefined,
          }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setObjective('');
      setTargetAudience('');
      setRawNotes('');
      loadResearches();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar pesquisa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyzeAI = async (id: string) => {
    setAnalyzingId(id);
    setError(null);
    try {
      await apiFetch(`/api/researches/${id}/analyze`, { method: 'POST' }, workspaceId);
      loadResearches();
    } catch (err: any) {
      setError(err.message || 'Falha na análise de IA');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleApproveAnalysis = async (research: Research) => {
    if (!research.suggested_problems || research.suggested_problems.length === 0) return;
    try {
      await apiFetch(
        `/api/researches/${research.id}/approve-analysis`,
        {
          method: 'POST',
          body: JSON.stringify({
            problemsToCreate: research.suggested_problems,
          }),
        },
        workspaceId
      );
      loadResearches();
    } catch (err: any) {
      setError(err.message || 'Falha ao aprovar sugestões de problemas');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-400" />
            Pesquisa de Campo & Discovery
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cole notas brutas de entrevistas ou feedbacks. A IA extrai achados principais e sugere problemas com evidências.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Pesquisa
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Carregando pesquisas...</div>
      ) : researches.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Nenhuma pesquisa registrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Crie sua primeira pesquisa e adicione anotações brutas de usuários.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg"
          >
            Criar Pesquisa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {researches.map((r) => (
            <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{r.title}</h3>
                  {r.target_audience && (
                    <span className="text-[11px] text-slate-400">Público-alvo: {r.target_audience}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      r.status === 'analyzed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {r.status === 'analyzed' ? 'Analisada' : 'Rascunho'}
                  </span>

                  {r.raw_notes && r.status !== 'analyzed' && (
                    <button
                      onClick={() => handleAnalyzeAI(r.id)}
                      disabled={analyzingId === r.id}
                      className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {analyzingId === r.id ? 'Analisando com IA...' : 'Analisar com IA'}
                    </button>
                  )}
                </div>
              </div>

              {r.objective && <p className="text-xs text-slate-300"><strong>Objetivo:</strong> {r.objective}</p>}

              {r.raw_notes && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Anotações Brutas</span>
                  {r.raw_notes}
                </div>
              )}

              {/* AI Findings */}
              {r.key_findings && r.key_findings.length > 0 && (
                <div className="bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-lg space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Principais Descobertas da IA
                  </h4>
                  <ul className="list-disc list-inside text-xs text-indigo-100 space-y-1">
                    {r.key_findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Suggested Problems */}
              {r.suggested_problems && r.suggested_problems.length > 0 && r.status !== 'analyzed' && (
                <div className="bg-slate-950 border border-amber-500/20 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-400">Problemas Sugeridos pela IA</h4>
                    <button
                      onClick={() => handleApproveAnalysis(r)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Aprovar e Gerar Problemas + Evidências
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {r.suggested_problems.map((p, i) => (
                      <div key={i} className="p-3 bg-slate-900 rounded border border-slate-800 text-xs space-y-1">
                        <div className="font-bold text-white">{p.title}</div>
                        <div className="text-slate-300">{p.description}</div>
                        <div className="text-[10px] text-amber-300 font-medium">Impacto: {p.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-100">
            <h3 className="text-base font-bold text-white mb-4">Nova Pesquisa de Discovery</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Entrevistas de Onboarding Q2"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Objetivo</label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Mapear atritos no primeiro uso da plataforma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Público Alvo</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ex: PMs e Tech Leads de Startups"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Anotações Brutas / Transcrição</label>
                <textarea
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  rows={4}
                  placeholder="Cole aqui os relatos dos usuários para a IA analisar..."
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
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg"
                >
                  Criar Pesquisa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
