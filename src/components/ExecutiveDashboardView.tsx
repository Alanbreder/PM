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
  Search,
  FileText,
  AlertCircle,
  GitCommit,
  Calculator,
  LayoutGrid,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  PlayCircle,
  Layers,
  HelpCircle,
  FolderKanban,
  Check,
  Zap,
} from 'lucide-react';
import { ToolKey } from '../types/tools';

interface ExecutiveDashboardProps {
  workspaceId: string;
  onNavigateTab: (tab: string, initialTool?: ToolKey) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardProps> = ({
  workspaceId,
  onNavigateTab,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGuidedFlow, setShowGuidedFlow] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/dashboard/executive', {}, workspaceId);
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar Product Home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadDashboard();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="p-16 text-center text-zinc-400 text-sm space-y-4">
        <div className="w-9 h-9 border-2 border-military-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-medium text-zinc-400">Sincronizando estado e inteligência da Product Home...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error || 'Não foi possível carregar os dados do workspace.'}</span>
        </div>
        <button
          onClick={loadDashboard}
          className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-white rounded text-xs transition font-semibold"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const {
    discovery_health,
    strategic_objectives = [],
    top_opportunities = [],
    active_experiments = [],
    recent_decisions = [],
    roadmap_summary,
    intelligence_alerts = [],
    recent_activity = [],
  } = data;

  const totals = discovery_health?.totals || {
    researches: 0,
    evidences: 0,
    problems: 0,
    opportunities: 0,
    hypotheses: 0,
    experiments: 0,
    decisions: 0,
  };

  const isWorkspaceEmpty =
    totals.researches === 0 &&
    totals.problems === 0 &&
    totals.hypotheses === 0 &&
    totals.experiments === 0 &&
    totals.decisions === 0 &&
    strategic_objectives.length === 0 &&
    (roadmap_summary?.total || 0) === 0;

  const healthScore = discovery_health?.health_score || 100;
  const riskIndicators = discovery_health?.risk_indicators || {};

  // Compute Real Actionable Next Steps from workspace state
  const nextActions: {
    id: string;
    title: string;
    description: string;
    badge: string;
    tab: string;
    priority: 'high' | 'medium' | 'info';
  }[] = [];

  if (riskIndicators.orphaned_problems_count > 0) {
    nextActions.push({
      id: 'action-evidences',
      title: `${riskIndicators.orphaned_problems_count} problema(s) sem evidência vinculada`,
      description: 'Adicione fatos ou pesquisas para fundamentar os gargalos identificados.',
      badge: 'Discovery',
      tab: 'problem',
      priority: 'high',
    });
  }

  if (riskIndicators.unvalidated_hypotheses_count > 0) {
    nextActions.push({
      id: 'action-experiments',
      title: `${riskIndicators.unvalidated_hypotheses_count} hipótese(s) aguardando validação`,
      description: 'Desenhe testes ou experimentos rápidos para comprovar ou refutar as premissas.',
      badge: 'Validação',
      tab: 'experiment',
      priority: 'high',
    });
  }

  if (riskIndicators.decisions_without_evidence_count > 0) {
    nextActions.push({
      id: 'action-decisions',
      title: `${riskIndicators.decisions_without_evidence_count} decisão(ões) tomada(s) com base empírica fraca`,
      description: 'Revise os resultados experimentais antes de aprovar lançamentos em escala.',
      badge: 'Decisão',
      tab: 'decision',
      priority: 'medium',
    });
  }

  if (totals.opportunities > 0 && top_opportunities.length === 0) {
    nextActions.push({
      id: 'action-prioritize',
      title: 'Priorizar oportunidades de produto',
      description: 'Utilize a matriz RICE ou Impacto vs Esforço para elencar as maiores apostas.',
      badge: 'Priorização',
      tab: 'prioritization',
      priority: 'medium',
    });
  }

  if ((roadmap_summary?.in_progress || 0) > 0) {
    nextActions.push({
      id: 'action-roadmap',
      title: `${roadmap_summary.in_progress} iniciativa(s) em desenvolvimento no Roadmap`,
      description: 'Acompanhe marcos de entrega e prepare a especificação funcional em PRDs.',
      badge: 'Execução',
      tab: 'roadmap',
      priority: 'info',
    });
  }

  // Fallback default action if everything is healthy
  if (nextActions.length === 0) {
    nextActions.push({
      id: 'action-diagnostics',
      title: 'Ciclo de Discovery Alinhado e Saudável',
      description: 'Execute o Diagnóstico IA para identificar oportunidades de inovação e novos padrões.',
      badge: 'Inteligência',
      tab: 'intelligence',
      priority: 'info',
    });
  }

  // Guided Flow Stages Definition
  const flowStages = [
    {
      id: 'stage_discover',
      tab: 'research',
      title: 'Descobrir',
      subtitle: 'Pesquisas & Personas',
      count: (totals.researches || 0) + (totals.evidences || 0),
      label: `${totals.researches || 0} pesq. / ${totals.evidences || 0} evid.`,
      status: totals.researches > 0 ? 'active' : 'pending',
    },
    {
      id: 'stage_understand',
      tab: 'problem',
      title: 'Entender',
      subtitle: 'Problemas & Dores',
      count: totals.problems || 0,
      label: `${totals.problems || 0} dores mapeadas`,
      status: totals.problems > 0 ? 'active' : 'pending',
    },
    {
      id: 'stage_prioritize',
      tab: 'opportunity',
      title: 'Priorizar',
      subtitle: 'Oportunidades & RICE',
      count: totals.opportunities || 0,
      label: `${totals.opportunities || 0} oportunidades`,
      status: totals.opportunities > 0 ? 'active' : 'pending',
    },
    {
      id: 'stage_validate',
      tab: 'hypothesis',
      title: 'Validar',
      subtitle: 'Hipóteses & Testes',
      count: (totals.hypotheses || 0) + (totals.experiments || 0),
      label: `${totals.hypotheses || 0} hip. / ${totals.experiments || 0} exp.`,
      status: totals.experiments > 0 ? 'active' : 'pending',
    },
    {
      id: 'stage_decide',
      tab: 'decision',
      title: 'Decidir',
      subtitle: 'Decisões & ADRs',
      count: totals.decisions || 0,
      label: `${totals.decisions || 0} decisões`,
      status: totals.decisions > 0 ? 'active' : 'pending',
    },
    {
      id: 'stage_plan',
      tab: 'roadmap',
      title: 'Planejar',
      subtitle: 'Roadmap & PRDs',
      count: roadmap_summary?.total || 0,
      label: `${roadmap_summary?.total || 0} iniciativas`,
      status: (roadmap_summary?.total || 0) > 0 ? 'active' : 'pending',
    },
    {
      id: 'stage_measure',
      tab: 'outcomes',
      title: 'Medir',
      subtitle: 'Outcomes & Impacto',
      count: roadmap_summary?.delivered || 0,
      label: `${roadmap_summary?.delivered || 0} entregues`,
      status: (roadmap_summary?.delivered || 0) > 0 ? 'active' : 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. First Access / Zero State Experience ("Vamos começar.") */}
      {isWorkspaceEmpty ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-military-900/80 text-military-300 border border-military-700/60 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-military-400" />
              Primeiro Acesso ao Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Vamos começar.
            </h1>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              O Product OS adapta-se à sua forma de trabalhar. Escolha o ponto de partida ideal para o momento do seu produto:
            </p>
          </div>

          {/* Intention-Driven Entry Cards for First Access */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <button
              onClick={() => onNavigateTab('toolkit', 'lean_canvas')}
              className="p-5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-military-600 transition text-left group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-military-200 transition">
                  Tenho uma ideia
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Estruture um modelo inicial de negócio com o <strong>Lean Canvas</strong> ou <strong>Product Canvas</strong>.
                </p>
              </div>
              <div className="text-xs text-military-400 font-semibold flex items-center gap-1">
                Iniciar Canvas <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('problem')}
              className="p-5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-military-600 transition text-left group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-military-200 transition">
                  Tenho um problema de usuário
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cadastre gargalos reais, severidade e frequência relatada por clientes.
                </p>
              </div>
              <div className="text-xs text-military-400 font-semibold flex items-center gap-1">
                Mapear Problema <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('research')}
              className="p-5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-military-600 transition text-left group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-military-200 transition">
                  Tenho pesquisas & evidências
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Insira anotações de entrevistas, transcrições e extraia fatos para o repositório.
                </p>
              </div>
              <div className="text-xs text-military-400 font-semibold flex items-center gap-1">
                Registrar Pesquisa <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('strategy')}
              className="p-5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-military-600 transition text-left group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-military-200 transition">
                  Tenho uma estratégia
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Defina a Visão de Produto e os OKRs trimestrais do time para o ciclo atual.
                </p>
              </div>
              <div className="text-xs text-military-400 font-semibold flex items-center gap-1">
                Definir OKRs <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('roadmap')}
              className="p-5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-military-600 transition text-left group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-military-200 transition">
                  Quero criar meu roadmap
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Organize iniciativas em colunas Now / Next / Later com metas e responsáveis.
                </p>
              </div>
              <div className="text-xs text-military-400 font-semibold flex items-center gap-1">
                Abrir Roadmap <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('toolkit')}
              className="p-5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-military-600 transition text-left group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-military-500/10 text-military-400 flex items-center justify-center border border-military-500/20">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-military-200 transition">
                  Quero usar uma ferramenta avulsa
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Acesse 18 ferramentas de produto (JTBD, RICE, OST, PRD, Personas) de forma 100% independente.
                </p>
              </div>
              <div className="text-xs text-military-400 font-semibold flex items-center gap-1">
                Explorar Toolkit <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      ) : null}

      {/* 2. Top Header Banner & Fast Actions */}
      <div className="bg-gradient-to-r from-zinc-950 via-military-950/80 to-zinc-950 border border-military-600/30 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-military-900/90 text-military-300 border border-military-700/60 text-[10px] font-bold uppercase tracking-wider">
              Product Home
            </span>
            <span className="text-[11px] text-zinc-400">
              Ambiente de Trabalho Central do Product Manager
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            O que está acontecendo no Produto
          </h1>
          <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
            Painel executivo com visão integrada de discovery, hipóteses em teste, decisões estratégicas e próximas ações sugeridas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowGuidedFlow((prev) => !prev)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition border flex items-center gap-1.5 ${
              showGuidedFlow
                ? 'bg-zinc-850 text-military-200 border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showGuidedFlow ? 'Ocultar Fluxo' : 'Exibir Fluxo'}</span>
          </button>

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

      {/* 3. Optional Guided Flow / Continuous Discovery Pipeline */}
      {showGuidedFlow && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-military-400" />
              <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Fluxo de Produto (Continuous Discovery)
              </h2>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                — Navegação flexível sem etapas bloqueantes
              </span>
            </div>
            <span className="text-[11px] text-military-400 font-medium">Clique em qualquer etapa para atuar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {flowStages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => onNavigateTab(stage.tab)}
                className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-military-600 transition text-left group flex flex-col justify-between space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    0{idx + 1}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${stage.count > 0 ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-100 group-hover:text-military-200 transition">
                    {stage.title}
                  </div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">{stage.subtitle}</div>
                </div>
                <div className="text-[10px] text-military-300 font-medium pt-1 border-t border-zinc-750/60 truncate">
                  {stage.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. "O que você quer fazer?" — Intention-Driven Action Hub */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              O que você quer fazer agora?
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400">Acesso direto por intenção de trabalho</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <button
            onClick={() => onNavigateTab('research')}
            className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-sky-500/60 transition text-center group flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-sky-300">Descobrir</span>
          </button>

          <button
            onClick={() => onNavigateTab('problem')}
            className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-rose-500/60 transition text-center group flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-rose-300">Estruturar Dor</span>
          </button>

          <button
            onClick={() => onNavigateTab('prioritization')}
            className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-amber-500/60 transition text-center group flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-amber-300">Priorizar RICE</span>
          </button>

          <button
            onClick={() => onNavigateTab('hypothesis')}
            className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-purple-500/60 transition text-center group flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-transform">
              <GitCommit className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-purple-300">Validar Hipótese</span>
          </button>

          <button
            onClick={() => onNavigateTab('decision')}
            className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-emerald-500/60 transition text-center group flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-emerald-300">Tomar Decisão</span>
          </button>

          <button
            onClick={() => onNavigateTab('roadmap')}
            className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-indigo-500/60 transition text-center group flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-indigo-300">Planejar</span>
          </button>

          <button
            onClick={() => onNavigateTab('outcomes')}
            className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-teal-500/60 transition text-center group flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-teal-300">Medir Impacto</span>
          </button>

          <button
            onClick={() => onNavigateTab('toolkit')}
            className="p-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 hover:border-military-500/60 transition text-center group flex flex-col items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-military-500/10 text-military-400 flex items-center justify-center border border-military-500/20 group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-military-300">Usar Ferramenta</span>
          </button>
        </div>
      </div>

      {/* 5. Split Row: "Próximas Ações" & "Continue de onde parou" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Ações Recomendadas (Calculadas a partir dos dados) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-military-400" />
              <h3 className="text-sm font-bold text-zinc-100">Próximas Ações Recomendadas</h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Baseado nos dados do workspace</span>
          </div>

          <div className="space-y-2.5">
            {nextActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigateTab(action.tab)}
                className="w-full p-3.5 rounded-xl bg-zinc-850/80 hover:bg-zinc-800 border border-zinc-750/70 hover:border-military-600 transition text-left flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-military-900 text-military-300 border border-military-700/60 rounded uppercase">
                      {action.badge}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-100 group-hover:text-military-200 transition">
                      {action.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">{action.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-military-300 group-hover:translate-x-1 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Continue de onde você parou */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-military-400" />
              <h3 className="text-sm font-bold text-zinc-100">Continue de onde você parou</h3>
            </div>
            <span className="text-[10px] text-zinc-400">Atividades recentes</span>
          </div>

          {recent_activity.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              Nenhuma atividade recente registrada neste workspace.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recent_activity.slice(0, 4).map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-zinc-850/50 border border-zinc-750/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-military-400 shrink-0"></div>
                    <div>
                      <div className="font-semibold text-zinc-200">
                        {act.actor_name}{' '}
                        <span className="font-normal text-zinc-400">
                          {act.action === 'created' ? 'criou' : act.action === 'updated' ? 'atualizou' : 'registrou'}
                        </span>{' '}
                        <span className="text-military-300 font-medium">{act.entity_type}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(act.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab(act.entity_type === 'canvas' ? 'toolkit' : act.entity_type)}
                    className="text-[11px] text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
                  >
                    Acessar <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Discovery Health & Cockpit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-3">
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
            {healthScore >= 75 ? 'Excelente alinhamento entre dores e validações.' : 'Atenção necessária em hipóteses ou evidências.'}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Objetivos Estratégicos</span>
            <Target className="w-4 h-4 text-military-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {strategic_objectives.length}
            </div>
            <span className="text-xs text-military-300 font-medium">OKRs ativos no ciclo</span>
          </div>
          <button
            onClick={() => onNavigateTab('strategy')}
            className="text-[11px] text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
          >
            Ver Estratégia <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Experimentos em Curso</span>
            <FlaskConical className="w-4 h-4 text-military-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {active_experiments.length}
            </div>
            <span className="text-xs text-military-300 font-medium">Testes em execução</span>
          </div>
          <button
            onClick={() => onNavigateTab('experiment')}
            className="text-[11px] text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
          >
            Ver Experimentos <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Iniciativas no Roadmap</span>
            <Compass className="w-4 h-4 text-military-400" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {roadmap_summary?.total || 0}
            </div>
            <span className="text-xs text-military-300 font-medium">
              {roadmap_summary?.in_progress || 0} em andamento
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('roadmap')}
            className="text-[11px] text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
          >
            Abrir Roadmap <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 7. OKRs & Top Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Objectives / OKRs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
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

          {strategic_objectives.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              Nenhum objetivo cadastrado.{' '}
              <button
                onClick={() => onNavigateTab('strategy')}
                className="text-military-400 underline font-semibold"
              >
                Criar primeiro OKR
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {strategic_objectives.slice(0, 3).map((obj: any) => (
                <div key={obj.id} className="bg-zinc-850/70 rounded-xl p-3.5 space-y-2 border border-zinc-750/60">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-military-400" />
              <h3 className="text-sm font-bold text-zinc-100">Top Oportunidades Priorizadas</h3>
            </div>
            <button
              onClick={() => onNavigateTab('prioritization')}
              className="text-xs text-military-400 hover:text-military-300 font-medium flex items-center gap-1"
            >
              Cálculo RICE <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {top_opportunities.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              Nenhuma oportunidade priorizada.{' '}
              <button
                onClick={() => onNavigateTab('prioritization')}
                className="text-military-400 underline font-semibold"
              >
                Priorizar agora
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {top_opportunities.slice(0, 4).map((op: any, index: number) => (
                <div key={op.id} className="bg-zinc-850/70 rounded-xl p-3 flex items-center justify-between gap-3 border border-zinc-750/60">
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
    </div>
  );
};
