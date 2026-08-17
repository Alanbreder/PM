import React, { useState, useEffect } from 'react';
import { Evidence, Research } from '../types';
import { apiFetch } from '../lib/api';
import { 
  FileText, 
  Plus, 
  Tag, 
  AlertCircle, 
  Search, 
  Sparkles, 
  ExternalLink,
  Filter,
  Layers,
  MessageSquare,
  HelpCircle,
  X,
  ArrowRight
} from 'lucide-react';

interface EvidenceViewProps {
  workspaceId: string;
  onNavigateTab?: (tab: string) => void;
  onOpenToolkit?: (toolKey: any) => void;
}

const ORIGIN_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  customer_interview: { label: 'Entrevista com Cliente', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' },
  support_ticket: { label: 'Ticket de Suporte', color: 'bg-amber-950/80 text-amber-300 border-amber-800/60' },
  analytics: { label: 'Dados de Analytics', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60' },
  sales_feedback: { label: 'Feedback de Vendas', color: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60' },
  user_testing: { label: 'Teste de Usabilidade', color: 'bg-purple-950/80 text-purple-300 border-purple-800/60' },
  research: { label: 'Pesquisa Estruturada', color: 'bg-military-900/80 text-military-300 border-military-700/60' },
  other: { label: 'Outra Origem', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
};

export const EvidenceView: React.FC<EvidenceViewProps> = ({ 
  workspaceId, 
  onNavigateTab,
  onOpenToolkit 
}) => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [researches, setResearches] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');

  // Manual Creation Modal
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [originType, setOriginType] = useState<string>('customer_interview');
  const [researchId, setResearchId] = useState<string>('');
  const [impactScore, setImpactScore] = useState<number>(3);
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [evRes, resRes] = await Promise.all([
        apiFetch('/api/evidences', {}, workspaceId),
        apiFetch('/api/researches', {}, workspaceId).catch(() => ({ data: [] })),
      ]);
      setEvidences(evRes.data || []);
      setResearches(resRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar evidências');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !source.trim()) return;

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await apiFetch(
        '/api/evidences',
        {
          method: 'POST',
          body: JSON.stringify({
            content: content.trim(),
            source: source.trim(),
            origin_type: originType,
            research_id: researchId ? researchId : undefined,
            impact_score: Number(impactScore),
            tags: tags.length > 0 ? tags : undefined,
            notes: notes.trim() || undefined,
          }),
        },
        workspaceId
      );

      // Reset modal
      setShowModal(false);
      setContent('');
      setSource('');
      setOriginType('customer_interview');
      setResearchId('');
      setImpactScore(3);
      setTagsInput('');
      setNotes('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Falha ao cadastrar evidência');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered list
  const filteredEvidences = evidences.filter((ev) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      ev.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.source && ev.source.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.tags && ev.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesOrigin =
      selectedOrigin === 'all' ||
      (selectedOrigin === 'unlinked' && !ev.research_id) ||
      (selectedOrigin === 'linked' && !!ev.research_id) ||
      ev.origin_type === selectedOrigin;

    return matchesSearch && matchesOrigin;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-military-900/80 text-military-300 border border-military-700/60 text-[10px] font-bold uppercase tracking-wider">
              Discovery Contínuo • Etapa 2
            </span>
            <span className="text-zinc-500 text-xs">|</span>
            <span className="text-zinc-400 text-xs font-medium">Entrada Flexível</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-military-400" />
            Banco de Evidências Fatuais
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Registre citações diretas, dados de suporte ou descobertas de pesquisas. 
            Você pode inserir evidências manualmente ou extraí-las de Pesquisas com IA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Evidência
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      {evidences.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar citações, fontes ou tags..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-military-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-military-500"
            >
              <option value="all">Todas as origens ({evidences.length})</option>
              <option value="unlinked">Entradas Manuais ({evidences.filter(e => !e.research_id).length})</option>
              <option value="linked">De Pesquisas ({evidences.filter(e => !!e.research_id).length})</option>
              <option value="customer_interview">Entrevistas com Clientes</option>
              <option value="support_ticket">Tickets de Suporte</option>
              <option value="analytics">Dados de Analytics</option>
              <option value="sales_feedback">Feedback de Vendas</option>
              <option value="user_testing">Testes de Usabilidade</option>
            </select>
          </div>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando evidências...</div>
      ) : evidences.length === 0 ? (
        /* Empty State Inteligente & Contextual */
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-military-950 border border-military-700/40 text-military-400 mx-auto">
            <FileText className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-zinc-100">Nenhuma evidência registrada ainda</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Você pode inserir uma evidência diretamente a partir de um feedback real ou iniciar uma pesquisa estruturada com o Discovery Engine.
            </p>
          </div>

          {/* Action options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
            <div 
              onClick={() => setShowModal(true)}
              className="bg-zinc-900 border border-zinc-700/80 hover:border-military-500 p-5 rounded-xl text-left cursor-pointer transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-100 group-hover:text-military-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-military-400" />
                  + Nova Evidência Direta
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Insira uma citação de cliente, ticket do suporte ou métrica quantitativa sem precisar criar uma pesquisa.
              </p>
            </div>

            {onNavigateTab && (
              <div 
                onClick={() => onNavigateTab('research')}
                className="bg-zinc-900 border border-zinc-700/80 hover:border-military-500 p-5 rounded-xl text-left cursor-pointer transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-100 group-hover:text-military-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-military-400" />
                    Iniciar Pesquisa de Usuário
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Crie um roteiro de entrevista ou faça upload de transcrições para extração automática com IA.
                </p>
              </div>
            )}
          </div>

          {/* Toolkit Contextual Hint */}
          {onOpenToolkit && (
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 max-w-xl mx-auto text-xs text-zinc-400 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <Layers className="w-4 h-4 text-military-400 shrink-0" />
                <span>
                  <strong>Dica de Discovery:</strong> Mapeie dores e contexto do cliente no{' '}
                  <strong className="text-zinc-200">Mapa de Empatia</strong> ou nas <strong className="text-zinc-200">Personas</strong> do Toolkit.
                </span>
              </div>
              <button
                onClick={() => onOpenToolkit('empathy-map')}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold shrink-0 transition"
              >
                Abrir Canvas
              </button>
            </div>
          )}
        </div>
      ) : filteredEvidences.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-xs text-zinc-400">
          Nenhuma evidência corresponde aos filtros aplicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvidences.map((ev) => {
            const originMeta = ORIGIN_TYPE_LABELS[ev.origin_type || (ev.research_id ? 'research' : 'customer_interview')] || ORIGIN_TYPE_LABELS.other;

            return (
              <div key={ev.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 space-y-3.5 transition flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded font-medium border ${originMeta.color}`}>
                        {originMeta.label}
                      </span>
                      {ev.research_id ? (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px]">
                          Vinculado à Pesquisa
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-military-400 font-medium text-[9px] border border-military-800/40">
                          Entrada Manual
                        </span>
                      )}
                    </div>

                    <span className="px-2 py-0.5 rounded bg-military-900/80 text-military-300 font-bold border border-military-700/50">
                      Impacto: {ev.impact_score}/5
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed font-mono bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80">
                    "{ev.content}"
                  </p>

                  {ev.notes && (
                    <p className="text-[11px] text-zinc-400 italic bg-zinc-900/80 px-3 py-1.5 rounded border border-zinc-800">
                      <strong>Contexto/Notas:</strong> {ev.notes}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-medium text-zinc-300 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-military-400" />
                      Fonte: <strong className="text-zinc-200">{ev.source || 'Não especificada'}</strong>
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {ev.created_at ? new Date(ev.created_at).toLocaleDateString('pt-BR') : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {ev.tags && ev.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ev.tags.map((tag, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                            <Tag className="w-2.5 h-2.5 text-zinc-400" /> {tag}
                          </span>
                        ))}
                      </div>
                    ) : <div />}

                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('problem')}
                        className="text-military-400 hover:text-military-300 font-medium text-[10px] flex items-center gap-1 transition"
                      >
                        Identificar Problema <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Evidence Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full text-zinc-100 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-military-400" />
                <h3 className="text-base font-bold text-zinc-100">Registrar Nova Evidência</h3>
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
                  Conteúdo ou Citação Direta <span className="text-military-400">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder='Ex: "A etapa de conciliação bancária leva 4 horas todo fim de mês e temos que exportar planilhas manuais."'
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 font-mono transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Fonte ou Autor <span className="text-military-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Ex: Entrevista com CFO Cliente #14"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Tipo de Origem</label>
                  <select
                    value={originType}
                    onChange={(e) => setOriginType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                  >
                    <option value="customer_interview">Entrevista com Cliente</option>
                    <option value="support_ticket">Ticket de Suporte / CS</option>
                    <option value="analytics">Métrica / Analytics</option>
                    <option value="sales_feedback">Feedback de Vendas</option>
                    <option value="user_testing">Teste de Usabilidade</option>
                    <option value="research">Pesquisa Estruturada</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>

              {researches.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Vincular a uma Pesquisa Existente <span className="text-zinc-500 font-normal">(opcional)</span>
                  </label>
                  <select
                    value={researchId}
                    onChange={(e) => setResearchId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                  >
                    <option value="">Nenhuma pesquisa (Entrada Independente)</option>
                    {researches.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} {r.objective ? `— ${r.objective}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Força / Impacto da Evidência (1 a 5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={impactScore}
                    onChange={(e) => setImpactScore(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tags <span className="text-zinc-500 font-normal">(separadas por vírgula)</span>
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Ex: checkout, pix, churn"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Notas ou Contexto Adicional <span className="text-zinc-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Cliente mencionou que isso é bloqueador para renovação anual."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
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
                  disabled={submitting || !content.trim() || !source.trim()}
                  className="px-5 py-2 bg-military-600 hover:bg-military-500 disabled:opacity-50 text-zinc-100 text-xs font-semibold rounded-xl transition shadow"
                >
                  {submitting ? 'Salvando...' : 'Cadastrar Evidência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
