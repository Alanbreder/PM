import React, { useState, useEffect } from 'react';
import { Opportunity, Problem } from '../types';
import { apiFetch } from '../lib/api';
import { 
  Lightbulb, 
  Plus, 
  AlertCircle, 
  Link2, 
  Layers, 
  Sparkles, 
  X, 
  CheckSquare, 
  Square,
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';

interface OpportunityViewProps {
  workspaceId: string;
  onNavigateTab?: (tab: string) => void;
  onOpenToolkit?: (toolKey: any) => void;
}

export const OpportunityView: React.FC<OpportunityViewProps> = ({ 
  workspaceId, 
  onNavigateTab,
  onOpenToolkit 
}) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [effort, setEffort] = useState<'low' | 'medium' | 'high' | 'very_high'>('medium');
  const [value, setValue] = useState<'low' | 'medium' | 'high' | 'transformative'>('high');
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppRes, probRes] = await Promise.all([
        apiFetch('/api/opportunities', {}, workspaceId),
        apiFetch('/api/problems', {}, workspaceId).catch(() => ({ data: [] })),
      ]);
      setOpportunities(oppRes.data || []);
      setProblems(probRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar oportunidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const toggleProblemSelection = (pId: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await apiFetch(
        '/api/opportunities',
        {
          method: 'POST',
          body: JSON.stringify({ 
            title: title.trim(), 
            description: description.trim(), 
            effort, 
            value,
            problem_ids: selectedProblemIds.length > 0 ? selectedProblemIds : undefined,
          }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setDescription('');
      setSelectedProblemIds([]);
      setEffort('medium');
      setValue('high');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar oportunidade');
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
              Discovery Contínuo • Etapa 4
            </span>
            <span className="text-zinc-500 text-xs">|</span>
            <span className="text-zinc-400 text-xs font-medium">Soluções & Alavancas de Valor</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mt-1">
            <Lightbulb className="w-5 h-5 text-military-400" />
            Oportunidades de Produto
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Direcionamentos estratégicos e soluções de valor. Podem responder a um ou múltiplos problemas validados, ou nascer como iniciativas diretas de negócio.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Criar Oportunidade
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando oportunidades...</div>
      ) : opportunities.length === 0 ? (
        /* Empty State Inteligente */
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-military-950 border border-military-700/40 text-military-400 mx-auto">
            <Lightbulb className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-zinc-100">Nenhuma oportunidade mapeada</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Você pode propor uma oportunidade de negócio diretamente ou explorar os problemas identificados no Discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
            <div 
              onClick={() => setShowModal(true)}
              className="bg-zinc-900 border border-zinc-700/80 hover:border-military-500 p-5 rounded-xl text-left cursor-pointer transition group"
            >
              <span className="text-xs font-bold text-zinc-100 group-hover:text-military-300 flex items-center gap-1.5 mb-1.5">
                <Plus className="w-4 h-4 text-military-400" />
                Criar Oportunidade Direta
              </span>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Mapeie uma solução inovadora, melhoria técnica ou oportunidade estratégica sem vínculo obrigatório.
              </p>
            </div>

            {onNavigateTab && (
              <div 
                onClick={() => onNavigateTab('problems')}
                className="bg-zinc-900 border border-zinc-700/80 hover:border-military-500 p-5 rounded-xl text-left cursor-pointer transition group"
              >
                <span className="text-xs font-bold text-zinc-100 group-hover:text-military-300 flex items-center gap-1.5 mb-1.5">
                  <Target className="w-4 h-4 text-military-400" />
                  Ver Problemas Priorizados
                </span>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Identifique os problemas mais votados ou dolorosos antes de desenhar as oportunidades.
                </p>
              </div>
            )}
          </div>

          {onOpenToolkit && (
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 max-w-xl mx-auto text-xs text-zinc-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <Layers className="w-4 h-4 text-military-400 shrink-0" />
                <span>
                  <strong>Árvore de Soluções:</strong> Use o Canvas <strong className="text-zinc-200">Opportunity Solution Tree</strong> no Toolkit para desdobrar oportunidades visuais.
                </span>
              </div>
              <button
                onClick={() => onOpenToolkit('opportunity-tree')}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold shrink-0 transition"
              >
                Abrir OST
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((op) => {
            return (
              <div key={op.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-4 transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-zinc-100">{op.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-military-900/80 text-military-300 border border-military-700/50">
                      Score: {op.score}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{op.description}</p>
                </div>

                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Valor: <strong className="text-emerald-400 uppercase">{op.value}</strong>
                    </span>
                    <span>
                      Esforço: <strong className="text-military-300 uppercase">{op.effort}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                      {op.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    {op.problem_id ? (
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Link2 className="w-3 h-3 text-military-400" /> Vinculada a Problema
                      </span>
                    ) : (
                      <span className="text-zinc-500 italic">
                        Oportunidade Direta / Standalone
                      </span>
                    )}
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('hypotheses')}
                        className="text-military-400 hover:text-military-300 font-medium flex items-center gap-1 transition"
                      >
                        Formular Hipóteses <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Oportunidade */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full text-zinc-100 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-military-400" />
                <h3 className="text-base font-bold text-zinc-100">Nova Oportunidade de Solução</h3>
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
                  Título da Oportunidade <span className="text-military-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Checkout de 1-Clique com Pix Inteligente"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição do Direcionamento <span className="text-military-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Explique como essa oportunidade gera valor para o cliente e para o negócio..."
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Valor Potencial</label>
                  <select
                    value={value}
                    onChange={(e) => setValue(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                  >
                    <option value="low">Baixo Impacto</option>
                    <option value="medium">Médio Impacto</option>
                    <option value="high">Alto Impacto</option>
                    <option value="transformative">Transformacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Esforço Estimado</label>
                  <select
                    value={effort}
                    onChange={(e) => setEffort(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                  >
                    <option value="low">Baixo (1-2 semanas)</option>
                    <option value="medium">Médio (1 mês)</option>
                    <option value="high">Alto (1 trimestre)</option>
                    <option value="very_high">Muito Alto (Multi-time)</option>
                  </select>
                </div>
              </div>

              {/* Optional Problem Linking */}
              {problems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Vincular a Problemas Mapeados <span className="text-zinc-500 font-normal">(opcional)</span>
                    </label>
                    <span className="text-[10px] text-zinc-500">
                      {selectedProblemIds.length} selecionado(s)
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    {problems.map((p) => {
                      const isSelected = selectedProblemIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProblemSelection(p.id)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs transition ${
                            isSelected
                              ? 'bg-military-950/70 border border-military-700/60 text-zinc-100'
                              : 'hover:bg-zinc-900 border border-transparent text-zinc-400'
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-military-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600 shrink-0" />
                          )}
                          <span className="line-clamp-1 font-medium">{p.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="px-5 py-2 bg-military-600 hover:bg-military-500 disabled:opacity-50 text-zinc-100 text-xs font-semibold rounded-xl transition shadow"
                >
                  {submitting ? 'Criar...' : 'Salvar Oportunidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
