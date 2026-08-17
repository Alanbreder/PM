import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Target, Plus, CheckCircle2, TrendingUp, AlertCircle, Trash2, Edit3, Link as LinkIcon } from 'lucide-react';

interface StrategyViewProps {
  workspaceId: string;
}

export const StrategyView: React.FC<StrategyViewProps> = ({ workspaceId }) => {
  const [objectives, setObjectives] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showObjModal, setShowObjModal] = useState(false);
  const [showKrModal, setShowKrModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState('2026-Q3');
  const [ownerName, setOwnerName] = useState('');

  // KR Form
  const [krTitle, setKrTitle] = useState('');
  const [metricName, setMetricName] = useState('');
  const [initialVal, setInitialVal] = useState(0);
  const [targetVal, setTargetVal] = useState(100);
  const [unit, setUnit] = useState('%');

  // Link Form
  const [linkOppId, setLinkOppId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [objRes, oppRes] = await Promise.all([
        apiFetch('/api/strategy/objectives', {}, workspaceId),
        apiFetch('/api/opportunities', {}, workspaceId),
      ]);
      setObjectives(objRes.data || []);
      setOpportunities(oppRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar objetivos estratégicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(
        '/api/strategy/objectives',
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            timeframe,
            owner_name: ownerName || 'Equipe de Produto',
          }),
        },
        workspaceId
      );
      setShowObjModal(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar objetivo');
    }
  };

  const handleCreateKeyResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObjId) return;
    try {
      await apiFetch(
        '/api/strategy/key-results',
        {
          method: 'POST',
          body: JSON.stringify({
            objective_id: selectedObjId,
            title: krTitle,
            metric_name: metricName,
            initial_value: Number(initialVal),
            target_value: Number(targetVal),
            unit,
          }),
        },
        workspaceId
      );
      setShowKrModal(false);
      setKrTitle('');
      setMetricName('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar Key Result');
    }
  };

  const handleLinkOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObjId || !linkOppId) return;
    try {
      await apiFetch(
        '/api/strategy/link-opportunity',
        {
          method: 'POST',
          body: JSON.stringify({
            objective_id: selectedObjId,
            opportunity_id: linkOppId,
          }),
        },
        workspaceId
      );
      setShowLinkModal(false);
      setLinkOppId('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao vincular oportunidade ao objetivo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-military-400" />
            Objetivos Estratégicos & OKRs
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Conecte a visão e metas da empresa diretamente com as Oportunidades e Entregas de Produto.
          </p>
        </div>
        <button
          onClick={() => setShowObjModal(true)}
          className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" /> Novo Objetivo (OKR)
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 text-sm">Carregando estratégia e OKRs...</div>
      ) : objectives.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
          <Target className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Nenhum Objetivo Cadastrado</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Defina o primeiro OKR da empresa ou produto para orientar o direcionamento do Discovery.
          </p>
          <button
            onClick={() => setShowObjModal(true)}
            className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg"
          >
            Cadastrar Primeiro OKR
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {objectives.map((obj) => (
            <div key={obj.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] bg-military-900/80 text-military-300 border border-military-700/50 rounded font-mono font-bold">
                      {obj.timeframe}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">• {obj.owner_name}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100 mt-1">{obj.title}</h3>
                  {obj.description && <p className="text-xs text-zinc-300 mt-1">{obj.description}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedObjId(obj.id);
                      setShowKrModal(true);
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar KR
                  </button>
                  <button
                    onClick={() => {
                      setSelectedObjId(obj.id);
                      setShowLinkModal(true);
                    }}
                    className="px-3 py-1.5 bg-military-900/80 hover:bg-military-800 text-military-300 text-xs font-semibold rounded-md transition flex items-center gap-1.5 border border-military-700/60"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Vincular Oportunidade
                  </button>
                </div>
              </div>

              {/* Key Results */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Resultados-Chave (KRs)</h4>
                {(!obj.key_results || obj.key_results.length === 0) ? (
                  <p className="text-xs text-zinc-500 italic">Nenhum Key Result vinculado a este objetivo.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {obj.key_results.map((kr: any) => (
                      <div key={kr.id} className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-zinc-100">{kr.title}</span>
                          <span className="px-2 py-0.5 text-[10px] rounded font-semibold bg-emerald-500/20 text-emerald-300">
                            {kr.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
                          <span>Inicial: {kr.initial_value}{kr.unit}</span>
                          <span className="text-emerald-400 font-bold">Atual: {kr.current_value}{kr.unit}</span>
                          <span>Meta: {kr.target_value}{kr.unit}</span>
                        </div>
                        <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full transition-all"
                            style={{ width: `${Math.min(100, kr.progress || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Objective Modal */}
      {showObjModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Novo Objetivo Estratégico (OKR)</h3>
            <form onSubmit={handleCreateObjective} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Título do Objetivo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Escalar a conversão no Onboarding em 40%"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição & Racional</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Contexto e por que esta meta é prioritária para o negócio..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Timeframe / Quarter</label>
                  <input
                    type="text"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Responsável</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Time de Growth / Product"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowObjModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Salvar Objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KR Modal */}
      {showKrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Adicionar Key Result (KR)</h3>
            <form onSubmit={handleCreateKeyResult} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Título do Key Result</label>
                <input
                  type="text"
                  value={krTitle}
                  onChange={(e) => setKrTitle(e.target.value)}
                  placeholder="Ex: Aumentar taxa de ativação D1 de 30% para 60%"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-military-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Nome da Métrica</label>
                  <input
                    type="text"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    placeholder="Ativação D1"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Unidade</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="%, R$, usuarios"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Valor Inicial</label>
                  <input
                    type="number"
                    value={initialVal}
                    onChange={(e) => setInitialVal(Number(e.target.value))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Valor Meta (Target)</label>
                  <input
                    type="number"
                    value={targetVal}
                    onChange={(e) => setTargetVal(Number(e.target.value))}
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKrModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Salvar KR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Opportunity Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-4">Vincular Oportunidade ao Objetivo</h3>
            <form onSubmit={handleLinkOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Selecione a Oportunidade</label>
                <select
                  value={linkOppId}
                  onChange={(e) => setLinkOppId(e.target.value)}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="">-- Escolha a oportunidade --</option>
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-military-600 hover:bg-military-500 text-zinc-100 text-xs font-semibold rounded-lg shadow"
                >
                  Confirmar Vinculação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
