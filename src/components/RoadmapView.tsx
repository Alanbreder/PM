import React, { useState, useEffect } from 'react';
import {
  RoadmapItem,
  CreateRoadmapItemInput,
  UpdateRoadmapItemInput,
  RoadmapLineage,
  RoadmapTimeframe,
  RoadmapStatus,
  RoadmapPriority,
  Decision,
  Opportunity,
} from '../types.js';
import { roadmapApi } from '../lib/roadmapApi.js';
import { apiFetch } from '../lib/api.js';
import {
  MapPin,
  Plus,
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  GitCommit,
  FlaskConical,
  Target,
  FileText,
  Search,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BarChart2,
  RefreshCw,
} from 'lucide-react';

interface RoadmapViewProps {
  workspaceId: string;
  onNavigateTab?: (tab: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ workspaceId, onNavigateTab }) => {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [activeTimeframe, setActiveTimeframe] = useState<RoadmapTimeframe | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [lineageModalItem, setLineageModalItem] = useState<RoadmapItem | null>(null);
  const [lineageData, setLineageData] = useState<RoadmapLineage | null>(null);
  const [loadingLineage, setLoadingLineage] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CreateRoadmapItemInput>({
    title: '',
    description: '',
    timeframe: 'now',
    status: 'planned',
    priority: 'medium',
    target_quarter: '2026-Q3',
    decision_id: undefined,
    opportunity_id: undefined,
    metrics_target: '',
    progress: 0,
    owner_name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, decRes, oppRes] = await Promise.all([
        roadmapApi.list(workspaceId),
        apiFetch('/api/decisions', {}, workspaceId).catch(() => ({ data: [] })),
        apiFetch('/api/opportunities', {}, workspaceId).catch(() => ({ data: [] })),
      ]);
      setItems(itemsRes || []);
      setDecisions(decRes.data || []);
      setOpportunities(oppRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar roadmap estratégico');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      timeframe: 'now',
      status: 'planned',
      priority: 'medium',
      target_quarter: '2026-Q3',
      decision_id: undefined,
      opportunity_id: undefined,
      metrics_target: '',
      progress: 0,
      owner_name: '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (item: RoadmapItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      timeframe: item.timeframe,
      status: item.status,
      priority: item.priority,
      target_quarter: item.target_quarter || '',
      decision_id: item.decision_id,
      opportunity_id: item.opportunity_id,
      metrics_target: item.metrics_target || '',
      progress: item.progress,
      owner_name: item.owner_name || '',
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleDecisionSelect = (decId: string) => {
    setFormData((prev) => {
      const dec = decisions.find((d) => d.id === decId);
      if (!dec) return { ...prev, decision_id: undefined };
      return {
        ...prev,
        decision_id: decId,
        title: prev.title || `Iniciativa: ${dec.title}`,
        description: prev.description || dec.description || dec.rationale || '',
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.title.trim().length < 3) {
      setFormError('O título deve ter no mínimo 3 caracteres.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingItem) {
        await roadmapApi.update(workspaceId, editingItem.id, formData);
      } else {
        await roadmapApi.create(workspaceId, formData);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar iniciativa no roadmap.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja remover a iniciativa "${title}" do roadmap?`)) {
      return;
    }
    try {
      await roadmapApi.delete(workspaceId, id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Falha ao remover item do roadmap.');
    }
  };

  const handleOpenLineage = async (item: RoadmapItem) => {
    setLineageModalItem(item);
    setLoadingLineage(true);
    try {
      const data = await roadmapApi.getLineage(workspaceId, item.id);
      setLineageData(data);
    } catch (err: any) {
      alert(err.message || 'Não foi possível carregar a linhagem completa.');
    } finally {
      setLoadingLineage(false);
    }
  };

  const handleUpdateProgress = async (item: RoadmapItem, newProgress: number) => {
    try {
      const clamped = Math.min(100, Math.max(0, newProgress));
      const autoStatus = clamped === 100 ? 'delivered' : clamped > 0 ? 'in_progress' : item.status;
      await roadmapApi.update(workspaceId, item.id, { progress: clamped, status: autoStatus });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, progress: clamped, status: autoStatus } : i))
      );
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar progresso');
    }
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (activeTimeframe !== 'all' && item.timeframe !== activeTimeframe) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchOwner = item.owner_name?.toLowerCase().includes(q);
      const matchDec = item.decision_title?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchOwner && !matchDec) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalItems = items.length;
  const nowItems = items.filter((i) => i.timeframe === 'now').length;
  const nextItems = items.filter((i) => i.timeframe === 'next').length;
  const laterItems = items.filter((i) => i.timeframe === 'later').length;
  const deliveredItems = items.filter((i) => i.status === 'delivered').length;
  const traceableItems = items.filter((i) => i.decision_id || i.opportunity_id).length;
  const traceabilityPercent = totalItems > 0 ? Math.round((traceableItems / totalItems) * 100) : 100;

  const getPriorityBadge = (p: RoadmapPriority) => {
    switch (p) {
      case 'critical':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-950/60 text-rose-300 border border-rose-800/50">Crítica</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-military-900/90 text-military-300 border border-military-700/60">Alta</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-military-950 text-military-300 border border-military-800">Média</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-zinc-800 text-zinc-300 border border-zinc-700">Baixa</span>;
    }
  };

  const getStatusBadge = (s: RoadmapStatus) => {
    switch (s) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/50"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Entregue</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-military-900/80 text-military-300 border border-military-700/50"><TrendingUp className="w-3 h-3 text-military-400" /> Em Progresso</span>;
      case 'blocked':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/50"><AlertCircle className="w-3 h-3 text-rose-400" /> Bloqueado</span>;
      case 'deferred':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"><Clock className="w-3 h-3" /> Adiado</span>;
      case 'planned':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-military-950 text-military-300 border border-military-800/60"><Layers className="w-3 h-3 text-military-400" /> Planejado</span>;
    }
  };

  const getTimeframeName = (t: RoadmapTimeframe) => {
    switch (t) {
      case 'now':
        return 'Agora (Now)';
      case 'next':
        return 'Próximo (Next)';
      case 'later':
        return 'Futuro (Later)';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin text-military-400 mb-3" />
        <p className="font-medium text-sm">Carregando Roadmap Estratégico & Entregas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-6 text-rose-300 max-w-2xl mx-auto my-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          <h3 className="font-semibold text-lg">Erro ao carregar Roadmap</h3>
        </div>
        <p className="text-sm text-rose-300 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-500 transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-military-900/80 text-military-300 border border-military-700/60 rounded">
              Etapa 8
            </span>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Compass className="w-6 h-6 text-military-400" />
              Roadmap Estratégico & Execução
            </h1>
          </div>
          <p className="text-sm text-zinc-400 max-w-3xl">
            Alinhe as decisões e oportunidades validadas do discovery à entrega de software. Toda iniciativa possui linhagem comprovada, prevenindo desperdício e funcionalidades não fundamentadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Atualizar dados"
            className="p-2.5 text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-military-600 text-zinc-100 rounded-lg text-sm font-semibold hover:bg-military-500 shadow transition"
          >
            <Plus className="w-4 h-4" />
            Nova Iniciativa
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-zinc-400 uppercase">Total Iniciativas</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{totalItems}</div>
          <div className="text-xs text-zinc-500 mt-1">{deliveredItems} concluídas</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-military-400 uppercase">Agora (Now)</div>
          <div className="text-2xl font-bold text-military-300 mt-1">{nowItems}</div>
          <div className="text-xs text-zinc-500 mt-1">Foco de entrega ativo</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-military-400 uppercase">Próximo (Next)</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{nextItems}</div>
          <div className="text-xs text-zinc-500 mt-1">Pronto para refinamento</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-zinc-400 uppercase">Futuro (Later)</div>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{laterItems}</div>
          <div className="text-xs text-zinc-500 mt-1">Visão de médio prazo</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase">Rastreabilidade</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{traceabilityPercent}%</div>
          <div className="text-xs text-zinc-500 mt-1">{traceableItems}/{totalItems} com vínculo</div>
        </div>
      </div>

      {/* Navigation Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900 p-3 border border-zinc-800 rounded-xl shadow-sm">
        {/* Timeframe Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg">
          <button
            onClick={() => setActiveTimeframe('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTimeframe === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todas ({items.length})
          </button>
          <button
            onClick={() => setActiveTimeframe('now')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTimeframe === 'now'
                ? 'bg-military-900/80 text-military-300 border border-military-700/50 shadow font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Agora ({nowItems})
          </button>
          <button
            onClick={() => setActiveTimeframe('next')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTimeframe === 'next'
                ? 'bg-military-900/80 text-military-300 border border-military-700/50 shadow font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Próximo ({nextItems})
          </button>
          <button
            onClick={() => setActiveTimeframe('later')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTimeframe === 'later'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Futuro ({laterItems})
          </button>
        </div>

        {/* Status Filter & Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar iniciativas ou tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-military-500 focus:bg-zinc-800 text-zinc-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:ring-2 focus:ring-military-500"
          >
            <option value="all">Todos Status</option>
            <option value="planned">Planejado</option>
            <option value="in_progress">Em Progresso</option>
            <option value="delivered">Entregue</option>
            <option value="blocked">Bloqueado</option>
            <option value="deferred">Adiado</option>
          </select>
        </div>
      </div>

      {/* Content / Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 bg-military-900/80 text-military-400 border border-military-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100 mb-1">Nenhuma iniciativa encontrada</h3>
          <p className="text-xs text-zinc-400 mb-6">
            {searchQuery || statusFilter !== 'all' || activeTimeframe !== 'all'
              ? 'Nenhum item corresponde aos filtros selecionados.'
              : 'Conecte as decisões aprovadas dos seus experimentos ou oportunidades priorizadas para criar sua primeira iniciativa de roadmap.'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 rounded-lg text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            Adicionar Iniciativa de Roadmap
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const hasDiscoveryLink = !!(item.decision_id || item.opportunity_id);

            return (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm hover:border-zinc-700 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Timeframe pill & Priority & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-zinc-800 text-zinc-300 rounded">
                      {getTimeframeName(item.timeframe)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Title & Target Quarter */}
                  <h3 className="text-base font-semibold text-zinc-100 mb-1 leading-snug">
                    {item.title}
                  </h3>
                  {item.target_quarter && (
                    <div className="text-xs text-military-400 font-medium mb-2 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Quarter Alvo: {item.target_quarter}
                    </div>
                  )}

                  {/* Description */}
                  {item.description && (
                    <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Metrics Target */}
                  {item.metrics_target && (
                    <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-2.5 mb-4 text-xs text-emerald-300 flex items-start gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-300">Meta / Impacto:</span>{' '}
                        {item.metrics_target}
                      </div>
                    </div>
                  )}

                  {/* Discovery Link Badge */}
                  <div className="mb-4">
                    {item.decision_id ? (
                      <div className="bg-military-900/80 border border-military-700/50 rounded-lg p-2 text-xs text-military-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-military-400 shrink-0" />
                          <span className="truncate">
                            <span className="font-semibold">Decisão:</span> {item.decision_title || 'Decisão Validada'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenLineage(item)}
                          title="Ver Linhagem de Discovery"
                          className="text-military-400 hover:text-military-200 p-1 shrink-0"
                        >
                          <GitCommit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : item.opportunity_id ? (
                      <div className="bg-military-900/80 border border-military-700/50 rounded-lg p-2 text-xs text-military-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <Sparkles className="w-3.5 h-3.5 text-military-400 shrink-0" />
                          <span className="truncate">
                            <span className="font-semibold">Oportunidade:</span> {item.opportunity_title || 'Oportunidade Priorizada'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenLineage(item)}
                          title="Ver Linhagem de Discovery"
                          className="text-military-400 hover:text-military-200 p-1 shrink-0"
                        >
                          <GitCommit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-military-950/40 border border-military-800/40 rounded-lg p-2 text-[11px] text-military-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-military-400 shrink-0" />
                        <span>Sem vínculo direto de discovery (Risco)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card: Progress & Actions */}
                <div className="border-t border-zinc-800 pt-3 mt-1 space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span>Progresso</span>
                      <span className="font-semibold text-zinc-200">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.progress === 100
                            ? 'bg-military-500'
                            : item.progress > 0
                            ? 'bg-military-600'
                            : 'bg-zinc-700'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Owner & Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-zinc-400 truncate max-w-[120px]">
                      {item.owner_name ? `Resp: ${item.owner_name}` : 'Sem responsável'}
                    </div>

                    <div className="flex items-center gap-1">
                      {onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab('prd')}
                          title="Escrever PRD"
                          className="px-2 py-1 text-xs text-military-400 hover:text-military-300 hover:bg-military-900/50 rounded flex items-center gap-1 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          PRD
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenLineage(item)}
                        title="Ver Linhagem Completa (Discovery Tree)"
                        className="px-2 py-1 text-xs text-military-400 hover:bg-military-900/50 rounded flex items-center gap-1 transition"
                      >
                        <GitCommit className="w-3.5 h-3.5" />
                        Linhagem
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        title="Editar Iniciativa"
                        className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        title="Excluir Iniciativa"
                        className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 rounded-2xl max-w-xl w-full p-6 shadow-xl border border-zinc-800 relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-military-400" />
                {editingItem ? 'Editar Iniciativa do Roadmap' : 'Nova Iniciativa do Roadmap'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pre-fill from Decisão Aprovada */}
              {!editingItem && decisions.length > 0 && (
                <div className="bg-military-950/60 border border-military-700/50 rounded-xl p-3.5">
                  <label className="block text-xs font-semibold text-military-300 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-military-400" />
                    Vincular a uma Decisão de Produto Aprovada (Recomendado):
                  </label>
                  <select
                    value={formData.decision_id || ''}
                    onChange={(e) => handleDecisionSelect(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-800 border border-military-700/60 rounded-lg text-zinc-100 focus:ring-2 focus:ring-military-500 focus:outline-none"
                  >
                    <option value="">-- Selecionar Decisão Aprovada --</option>
                    {decisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        [{d.status.toUpperCase()}] {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Título da Iniciativa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Validador de Configuração em Tempo Real no Onboarding"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-2 focus:ring-military-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição & Escopo da Entrega
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes sobre a entrega, escopo acordado e impacto esperado..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-700 bg-zinc-800 text-zinc-100 rounded-lg focus:ring-2 focus:ring-military-500 focus:outline-none"
                />
              </div>

              {/* Grid: Timeframe & Status & Priority */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Timeframe
                  </label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-zinc-700 bg-zinc-800 text-zinc-100 rounded-lg focus:ring-2 focus:ring-military-500 focus:outline-none"
                  >
                    <option value="now">Agora (Now)</option>
                    <option value="next">Próximo (Next)</option>
                    <option value="later">Futuro (Later)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-zinc-700 bg-zinc-800 text-zinc-100 rounded-lg focus:ring-2 focus:ring-military-500 focus:outline-none"
                  >
                    <option value="planned">Planejado</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="delivered">Entregue</option>
                    <option value="blocked">Bloqueado</option>
                    <option value="deferred">Adiado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-zinc-700 bg-zinc-800 text-zinc-100 rounded-lg focus:ring-2 focus:ring-military-500 focus:outline-none"
                  >
                    <option value="critical">Crítica</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Grid: Quarter & Owner */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Quarter Alvo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2026-Q3"
                    value={formData.target_quarter || ''}
                    onChange={(e) => setFormData({ ...formData, target_quarter: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-700 bg-zinc-800 text-zinc-100 rounded-lg focus:ring-2 focus:ring-military-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Responsável / Squad
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Squad Growth / Onboarding"
                    value={formData.owner_name || ''}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-700 bg-zinc-800 text-zinc-100 rounded-lg focus:ring-2 focus:ring-military-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Metrics Target */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Métricas de Sucesso / Meta de Impacto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reduzir churn em 15% e elevar taxa de conversão para 85%"
                  value={formData.metrics_target || ''}
                  onChange={(e) => setFormData({ ...formData, metrics_target: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-700 bg-zinc-800 text-zinc-100 rounded-lg focus:ring-2 focus:ring-military-500 focus:outline-none"
                />
              </div>

              {/* Progress Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1">
                  <span>Progresso de Entrega</span>
                  <span className="text-military-400 font-bold">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.progress || 0}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value, 10) })}
                  className="w-full accent-military-500 cursor-pointer"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-military-600 text-zinc-100 rounded-lg hover:bg-military-500 shadow transition disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Criar Iniciativa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discovery Lineage Modal (Opportunity-Solution-Roadmap Trail) */}
      {lineageModalItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-zinc-800 relative my-8 max-h-[90vh] overflow-y-auto text-zinc-100">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4 sticky top-0 bg-zinc-900 z-10">
              <div>
                <div className="text-xs font-bold text-military-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Rastreabilidade de Ponta a Ponta
                </div>
                <h2 className="text-base font-bold text-zinc-100 mt-0.5">
                  Linhagem da Iniciativa: {lineageModalItem.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setLineageModalItem(null);
                  setLineageData(null);
                }}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingLineage ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <RefreshCw className="w-6 h-6 animate-spin text-military-400 mb-2" />
                <p className="text-xs">Mapeando a árvore completa de discovery...</p>
              </div>
            ) : lineageData ? (
              <div className="space-y-4 text-xs">
                {/* Step 1: Pesquisa */}
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3.5 relative">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5 mb-1.5">
                    <Search className="w-4 h-4 text-military-400" />
                    1. Pesquisas de Usuário ({lineageData.researches.length})
                  </div>
                  {lineageData.researches.length > 0 ? (
                    lineageData.researches.map((r) => (
                      <div key={r.id} className="bg-zinc-900 p-2 rounded border border-zinc-700 mb-1.5">
                        <div className="font-medium text-zinc-100">{r.title}</div>
                        {r.objective && <div className="text-zinc-400 text-[11px]">Objetivo: {r.objective}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 italic text-[11px]">Nenhuma pesquisa direta associada.</div>
                  )}
                </div>

                <div className="flex justify-center text-zinc-500 -my-2">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>

                {/* Step 2: Evidências */}
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    2. Evidências Coletadas ({lineageData.evidences.length})
                  </div>
                  {lineageData.evidences.length > 0 ? (
                    lineageData.evidences.map((e) => (
                      <div key={e.id} className="bg-zinc-900 p-2 rounded border border-zinc-700 mb-1.5">
                        <div className="text-zinc-200">{e.content}</div>
                        <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                          <span>Impacto: {e.impact_score}/10</span>
                          <span>Tags: {e.tags?.join(', ') || 'N/A'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 italic text-[11px]">Nenhuma evidência vinculada.</div>
                  )}
                </div>

                <div className="flex justify-center text-zinc-500 -my-2">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>

                {/* Step 3: Problemas */}
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3.5">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4 text-military-400" />
                    3. Problemas de Produto Mapeados ({lineageData.problems.length})
                  </div>
                  {lineageData.problems.length > 0 ? (
                    lineageData.problems.map((p) => (
                      <div key={p.id} className="bg-zinc-900 p-2 rounded border border-zinc-700 mb-1.5">
                        <div className="font-medium text-zinc-100">{p.title}</div>
                        <div className="text-[11px] text-zinc-400">
                          Impacto: {p.impact} | Frequência: {p.frequency}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 italic text-[11px]">Nenhum problema direto vinculado.</div>
                  )}
                </div>

                <div className="flex justify-center text-zinc-500 -my-2">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>

                {/* Step 4: Oportunidade */}
                <div className="bg-military-950/80 border border-military-700/50 rounded-xl p-3.5">
                  <div className="font-semibold text-military-300 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-4 h-4 text-military-400" />
                    4. Oportunidade Priorizada
                  </div>
                  {lineageData.opportunity ? (
                    <div className="bg-zinc-900 p-2.5 rounded border border-military-700/40">
                      <div className="font-bold text-zinc-100">{lineageData.opportunity.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-1">
                        Esforço: {lineageData.opportunity.effort} | Valor: {lineageData.opportunity.value} | Status: {lineageData.opportunity.status}
                      </div>
                    </div>
                  ) : (
                    <div className="text-zinc-500 italic text-[11px]">Nenhuma oportunidade vinculada.</div>
                  )}
                </div>

                <div className="flex justify-center text-zinc-500 -my-2">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>

                {/* Step 5: Hipótese & Experimento */}
                <div className="bg-military-950/40 border border-military-800/40 rounded-xl p-3.5">
                  <div className="font-semibold text-military-300 flex items-center gap-1.5 mb-1.5">
                    <FlaskConical className="w-4 h-4 text-military-400" />
                    5. Hipótese & Experimento Validado
                  </div>
                  {lineageData.hypothesis ? (
                    <div className="bg-zinc-900 p-2.5 rounded border border-military-800/40 mb-2">
                      <div className="font-semibold text-zinc-100">Hipótese: {lineageData.hypothesis.statement}</div>
                      <div className="text-[11px] text-zinc-400">Confiança: {lineageData.hypothesis.confidence_score}/10</div>
                    </div>
                  ) : null}

                  {lineageData.experiment ? (
                    <div className="bg-zinc-900 p-2.5 rounded border border-military-800/40">
                      <div className="font-semibold text-zinc-100">Experimento: {lineageData.experiment.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Resultados: {lineageData.experiment.results || 'N/A'}
                      </div>
                    </div>
                  ) : null}

                  {!lineageData.hypothesis && !lineageData.experiment && (
                    <div className="text-zinc-500 italic text-[11px]">Nenhum experimento/hipótese registrado.</div>
                  )}
                </div>

                <div className="flex justify-center text-zinc-500 -my-2">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>

                {/* Step 6: Decisão */}
                <div className="bg-military-950/80 border border-military-700/50 rounded-xl p-3.5">
                  <div className="font-semibold text-military-300 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-military-400" />
                    6. Decisão Estratégica de Produto
                  </div>
                  {lineageData.decision ? (
                    <div className="bg-zinc-900 p-2.5 rounded border border-military-700/40">
                      <div className="font-bold text-zinc-100">{lineageData.decision.title}</div>
                      <div className="text-[11px] text-zinc-300 mt-1">
                        Racional: {lineageData.decision.rationale || lineageData.decision.description}
                      </div>
                      <div className="text-[10px] text-military-300 font-semibold mt-1">
                        Status da Decisão: {lineageData.decision.status.toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-zinc-500 italic text-[11px]">Iniciativa criada diretamente da oportunidade sem decisão formal.</div>
                  )}
                </div>

                <div className="flex justify-center text-zinc-500 -my-2">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>

                {/* Step 7: Iniciativa de Roadmap */}
                <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3.5">
                  <div className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    7. Iniciativa no Roadmap (Execução)
                  </div>
                  <div className="bg-zinc-900 p-3 rounded-lg border border-emerald-800/40">
                    <div className="font-bold text-zinc-100 text-sm">{lineageData.roadmap_item.title}</div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Timeframe: {getTimeframeName(lineageData.roadmap_item.timeframe)} | Progresso: {lineageData.roadmap_item.progress}%
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => {
                  setLineageModalItem(null);
                  setLineageData(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 rounded-lg transition"
              >
                Fechar Linhagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
