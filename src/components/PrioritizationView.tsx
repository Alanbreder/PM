import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Lightbulb, Calculator, TrendingUp, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

interface PrioritizationViewProps {
  workspaceId: string;
}

export const PrioritizationView: React.FC<PrioritizationViewProps> = ({ workspaceId }) => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [prioritizations, setPrioritizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [framework, setFramework] = useState<'rice' | 'ice' | 'wsjf'>('rice');
  const [selectedOppId, setSelectedOppId] = useState('');

  // RICE
  const [reach, setReach] = useState(500);
  const [impact, setImpact] = useState(4);
  const [confidence, setConfidence] = useState(80);
  const [effort, setEffort] = useState(2);

  // ICE
  const [iceImpact, setIceImpact] = useState(8);
  const [iceConfidence, setIceConfidence] = useState(8);
  const [iceEase, setIceEase] = useState(7);

  // WSJF
  const [ubv, setUbv] = useState(8);
  const [tc, setTc] = useState(7);
  const [rr, setRr] = useState(6);
  const [jobSize, setJobSize] = useState(3);

  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppRes, prioRes] = await Promise.all([
        apiFetch('/api/opportunities', {}, workspaceId),
        apiFetch('/api/prioritization', {}, workspaceId),
      ]);
      setOpportunities(oppRes.data || []);
      setPrioritizations(prioRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar dados de priorização');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) loadData();
  }, [workspaceId]);

  const calculatePreviewScore = () => {
    if (framework === 'rice') {
      return Math.round((reach * impact * (confidence / 100)) / Math.max(effort, 1));
    } else if (framework === 'ice') {
      return Math.round((iceImpact * iceConfidence * iceEase) / 10);
    } else if (framework === 'wsjf') {
      return Math.round(((ubv + tc + rr) / Math.max(jobSize, 1)) * 10);
    }
    return 0;
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOppId) return;
    try {
      await apiFetch(
        '/api/prioritization',
        {
          method: 'POST',
          body: JSON.stringify({
            opportunity_id: selectedOppId,
            framework,
            reach: Number(reach),
            impact: Number(impact),
            confidence: Number(confidence),
            effort: Number(effort),
            ice_impact: Number(iceImpact),
            ice_confidence: Number(iceConfidence),
            ice_ease: Number(iceEase),
            user_business_value: Number(ubv),
            time_criticality: Number(tc),
            risk_reduction: Number(rr),
            job_size: Number(jobSize),
            notes,
          }),
        },
        workspaceId
      );
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar avaliação');
    }
  };

  // Sort opportunities by score descending
  const sortedOpps = [...opportunities].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            Matriz de Priorização & Scoring (RICE / ICE / WSJF)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quantifique o retorno sobre o investimento de cada oportunidade com algoritmos padronizados de produto.
          </p>
        </div>
        <button
          onClick={() => {
            if (opportunities.length > 0) setSelectedOppId(opportunities[0].id);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Avaliar Oportunidade
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Carregando matriz de priorização...</div>
      ) : sortedOpps.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">Nenhuma Oportunidade Encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Mapeie primeiro uma Oportunidade no pipeline para que você possa avaliar o RICE/ICE Score.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Ranking de Oportunidades Priorizadas
            </span>
            <span className="text-xs text-slate-400">{sortedOpps.length} Oportunidades Registradas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold bg-slate-900/50">
                  <th className="py-3 px-4"># Pos</th>
                  <th className="py-3 px-4">Oportunidade</th>
                  <th className="py-3 px-4">Score Total</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                  <th className="py-3 px-4">Esforço</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {sortedOpps.map((opp, index) => {
                  const prioEval = prioritizations.find((p) => p.opportunity_id === opp.id);
                  return (
                    <tr key={opp.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-amber-400">#{index + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{opp.title}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{opp.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono font-bold text-xs">
                          {opp.score || prioEval?.score || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">{opp.value || 'medium'}</td>
                      <td className="py-3 px-4 text-slate-300">{opp.effort || 'medium'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-indigo-500/20 text-indigo-300">
                          {opp.status || 'discovery'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOppId(opp.id);
                            setShowModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
                        >
                          {prioEval ? 'Reavaliar' : 'Calcular RICE'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full text-slate-100">
            <h3 className="text-base font-bold text-white mb-2">Avaliação & Scoring de Oportunidade</h3>
            <p className="text-xs text-slate-400 mb-4">Escolha o framework de pontuação desejado.</p>

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Oportunidade</label>
                <select
                  value={selectedOppId}
                  onChange={(e) => setSelectedOppId(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Framework de Priorização</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFramework('rice')}
                    className={`py-1.5 px-3 rounded text-xs font-semibold border ${
                      framework === 'rice'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    RICE
                  </button>
                  <button
                    type="button"
                    onClick={() => setFramework('ice')}
                    className={`py-1.5 px-3 rounded text-xs font-semibold border ${
                      framework === 'ice'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    ICE
                  </button>
                  <button
                    type="button"
                    onClick={() => setFramework('wsjf')}
                    className={`py-1.5 px-3 rounded text-xs font-semibold border ${
                      framework === 'wsjf'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    WSJF
                  </button>
                </div>
              </div>

              {framework === 'rice' && (
                <div className="space-y-3 bg-slate-800/50 p-3.5 rounded-lg border border-slate-700/50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Reach (Alcance em usuários)</label>
                      <input
                        type="number"
                        value={reach}
                        onChange={(e) => setReach(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Impact (1 a 5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={impact}
                        onChange={(e) => setImpact(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Confidence (0% a 100%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={confidence}
                        onChange={(e) => setConfidence(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Effort (Pessoas-Mês / 1 a 5)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={effort}
                        onChange={(e) => setEffort(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {framework === 'ice' && (
                <div className="space-y-3 bg-slate-800/50 p-3.5 rounded-lg border border-slate-700/50">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Impact (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={iceImpact}
                        onChange={(e) => setIceImpact(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Confidence (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={iceConfidence}
                        onChange={(e) => setIceConfidence(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Ease / Facilidade (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={iceEase}
                        onChange={(e) => setIceEase(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {framework === 'wsjf' && (
                <div className="space-y-3 bg-slate-800/50 p-3.5 rounded-lg border border-slate-700/50">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">User/Business Value (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={ubv}
                        onChange={(e) => setUbv(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Time Criticality (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={tc}
                        onChange={(e) => setTc(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Risk Reduction (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={rr}
                        onChange={(e) => setRr(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">Job Size / Esforço (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={jobSize}
                        onChange={(e) => setJobSize(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs text-amber-300 font-semibold">Score Calculado:</span>
                <span className="text-lg font-extrabold text-amber-400 font-mono">{calculatePreviewScore()}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notas da Avaliação</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Justificativa das notas de impacto e esforço..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg"
                >
                  Salvar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
