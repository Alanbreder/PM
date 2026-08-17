import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { 
  TrendingUp, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Lightbulb,
  GitCommit,
  FileText,
  Target,
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

interface OutcomeReviewViewProps {
  workspaceId: string;
  onNavigateTab?: (tab: string) => void;
  onOpenToolkit?: (toolKey: any) => void;
}

export const OutcomeReviewView: React.FC<OutcomeReviewViewProps> = ({ 
  workspaceId, 
  onNavigateTab,
  onOpenToolkit 
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  // Quick action states
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Review Form
  const [title, setTitle] = useState('');
  const [metricName, setMetricName] = useState('');
  const [baselineVal, setBaselineVal] = useState('30%');
  const [targetVal, setTargetVal] = useState('70%');
  const [actualVal, setActualVal] = useState('45%');
  const [status, setStatus] = useState<'exceeded' | 'on_target' | 'below_target' | 'failed'>('below_target');

  const [expected, setExpected] = useState('');
  const [happened, setHappened] = useState('');
  const [learned, setLearned] = useState('');
  const [nextActions, setNextActions] = useState('');
  const [roadmapItemId, setRoadmapItemId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [outRes, roadRes] = await Promise.all([
        apiFetch('/api/outcomes', {}, workspaceId),
        apiFetch('/api/roadmap', {}, workspaceId).catch(() => ({ data: [] })),
      ]);
      setReviews(outRes.data || []);
      setRoadmapItems(roadRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar revisões de resultado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !metricName.trim()) return;

    setSubmitting(true);
    try {
      await apiFetch(
        '/api/outcomes',
        {
          method: 'POST',
          body: JSON.stringify({
            roadmap_item_id: roadmapItemId || undefined,
            title: title.trim(),
            metric_name: metricName.trim(),
            baseline_value: baselineVal.trim(),
            target_value: targetVal.trim(),
            actual_value: actualVal.trim(),
            status,
            what_we_expected: expected.trim(),
            what_happened: happened.trim(),
            what_we_learned: learned.trim(),
            next_actions: nextActions.trim(),
            refeed_to_discovery: false, // Manual human-in-the-loop actions preferred
          }),
        },
        workspaceId
      );
      setShowModal(false);
      setTitle('');
      setMetricName('');
      setExpected('');
      setHappened('');
      setLearned('');
      setNextActions('');
      setRoadmapItemId('');
      setSuccessMessage('Revisão de impacto registrada com sucesso!');
      setTimeout(() => setSuccessMessage(null), 4000);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar revisão de resultado');
    } finally {
      setSubmitting(false);
    }
  };

  // Explicit Human-in-the-loop action: Create Problem from Outcome Learning
  const handleDeriveProblem = async (rev: any) => {
    setActionInProgress(`problem-${rev.id}`);
    try {
      await apiFetch(
        '/api/problems',
        {
          method: 'POST',
          body: JSON.stringify({
            title: `[Aprendizado Pós-Lançamento] ${rev.title}`,
            description: `Problema identificado após medição de resultado (${rev.metric_name}: esperado ${rev.target_value}, atingido ${rev.actual_value}). O que aconteceu: ${rev.what_happened || 'Não documentado'}. Aprendizado: ${rev.what_we_learned || 'Não documentado'}`,
            severity: rev.status === 'failed' ? 'critical' : 'medium',
            impact_areas: ['growth', 'product_quality'],
          }),
        },
        workspaceId
      );
      setSuccessMessage(`Novo problema criado com base no aprendizado de "${rev.title}"!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Falha ao derivar problema do resultado');
    } finally {
      setActionInProgress(null);
    }
  };

  // Explicit Human-in-the-loop action: Create Evidence from Outcome Learning
  const handleDeriveEvidence = async (rev: any) => {
    setActionInProgress(`evidence-${rev.id}`);
    try {
      await apiFetch(
        '/api/evidences',
        {
          method: 'POST',
          body: JSON.stringify({
            content: `Resultado pós-lançamento da iniciativa "${rev.title}": Métrica ${rev.metric_name} atingiu ${rev.actual_value} (meta era ${rev.target_value}). Aprendizado: ${rev.what_we_learned || rev.what_happened}`,
            source: `Outcome Review: ${rev.title}`,
            origin_type: 'analytics',
            impact_score: rev.status === 'failed' || rev.status === 'below_target' ? 4 : 5,
            notes: rev.next_actions ? `Próximas ações sugeridas: ${rev.next_actions}` : undefined,
          }),
        },
        workspaceId
      );
      setSuccessMessage(`Evidência de dados registrada com sucesso no Banco de Evidências!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar evidência');
    } finally {
      setActionInProgress(null);
    }
  };

  // Explicit Human-in-the-loop action: Create Hypothesis from Outcome Learning
  const handleDeriveHypothesis = async (rev: any) => {
    setActionInProgress(`hypothesis-${rev.id}`);
    try {
      await apiFetch(
        '/api/hypotheses',
        {
          method: 'POST',
          body: JSON.stringify({
            title: `Hipótese Derivada de ${rev.title}`,
            statement: `Acreditamos que ajustando a abordagem com base no aprendizado (${rev.what_we_learned || 'revisão de impacto'}), alcançaremos a meta original de ${rev.metric_name} (${rev.target_value}).`,
            metrics_to_validate: `${rev.metric_name} >= ${rev.target_value}`,
            confidence_score: 3,
          }),
        },
        workspaceId
      );
      setSuccessMessage(`Nova hipótese formulada no Discovery Engine!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Falha ao criar hipótese');
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'exceeded':
        return <span className="px-2 py-0.5 text-[10px] rounded-full font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">Excedeu as expectativas</span>;
      case 'on_target':
        return <span className="px-2 py-0.5 text-[10px] rounded-full font-bold uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">Dentro da meta</span>;
      case 'below_target':
        return <span className="px-2 py-0.5 text-[10px] rounded-full font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-800/60">Abaixo da meta</span>;
      case 'failed':
        return <span className="px-2 py-0.5 text-[10px] rounded-full font-bold uppercase bg-rose-950/80 text-rose-300 border border-rose-800/60">Não atingiu resultado</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] rounded-full font-bold uppercase bg-zinc-800 text-zinc-300">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold uppercase tracking-wider">
              Fechamento de Ciclo • Etapa 9
            </span>
            <span className="text-zinc-500 text-xs">|</span>
            <span className="text-zinc-400 text-xs font-medium">Loop de Aprendizado Contínuo</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mt-1">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Revisão de Impacto (Post-Launch Outcome Reviews)
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Avalie o impacto real pós-lançamento, documente o que funcionou ou falhou, e derive novas ações com confirmação explícita para fechar o ciclo do Continuous Discovery.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Registrar Revisão Pós-Lançamento
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando revisões de impacto...</div>
      ) : reviews.length === 0 ? (
        /* Empty State */
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-700/40 text-emerald-400 mx-auto">
            <TrendingUp className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-zinc-100">Nenhuma Revisão de Impacto Registrada</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Após 15 a 30 dias do lançamento de um item do roadmap, compare os resultados reais com a meta esperada para alimentar novos ciclos de descoberta.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-xl shadow transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Registrar Primeira Revisão
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((rev) => {
            const isNegativeOrBelow = rev.status === 'below_target' || rev.status === 'failed';

            return (
              <div key={rev.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-6 space-y-5 transition">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(rev.status)}
                      {rev.roadmap_title && (
                        <span className="text-xs text-zinc-400 font-mono bg-zinc-800/80 px-2 py-0.5 rounded">
                          Item: {rev.roadmap_title}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 mt-1">{rev.title}</h3>
                  </div>

                  <div className="flex items-center gap-4 bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-mono shrink-0">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase">Métrica</span>
                      <strong className="text-zinc-200">{rev.metric_name}</strong>
                    </div>
                    <div className="border-l border-zinc-800 pl-3">
                      <span className="text-zinc-500 block text-[10px] uppercase">Antes</span>
                      <span className="text-zinc-400">{rev.baseline_value}</span>
                    </div>
                    <div className="border-l border-zinc-800 pl-3">
                      <span className="text-zinc-500 block text-[10px] uppercase">Meta</span>
                      <span className="text-military-300 font-semibold">{rev.target_value}</span>
                    </div>
                    <div className="border-l border-zinc-800 pl-3">
                      <span className="text-zinc-500 block text-[10px] uppercase">Atingido</span>
                      <strong className={isNegativeOrBelow ? 'text-amber-400' : 'text-emerald-400'}>
                        {rev.actual_value}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Retrospective Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                    <span className="font-bold text-zinc-400 uppercase text-[10px] block tracking-wider">
                      O que esperávamos
                    </span>
                    <p className="text-zinc-300 leading-relaxed">{rev.what_we_expected || '—'}</p>
                  </div>
                  <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                    <span className="font-bold text-military-300 uppercase text-[10px] block tracking-wider">
                      O que realmente aconteceu
                    </span>
                    <p className="text-zinc-300 leading-relaxed">{rev.what_happened || '—'}</p>
                  </div>
                  <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800/80 space-y-1">
                    <span className="font-bold text-emerald-400 uppercase text-[10px] block tracking-wider">
                      O que aprendemos
                    </span>
                    <p className="text-zinc-200 leading-relaxed font-medium">{rev.what_we_learned || '—'}</p>
                  </div>
                </div>

                {rev.next_actions && (
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Próximas Ações Planejadas
                    </span>
                    <p>{rev.next_actions}</p>
                  </div>
                )}

                {/* Explicit Human-in-the-Loop Actions Box (Loop Fechado) */}
                <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-military-400" />
                      <span className="text-xs font-bold text-zinc-200">
                        Ações Recomendadas para Fechar o Ciclo de Descoberta:
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Confirmação manual necessária</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {/* Derive Problem */}
                    <button
                      onClick={() => handleDeriveProblem(rev)}
                      disabled={actionInProgress === `problem-${rev.id}`}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Target className="w-3.5 h-3.5 text-military-400" />
                      {actionInProgress === `problem-${rev.id}` ? 'Criando...' : '+ Criar Novo Problema Identificado'}
                    </button>

                    {/* Derive Hypothesis */}
                    <button
                      onClick={() => handleDeriveHypothesis(rev)}
                      disabled={actionInProgress === `hypothesis-${rev.id}`}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <GitCommit className="w-3.5 h-3.5 text-military-400" />
                      {actionInProgress === `hypothesis-${rev.id}` ? 'Formulando...' : '+ Formular Nova Hipótese Derivada'}
                    </button>

                    {/* Derive Evidence */}
                    <button
                      onClick={() => handleDeriveEvidence(rev)}
                      disabled={actionInProgress === `evidence-${rev.id}`}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5 text-military-400" />
                      {actionInProgress === `evidence-${rev.id}` ? 'Registrando...' : '+ Registrar Evidência Factual'}
                    </button>

                    {/* Navigate back to Discovery */}
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('problems')}
                        className="px-3 py-1.5 rounded-lg bg-military-950 hover:bg-military-900 text-military-300 text-xs font-medium border border-military-800/80 flex items-center gap-1.5 transition ml-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-military-400" />
                        Ir para Continuous Discovery
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-xl w-full text-zinc-100 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-zinc-100">Registrar Revisão de Impacto Pós-Lançamento</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Título da Revisão <span className="text-military-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Impacto 30 Dias — Novo Fluxo de Onboarding Mobile"
                  required
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                />
              </div>

              {roadmapItems.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Item do Roadmap Lançado <span className="text-zinc-500 font-normal">(opcional)</span>
                  </label>
                  <select
                    value={roadmapItemId}
                    onChange={(e) => setRoadmapItemId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                  >
                    <option value="">Nenhum item específico</option>
                    {roadmapItems.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.quarter || 'Roadmap'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Métrica Principal Medida <span className="text-military-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    placeholder="Ex: Taxa de Ativação D7"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Avaliação Geral do Impacto</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-zinc-100 outline-none focus:border-military-500 transition"
                  >
                    <option value="exceeded">Excedeu as expectativas</option>
                    <option value="on_target">Dentro da meta esperada</option>
                    <option value="below_target">Abaixo da meta esperada</option>
                    <option value="failed">Não atingiu resultado / Negativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Valor Inicial (Base)</label>
                  <input
                    type="text"
                    value={baselineVal}
                    onChange={(e) => setBaselineVal(e.target.value)}
                    placeholder="30%"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-military-500 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Meta Desejada</label>
                  <input
                    type="text"
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value)}
                    placeholder="65%"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-military-500 transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Resultado Real</label>
                  <input
                    type="text"
                    value={actualVal}
                    onChange={(e) => setActualVal(e.target.value)}
                    placeholder="45%"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-military-500 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">O que esperávamos (Premissa)</label>
                <textarea
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  rows={2}
                  placeholder="Esperávamos que simplificar a etapa 2 aumentaria o funil em 35%..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">O que realmente aconteceu</label>
                <textarea
                  value={happened}
                  onChange={(e) => setHappened(e.target.value)}
                  rows={2}
                  placeholder="Os usuários avançaram mais rápido, mas muitos abandonaram ao solicitar permissão de câmera..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">O que aprendemos</label>
                <textarea
                  value={learned}
                  onChange={(e) => setLearned(e.target.value)}
                  rows={2}
                  placeholder="A fricção principal não era a quantidade de campos, e sim a falta de clareza sobre por que a câmera é necessária..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-military-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Próximas Ações</label>
                <input
                  type="text"
                  value={nextActions}
                  onChange={(e) => setNextActions(e.target.value)}
                  placeholder="Ex: Formular hipótese sobre tela explicativa de permissão de câmera"
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
                  disabled={submitting || !title.trim() || !metricName.trim()}
                  className="px-5 py-2 bg-military-600 hover:bg-military-500 disabled:opacity-50 text-zinc-100 text-xs font-semibold rounded-xl transition shadow"
                >
                  {submitting ? 'Salvando...' : 'Salvar Revisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
