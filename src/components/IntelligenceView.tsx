import React, { useState, useEffect } from 'react';
import {
  DiscoveryHealthMetrics,
  ProductInsight,
  InsightStatus,
  InsightSeverity,
  InsightType,
} from '../types';
import {
  getDiscoveryHealth,
  getInsights,
  generateInsights,
  updateInsightStatus,
} from '../lib/intelligenceApi';
import {
  BrainCircuit,
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  Info,
  ShieldAlert,
  Flame,
  FileCheck2,
  ExternalLink,
  MessageSquareText,
} from 'lucide-react';

interface IntelligenceViewProps {
  workspaceId: string;
  onNavigateTab?: (tabId: string) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ workspaceId, onNavigateTab }) => {
  const [health, setHealth] = useState<DiscoveryHealthMetrics | null>(null);
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<InsightStatus>('suggested');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [feedbackNoteInput, setFeedbackNoteInput] = useState<{ [id: string]: string }>({});
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, insightsRes] = await Promise.all([
        getDiscoveryHealth(workspaceId),
        getInsights(workspaceId),
      ]);
      setHealth(healthRes);
      setInsights(insightsRes);
    } catch (err: any) {
      console.error('Failed to load product intelligence:', err);
      setError(err.message || 'Erro ao carregar inteligência do produto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const newInsights = await generateInsights(workspaceId);
      setInsights(newInsights);
      // Refresh health metrics as well
      const updatedHealth = await getDiscoveryHealth(workspaceId);
      setHealth(updatedHealth);
      setActiveStatusFilter('suggested');
    } catch (err: any) {
      console.error('Error generating AI insights:', err);
      setError(err.message || 'Falha ao analisar o workspace com Gemini');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (insightId: string, status: InsightStatus) => {
    setActioningId(insightId);
    try {
      const notes = feedbackNoteInput[insightId];
      const updated = await updateInsightStatus(workspaceId, insightId, status, notes);
      setInsights((prev) => prev.map((item) => (item.id === insightId ? updated : item)));
    } catch (err: any) {
      console.error('Error updating insight status:', err);
      setError(err.message || 'Erro ao atualizar status do insight');
    } finally {
      setActioningId(null);
    }
  };

  const getSeverityBadge = (severity: InsightSeverity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Flame className="w-3 h-3 text-rose-400" />
            Crítico
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-military-500/15 text-military-300 border border-military-500/30">
            <AlertTriangle className="w-3 h-3 text-military-400" />
            Alerta
          </span>
        );
      case 'opportunity':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Oportunidade
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-military-900/80 text-military-300 border border-military-700/50">
            <Info className="w-3 h-3 text-military-400" />
            Informativo
          </span>
        );
    }
  };

  const getTypeLabel = (type: InsightType) => {
    switch (type) {
      case 'recurring_pattern':
        return 'Padrão Recorrente';
      case 'unvalidated_hypothesis':
        return 'Hipótese sem Validação';
      case 'inconclusive_experiment':
        return 'Experimento Inconclusivo';
      case 'weak_evidence_decision':
        return 'Decisão com Pouca Evidência';
      case 'contradiction':
        return 'Contradição Lógica';
      case 'gap':
        return 'Lacuna de Dados';
      default:
        return type;
    }
  };

  const getEntityTab = (type: string) => {
    switch (type) {
      case 'research':
        return 'research';
      case 'evidence':
        return 'evidence';
      case 'problem':
        return 'problem';
      case 'opportunity':
        return 'opportunity';
      case 'hypothesis':
        return 'hypothesis';
      case 'experiment':
        return 'experiment';
      case 'decision':
        return 'decision';
      default:
        return 'research';
    }
  };

  const filteredInsights = insights.filter((i) => {
    if (i.status !== activeStatusFilter) return false;
    if (selectedSeverity !== 'all' && i.severity !== selectedSeverity) return false;
    return true;
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-military-300 border-military-500/40 bg-military-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-military-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-zinc-400 text-sm">Carregando Inteligência e Saúde do Discovery...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-military-900/80 text-military-300 border border-military-700/50">
              Etapa 7: Product OS
            </span>
            <span className="text-xs text-zinc-400">• Contextual AI Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-military-400" />
            Inteligência do Produto
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Diagnóstico consolidado de saúde do discovery, identificação de contradições, gargalos e insights estruturados para o Product Manager.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-military-600 hover:bg-military-500 disabled:opacity-50 text-zinc-100 font-semibold text-xs transition shadow-md shadow-military-900/40 cursor-pointer whitespace-nowrap"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              Analisando com Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-military-300" />
              Analisar Workspace com IA
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white text-xs underline">
            Fechar
          </button>
        </div>
      )}

      {/* Discovery Health Section */}
      {health && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Discovery Health Dashboard
            </h2>
            <span className="text-[11px] text-zinc-400">
              Última avaliação: {new Date(health.last_evaluated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Health Score Card */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between ${getHealthColor(health.health_score)}`}>
              <div>
                <span className="text-xs font-medium opacity-80 uppercase tracking-wider block">Health Score do Processo</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold tracking-tight">{health.health_score}</span>
                  <span className="text-xs font-semibold">/ 100</span>
                </div>
              </div>
              <div className="mt-4 text-[11px] opacity-90 leading-relaxed border-t border-current/20 pt-3">
                {health.health_score >= 80 && 'Excelente rastreabilidade e alinhamento entre hipóteses, testes e decisões.'}
                {health.health_score >= 60 && health.health_score < 80 && 'Gargalos identificados em validação de hipóteses ou evidências de decisões.'}
                {health.health_score < 60 && 'Atenção: alto volume de decisões sem evidências ou experimentos inconclusivos.'}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Volume de Entidades no Funil</span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center pt-1">
                <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/50">
                  <span className="block text-xs font-bold text-zinc-200">{health.totals.researches}</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Pesquisas</span>
                </div>
                <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/50">
                  <span className="block text-xs font-bold text-zinc-200">{health.totals.evidences}</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Evidências</span>
                </div>
                <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/50">
                  <span className="block text-xs font-bold text-zinc-200">{health.totals.problems}</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Problemas</span>
                </div>
                <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/50">
                  <span className="block text-xs font-bold text-zinc-200">{health.totals.opportunities}</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Oportun.</span>
                </div>
                <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/50">
                  <span className="block text-xs font-bold text-zinc-200">{health.totals.hypotheses}</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Hipóteses</span>
                </div>
                <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/50">
                  <span className="block text-xs font-bold text-zinc-200">{health.totals.experiments}</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Experim.</span>
                </div>
                <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/50">
                  <span className="block text-xs font-bold text-military-300">{health.totals.decisions}</span>
                  <span className="text-[9px] text-military-400 block mt-0.5">Decisões</span>
                </div>
              </div>

              {/* Conversion Ratios */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-zinc-800">
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="text-[11px] text-zinc-400">Taxa Problemas Validados:</span>
                  <span className="font-mono font-bold text-military-400">{(health.funnel_conversion.problems_validated_ratio * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="text-[11px] text-zinc-400">Taxa Experimentos -&gt; Decisão:</span>
                  <span className="font-mono font-bold text-military-400">{(health.funnel_conversion.experiments_decided_ratio * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Risk Indicators Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Indicadores de Risco
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300 pt-1">
                <li className="flex items-center justify-between">
                  <span className="text-zinc-400">Decisões s/ evidências:</span>
                  <span className={`font-mono font-semibold ${health.risk_indicators.decisions_without_evidence_count > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                    {health.risk_indicators.decisions_without_evidence_count}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-400">Hipóteses estagnadas:</span>
                  <span className={`font-mono font-semibold ${health.risk_indicators.unvalidated_hypotheses_count > 0 ? 'text-military-400' : 'text-zinc-300'}`}>
                    {health.risk_indicators.unvalidated_hypotheses_count}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-400">Experim. inconclusivos:</span>
                  <span className={`font-mono font-semibold ${health.risk_indicators.inconclusive_experiments_count > 0 ? 'text-military-400' : 'text-zinc-300'}`}>
                    {health.risk_indicators.inconclusive_experiments_count}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-400">Problemas orfãos:</span>
                  <span className="font-mono font-semibold text-zinc-300">
                    {health.risk_indicators.orphaned_problems_count}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Product Insights Section - Human-in-the-Loop */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-military-400" />
              Insights de Inteligência (Human-in-the-Loop)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Todas as sugestões produzidas pela IA permanecem como proposições até o aceite do Product Manager.
            </p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveStatusFilter('suggested')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeStatusFilter === 'suggested'
                  ? 'bg-military-600 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sugestões ({insights.filter((i) => i.status === 'suggested').length})
            </button>
            <button
              onClick={() => setActiveStatusFilter('accepted')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeStatusFilter === 'accepted'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Aceitos ({insights.filter((i) => i.status === 'accepted').length})
            </button>
            <button
              onClick={() => setActiveStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                activeStatusFilter === 'rejected'
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Rejeitados/Descartados ({insights.filter((i) => i.status === 'rejected' || i.status === 'dismissed').length})
            </button>
          </div>
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Filtrar por severidade:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 px-2.5 py-1 rounded outline-none cursor-pointer"
          >
            <option value="all">Todas Severidades</option>
            <option value="critical">Crítico</option>
            <option value="warning">Alerta</option>
            <option value="opportunity">Oportunidade</option>
            <option value="info">Informativo</option>
          </select>
        </div>

        {/* List of Insights */}
        {filteredInsights.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
            <BrainCircuit className="w-8 h-8 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-300">Nenhum insight neste filtro</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Clique no botão &quot;Analisar Workspace com IA&quot; acima para extrair padrões, gargalos e diagnósticos em tempo real com Gemini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5 transition hover:border-zinc-700/80 shadow-sm"
              >
                {/* Insight Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(insight.severity)}
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {getTypeLabel(insight.type)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        ID: {insight.id.slice(-8)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 tracking-tight">{insight.title}</h3>
                  </div>

                  <span className="text-[11px] text-zinc-500 shrink-0">
                    {new Date(insight.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80">
                  {insight.summary}
                </p>

                {/* Facts vs Interpretation vs Uncertainties */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Facts */}
                  <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800 space-y-2">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      Fatos &amp; Evidências
                    </span>
                    <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                      {insight.facts.map((fact, idx) => (
                        <li key={idx} className="leading-normal">{fact}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Interpretation */}
                  <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800 space-y-2">
                    <span className="font-semibold text-military-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      Leitura / Hipótese da IA
                    </span>
                    <p className="text-zinc-300 leading-relaxed">{insight.interpretation}</p>
                  </div>

                  {/* Uncertainties */}
                  <div className="bg-zinc-950/40 p-4 rounded-lg border border-zinc-800 space-y-2">
                    <span className="font-semibold text-military-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Incertezas &amp; Premissas
                    </span>
                    <ul className="space-y-1 text-zinc-300 list-disc list-inside">
                      {insight.uncertainties.map((unc, idx) => (
                        <li key={idx} className="leading-normal">{unc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Traceability / Sources */}
                <div className="space-y-2 border-t border-zinc-800/80 pt-4">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-military-400" />
                    Rastreabilidade Origem ({insight.sources.length} entidades encadeadas)
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {insight.sources.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => onNavigateTab && onNavigateTab(getEntityTab(src.entity_type))}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs transition cursor-pointer"
                        title={`Ir para ${src.entity_type}`}
                      >
                        <span className="text-[10px] font-bold uppercase text-military-400">{src.entity_type}</span>
                        <span className="truncate max-w-[200px]">{src.title}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Human-in-the-loop Action Bar */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                      <MessageSquareText className="w-3.5 h-3.5 text-military-400" />
                      Validação Humana (Product Manager):
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      {insight.status === 'suggested' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(insight.id, 'accepted')}
                            disabled={actioningId === insight.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aceitar Sugestão
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(insight.id, 'rejected')}
                            disabled={actioningId === insight.id}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-medium text-xs border border-zinc-700 transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rejeitar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(insight.id, 'dismissed')}
                            disabled={actioningId === insight.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-medium text-xs transition cursor-pointer"
                          >
                            Descartar
                          </button>
                        </>
                      )}

                      {insight.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sugestão Aceita pelo PM
                        </span>
                      )}

                      {(insight.status === 'rejected' || insight.status === 'dismissed') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          Descartado / Rejeitado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Optional feedback note */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    <input
                      type="text"
                      placeholder="Adicionar nota de contexto ou decisão do PM (opcional)..."
                      value={feedbackNoteInput[insight.id] || insight.feedback_notes || ''}
                      onChange={(e) =>
                        setFeedbackNoteInput({ ...feedbackNoteInput, [insight.id]: e.target.value })
                      }
                      onBlur={() => {
                        if (feedbackNoteInput[insight.id] !== undefined && insight.status !== 'suggested') {
                          handleUpdateStatus(insight.id, insight.status);
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs px-3 py-1.5 rounded outline-none focus:border-military-500 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
