import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import {
  Activity,
  Target,
  Lightbulb,
  FlaskConical,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Compass,
  ArrowRight,
  AlertTriangle,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  workspaceId: string;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardProps> = ({
  workspaceId,
  onNavigateTab,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/dashboard/executive', {}, workspaceId);
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar dashboard executivo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadDashboard();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-400 text-sm space-y-3">
        <div className="w-8 h-8 border-2 border-military-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Consolidando inteligência e métricas do Product OS...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error || 'Não foi possível carregar os dados'}</span>
        </div>
        <button
          onClick={loadDashboard}
          className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-white rounded text-xs transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const {
    discovery_health,
    strategic_objectives,
    top_opportunities,
    active_experiments,
    recent_decisions,
    roadmap_summary,
    intelligence_alerts,
    recent_activity,
  } = data;

  const healthScore = discovery_health?.score || 85;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-military-950 to-zinc-950 border border-military-600/30 p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-military-900/80 text-military-300 border border-military-700/60 text-[10px] font-bold uppercase tracking-wider">
              Product OS — Painel Executivo
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Visão Geral do Workspace</h1>
          <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
            Acompanhe a saúde do Discovery, os objetivos OKR, as oportunidades priorizadas e o progresso do roadmap em um único fluxo contínuo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('intelligence')}
            className="px-3.5 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-sm"
          >
            <BrainCircuit className="w-4 h-4 text-military-200" /> Diagnóstico IA
          </button>
          <button
            onClick={loadDashboard}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-lg transition border border-zinc-800"
            title="Atualizar Métricas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Discovery Health Score & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Saúde do Discovery</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-zinc-100 flex items-baseline gap-2">
              {healthScore}
              <span className="text-xs text-zinc-400 font-normal">/ 100</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            {healthScore >= 75 ? 'Excelente alinhamento entre dores e experimentos.' : 'Atenção necessária no rastreamento de hipóteses.'}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Objetivos Estratégicos</span>
            <Target className="w-4 h-4 text-military-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {strategic_objectives?.length || 0}
            </div>
            <span className="text-xs text-military-300 font-medium">Ativos no Quarter</span>
          </div>
          <button
            onClick={() => onNavigateTab('strategy')}
            className="text-[11px] text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
          >
            Ver OKRs Estratégicos <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Experimentos em Curso</span>
            <FlaskConical className="w-4 h-4 text-military-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {active_experiments?.length || 0}
            </div>
            <span className="text-xs text-military-300 font-medium">Em Execução/Validação</span>
          </div>
          <button
            onClick={() => onNavigateTab('experiment')}
            className="text-[11px] text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
          >
            Ver Experimentos <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Itens em Roadmap</span>
            <Compass className="w-4 h-4 text-military-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {roadmap_summary?.total || 0}
            </div>
            <span className="text-xs text-military-300 font-medium">
              {roadmap_summary?.in_progress || 0} em progresso
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('roadmap')}
            className="text-[11px] text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
          >
            Ver Roadmap & PRDs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: OKRs & Prioritized Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Objectives / OKRs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-military-400" />
              <h3 className="text-sm font-bold text-zinc-100">Objetivos Estratégicos (OKRs)</h3>
            </div>
            <button
              onClick={() => onNavigateTab('strategy')}
              className="text-xs text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
            >
              Gerenciar <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {strategic_objectives?.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              Nenhum objetivo cadastrado.{' '}
              <button
                onClick={() => onNavigateTab('strategy')}
                className="text-military-400 underline"
              >
                Criar primeiro OKR
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {strategic_objectives?.slice(0, 3).map((obj: any) => (
                <div key={obj.id} className="bg-zinc-800/60 rounded-lg p-3.5 space-y-2 border border-zinc-700/50">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-100 leading-snug">{obj.title}</span>
                    <span className="px-2 py-0.5 text-[10px] bg-military-900/80 text-military-300 border border-military-700/50 rounded font-mono shrink-0">
                      {obj.timeframe}
                    </span>
                  </div>
                  {obj.description && <p className="text-[11px] text-zinc-300 line-clamp-1">{obj.description}</p>}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <span>{obj.key_results?.length || 0} Key Results vinculados</span>
                    <span className="font-semibold text-military-400">{obj.progress || 0}% Concluído</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Prioritized Opportunities */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-military-400" />
              <h3 className="text-sm font-bold text-zinc-100">Top Oportunidades Priorizadas</h3>
            </div>
            <button
              onClick={() => onNavigateTab('prioritization')}
              className="text-xs text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
            >
              Cálculo RICE/ICE <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {top_opportunities?.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              Nenhuma oportunidade priorizada.{' '}
              <button
                onClick={() => onNavigateTab('prioritization')}
                className="text-military-400 underline"
              >
                Priorizar agora
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {top_opportunities.slice(0, 4).map((op: any, index: number) => (
                <div key={op.id} className="bg-zinc-800/60 rounded-lg p-3 flex items-center justify-between gap-3 border border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-military-900/90 text-military-300 text-xs font-bold flex items-center justify-center border border-military-700/60">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100">{op.title}</h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{op.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-military-400">Score: {op.score || 0}</div>
                    <span className="text-[10px] text-zinc-400 uppercase">{op.status || 'discovery'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Row: Active Experiments & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Experiments */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-military-400" />
              <h3 className="text-sm font-bold text-zinc-100">Experimentos Ativos</h3>
            </div>
            <button
              onClick={() => onNavigateTab('experiment')}
              className="text-xs text-military-400 hover:text-military-300 font-medium"
            >
              Ver todos
            </button>
          </div>

          {active_experiments?.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">Nenhum experimento ativo no momento.</p>
          ) : (
            <div className="space-y-2.5">
              {active_experiments.slice(0, 3).map((exp: any) => (
                <div key={exp.id} className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/40 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-100">
                    <span>{exp.title}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-military-900/80 text-military-300 border border-military-700/50 rounded uppercase">
                      {exp.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">{exp.metric}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workspace Activity Timeline */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-military-400" />
              <h3 className="text-sm font-bold text-zinc-100">Linha do Tempo de Atividades do Time</h3>
            </div>
            <span className="text-[10px] text-zinc-400">Tempo Real</span>
          </div>

          {recent_activity?.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">Nenhuma atividade recente gravada.</p>
          ) : (
            <div className="space-y-3">
              {recent_activity.slice(0, 5).map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-military-400 mt-1.5 shrink-0"></div>
                  <div className="flex-1">
                    <span className="font-semibold text-zinc-100">{act.actor_name}</span>{' '}
                    <span className="text-zinc-300">executou a ação </span>
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-military-300 rounded font-mono text-[10px]">
                      {act.action}
                    </span>{' '}
                    <span className="text-zinc-400">em {act.entity_type}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {new Date(act.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
